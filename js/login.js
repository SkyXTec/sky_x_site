// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Pegar valores dos inputs
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Validação simples
        if (!username || !password) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        // Desabilitar botão durante login
        loginBtn.disabled = true;
        loginBtn.textContent = 'Entrando...';

        try {
            // Simular chamada de API (substituir por chamada real depois)
            console.log('Tentando login com:', { username, password });

            // Simular delay de rede
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Login de exemplo (REMOVER EM PRODUÇÃO)
            if (username === 'admin' && password === 'admin') {
                // Sucesso!
                alert(`Bem-vindo, ${username}!`);
                
                // Salvar token (exemplo)
                localStorage.setItem('auth_token', 'fake-jwt-token-' + Date.now());
                localStorage.setItem('username', username);

                // Redirecionar para dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Erro de credenciais
                alert('Usuário ou senha incorretos!');
                passwordInput.value = '';
                passwordInput.focus();
            }

        } catch (error) {
            console.error('Erro no login:', error);
            alert('Erro ao fazer login. Tente novamente.');
        } finally {
            // Reabilitar botão
            loginBtn.disabled = false;
            loginBtn.textContent = 'Entrar';
        }
    });

    // Enter nos inputs
    usernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            passwordInput.focus();
        }
    });

    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginForm.requestSubmit();
        }
    });
});
