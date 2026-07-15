document.addEventListener('DOMContentLoaded', () => {
  const votdContainer = document.getElementById('votd-container');
  const readerContent = document.getElementById('reader-content');
  const loadBtn = document.getElementById('load-chapter-btn');
  const bookSelect = document.getElementById('book-select');
  const chapterInput = document.getElementById('chapter-input');
  const translationSelect = document.getElementById('translation-select');

  const books = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
    "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
    "Ezra", "Nehemiah", "Esther", "Job", "Psalms",
    "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah",
    "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea",
    "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum",
    "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
    "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
    "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
    "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
    "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
    "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
    "Jude", "Revelation"
  ];

  if (bookSelect) {
    bookSelect.innerHTML = '';
    books.forEach(book => {
      const option = document.createElement('option');
      option.value = book;
      option.textContent = book;
      bookSelect.appendChild(option);
    });
    bookSelect.value = 'John';
  }

  if (chapterInput) chapterInput.value = '3';

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

  async function loadVOTD() {
    if (!votdContainer) return;
    votdContainer.innerHTML = getLoadingStateHtml();
    try {
      const response = await fetch('https://bible-api.com/john+3:16?translation=web');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      votdContainer.innerHTML = `
        <div class="scripture-text">${data.text}</div>
        <div style="margin-top:var(--space-2);margin-bottom:var(--space-4);font-family:var(--font-ui);font-size:0.85rem;color:#8c8577;">
          — ${data.reference} (${data.translation_id.toUpperCase()})
        </div>
        <button class="btn-primary" onclick="document.querySelector('[data-target=\\'reader\\']').click();">Read Full Chapter</button>`;
    } catch (error) {
      votdContainer.innerHTML = getErrorStateHtml('Error loading Verse of the Day.');
    }
  }

  async function loadChapter() {
    if (!bookSelect || !chapterInput || !translationSelect || !readerContent) return;
    const book = bookSelect.value;
    const chapter = chapterInput.value;
    const translation = translationSelect.value;
    const reference = `${book} ${chapter}`;
    readerContent.innerHTML = getLoadingStateHtml();
    try {
      const cacheKey = `bible_${translation}_${reference}`;
      const cached = localStorage.getItem(cacheKey);
      let data;
      if (cached) {
        data = JSON.parse(cached);
      } else {
        const response = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation}`);
        if (!response.ok) throw new Error('Passage not found or API error');
        data = await response.json();
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch(e) {}
      }

      let html = `
        <div class="chapter-heading-container">
          <h2>${data.reference}</h2>
          <button id="save-chapter-btn" class="btn-primary" style="font-size:0.85rem;padding:0.4rem 1rem;">Save Chapter</button>
        </div>`;

      let paragraphHTML = '<p>';
      data.verses.forEach((verse, index) => {
        paragraphHTML += `<span class="verse-num">${verse.verse}</span>${verse.text} `;
        if ((index + 1) % 4 === 0 && index !== data.verses.length - 1) {
          paragraphHTML += '</p><p>';
        }
      });
      paragraphHTML += '</p>';
      html += paragraphHTML;
      readerContent.innerHTML = html;

      const saveBtn = document.getElementById('save-chapter-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const textPreview = data.text.substring(0, 150) + '...';
          if (window.addFavorite) {
            window.addFavorite(data.reference, textPreview);
          } else {
            alert("Please log in to save favorites.");
          }
        });
      }

      window.scrollTo(0, 0);
      window.dispatchEvent(new Event('scroll'));
    } catch (error) {
      readerContent.innerHTML = getErrorStateHtml('Error loading passage. Please check your reference and try again.');
    }
  }

  if (loadBtn) loadBtn.addEventListener('click', loadChapter);

  loadVOTD();
  loadChapter();
});
