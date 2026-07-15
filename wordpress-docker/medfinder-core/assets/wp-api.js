document.addEventListener('DOMContentLoaded', () => {
  const WP_API_BASE = 'http://localhost:8080/wp-json/wp/v2';

  const state = {
    devotionals: [],
    sermons: []
  };

  const els = {
    devotionalsList:   document.getElementById('devotionals-list'),
    sermonslist:       document.getElementById('sermons-list'),
    devotionalsDetail: document.getElementById('devotionals-detail'),
    sermonsDetail:     document.getElementById('sermons-detail'),
    devotionalsCount:  document.getElementById('devotionals-count'),
    sermonsCount:      document.getElementById('sermons-count'),
    devotionalsSearch: document.getElementById('devotionals-search'),
    sermonsSearch:     document.getElementById('sermons-search'),
    homeDevotionals:   document.getElementById('home-devotionals-preview'),
    homeSermons:       document.getElementById('home-sermons-preview'),
  };

  function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function getErrorStateHtml(message) {
    return `
      <div class="state-container" style="grid-column:1/-1;">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        <p>${message}</p>
        <button class="btn-primary" onclick="window.location.reload()">Retry</button>
      </div>`;
  }

  function getLoadingStateHtml() {
    return `
      <div class="state-container" style="border:none;background:transparent;grid-column:1/-1;">
        <svg viewBox="0 0 24 24" style="animation:spin 1s linear infinite;"><path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/></svg>
        <p style="color:#8c8577;">Loading…</p>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
  }

  function getEmptyStateHtml(message) {
    return `
      <div class="state-container" style="grid-column:1/-1;border:none;background:transparent;">
        <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>
        <p style="color:#8c8577;">${message}</p>
      </div>`;
  }

  function buildCard(post, isPreview = false) {
    const title = post.title.rendered;
    const reference = post.meta?.scripture_reference || '';
    const date = formatDate(post.meta?.content_date || post.date);
    const rawExcerpt = post.excerpt?.rendered || post.content?.rendered || '';
    const excerpt = stripHtml(rawExcerpt).substring(0, 200).trim();
    const refTag = reference ? `<span class="tag">📖 ${reference}</span>` : '';

    if (isPreview) {
      return `
        <div class="card">
          <h4>${title}</h4>
          <div class="meta">${date}</div>
          <p class="excerpt">${excerpt}…</p>
          ${refTag}
        </div>`;
    }

    return `
      <div class="card" data-id="${post.id}">
        <h4>${title}</h4>
        <div class="meta">${date}</div>
        <p class="excerpt">${excerpt}…</p>
        <div class="card-footer">
          ${refTag}
          <span class="card-read-btn">Read →</span>
        </div>
      </div>`;
  }

  function buildDetailPanel(post, listEl, detailEl) {
    const title = post.title.rendered;
    const reference = post.meta?.scripture_reference || '';
    const date = formatDate(post.meta?.content_date || post.date);
    const content = post.content?.rendered || '<p>No content available.</p>';
    const refTag = reference ? `<span class="tag">📖 ${reference}</span>` : '';
    const openReaderBtn = reference
      ? `<button class="btn-primary" style="font-size:0.85rem;padding:0.4rem 1rem;" onclick="window._openInReader('${reference}')">Read in Scripture →</button>`
      : '';

    detailEl.innerHTML = `
      <button class="detail-back-btn" id="back-btn-${detailEl.id}">
        <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        Back to list
      </button>
      <h1 style="margin-bottom:var(--space-2);">${title}</h1>
      <div class="detail-meta-bar">
        <span class="meta">${date}</span>
        ${refTag}
        ${openReaderBtn}
      </div>
      <div class="detail-content">${content}</div>`;

    listEl.style.display = 'none';
    detailEl.style.display = 'block';
    window.scrollTo(0, 0);

    document.getElementById(`back-btn-${detailEl.id}`).addEventListener('click', () => {
      detailEl.style.display = 'none';
      listEl.style.display = 'grid';
      window.scrollTo(0, 0);
    });
  }

  async function loadAndRenderPosts(postType, posts, listEl, detailEl, countEl) {
    if (!listEl) return;
    listEl.innerHTML = getLoadingStateHtml();
    try {
      const response = await fetch(`${WP_API_BASE}/${postType}?_embed&per_page=100`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      posts.splice(0, posts.length, ...data);

      if (countEl) {
        countEl.textContent = data.length === 0
          ? 'No posts yet'
          : `${data.length} post${data.length > 1 ? 's' : ''}`;
      }

      renderGrid(posts, listEl, detailEl);
    } catch (err) {
      listEl.innerHTML = getErrorStateHtml('Could not load content. Make sure the WordPress backend is running.');
    }
  }

  function renderGrid(posts, listEl, detailEl, filter = '') {
    const filtered = filter
      ? posts.filter(p => {
          const haystack = (p.title.rendered + ' ' + stripHtml(p.content?.rendered || '')).toLowerCase();
          return haystack.includes(filter.toLowerCase());
        })
      : posts;

    if (filtered.length === 0) {
      listEl.innerHTML = filter
        ? getEmptyStateHtml(`No results for "${filter}".`)
        : getEmptyStateHtml('No posts yet. Add some from the WordPress admin!');
      return;
    }

    listEl.innerHTML = filtered.map(p => buildCard(p)).join('');

    listEl.querySelectorAll('.card[data-id]').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.getAttribute('data-id'));
        const post = posts.find(p => p.id === id);
        if (post) buildDetailPanel(post, listEl, detailEl);
      });
    });
  }

  function attachSearch(input, posts, listEl, detailEl) {
    if (!input) return;
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => renderGrid(posts, listEl, detailEl, input.value.trim()), 250);
    });
  }

  async function loadPreview(postType, container, limit = 3) {
    if (!container) return;
    container.innerHTML = getLoadingStateHtml();
    try {
      const response = await fetch(`${WP_API_BASE}/${postType}?_embed&per_page=${limit}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.length === 0) { container.innerHTML = getEmptyStateHtml('No content yet.'); return; }
      container.innerHTML = data.map(p => buildCard(p, true)).join('');
    } catch (err) {
      container.innerHTML = getErrorStateHtml('Could not connect to WordPress.');
    }
  }

  window._openInReader = function(reference) {
    const match = reference.match(/([1-3]?\s?[A-Za-z]+)\s(\d+)/);
    if (!match) return;
    const book = match[1].trim();
    const chapter = match[2];
    const bookSel = document.getElementById('book-select');
    const chapIn = document.getElementById('chapter-input');
    const loadBtn = document.getElementById('load-chapter-btn');
    const readerNav = document.querySelector('.nav-item[data-target="reader"]');
    if (!bookSel || !chapIn || !loadBtn || !readerNav) return;
    let found = false;
    Array.from(bookSel.options).forEach(opt => {
      if (opt.value.toLowerCase() === book.toLowerCase()) { bookSel.value = opt.value; found = true; }
    });
    if (found) { chapIn.value = chapter; readerNav.click(); loadBtn.click(); }
  };

  loadAndRenderPosts('devotionals', state.devotionals, els.devotionalsList, els.devotionalsDetail, els.devotionalsCount);
  loadAndRenderPosts('sermon_notes', state.sermons, els.sermonslist, els.sermonsDetail, els.sermonsCount);
  attachSearch(els.devotionalsSearch, state.devotionals, els.devotionalsList, els.devotionalsDetail);
  attachSearch(els.sermonsSearch, state.sermons, els.sermonslist, els.sermonsDetail);
  loadPreview('devotionals', els.homeDevotionals, 3);
  loadPreview('sermon_notes', els.homeSermons, 3);
});
