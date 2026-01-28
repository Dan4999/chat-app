class Register {
    constructor() {
        this.baseUrl = '/api/auth';
        this.initEventListeners();
        this.initPasswordStrength();
    }

    initEventListeners() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => this.checkPasswordStrength());
        }

        const confirmInput = document.getElementById('confirmPassword');
        if (confirmInput) {
            confirmInput.addEventListener('input', () => this.validatePasswords());
        }
    }

    initPasswordStrength() {
        this.passwordRules = {
            minLength: 8,
            hasUpperCase: /[A-Z]/,
            hasLowerCase: /[a-z]/,
            hasNumbers: /\d/
        };
    }

    checkPasswordStrength() {
        const password = document.getElementById('password').value;
        const strengthBar = document.getElementById('strengthBar');
        
        if (!password) {
            strengthBar.style.width = '0%';
            return;
        }
        
        let score = 0;
        const rules = this.passwordRules;
        
        if (password.length >= rules.minLength) score++;
        if (rules.hasUpperCase.test(password)) score++;
        if (rules.hasLowerCase.test(password)) score++;
        if (rules.hasNumbers.test(password)) score++;
        
        const percentage = (score / 4) * 100;
        strengthBar.style.width = `${percentage}%`;
        
        if (percentage <= 40) {
            strengthBar.className = 'strength-bar strength-weak';
        } else if (percentage <= 70) {
            strengthBar.className = 'strength-bar strength-medium';
        } else {
            strengthBar.className = 'strength-bar strength-strong';
        }
    }

    validatePasswords() {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (!confirmPassword) return true;
        
        return password === confirmPassword;
    }

    validateForm() {
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const gender = document.getElementById('gender').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!username || !email || !gender || !password || !confirmPassword) {
            this.showMessage('Todos los campos son requeridos', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showMessage('Por favor ingresa un email válido', 'error');
            return false;
        }

        if (password.length < this.passwordRules.minLength) {
            this.showMessage('La contraseña debe tener al menos 8 caracteres', 'error');
            return false;
        }

        if (!this.validatePasswords()) {
            this.showMessage('Las contraseñas no coinciden', 'error');
            return false;
        }

        return true;
    }

    async handleRegister(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        const userData = {
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            gender: document.getElementById('gender').value,
            password: document.getElementById('password').value
        };

        this.showLoading(true);

        try {
            console.log('🔍 Intentando registro...');
            
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            console.log('📥 Respuesta recibida:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error en el registro');
            }

            const data = await response.json();
            console.log('✅ Registro exitoso:', data);

            this.showMessage('¡Cuenta creada exitosamente! Redirigiendo al login...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            console.error('❌ Error en registro:', error);
            this.showMessage(error.message || 'Error de conexión', 'error');
        } finally {
            this.showLoading(false);
        }
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
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');
        
        if (show) {
            loadingDiv.style.display = 'block';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creando...';
        } else {
            loadingDiv.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Cuenta';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Register();

});
