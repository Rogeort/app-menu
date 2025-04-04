class ProductManager {
    constructor() {
        this.STORAGE_KEY = 'restaurantOrder';
        this.order = this.loadFromStorage();
        this.currentSelectedDish = null;
    }

    init() {
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        // Product selection - shows details
        document.querySelectorAll('.product-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('badge')) {
                    this.showDishDetails(item);
                    this.updateDetails(item);
                }
            });
        });


        document.getElementById('checkout').addEventListener('click', () => {
            this.processCheckout();
        });




        // Add to order button
        document.querySelector('.add').addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentSelectedDish) {
                this.addProductToOrder(this.currentSelectedDish);
            }
        });

        // Clear order button
        document.querySelector('#clearOrder').addEventListener('click', () => {
            this.clearOrder();
        });

        // Handle quantity changes in the table
        document.querySelector('#orderSummary tbody').addEventListener('click', (e) => {
            if (e.target.classList.contains('qty-btn')) {
                const productId = e.target.dataset.productId;
                const action = e.target.dataset.action;
                this.adjustQuantity(productId, action);
            }
        });
    }

    showDishDetails(item) {
        // Store the currently selected dish
        this.currentSelectedDish = item;
        
        // Highlight selected item
        document.querySelectorAll('.product-item').forEach(i => {
            i.classList.remove('selected');
        });
        item.classList.add('selected');
    }

    updateDetails(item) {
        const dishName = item.dataset.name;
        const dishDescription = item.dataset.description;
        const dishPrice = parseFloat(item.dataset.price) || 0;
        const isVegetarian = item.dataset.isVegetarian === 'true';
        const isVegan = item.dataset.isVegan === 'true';
        const isGlutenFree = item.dataset.isGlutenFree === 'true';
        const isSpicy = item.dataset.isSpicy === 'true';
        const calories = parseInt(item.dataset.calories) || null;
        
        const properties = this.getDishPropertiesString({
            isVegetarian,
            isVegan,
            isGlutenFree,
            isSpicy
        });

        const detailCard = document.querySelector('.col-md-6 .card');

        detailCard.querySelector('.card-title').textContent = dishName;
        detailCard.querySelector('.card-text').textContent = dishDescription;
        
        let propertiesText = `$${dishPrice.toFixed(2)}`;
        if (calories) propertiesText += ` • ${calories} cal`;
        propertiesText += ` • ${properties}`;
        
        detailCard.querySelector('.text-muted').textContent = propertiesText;
        
        const img = document.getElementById("img-dish");
        console.log(item.dataset.url)
        img.src = item.dataset.url;
        const addButton = detailCard.querySelector('.add');
        addButton.dataset.id = item.dataset.id;
        addButton.dataset.name = dishName;
        addButton.dataset.price = dishPrice;
        addButton.dataset.isVegetarian = isVegetarian;
        addButton.dataset.isVegan = isVegan;
        addButton.dataset.isGlutenFree = isGlutenFree;
        addButton.dataset.isSpicy = isSpicy;
        addButton.dataset.calories = calories || '';
    }

    getDishPropertiesString(properties) {
        const props = [];
        if (properties.isVegetarian) props.push('Vegetarian');
        if (properties.isVegan) props.push('Vegan');
        if (properties.isGlutenFree) props.push('Gluten Free');
        if (properties.isSpicy) props.push('Spicy');
        return props.join(' • ') || 'Standard';
    }


    addProductToOrder(productElement) {
        const productId = productElement.dataset.id;
        const productName = productElement.dataset.name;
        const productPrice = parseFloat(productElement.dataset.price) || 0;
        const isVegetarian = productElement.dataset.isVegetarian === 'true';
        const isVegan = productElement.dataset.isVegan === 'true';
        const isGlutenFree = productElement.dataset.isGlutenFree === 'true';
        const isSpicy = productElement.dataset.isSpicy === 'true';
        const calories = parseInt(productElement.dataset.calories) || null;
        
        const existingItem = this.order.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.order.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1,
                isVegetarian,
                isVegan,
                isGlutenFree,
                isSpicy,
                calories,
                properties: this.getDishPropertiesString({
                    isVegetarian,
                    isVegan,
                    isGlutenFree,
                    isSpicy
                })
            });
        }

        this.saveToStorage();
        this.updateUI();
    }


    adjustQuantity(productId, action) {
        const item = this.order.find(item => item.id === productId);
        
        if (item) {
            if (action === 'increase') {
                item.quantity += 1;
            } else if (action === 'decrease') {
                item.quantity -= 1;
                if (item.quantity <= 0) {
                    this.order = this.order.filter(i => i.id !== productId);
                }
            } else if (action === 'remove') {
                this.order = this.order.filter(i => i.id !== productId);
            }
            
            this.saveToStorage();
            this.updateUI();
        }
    }

    updateUI() {
        this.renderOrderSummary();
        this.updateProductBadges();
        this.updateTotal();
    }

    renderOrderSummary() {
        const tbody = document.querySelector('#orderSummary tbody');
        tbody.innerHTML = '';

        this.order.forEach(item => {
            // Ensure price is a number before using toFixed()
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            const subtotal = (price * quantity).toFixed(2);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>$${price.toFixed(2)}</td>
                <td class="qty-controls">
                    <button class="btn btn-sm btn-outline-secondary qty-btn" data-action="decrease" data-product-id="${item.id}">-</button>
                    <span class="mx-2">${quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary qty-btn" data-action="increase" data-product-id="${item.id}">+</button>
                </td>
                <td>$${subtotal}</td>
                <td><button class="btn btn-sm btn-danger qty-btn" data-action="remove" data-product-id="${item.id}">Remove</button></td>
            `;
            tbody.appendChild(row);
        });
    }
    updateProductBadges() {
        document.querySelectorAll('.product-item').forEach(item => {
            const productId = item.dataset.id;
            const badge = item.querySelector('.badge');
            const orderItem = this.order.find(i => i.id === productId);
            
            if (orderItem) {
                badge.textContent = `$${orderItem.price.toFixed(2)} (${orderItem.quantity})`;
                badge.classList.remove('bg-primary');
                badge.classList.add('bg-success');
            } else {
                badge.textContent = `$${item.dataset.price}`;
                badge.classList.remove('bg-success');
                badge.classList.add('bg-primary');
            }
        });
    }

    updateTotal() {
        const total = this.order.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        let totalDisplay = document.querySelector('.total-display');
        if (!totalDisplay) {
            totalDisplay = document.createElement('div');
            totalDisplay.className = 'total-display alert alert-info mt-3';
            document.querySelector('#orderSummary').after(totalDisplay);
        }
        totalDisplay.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
    }

    saveToStorage() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.order));
    }

    loadFromStorage() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    clearOrder() {
        if (confirm('Are you sure you want to clear your order?')) {
            localStorage.removeItem(this.STORAGE_KEY);
            this.order = [];
            this.updateUI();
        }
    }

    getCSRFToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }

    async processCheckout() {
        if (this.order.length === 0) {
            alert('Your order is empty!');
            return;
        }

        try {
            const response = await fetch('/api/sales/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCSRFToken()
                },
                body: JSON.stringify({
                    items: this.order
                })
            });

            if (!response.ok) {
                throw new Error('Checkout failed');
            }

            alert('Order completed successfully!');
            this.clearOrder();
            
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Error during checkout');
        }
    }

    calculateTotal() {
        return this.order.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);
    }

    getCSRFToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue;
    }

    showSuccessMessage(orderId) {
        // Create or update success message
        let successDiv = document.querySelector('.order-success');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'order-success alert alert-success mt-3';
            document.querySelector('#orderSummary').after(successDiv);
        }
        
        successDiv.innerHTML = `
            <h4>Order #${orderId} placed successfully!</h4>
            <p>Thank you for your order.</p>
            <button class="btn btn-sm btn-outline-success" onclick="this.parentElement.remove()">OK</button>
        `;
    }








}












// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const productManager = new ProductManager();
    productManager.init();
});