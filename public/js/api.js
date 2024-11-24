const API_URL = '/api';

class ApiService {
    static async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro na requisição');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Autenticação
    static async login(email, password) {
        return this.request('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async register(userData) {
        return this.request('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async getProfile() {
        return this.request('/users/profile');
    }

    static async updateProfile(profileData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Lojas
    static async getStores(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/stores${queryString ? `?${queryString}` : ''}`);
    }

    static async getStore(id) {
        return this.request(`/stores/${id}`);
    }

    static async createStore(storeData) {
        return this.request('/stores', {
            method: 'POST',
            body: JSON.stringify(storeData)
        });
    }

    static async updateStore(id, storeData) {
        return this.request(`/stores/${id}`, {
            method: 'PUT',
            body: JSON.stringify(storeData)
        });
    }

    // Produtos
    static async getStoreProducts(storeId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/products/store/${storeId}${queryString ? `?${queryString}` : ''}`);
    }

    static async searchProducts(query) {
        return this.request(`/products/search?q=${encodeURIComponent(query)}`);
    }

    static async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    static async updateProduct(id, productData) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    // Pedidos
    static async createOrder(orderData) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    }

    static async getUserOrders() {
        return this.request('/orders/my-orders');
    }

    static async getStoreOrders() {
        return this.request('/orders/store-orders');
    }

    static async getAvailableDeliveries() {
        return this.request('/orders/available-deliveries');
    }

    static async acceptDelivery(orderId) {
        return this.request(`/orders/${orderId}/accept-delivery`, {
            method: 'POST'
        });
    }

    static async updateOrderStatus(orderId, status) {
        return this.request(`/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }
}
