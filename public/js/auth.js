class AuthHandler {
    static async init() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const user = await ApiService.getProfile();
                this.updateUI(user);
            } catch (error) {
                this.logout();
            }
        }
        this.setupEventListeners();
    }

    static setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            try {
                const response = await ApiService.login(
                    formData.get('email'),
                    formData.get('password')
                );
                localStorage.setItem('token', response.token);
                const user = await ApiService.getProfile();
                this.updateUI(user);
                bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
                loginForm.reset();
            } catch (error) {
                alert(error.message);
            }
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            try {
                const response = await ApiService.register({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    role: formData.get('role')
                });
                localStorage.setItem('token', response.token);
                const user = await ApiService.getProfile();
                this.updateUI(user);
                bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
                registerForm.reset();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    static updateUI(user) {
        const authButtons = document.getElementById('authButtons');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('userName');

        if (user) {
            authButtons.classList.add('d-none');
            userInfo.classList.remove('d-none');
            userName.textContent = user.name;

            // Atualizar navegação baseado no tipo de usuário
            const nav = document.getElementById('navbarNav');
            const navItems = nav.querySelector('.navbar-nav');
            navItems.innerHTML = ''; // Limpar itens existentes

            if (user.role === 'customer') {
                navItems.innerHTML = `
                    <li class="nav-item">
                        <a class="nav-link" href="/restaurants">Restaurantes</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/orders">Meus Pedidos</a>
                    </li>
                `;
            } else if (user.role === 'store') {
                navItems.innerHTML = `
                    <li class="nav-item">
                        <a class="nav-link" href="/store/dashboard">Dashboard</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/store/menu">Cardápio</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/store/orders">Pedidos</a>
                    </li>
                `;
            } else if (user.role === 'driver') {
                navItems.innerHTML = `
                    <li class="nav-item">
                        <a class="nav-link" href="/driver/available">Entregas Disponíveis</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/driver/deliveries">Minhas Entregas</a>
                    </li>
                `;
            }
        } else {
            authButtons.classList.remove('d-none');
            userInfo.classList.add('d-none');
            userName.textContent = '';
        }
    }

    static logout() {
        localStorage.removeItem('token');
        this.updateUI(null);
        window.location.href = '/';
    }
}

// Inicializar autenticação quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    AuthHandler.init();
});

// Funções globais para os modais
window.showLoginModal = () => {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
};

window.showRegisterModal = () => {
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
};

window.logout = () => {
    AuthHandler.logout();
};
