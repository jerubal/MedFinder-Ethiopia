const Auth = {
  getCredentials() {
    const creds = localStorage.getItem('bac_creds');
    if (creds) return JSON.parse(creds);
    return null;
  },

  setCredentials(username, password) {
    const encoded = btoa(`${username}:${password}`);
    localStorage.setItem('bac_creds', JSON.stringify({ username, token: encoded }));
    this.notifyAuthChange();
  },

  clearCredentials() {
    localStorage.removeItem('bac_creds');
    this.notifyAuthChange();
  },

  isLoggedIn() {
    return this.getCredentials() !== null;
  },

  getAuthHeader() {
    const creds = this.getCredentials();
    if (creds) return { 'Authorization': `Basic ${creds.token}` };
    return {};
  },

  notifyAuthChange() {
    const event = new Event('auth_changed');
    document.dispatchEvent(event);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginStatus = document.getElementById('login-status');
  const loginFormContainer = document.getElementById('login-form-container');
  const loggedInContainer = document.getElementById('logged-in-container');
  const currentUserDisplay = document.getElementById('current-user');
  const logoutBtn = document.getElementById('logout-btn');

  function updateAuthUI() {
    if (Auth.isLoggedIn()) {
      loginFormContainer.style.display = 'none';
      loggedInContainer.style.display = 'block';
      currentUserDisplay.textContent = Auth.getCredentials().username;
    } else {
      loginFormContainer.style.display = 'block';
      loggedInContainer.style.display = 'none';
      loginStatus.innerHTML = '';
    }
  }

  function setStatus(message, isError = false) {
    if (!message) { loginStatus.innerHTML = ''; return; }
    if (isError) {
      loginStatus.innerHTML = `
        <div style="background:rgba(107,39,55,0.05);border-left:4px solid var(--wine);padding:var(--space-2);margin-top:var(--space-3);display:flex;align-items:center;gap:var(--space-2);font-size:0.9rem;">
          <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:var(--wine);"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <span>${message}</span>
        </div>`;
    } else {
      loginStatus.innerHTML = `<div style="padding:var(--space-2);margin-top:var(--space-3);font-size:0.9rem;color:#8c8577;">${message}</div>`;
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;
      setStatus('Logging in...', false);
      try {
        const encoded = btoa(`${username}:${password}`);
        const response = await fetch('http://localhost:8080/wp-json/wp/v2/users/me', {
          headers: { 'Authorization': `Basic ${encoded}` }
        });
        if (response.ok) {
          Auth.setCredentials(username, password);
          loginForm.reset();
        } else {
          setStatus('Invalid credentials. Please check your username and application password and try again.', true);
        }
      } catch (error) {
        setStatus('A network error occurred. Ensure your WordPress backend is reachable.', true);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => Auth.clearCredentials());
  }

  document.addEventListener('auth_changed', updateAuthUI);
  updateAuthUI();
});
