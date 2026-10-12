const API_URL = 'http://localhost:5000/api';
let selectedRole = 'student';

// Role tab selection
document.querySelectorAll('.role-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    selectedRole = tab.getAttribute('data-role');
  });
});

// Eye toggle for password
const eyeToggle = document.getElementById('eyeToggle');
const passwordInput = document.getElementById('password');

eyeToggle.addEventListener('click', (e) => {
  e.preventDefault();
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  eyeToggle.textContent = isPassword ? '🙈' : '👁️';
});

// Login form submission
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');
  
  // Clear previous errors
  errorMessage.style.display = 'none';
  document.getElementById('emailError').textContent = '';
  document.getElementById('passwordError').textContent = '';
  
  // Validation
  if (!email) {
    document.getElementById('emailError').textContent = 'Email is required';
    return;
  }
  
  if (!email.endsWith('@tce.edu')) {
    document.getElementById('emailError').textContent = 'Please use your TCE email (@tce.edu)';
    return;
  }
  
  if (!password) {
    document.getElementById('passwordError').textContent = 'Password is required';
    return;
  }
  
  if (password.length < 8) {
    document.getElementById('passwordError').textContent = 'Password must be at least 8 characters';
    return;
  }
  
  // Show loading state
  const submitBtn = loginForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Signing in...';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, role: selectedRole })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      errorMessage.textContent = data.error || 'Login failed. Please try again.';
      errorMessage.style.display = 'flex';
    }
  } catch (err) {
    console.error('Login error:', err);
    errorMessage.textContent = 'Connection error. Please try again.';
    errorMessage.style.display = 'flex';
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Signup modal functions
function openSignupModal(e) {
  if (e) e.preventDefault();
  document.getElementById('signupModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeSignupModal() {
  document.getElementById('signupModal').style.display = 'none';
  document.body.style.overflow = 'auto';
  document.getElementById('signupForm').reset();
}

// Signup form submission
const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('signupName').value.trim();
  const roll = document.getElementById('signupRoll').value.trim();
  const dept = document.getElementById('signupDept').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const phone = document.getElementById('signupPhone').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;
  
  // Validation
  if (!name || name.length < 3) {
    showToast('Name must be at least 3 characters', 'error');
    return;
  }
  
  const rollRegex = /^\d{2}[A-Z]{2}\d{3}$/;
  if (!rollRegex.test(roll)) {
    showToast('Roll number format: 21CS045', 'error');
    return;
  }
  
  if (!email.endsWith('@tce.edu')) {
    showToast('Please use your TCE email (@tce.edu)', 'error');
    return;
  }
  
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    showToast('Phone must be 10 digits starting with 6-9', 'error');
    return;
  }
  
  if (password.length < 8) {
    showToast('Password must be at least 8 characters', 'error');
    return;
  }
  
  if (!/\d/.test(password)) {
    showToast('Password must contain at least one number', 'error');
    return;
  }
  
  if (password !== confirmPassword) {
    showToast('Passwords do not match', 'error');
    return;
  }
  
  // Show loading state
  const submitBtn = signupForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Creating account...';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name,
        email,
        phone,
        roll_number: roll,
        department: dept,
        password,
        role: 'student'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast('Account created! Signing you in...', 'success');
      closeSignupModal();
      setTimeout(() => {
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
        loginForm.dispatchEvent(new Event('submit'));
      }, 1000);
    } else {
      showToast(data.error || 'Signup failed. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Signup error:', err);
    showToast('Connection error. Please try again.', 'error');
  } finally {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Social login handlers
document.getElementById('googleBtn').addEventListener('click', () => {
  window.location.href = `${API_URL}/auth/google`;
});

document.getElementById('appleBtn').addEventListener('click', () => {
  window.location.href = `${API_URL}/auth/apple`;
});

// Toast notification function
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Close modal on overlay click
document.getElementById('signupModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'signupModal') closeSignupModal();
});