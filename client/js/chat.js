class Chat {
    constructor() {
        this.socket = null;
        this.currentUser = JSON.parse(localStorage.getItem('chat_user') || '{}');
        this.init();
    }

    init() {
        if (!this.currentUser.id) {
            alert('No estás autenticado. Redirigiendo al login...');
            window.location.href = 'index.html';
            return;
        }

        document.getElementById('currentUsername').textContent = this.currentUser.username;
        this.connectSocket();

        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }

    connectSocket() {
        this.socket = io('http://localhost:3000', {
            transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
            console.log('✅ Conectado al servidor de chat');
            
            this.socket.emit('userConnected', {
                id: this.currentUser.id,
                username: this.currentUser.username,
                gender: this.currentUser.gender
            });
        });

        this.socket.on('disconnect', () => {
            console.log('🔌 Desconectado del servidor');
        });

        this.socket.on('userList', (users) => {
            this.updateUserList(users);
        });

        this.socket.on('newMessage', (message) => {
            this.addMessage(message);
        });

        this.socket.on('systemMessage', (systemMessage) => {
            if (systemMessage && systemMessage.message) {
                this.addSystemMessage(systemMessage.message);
            }
        });
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();

        if (!message) return;

        const messageData = {
            content: message
        };

        this.socket.emit('sendMessage', messageData);
        input.value = '';
        input.focus();
    }

    addMessage(message) {
        const container = document.getElementById('messagesContainer');
        const isOwn = message.userId === this.currentUser.id;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isOwn ? 'own' : ''}`;
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-sender">${message.username || 'Usuario'}</span>
                <span class="message-time">${this.formatTime(message.timestamp)}</span>
            </div>
            <div class="message-content">${this.escapeHtml(message.content)}</div>
        `;

        container.appendChild(messageElement);
        container.scrollTop = container.scrollHeight;
    }

    addSystemMessage(text) {
        const container = document.getElementById('messagesContainer');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message system';
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-sender">Sistema</span>
                <span class="message-time">Ahora</span>
            </div>
            <div class="message-content">${text}</div>
        `;

        container.appendChild(messageElement);
        container.scrollTop = container.scrollHeight;
    }

    updateUserList(users) {
        const container = document.getElementById('usersList');
        const onlineCount = document.getElementById('onlineCount');
        
        const otherUsers = users.filter(user => user.id !== this.currentUser.id);
        onlineCount.textContent = otherUsers.length;

        container.innerHTML = '';

        users.forEach(user => {
            if (user.id === this.currentUser.id) return;
            
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
                <div class="user-name">${user.username}</div>
                <div class="user-status"></div>
            `;
            
            container.appendChild(userElement);
        });
    }

    formatTime(timestamp) {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (error) {
            return 'Ahora';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            try {
                await fetch('http://localhost:3000/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: this.currentUser.id })
                });

                if (this.socket) this.socket.disconnect();
                localStorage.removeItem('chat_user');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error en logout:', error);
                window.location.href = 'index.html';
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Chat();
});