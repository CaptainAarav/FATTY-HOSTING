// API Configuration
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3001/api'
    : '/api';

// State
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// DOM Elements
const modals = {
    login: document.getElementById('loginModal'),
    register: document.getElementById('registerModal'),
    serverRequest: document.getElementById('serverRequestModal'),
    dashboard: document.getElementById('dashboardModal')
};

const forms = {
    login: document.getElementById('loginForm'),
    register: document.getElementById('registerForm'),
    serverRequest: document.getElementById('serverRequestForm'),
    contact: document.querySelector('.contact-form')
};

const buttons = {
    login: document.getElementById('loginBtn'),
    register: document.getElementById('registerBtn'),
    logout: document.getElementById('logoutBtn'),
    dashboard: document.getElementById('dashboardBtn'),
    getStarted: document.querySelectorAll('.btn-primary')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    checkAuth();
});

function initializeApp() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            navbar.style.background = 'rgba(26, 26, 26, 0.95)';
        } else {
            navbar.style.background = 'var(--bg-secondary)';
        }
        lastScroll = currentScroll;
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

function setupEventListeners() {
    // Auth buttons
    buttons.login?.addEventListener('click', () => openModal('login'));
    buttons.register?.addEventListener('click', () => openModal('register'));
    buttons.logout?.addEventListener('click', logout);
    buttons.dashboard?.addEventListener('click', () => openDashboard());

    // Get Started buttons
    buttons.getStarted.forEach(btn => {
        if (btn.textContent.includes('Get Started')) {
            btn.addEventListener('click', handleGetStarted);
        }
    });

    // Modal switches
    document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('login');
        openModal('register');
    });

    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('register');
        openModal('login');
    });

    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('modal-active');
        });
    });

    window.addEventListener('click', (e) => {
        Object.values(modals).forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('modal-active');
            }
        });
    });

    // Form submissions
    forms.login?.addEventListener('submit', handleLogin);
    forms.register?.addEventListener('submit', handleRegister);
    forms.serverRequest?.addEventListener('submit', handleServerRequest);
    forms.contact?.addEventListener('submit', handleContact);
}

// Authentication
async function checkAuth() {
    if (!authToken) {
        updateUIForLoggedOut();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            updateUIForLoggedIn();
        } else {
            localStorage.removeItem('authToken');
            authToken = null;
            updateUIForLoggedOut();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        updateUIForLoggedOut();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            updateUIForLoggedIn();
            closeModal('login');
            showAlert('Login successful!', 'success');
            forms.login.reset();
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            updateUIForLoggedIn();
            closeModal('register');
            showAlert('Registration successful!', 'success');
            forms.register.reset();
        } else {
            showAlert(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('Registration failed. Please try again.', 'error');
    }
}

function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    updateUIForLoggedOut();
    showAlert('Logged out successfully', 'success');
}

// Server Request
function handleGetStarted(e) {
    e.preventDefault();
    if (!currentUser) {
        openModal('login');
        showAlert('Please login or create an account to request a server', 'error');
    } else {
        openModal('serverRequest');
    }
}

async function handleServerRequest(e) {
    e.preventDefault();

    const serverName = document.getElementById('serverName').value;
    const playerCount = parseInt(document.getElementById('playerCount').value);
    const ampUsername = document.getElementById('ampUsername').value;
    const ampPassword = document.getElementById('ampPassword').value;

    try {
        const response = await fetch(`${API_URL}/servers/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                serverName,
                playerCount,
                ampUsername,
                ampPassword
            })
        });

        const data = await response.json();

        if (data.success) {
            closeModal('serverRequest');
            showAlert('Server request submitted successfully! Check your email for updates.', 'success');
            forms.serverRequest.reset();
        } else {
            showAlert(data.message || 'Failed to submit request', 'error');
        }
    } catch (error) {
        console.error('Server request error:', error);
        showAlert('Failed to submit request. Please try again.', 'error');
    }
}

// Dashboard
async function openDashboard() {
    openModal('dashboard');
    loadUserRequests();
}

async function loadUserRequests() {
    const requestsList = document.getElementById('requestsList');
    requestsList.innerHTML = '<p style="text-align: center;">Loading...</p>';

    try {
        const response = await fetch(`${API_URL}/servers/my-requests`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            if (data.requests.length === 0) {
                requestsList.innerHTML = `
                    <div class="empty-state">
                        <p>You haven't requested any servers yet.</p>
                        <button class="btn btn-primary" onclick="closeModal('dashboard'); handleGetStarted(event);">Request Your First Server</button>
                    </div>
                `;
            } else {
                requestsList.innerHTML = data.requests.map(req => `
                    <div class="request-card">
                        <div class="request-header">
                            <h4>${req.server_name}</h4>
                            <span class="status-badge status-${req.status}">${req.status}</span>
                        </div>
                        <div class="request-details">
                            <div><strong>Players:</strong> ${req.player_count}</div>
                            <div><strong>Username:</strong> ${req.amp_username}</div>
                            <div><strong>Requested:</strong> ${new Date(req.created_at).toLocaleDateString()}</div>
                            <div><strong>Status:</strong> ${req.status}</div>
                        </div>
                    </div>
                `).join('');
            }
        } else {
            requestsList.innerHTML = '<p style="text-align: center; color: #f44336;">Failed to load requests</p>';
        }
    } catch (error) {
        console.error('Load requests error:', error);
        requestsList.innerHTML = '<p style="text-align: center; color: #f44336;">Failed to load requests</p>';
    }
}

// Contact Form
function handleContact(e) {
    e.preventDefault();
    showAlert('Thank you for your message! We will get back to you soon.', 'success');
    forms.contact.reset();
}

// UI Updates
function updateUIForLoggedIn() {
    document.getElementById('authButtons').style.display = 'none';
    document.getElementById('userMenu').style.display = 'flex';
    document.getElementById('userName').textContent = currentUser?.name || 'User';
}

function updateUIForLoggedOut() {
    document.getElementById('authButtons').style.display = 'flex';
    document.getElementById('userMenu').style.display = 'none';
}

// Modal Management
function openModal(modalName) {
    if (modals[modalName]) {
        modals[modalName].classList.add('modal-active');
    }
}

function closeModal(modalName) {
    if (modals[modalName]) {
        modals[modalName].classList.remove('modal-active');
    }
}

// Alert System
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '3000';
    alert.style.maxWidth = '400px';

    document.body.appendChild(alert);

    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}
