document.addEventListener('DOMContentLoaded', () => {
  const navItems = document.querySelectorAll('.nav-item');
  const pageViews = document.querySelectorAll('.page-view');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      pageViews.forEach(view => view.classList.remove('active'));
      const targetId = item.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
      setTimeout(updateRibbonMarker, 50);
      window.scrollTo(0, 0);
    });
  });

  const ribbonTrack = document.getElementById('ribbon-track');
  const ribbonMarker = document.getElementById('ribbon-marker');

  function updateRibbonMarker() {
    if (!ribbonTrack || !ribbonMarker) return;
    const isReaderActive = document.getElementById('reader').classList.contains('active');
    if (!isReaderActive || window.innerWidth <= 768) {
      ribbonTrack.style.display = 'none';
      return;
    }
    const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (scrollTotal <= 0) {
      ribbonTrack.style.display = 'none';
      return;
    }
    ribbonTrack.style.display = 'block';
    const scrollPosition = document.documentElement.scrollTop;
    const scrollPercentage = Math.min((scrollPosition / scrollTotal) * 100, 100);
    ribbonMarker.style.height = `${scrollPercentage}%`;
  }

  if (ribbonTrack) {
    ribbonTrack.addEventListener('click', (e) => {
      const trackRect = ribbonTrack.getBoundingClientRect();
      const clickY = e.clientY - trackRect.top;
      const clickPercentage = clickY / trackRect.height;
      const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const targetScroll = scrollTotal * clickPercentage;
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', updateRibbonMarker, { passive: true });
  window.addEventListener('resize', updateRibbonMarker);
  setTimeout(updateRibbonMarker, 100);
});
