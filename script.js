document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const menuButton = document.querySelector('.c-menu-toggle');
  const navigation = document.querySelector('.l-navbar__nav');
  function closeMenu() {
    navigation?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    if (menuButton) menuButton.innerHTML = 'Menu <span aria-hidden="true">☰</span>';
  }
  menuButton?.addEventListener('click', () => {
    const open = !navigation.classList.contains('is-open');
    navigation.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.innerHTML = open ? 'Close <span aria-hidden="true">×</span>' : 'Menu <span aria-hidden="true">☰</span>';
  });
  navigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation?.classList.contains('is-open')) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.l-navbar') && navigation?.classList.contains('is-open')) closeMenu(); });
  window.matchMedia('(min-width: 981px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const studioButton = document.querySelector('.c-studio-toggle');
  function setStudio(night) {
    root.dataset.background = night ? 'night' : 'day';
    if (studioButton) {
      studioButton.setAttribute('aria-pressed', String(night));
      studioButton.setAttribute('aria-label', night ? 'Brighten the studio background' : 'Dim the studio background');
      studioButton.title = studioButton.getAttribute('aria-label');
      studioButton.textContent = night ? '☾' : '☀';
    }
    try { localStorage.setItem('ragvendar-studio-night', String(night)); } catch (_) {}
  }
  let night = false; try { night = localStorage.getItem('ragvendar-studio-night') === 'true'; } catch (_) {}
  setStudio(night);
  studioButton?.addEventListener('click', () => setStudio(root.dataset.background !== 'night'));

  const mainImage = document.getElementById('nexusMainImg');
  const badge = document.getElementById('nexusMediaBadge');
  const realButton = document.getElementById('btnToggleReal');
  const aiButton = document.getElementById('btnToggleAi');
  const thumbs = [...document.querySelectorAll('.c-nexus-mini-thumb')];
  function setNexus(src, label, alt) {
    if (!mainImage) return;
    mainImage.src = src;
    mainImage.alt = alt || label;
    badge.textContent = label;
    const ai = src.includes('00_nexus_approved');
    [[realButton, !ai], [aiButton, ai]].forEach(([button, active]) => { button?.classList.toggle('is-active', active); button?.setAttribute('aria-pressed', String(active)); });
    thumbs.forEach(button => { const active = button.dataset.src === src; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); });
  }
  realButton?.addEventListener('click', () => setNexus('assets/images/nexus_westend/real_front.png', 'Executed installation · Nexus Westend Mall, Pune'));
  aiButton?.addEventListener('click', () => setNexus('assets/images/nexus_westend/00_nexus_approved_ai_concept.jpg', 'AI concept visualization · Lotus & Peacock Pavilion'));
  thumbs.forEach(button => button.addEventListener('click', () => setNexus(button.dataset.src, button.dataset.label, button.dataset.alt)));
  if (mainImage) setNexus(mainImage.getAttribute('src'), badge.textContent.trim(), mainImage.alt);

  const sections = [...document.querySelectorAll('section[id], article[id]')];
  const navLinks = [...document.querySelectorAll('.l-navbar__link[href^="#"]')];
  function updateNavigation() {
    let current = null;
    sections.forEach(section => { if (section.getBoundingClientRect().top <= 170) current = section.id; });
    navLinks.forEach(link => link.classList.toggle('is-active', link.hash === '#' + current));
  }
  window.addEventListener('scroll', updateNavigation, { passive: true });
  updateNavigation();

  const canvas = document.getElementById('scrollCanvas');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const frameCount = 90;
  const cache = new Map();
  let currentFrame = 0, targetFrame = 0, animationId = null;
  function framePath(index) { return 'frames/frame_' + String(index + 1).padStart(3, '0') + '.jpg'; }
  function loadFrame(index) {
    index = Math.min(frameCount - 1, Math.max(0, index));
    if (cache.has(index)) return;
    const image = new Image();
    cache.set(index, image);
    image.onload = () => renderFrame(Math.round(currentFrame));
    image.src = framePath(index);
    if (cache.size > 24) {
      const candidates = [...cache.keys()].filter(key => key !== 0 && Math.abs(key - targetFrame) > 4).sort((a, b) => Math.abs(b - targetFrame) - Math.abs(a - targetFrame));
      while (cache.size > 24 && candidates.length) cache.delete(candidates.shift());
    }
  }
  function requestNearby(index) { [0, -1, 1, -2, 2].forEach(offset => loadFrame(index + offset)); }
  function renderFrame(index) {
    let image = cache.get(index);
    if (!image?.complete || !image.naturalWidth) {
      const loaded = [...cache.entries()].filter(([, item]) => item.complete && item.naturalWidth).sort((a, b) => Math.abs(a[0] - index) - Math.abs(b[0] - index));
      image = loaded[0]?.[1];
    }
    if (!image) return;
    const width = window.innerWidth, height = window.innerHeight;
    // Frame the room itself, keeping embedded reference-page labels outside the canvas.
    const sx = image.naturalWidth * .085, sy = image.naturalHeight * .265;
    const sw = image.naturalWidth * .83, sh = image.naturalHeight * .565;
    const scale = Math.max(width / sw, height / sh);
    const rw = sw * scale, rh = sh * scale;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, sx, sy, sw, sh, (width - rw) / 2, (height - rh) / 2, rw, rh);
  }
  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio; canvas.height = window.innerHeight * ratio;
    canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    renderFrame(Math.round(currentFrame));
  }
  function animate() {
    const difference = targetFrame - currentFrame;
    if (Math.abs(difference) < .05) { currentFrame = targetFrame; animationId = null; renderFrame(Math.round(currentFrame)); return; }
    currentFrame += difference * .18;
    renderFrame(Math.round(currentFrame));
    animationId = requestAnimationFrame(animate);
  }
  function updateScroll() {
    if (reducedMotion.matches) { targetFrame = currentFrame = 0; renderFrame(0); return; }
    const footer = document.querySelector('.l-footer');
    const maxScroll = Math.max(1, (footer?.offsetTop || document.documentElement.scrollHeight) - window.innerHeight);
    targetFrame = Math.min(1, Math.max(0, window.scrollY / maxScroll)) * (frameCount - 1);
    requestNearby(Math.round(targetFrame));
    if (animationId === null) animationId = requestAnimationFrame(animate);
  }
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('scroll', updateScroll, { passive: true });
  reducedMotion.addEventListener('change', () => { if (animationId !== null) cancelAnimationFrame(animationId); animationId = null; updateScroll(); });
  resizeCanvas(); loadFrame(0); updateScroll();
});
