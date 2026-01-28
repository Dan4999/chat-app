class Auth {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api/auth';
        this.initEventListeners();
    }

    initEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.goToRegister());
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            this.showMessage('Por favor completa todos los campos', 'error');
            return;
        }

        this.showLoading(true);

        try {
            console.log('🔍 Intentando login...');
            
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            console.log('📥 Respuesta recibida:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en el login');
            }

            const data = await response.json();
            console.log('✅ Login exitoso:', data);

            this.showMessage('¡Login exitoso! Redirigiendo...', 'success');
            
            localStorage.setItem('chat_user', JSON.stringify(data.user));
            
            setTimeout(() => {
                window.location.href = 'chat.html';
            }, 1500);

        } catch (error) {
            console.error('❌ Error en login:', error);
            this.showMessage(error.message || 'Error de conexión', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    goToRegister() {
        window.location.href = 'register.html';
    }

    showMessage(message, type = 'info') {
        const errorDiv = document.getElementById('errorMessage');
        const successDiv = document.getElementById('successMessage');

        if (type === 'error') {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            successDiv.style.display = 'none';
        } else if (type === 'success') {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            errorDiv.style.display = 'none';
        }
    }

    showLoading(show) {
        const loadingDiv = document.getElementById('loading');
        const submitBtn = document.querySelector('#loginForm button[type="submit"]');
        
        if (show) {
            loadingDiv.style.display = 'block';
            submitBtn.disabled = true;
        } else {
            loadingDiv.style.display = 'none';
            submitBtn.disabled = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Auth();
});