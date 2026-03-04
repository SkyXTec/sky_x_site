/**
 * login.js  Lógica do formulário de login
 * Consome a API PHP: POST /api/auth/login.php
 */

const API_LOGIN   = 'api/auth/login.php';
const TOKEN_KEY   = 'skyx_token';
const USER_KEY    = 'skyx_user';
const EXPIRES_KEY = 'skyx_expires';

document.addEventListener('DOMContentLoaded', function () {
    const loginForm     = document.getElementById('loginForm');
    const loginBtn      = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg      = document.getElementById('loginError');

    if (sessionStorage.getItem(TOKEN_KEY)) {
        window.location.replace('dashboard.html');
        return;
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.add('visible');
        usernameInput.classList.add('input-error');
        passwordInput.classList.add('input-error');
    }

    function clearError() {
        errorMsg.textContent = '';
        errorMsg.classList.remove('visible');
        usernameInput.classList.remove('input-error');
        passwordInput.classList.remove('input-error');
    }

    function setLoading(loading) {
        loginBtn.disabled    = loading;
        loginBtn.textContent = loading ? 'Entrando...' : 'Entrar';
        loginBtn.classList.toggle('loading', loading);
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearError();

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            showError('Preencha o usuário e a senha.');
            return;
        }

        setLoading(true);

        // Login fake temporário para testes locais
        if (username === 'admin' && password === 'admin') {
            sessionStorage.setItem(TOKEN_KEY, 'fake_token');
            sessionStorage.setItem(USER_KEY, JSON.stringify({ nome: 'Lucas', email: 'lucas@teste.com', id: 1 }));
            sessionStorage.setItem(EXPIRES_KEY, new Date(Date.now() + 3600 * 1000).toISOString());
            window.location.replace('dashboard.html');
            return;
        }

        // ...existing code...
        try {
            const response = await fetch(API_LOGIN, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ username, password }),
            });

            let data = null;
            const contentType = response.headers.get('content-type');
            if (!response.ok) {
                // Tenta extrair mensagem de erro JSON, senão texto puro
                try {
                    if (contentType && contentType.includes('application/json')) {
                        data = await response.json();
                        showError((data && data.error) || 'Erro ao fazer login.');
                    } else {
                        const text = await response.text();
                        showError('Erro do servidor: ' + text);
                    }
                } catch (jsonError) {
                    const text = await response.text();
                    showError('Erro inesperado: ' + text);
                }
                passwordInput.value = '';
                passwordInput.focus();
                return;
            }

            // Se resposta OK, tenta parsear como JSON
            try {
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    throw new SyntaxError('Resposta não é JSON');
                }
            } catch (err) {
                showError('Erro ao processar a resposta do servidor. A resposta não é JSON válido.');
                return;
            }

            if (data && data.success) {
                sessionStorage.setItem(TOKEN_KEY,   data.token);
                sessionStorage.setItem(USER_KEY,    JSON.stringify(data.user));
                sessionStorage.setItem(EXPIRES_KEY, data.expires_at);
                window.location.replace('dashboard.html');
            } else {
                showError((data && data.error) || 'Usuário ou senha incorretos.');
                passwordInput.value = '';
                passwordInput.focus();
            }

        } catch (err) {
            console.error('Erro na requisição de login:', err);
            if (err instanceof SyntaxError && err.message.includes("Unexpected token '/")) {
                showError('Erro ao processar a resposta do servidor. A resposta não é JSON válido.');
            } else {
                showError('Erro ao conectar com o servidor. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    });

    [usernameInput, passwordInput].forEach(input => {
        input.addEventListener('input', clearError);
    });
});
