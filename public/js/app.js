class App {
    static async init() {
        this.setupRouter();
        this.loadInitialContent();
    }

    static setupRouter() {
        window.addEventListener('popstate', () => this.handleRoute());
        document.body.addEventListener('click', (e) => {
            if (e.target.matches('a') && e.target.href.startsWith(window.location.origin)) {
                e.preventDefault();
                const url = new URL(e.target.href);
                history.pushState(null, '', url.pathname);
                this.handleRoute();
            }
        });
    }

    static async handleRoute() {
        const path = window.location.pathname;
        const mainContent = document.getElementById('mainContent');

        try {
            if (path === '/' || path === '/restaurants') {
                await this.showRestaurants();
            } else if (path.startsWith('/store/')) {
                const storeId = path.split('/')[2];
                await this.showStore(storeId);
            } else if (path === '/orders') {
                await this.showOrders();
            } else if (path === '/store/dashboard') {
                await this.showStoreDashboard();
            } else if (path === '/store/menu') {
                await this.showStoreMenu();
            } else if (path === '/store/orders') {
                await this.showStoreOrders();
            } else if (path === '/driver/available') {
                await this.showAvailableDeliveries();
            } else if (path === '/driver/deliveries') {
                await this.showDriverDeliveries();
            } else {
                mainContent.innerHTML = '<h1>Página não encontrada</h1>';
            }
        } catch (error) {
            console.error('Error handling route:', error);
            mainContent.innerHTML = '<h1>Erro ao carregar conteúdo</h1>';
        }
    }

    static async loadInitialContent() {
        await this.handleRoute();
    }

    static async showRestaurants() {
        const mainContent = document.getElementById('mainContent');
        try {
            const stores = await ApiService.getStores();
            mainContent.innerHTML = `
                <div class="search-bar">
                    <div class="row">
                        <div class="col-md-8">
                            <input type="text" class="form-control" placeholder="Buscar restaurantes..." id="searchInput">
                        </div>
                        <div class="col-md-4">
                            <select class="form-select" id="categoryFilter">
                                <option value="">Todas as categorias</option>
                                <option value="pizza">Pizza</option>
                                <option value="burger">Hambúrguer</option>
                                <option value="japanese">Japonês</option>
                                <option value="brazilian">Brasileiro</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="row" id="storesList">
                    ${stores.map(store => `
                        <div class="col-md-4">
                            <div class="card store-card">
                                <img src="${store.coverImage || 'https://via.placeholder.com/300x200'}" class="card-img-top" alt="${store.name}">
                                <div class="card-body">
                                    <h5 class="card-title">${store.name}</h5>
                                    <p class="card-text">${store.description || ''}</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="text-muted">
                                            <i class="fas fa-star text-warning"></i> ${store.rating.toFixed(1)}
                                        </span>
                                        <a href="/store/${store._id}" class="btn btn-primary">Ver Cardápio</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            // Adicionar event listeners para busca e filtro
            const searchInput = document.getElementById('searchInput');
            const categoryFilter = document.getElementById('categoryFilter');

            searchInput.addEventListener('input', async () => {
                const stores = await ApiService.getStores({
                    search: searchInput.value,
                    category: categoryFilter.value
                });
                this.updateStoresList(stores);
            });

            categoryFilter.addEventListener('change', async () => {
                const stores = await ApiService.getStores({
                    search: searchInput.value,
                    category: categoryFilter.value
                });
                this.updateStoresList(stores);
            });
        } catch (error) {
            console.error('Error loading stores:', error);
            mainContent.innerHTML = '<h1>Erro ao carregar restaurantes</h1>';
        }
    }

    static updateStoresList(stores) {
        const storesList = document.getElementById('storesList');
        storesList.innerHTML = stores.map(store => `
            <div class="col-md-4">
                <div class="card store-card">
                    <img src="${store.coverImage || 'https://via.placeholder.com/300x200'}" class="card-img-top" alt="${store.name}">
                    <div class="card-body">
                        <h5 class="card-title">${store.name}</h5>
                        <p class="card-text">${store.description || ''}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted">
                                <i class="fas fa-star text-warning"></i> ${store.rating.toFixed(1)}
                            </span>
                            <a href="/store/${store._id}" class="btn btn-primary">Ver Cardápio</a>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    static async showStore(storeId) {
        const mainContent = document.getElementById('mainContent');
        try {
            const [store, products] = await Promise.all([
                ApiService.getStore(storeId),
                ApiService.getStoreProducts(storeId)
            ]);

            // Agrupar produtos por categoria
            const productsByCategory = products.reduce((acc, product) => {
                if (!acc[product.category]) {
                    acc[product.category] = [];
                }
                acc[product.category].push(product);
                return acc;
            }, {});

            mainContent.innerHTML = `
                <div class="row">
                    <div class="col-md-8">
                        <div class="store-header mb-4">
                            <img src="${store.coverImage || 'https://via.placeholder.com/800x300'}" class="img-fluid rounded" alt="${store.name}">
                            <h1 class="mt-3">${store.name}</h1>
                            <p>${store.description || ''}</p>
                            <div class="d-flex align-items-center">
                                <span class="me-3">
                                    <i class="fas fa-star text-warning"></i> ${store.rating.toFixed(1)}
                                </span>
                                <span class="me-3">
                                    <i class="fas fa-motorcycle"></i> R$ ${store.deliveryFee.toFixed(2)}
                                </span>
                                <span>
                                    <i class="fas fa-clock"></i> ${store.isOpen ? 'Aberto' : 'Fechado'}
                                </span>
                            </div>
                        </div>

                        <div class="store-menu">
                            ${Object.entries(productsByCategory).map(([category, products]) => `
                                <div class="menu-category">
                                    <h3>${category}</h3>
                                    <div class="row">
                                        ${products.map(product => `
                                            <div class="col-md-6">
                                                <div class="card product-card">
                                                    <div class="row g-0">
                                                        <div class="col-4">
                                                            <img src="${product.image || 'https://via.placeholder.com/150'}" class="img-fluid rounded-start" alt="${product.name}">
                                                        </div>
                                                        <div class="col-8">
                                                            <div class="card-body">
                                                                <h5 class="card-title">${product.name}</h5>
                                                                <p class="card-text small">${product.description || ''}</p>
                                                                <div class="d-flex justify-content-between align-items-center">
                                                                    <span class="text-primary">R$ ${product.price.toFixed(2)}</span>
                                                                    <button class="btn btn-outline-primary btn-sm" onclick="App.addToCart(${JSON.stringify(product)})">
                                                                        Adicionar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="cart-summary">
                            <h3>Carrinho</h3>
                            <div id="cartItems">
                                <p class="text-muted">Seu carrinho está vazio</p>
                            </div>
                            <div class="cart-total mt-3">
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <span id="cartSubtotal">R$ 0,00</span>
                                </div>
                                <div class="d-flex justify-content-between mb-2">
                                    <span>Taxa de entrega:</span>
                                    <span>R$ ${store.deliveryFee.toFixed(2)}</span>
                                </div>
                                <div class="d-flex justify-content-between mb-3">
                                    <strong>Total:</strong>
                                    <strong id="cartTotal">R$ ${store.deliveryFee.toFixed(2)}</strong>
                                </div>
                                <button class="btn btn-primary w-100" onclick="App.checkout()">
                                    Fazer Pedido
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Inicializar carrinho
            this.cart = {
                items: [],
                store: store,
                subtotal: 0,
                total: store.deliveryFee
            };
        } catch (error) {
            console.error('Error loading store:', error);
            mainContent.innerHTML = '<h1>Erro ao carregar restaurante</h1>';
        }
    }

    static addToCart(product) {
        const existingItem = this.cart.items.find(item => item.product._id === product._id);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.items.push({
                product,
                quantity: 1
            });
        }

        this.updateCart();
    }

    static removeFromCart(productId) {
        const index = this.cart.items.findIndex(item => item.product._id === productId);
        if (index !== -1) {
            if (this.cart.items[index].quantity > 1) {
                this.cart.items[index].quantity--;
            } else {
                this.cart.items.splice(index, 1);
            }
        }
        this.updateCart();
    }

    static updateCart() {
        const cartItems = document.getElementById('cartItems');
        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTotal = document.getElementById('cartTotal');

        if (this.cart.items.length === 0) {
            cartItems.innerHTML = '<p class="text-muted">Seu carrinho está vazio</p>';
            this.cart.subtotal = 0;
        } else {
            cartItems.innerHTML = this.cart.items.map(item => `
                <div class="cart-item mb-2">
                    <div class="d-flex justify-content-between">
                        <div>
                            <h6 class="mb-0">${item.product.name}</h6>
                            <small class="text-muted">R$ ${item.product.price.toFixed(2)} x ${item.quantity}</small>
                        </div>
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-danger me-2" onclick="App.removeFromCart('${item.product._id}')">
                                -
                            </button>
                            <span>R$ ${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `).join('');

            this.cart.subtotal = this.cart.items.reduce((total, item) => 
                total + (item.product.price * item.quantity), 0);
        }

        this.cart.total = this.cart.subtotal + this.cart.store.deliveryFee;
        cartSubtotal.textContent = `R$ ${this.cart.subtotal.toFixed(2)}`;
        cartTotal.textContent = `R$ ${this.cart.total.toFixed(2)}`;
    }

    static async checkout() {
        if (!this.cart.items.length) {
            alert('Adicione itens ao carrinho para fazer o pedido');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Faça login para continuar com o pedido');
                showLoginModal();
                return;
            }

            const user = await ApiService.getProfile();
            if (!user.address) {
                alert('Adicione um endereço de entrega no seu perfil');
                window.location.href = '/profile';
                return;
            }

            const orderData = {
                storeId: this.cart.store._id,
                items: this.cart.items.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.price
                })),
                deliveryAddress: user.address
            };

            const order = await ApiService.createOrder(orderData);
            alert(`Pedido criado com sucesso! Use o código PIX: ${order.pixCode}`);
            this.cart.items = [];
            this.updateCart();
            window.location.href = '/orders';
        } catch (error) {
            alert('Erro ao criar pedido: ' + error.message);
        }
    }

    // Implementar outras funções de visualização conforme necessário
}

// Inicializar aplicação quando o documento carregar
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Tornar App acessível globalmente
window.App = App;
