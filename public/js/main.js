// ========================================
// GLOW CARE - Main JavaScript
// ========================================

// Cart Management
class ShoppingCart {
  constructor() {
    this.items = this.loadCart();
    this.updateCartUI();
  }

  loadCart() {
    const saved = localStorage.getItem('glowCareCart');
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem('glowCareCart', JSON.stringify(this.items));
    this.updateCartUI();
  }

  addItem(product) {
    const existingItem = this.items.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({
        ...product,
        quantity: 1
      });
    }
    
    this.saveCart();
    this.showNotification(`${product.name} added to cart!`);
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
  }

  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item && quantity > 0) {
      item.quantity = quantity;
    } else if (quantity === 0) {
      this.removeItem(productId);
    }
    this.saveCart();
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  updateCartUI() {
    const badge = document.querySelector('.cart-badge');
    const count = this.getItemCount();
    
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    this.updateCartSidebar();
  }

  updateCartSidebar() {
    const cartItems = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.total-row.final .price');
    
    if (!cartItems) return;

    if (this.items.length === 0) {
      cartItems.innerHTML = '<p style="text-align:center;padding:2rem;color:#999;">Your cart is empty</p>';
      if (cartTotal) cartTotal.textContent = '₦0.00';
      return;
    }

    cartItems.innerHTML = this.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-image">🎁</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₦${(item.price * item.quantity).toLocaleString()}</div>
          <div class="quantity-control">
            <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
        </div>
        <button class="btn-remove" onclick="cart.removeItem('${item.id}')" style="background:none;border:none;color:#999;cursor:pointer;font-size:1.2rem;">×</button>
      </div>
    `).join('');

    if (cartTotal) {
      cartTotal.textContent = `₦${this.getTotal().toLocaleString()}`;
    }
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #d81e5b;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 5px;
      z-index: 5000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
  }
}

// Initialize cart
const cart = new ShoppingCart();

// Cart Toggle
function toggleCart() {
  const cartSidebar = document.querySelector('.cart-sidebar');
  if (cartSidebar) {
    cartSidebar.classList.toggle('active');
  }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Cart icon click
  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', toggleCart);
  }

  // Close cart button
  const closeBtn = document.querySelector('.cart-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', toggleCart);
  }

  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      filterProducts(this.dataset.category);
    });
  });

  // Add to cart buttons
  const addToCartBtns = document.querySelectorAll('.btn-add-cart');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const productCard = this.closest('.product-card');
      const product = {
        id: productCard.dataset.productId || 'product-' + Math.random(),
        name: productCard.querySelector('.product-name').textContent,
        price: parseFloat(productCard.querySelector('.price').textContent.replace('₦', '').replace(/,/g, '')),
        category: productCard.querySelector('.product-category').textContent
      };
      cart.addItem(product);
    });
  });
});

// Filter products
function filterProducts(category) {
  const products = document.querySelectorAll('.product-card');
  products.forEach(product => {
    if (category === 'all' || product.dataset.category === category) {
      product.style.display = 'block';
      product.style.animation = 'fadeIn 0.3s ease';
    } else {
      product.style.display = 'none';
    }
  });
}

// Sort products
function sortProducts(sortBy) {
  const container = document.querySelector('.products-grid');
  if (!container) return;

  const products = Array.from(container.querySelectorAll('.product-card'));
  
  products.sort((a, b) => {
    const priceA = parseFloat(a.querySelector('.price').textContent.replace('₦', '').replace(/,/g, ''));
    const priceB = parseFloat(b.querySelector('.price').textContent.replace('₦', '').replace(/,/g, ''));
    const nameA = a.querySelector('.product-name').textContent.toLowerCase();
    const nameB = b.querySelector('.product-name').textContent.toLowerCase();

    switch(sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'name':
        return nameA.localeCompare(nameB);
      default:
        return 0;
    }
  });

  products.forEach(product => container.appendChild(product));
}

// Close cart when clicking outside
document.addEventListener('click', function(event) {
  const cartSidebar = document.querySelector('.cart-sidebar');
  const cartIcon = document.querySelector('.cart-icon');
  
  if (cartSidebar && !cartSidebar.contains(event.target) && !cartIcon.contains(event.target)) {
    if (cartSidebar.classList.contains('active')) {
      cartSidebar.classList.remove('active');
    }
  }
});

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
