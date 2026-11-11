const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { createServer } = require('https');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// WebSocket for real-time updates
const wss = new WebSocket.Server({ server });

// Store connected clients and their states
const clients = new Map(); // uuid -> { username, modEnabled }

// Client stats
let totalConnections = 0;
let modOnCount = 0;

// In-memory database of all tracked hitsboxes (for demo)
const hitboxData = [];

// Initialize
console.log('HitboxRender Server starting on port 3000...');
app.use(express.json());

// Middleware to track client connections
server.on('connection', (socket) => {
    console.log('New HTTP connection detected');
});

// WebSocket handler for real-time updates
wss.on('connection', (ws) => {
    console.log('WebSocket connected');
    
    // Handle incoming messages from clients
    ws.on('message', (message) => {
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
            
            console.log(`Client registered: ${username} (${uuid.slice(0, 8)}...) - Mod: ${modEnabled ? 'ON' : 'OFF'}`);
            
            // Broadcast update to all connected clients
            broadcastUpdate();
            
        } else if (data.type === 'toggle') {
            const { uuid } = data;
            
            // Toggle the client's state
            const clientData = clients.get(uuid.toLowerCase());
            if (clientData) {
                clientData.modEnabled = !clientData.modEnabled;
                totalConnections--;
                modOnCount++;
                console.log(`Client ${username} toggled to: ${clientData.modEnabled ? 'ON' : 'OFF'}`);
                
                broadcastUpdate();
            }
        } else if (data.type === 'heartbeat') {
            // Update last seen time
            const clientData = clients.get(uuid.toLowerCase());
            if (clientData) {
                clientData.lastSeen = new Date().toISOString();
            }
        }
    });
    
    ws.on('close', () => {
        // Clean up on disconnect
        wss.clients.forEach(client => {
            if (client === ws) {
                clients.forEach((data, uuid) => {
                    if (uuid === ws._socket?.remoteAddress + ':' + ws._socket.remotePort) {
                        console.log('Client disconnected: ' + data.username);
                        clients.delete(uuid.toLowerCase());
                        totalConnections--;
                        modOnCount++;
                        broadcastUpdate();
                    }
                });
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
        clients: Array.from(clients.values()),
        hitboxData
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
    
    console.log(`Toggled ${clientData.username} to: ${clientData.modEnabled ? 'ON' : 'OFF'}`);
    
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
    hitboxData.push({
        uuid,
        username,
        timestamp: new Date().toISOString(),
        type: 'hitbox_rendered'
    });
    
    // Keep only last 100 entries
    if (hitboxData.length > 100) {
        hitboxData.shift();
    }
    
    console.log(`Hitsbox registered for ${username}`);
    
    res.json({ success: true });
});

// API endpoint to get hitsbox data
app.get('/api/hitboxrender/data', (req, res) => {
    res.json({ hitboxData });
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
    console.log('SIGTERM received. Shutting down...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down...');
    process.exit(0);
});