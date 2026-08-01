import { basic, initSidebar, initTopbar } from './modules/layouts';
import {
  imgLazy,
  imgPopup,
  initLocaleDatetime,
  initClipboard,
  toc,
  highlightLines,
  runCpp,
  runJavascript,
  runPython,
  runRust
} from './modules/plugins';

function initReadingProgress() {
  const indicator = document.querySelector('.reading-progress span');
  const article = document.querySelector('.layout-post #core-wrapper > .post');
  if (!indicator || !article) return;

  let ticking = false;
  const update = () => {
    const start = article.offsetTop;
    const distance = Math.max(1, article.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
    indicator.style.transform = `scaleX(${progress})`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }, { passive: true });
  update();
}

function initMobileToc() {
  const source = document.querySelector('#toc');
  const target = document.querySelector('#mobile-toc');
  const drawer = document.querySelector('#mobile-toc-drawer');
  const toggle = document.querySelector('#mobile-toc-toggle');
  const close = document.querySelector('#mobile-toc-close');
  if (!source || !target || !drawer || !toggle || !close) return;

  target.innerHTML = source.innerHTML;
  if (!target.querySelector('a')) {
    toggle.hidden = true;
    return;
  }

  const setOpen = (open) => {
    drawer.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(drawer.hidden));
  close.addEventListener('click', () => setOpen(false));
  target.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}

basic();
initSidebar();
initTopbar();
imgLazy();
imgPopup();
initLocaleDatetime();
initClipboard();
toc();
initReadingProgress();
initMobileToc();
highlightLines();
runCpp();
runJavascript();
runPython();
runRust();
