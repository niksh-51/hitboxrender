const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected clients and their states
const clients = new Map(); // uuid -> { username, modEnabled }

// Client stats
let totalConnections = 0;
let modOnCount = 0;

// Initialize
console.log('HitboxRender Server starting on port 3000...');
app.use(express.json());

// WebSocket handler for real-time updates
wss.on('connection', (ws) => {
    console.log('[SERVER] WebSocket connected');
    
    // Handle incoming messages from clients
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'register') {
                const { uuid, username, modEnabled } = data;
                
                // Store client info
                clients.set(uuid.toLowerCase(), {
                    uuid,
                    username,
                    modEnabled,
                    lastSeen: new Date().toISOString()
                });
                
                // Update stats
                totalConnections++;
                if (modEnabled) modOnCount++;
                
                console.log(`[SERVER] Client registered: ${username} (${uuid.slice(0, 8)}...) - Mod: ${modEnabled ? 'ON' : 'OFF'}`);
                
            } else if (data.type === 'toggle') {
                const { uuid } = data;
                
                // Toggle the client's state
                const clientData = clients.get(uuid.toLowerCase());
                if (clientData) {
                    clientData.modEnabled = !clientData.modEnabled;
                    if (clientData.modEnabled) modOnCount++;
                    else modOnCount--;
                    
                    console.log(`[SERVER] ${username} toggled to: ${clientData.modEnabled ? 'ON' : 'OFF'}`);
                }
                
            } else if (data.type === 'heartbeat') {
                // Update last seen time
                const clientData = clients.get(uuid.toLowerCase());
                if (clientData) {
                    clientData.lastSeen = new Date().toISOString();
                }
            }
        } catch (e) {
            console.error('[SERVER] WebSocket error:', e.message);
        }
    });
    
    ws.on('close', () => {
        // Clean up on disconnect
        clients.forEach((data, uuid) => {
            if (uuid === ws._socket?.remoteAddress + ':' + ws._socket.remotePort) {
                console.log(`[SERVER] Client disconnected: ${data.username}`);
                clients.delete(uuid.toLowerCase());
                totalConnections--;
                modOnCount++;
                broadcastUpdate();
            }
        });
    });
});

// Broadcast current state to all connected clients
function broadcastUpdate() {
    const update = {
        type: 'state_update',
        timestamp: new Date().toISOString(),
        stats: {
            totalConnections,
            modOnCount,
            modOffCount: totalConnections - modOnCount
        },
        clients: Array.from(clients.values())
    };
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(update));
        }
    });
}

// API endpoint to get current state
app.get('/api/hitboxrender/state', (req, res) => {
    const state = {
        enabled: modOnCount > 0,
        lastUserSeen: modOnCount > 0 ? 
            clients.get(clients.keys().next().value)?.username || 'none' : null,
        stats: {
            totalConnections,
            modOnCount,
            modOffCount: totalConnections - modOnCount
        },
        clients: Array.from(clients.values())
    };
    
    res.json(state);
});

// API endpoint to toggle a specific client
app.post('/api/hitboxrender/toggle', (req, res) => {
    const { uuid } = req.body;
    const clientData = clients.get(uuid.toLowerCase());
    
    if (!clientData) {
        return res.status(404).json({ error: 'Client not found' });
    }
    
    // Toggle state
    clientData.modEnabled = !clientData.modEnabled;
    modOnCount = Array.from(clients.values()).filter(c => c.modEnabled).length;
    
    console.log(`[SERVER] Toggled ${clientData.username} to: ${clientData.modEnabled ? 'ON' : 'OFF'}`);
    
    // Broadcast update
    broadcastUpdate();
    
    res.json({
        success: true,
        data: clientData
    });
});

// API endpoint to register a hitsbox event
app.post('/api/hitboxrender/register-hitsbox', (req, res) => {
    const { uuid, username, timestamp } = req.body;
    
    // Store hitbox data
    const hitboxEntry = {
        uuid,
        username,
        timestamp: new Date().toISOString(),
        type: 'hitbox_rendered'
    };
    
    console.log(`[SERVER] Hitsbox registered for ${username}`);
    
    res.json({ success: true, data: hitboxEntry });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`HitboxRender Server running on http://localhost:${PORT}`);
    console.log('API Endpoints:');
    console.log(`  GET  /api/hitboxrender/state - Get current state`);
    console.log(`  POST /api/hitboxrender/toggle - Toggle a client's mod state`);
    console.log(`  POST /api/hitboxrender/register-hitsbox - Register hitsbox event`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('[SERVER] SIGTERM received. Shutting down...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('[SERVER] SIGINT received. Shutting down...');
    process.exit(0);
});