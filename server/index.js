const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// COMENTA la conexión a DB para evitar errores en Render
// console.log('Cargando db.js...');
// const db = require('./db');
// console.log('db.js cargado');

// Si usas authRoutes, déjala, pero si no, coméntala
// const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);

// Configuración SIMPLE de CORS
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware CORS SIMPLE
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, '../client')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/login.html'));
});

// Middleware para loguear peticiones
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// COMENTA las rutas de autenticación si no funcionan
// app.use('/api/auth', authRoutes);

//  BORRA O COMENTA ESTA RUTA DUPLICADA (la que hace consulta a DB)
// // Ruta de prueba
// app.get('/', async (req, res) => {
//     try {
//         const result = await db.query('SELECT NOW() as time');
//         res.json({ 
//             message: '✅ Servidor de chat funcionando',
//             database: '✅ Conectado',
//             time: result.rows[0].time
//         });
//     } catch (error) {
//         res.json({ 
//             message: '✅ Servidor de chat funcionando',
//             database: '❌ Error de conexión',
//             error: error.message
//         });
//     }
// });

// Manejo de conexiones Socket.io
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('✅ Nuevo cliente conectado:', socket.id);

    socket.on('userConnected', (userData) => {
        if (!userData || !userData.id) {
            console.error('Datos de usuario inválidos:', userData);
            return;
        }
        
        connectedUsers.set(socket.id, {
            socketId: socket.id,
            userId: userData.id,
            username: userData.username || 'Usuario',
            gender: userData.gender,
            connectedAt: new Date()
        });

        console.log(`👤 Usuario conectado: ${userData.username}`);
        
        socket.broadcast.emit('systemMessage', {
            type: 'user_join',
            message: `${userData.username} se ha conectado`,
            timestamp: new Date().toISOString()
        });
        
        updateUserList();
        
        socket.emit('systemMessage', {
            type: 'welcome',
            message: `¡Bienvenido al chat, ${userData.username}!`,
            timestamp: new Date().toISOString()
        });
    });

    socket.on('sendMessage', (messageData) => {
        const user = connectedUsers.get(socket.id);
        if (!user) return;

        const message = {
            userId: user.userId,
            username: user.username,
            content: (messageData.content || '').substring(0, 500),
            timestamp: new Date().toISOString(),
            messageId: Date.now() + Math.random().toString(36).substr(2, 9)
        };

        console.log(`💬 ${user.username}: ${message.content}`);
        
        io.emit('newMessage', message);
    });

    socket.on('disconnect', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            connectedUsers.delete(socket.id);
            
            console.log(`👋 Usuario desconectado: ${user.username}`);
            
            socket.broadcast.emit('systemMessage', {
                type: 'user_leave',
                message: `${user.username} se ha desconectado`,
                timestamp: new Date().toISOString()
            });
            
            updateUserList();
        }
    });

    function updateUserList() {
        const usersArray = Array.from(connectedUsers.values()).map(user => ({
            id: user.userId,
            username: user.username,
            gender: user.gender
        }));
        
        io.emit('userList', usersArray);
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`🌐 HTTP: http://localhost:${PORT}/`);
    console.log(`🔗 WebSocket: ws://localhost:${PORT}`);
    console.log(`📡 Socket.io listo para conexiones`);
    console.log(`=========================================\n`);
});