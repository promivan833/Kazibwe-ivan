const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const themeToggle = document.querySelector('.theme-toggle');
const mobileMenuQuery = window.matchMedia('(max-width: 1100px)');

const setMenuOpen = (open, { moveFocus = true } = {}) => {
  if (!nav || !menuToggle) return;
  const mobile = mobileMenuQuery.matches;
  nav.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open && mobile);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

  // Closed mobile navigation must not remain in the keyboard or accessibility tree.
  nav.inert = mobile && !open;
  nav.setAttribute('aria-hidden', String(mobile && !open));

  if (moveFocus && mobile && open) {
    // The drawer is already visible and no longer inert; move focus immediately.
    nav.querySelector('a[href]')?.focus();
  } else if (moveFocus && mobile && !open && document.activeElement && nav.contains(document.activeElement)) {
    menuToggle.focus();
  }
};

if (nav && menuToggle) {
  setMenuOpen(false, { moveFocus: false });

  menuToggle.addEventListener('click', () => {
    const opening = !nav.classList.contains('open');
    setMenuOpen(opening, { moveFocus: false });
    if (opening && mobileMenuQuery.matches) {
      queueMicrotask(() => {
        if (nav.classList.contains('open') && mobileMenuQuery.matches) {
          nav.querySelector('a[href]')?.focus({ preventScroll: true });
        }
      });
    }
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  const syncNavigationMode = () => {
    if (!mobileMenuQuery.matches) {
      nav.inert = false;
      nav.setAttribute('aria-hidden', 'false');
      setMenuOpen(false, { moveFocus: false });
    } else if (!nav.classList.contains('open')) {
      nav.inert = true;
      nav.setAttribute('aria-hidden', 'true');
    }
  };

  window.addEventListener('resize', syncNavigationMode);
  mobileMenuQuery.addEventListener?.('change', syncNavigationMode);
}

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

const navLinks = [...document.querySelectorAll('.site-nav a')];
const navTargets = new Set(navLinks.map(link => link.getAttribute('href')));
const sections = [...document.querySelectorAll('main section[id]')]
  .filter(section => navTargets.has(`#${section.id}`));

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

document.querySelectorAll('.back-to-top').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', '#top');
  });
});

const inquiryForm = document.querySelector('#project-inquiry-form');
inquiryForm?.addEventListener('submit', event => {
  event.preventDefault();
  const formData = new FormData(inquiryForm);
  const name = String(formData.get('name') || '').trim();
  const service = String(formData.get('service') || '').trim();
  const budget = String(formData.get('budget') || 'Not sure yet').trim();
  const details = String(formData.get('details') || '').trim();
  const status = document.querySelector('#inquiry-status');
  if (!name || !service || !details) {
    if (status) status.textContent = 'Please complete your name, service and project details.';
    return;
  }
  const message = [
    'Hello Kazibwe Ivan, I would like to discuss a project.',
    '',
    'Name: ' + name,
    'Service: ' + service,
    'Estimated budget: ' + budget,
    'Project details: ' + details
  ].join('\n');
  const whatsappUrl = 'https://wa.me/256704084962?text=' + encodeURIComponent(message);
  if (status) status.textContent = 'Redirecting to WhatsApp. If it does not open, use the WhatsApp link below.';
  window.location.href = whatsappUrl;
});
