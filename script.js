const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const themeToggle = document.querySelector('.theme-toggle');

const setMenuOpen = (open) => {
  if (!nav || !menuToggle) return;
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
};

menuToggle?.addEventListener('click', () => {
  setMenuOpen(!nav?.classList.contains('open'));
});

nav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) {
    setMenuOpen(false);
    menuToggle?.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1100) setMenuOpen(false);
});

const applyTheme = (light) => {
  document.body.classList.toggle('light-theme', light);
  if (!themeToggle) return;
  themeToggle.textContent = light ? '☀' : '☾';
  themeToggle.setAttribute('aria-pressed', String(light));
  themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  themeToggle.title = light ? 'Switch to dark theme' : 'Switch to light theme';
};

themeToggle?.addEventListener('click', () => {
  const light = !document.body.classList.contains('light-theme');
  applyTheme(light);
  try {
    localStorage.setItem('ivan-theme', light ? 'light' : 'dark');
  } catch {
    // Theme switching still works when browser storage is unavailable.
  }
});

try {
  applyTheme(localStorage.getItem('ivan-theme') === 'light');
} catch {
  applyTheme(false);
}

const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.site-nav a')];

const setActiveSection = (id) => {
  navLinks.forEach(link => {
    const active = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', active);
  });
};

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    if (visible.length) setActiveSection(visible[0].target.id);
  }, {
    root: null,
    rootMargin: '-110px 0px -72% 0px',
    threshold: 0
  });
  sections.forEach(section => sectionObserver.observe(section));
} else {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      let current = 'top';
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= 110) current = section.id;
      }
      setActiveSection(current);
      ticking = false;
    });
  }, {passive:true});
}

