document.addEventListener('DOMContentLoaded', () => {
  const favoritesList = document.getElementById('favorites-list');
  const FAV_API_BASE = 'http://localhost:8080/wp-json/bibleapp/v1/favorites';

  function getErrorStateHtml(message) {
    return `
      <div class="state-container">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        <p>${message}</p>
        <button class="btn-primary" onclick="window.location.reload()">Retry</button>
      </div>`;
  }

  function getLoadingStateHtml() {
    return `
      <div class="state-container" style="border:none;background:transparent;">
        <svg viewBox="0 0 24 24" style="animation:spin 1s linear infinite;"><path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/></svg>
        <p style="color:#8c8577;">Loading...</p>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
  }

  function getLoggedOutStateHtml() {
    return `
      <div class="state-container">
        <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
        <p>Please log in to view and save your favorite verses.</p>
        <button class="btn-primary" onclick="document.querySelector('[data-target=\\'login\\']').click();">Go to Login</button>
      </div>`;
  }

  async function loadFavorites() {
    if (!favoritesList) return;
    if (!Auth.isLoggedIn()) {
      favoritesList.innerHTML = getLoggedOutStateHtml();
      favoritesList.classList.remove('card-grid');
      return;
    }

    favoritesList.innerHTML = getLoadingStateHtml();
    favoritesList.classList.remove('card-grid');

    try {
      const response = await fetch(FAV_API_BASE, { headers: Auth.getAuthHeader() });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) throw new Error('Unauthorized');
        throw new Error('Network response was not ok');
      }
      const favorites = await response.json();
      renderFavorites(favorites);
    } catch (error) {
      if (error.message === 'Unauthorized') {
        favoritesList.innerHTML = getLoggedOutStateHtml();
        Auth.clearCredentials();
      } else {
        favoritesList.innerHTML = getErrorStateHtml('Error loading favorites.');
      }
    }
  }

  function renderFavorites(favorites) {
    if (favorites.length === 0) {
      favoritesList.innerHTML = `
        <div class="state-container" style="border:none;background:transparent;">
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <p style="color:#8c8577;">You have no saved favorites yet.</p>
          <button class="btn-primary" onclick="document.querySelector('[data-target=\\'reader\\']').click();">Read the Bible</button>
        </div>`;
      favoritesList.classList.remove('card-grid');
      return;
    }

    favoritesList.classList.add('card-grid');
    favoritesList.innerHTML = favorites.map(fav => `
      <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <h4>${fav.reference}</h4>
          <div class="meta">Added: ${new Date(fav.added_at).toLocaleDateString()}</div>
          <div class="scripture-text" style="font-size:1.1rem;line-height:1.5;margin-bottom:var(--space-3);">${fav.text}</div>
        </div>
        <button class="remove-fav-btn" data-reference="${fav.reference}" style="background:transparent;color:var(--wine);border:1px solid var(--wine);padding:0.25rem 0.75rem;border-radius:4px;font-size:0.8rem;cursor:pointer;align-self:flex-start;">Remove</button>
      </div>`).join('');

    document.querySelectorAll('.remove-fav-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        await removeFavorite(e.target.getAttribute('data-reference'));
      });
    });
  }

  async function removeFavorite(reference) {
    try {
      const response = await fetch(FAV_API_BASE, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...Auth.getAuthHeader() },
        body: JSON.stringify({ reference })
      });
      if (response.ok) loadFavorites();
      else alert('Failed to remove favorite.');
    } catch (error) {
    }
  }

  window.addFavorite = async function(reference, text) {
    if (!Auth.isLoggedIn()) {
      const loginBtn = document.querySelector('[data-target=\'login\']');
      if (loginBtn) loginBtn.click();
      const loginStatus = document.getElementById('login-status');
      if (loginStatus) {
        loginStatus.innerHTML = `
          <div style="background:rgba(176,141,62,0.1);border-left:4px solid var(--aged-brass);padding:var(--space-2);margin-top:var(--space-2);display:flex;align-items:center;gap:var(--space-2);font-size:0.9rem;">
            <svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:var(--aged-brass);"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <span>Please log in to save favorites.</span>
          </div>`;
      }
      return;
    }
    try {
      const response = await fetch(FAV_API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...Auth.getAuthHeader() },
        body: JSON.stringify({ reference, text })
      });
      if (response.ok) { alert(`Saved ${reference} to favorites!`); loadFavorites(); }
      else alert('Failed to save favorite.');
    } catch (error) {
    }
  };

  document.addEventListener('auth_changed', loadFavorites);
  loadFavorites();
});
