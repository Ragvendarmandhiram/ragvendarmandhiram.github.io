(() => {
  const openers = [...document.querySelectorAll('[data-media-src]')];
  if (!openers.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'c-media-viewer';
  dialog.setAttribute('aria-labelledby', 'media-title');
  dialog.innerHTML = '<div class="c-media-shell"><button type="button" class="c-media-close" aria-label="Close artwork viewer">×</button><div class="c-media-stage"><img class="c-media-image" alt=""></div><div class="c-media-controls"><button type="button" class="c-media-prev" aria-label="Previous image">←</button><span class="c-media-count" aria-live="polite"></span><button type="button" class="c-media-next" aria-label="Next image">→</button></div><div class="c-media-caption"><p class="c-media-status"></p><h2 id="media-title"></h2><p class="c-media-description"></p><a class="c-btn c-btn--secondary c-media-original" target="_blank" rel="noopener noreferrer">Open full image ↗</a></div></div>';
  document.body.append(dialog);
  let group = [], index = 0, opener = null;
  function show(next) {
    index = (next + group.length) % group.length;
    const item = group[index], data = item.dataset;
    const image = dialog.querySelector('.c-media-image'); image.src = data.mediaSrc; image.alt = item.querySelector('img')?.alt || data.mediaTitle;
    dialog.querySelector('#media-title').textContent = data.mediaTitle;
    dialog.querySelector('.c-media-description').textContent = data.mediaDescription;
    dialog.querySelector('.c-media-status').textContent = data.mediaStatus;
    dialog.querySelector('.c-media-original').href = data.mediaSrc;
    dialog.querySelector('.c-media-count').textContent = (index + 1) + ' / ' + group.length;
    dialog.querySelector('.c-media-controls').hidden = group.length < 2;
  }
  openers.forEach(button => button.addEventListener('click', () => {
    opener = button;
    group = [...new Map(openers.filter(item => item.dataset.mediaGroup === button.dataset.mediaGroup).map(item => [item.dataset.mediaSrc, item])).values()];
    show(group.findIndex(item => item.dataset.mediaSrc === button.dataset.mediaSrc));
    dialog.showModal(); dialog.scrollTop = 0; document.body.classList.add('has-media-open');
  }));
  dialog.querySelector('.c-media-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.c-media-prev').addEventListener('click', () => show(index - 1));
  dialog.querySelector('.c-media-next').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', event => { if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); } if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); } });
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.classList.remove('has-media-open'); opener?.focus({ preventScroll: true }); });
})();
