/**
 * auth.js  Guard de Autenticação
 * Incluir no <head> de TODAS as páginas protegidas do dashboard.
 * Verifica token contra a API PHP antes de carregar o conteúdo.
 */

(function () {
    const API_VERIFY = 'api/auth/verify.php';
    const API_LOGOUT = 'api/auth/logout.php';
    const TOKEN_KEY  = 'skyx_token';
    const USER_KEY   = 'skyx_user';
    const LOGIN_PAGE = 'login.html';

    function redirectToLogin() {
        sessionStorage.clear();
        window.location.replace(LOGIN_PAGE);
    }

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function getUser() {
        try {
            return JSON.parse(sessionStorage.getItem(USER_KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    async function logout() {
        const token = getToken();
        if (token) {
            try {
                await fetch(API_LOGOUT, {
                    method:  'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type':  'application/json',
                    },
                });
            } catch (e) { /* ignora erro de rede */ }
        }
        redirectToLogin();
    }

    function fillUserUI(user) {
        if (!user) return;
        const nameEl   = document.querySelector('.user-name');
        const avatarEl = document.querySelector('.user-avatar span');
        if (nameEl && user.name)   nameEl.textContent = user.name;
        if (avatarEl && user.name) {
            avatarEl.textContent = user.name
                .split(' ').slice(0, 2)
                .map(w => w[0]).join('').toUpperCase();
        }
    }

    async function checkAuth() {
        const token = getToken();
        if (!token) { redirectToLogin(); return; }

        try {
            const response = await fetch(API_VERIFY, {
                method:  'GET',
                headers: { 'Authorization': 'Bearer ' + token },
            });
            const data = await response.json();

            if (!response.ok || !data.valid) {
                redirectToLogin();
                return;
            }

            sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
            fillUserUI(data.user);

        } catch (err) {
            console.warn('auth.js: falha ao verificar token, usando dados locais.', err);
            fillUserUI(getUser());
        }
    }

    window.SkyXAuth = { logout, getUser, getToken };

    document.addEventListener('DOMContentLoaded', function () {
        const logoutBtn = document.querySelector('.user-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function (e) {
                e.preventDefault();
                logout();
            });
        }
        checkAuth();
    });
})();
