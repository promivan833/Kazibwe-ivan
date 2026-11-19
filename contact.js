(() => {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  const setTheme = (dark) => {
    document.body.classList.toggle('dark-mode', dark);
    toggle.innerHTML = dark
      ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
    toggle.setAttribute('aria-pressed', String(dark));
    toggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    toggle.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  };

  let savedTheme = null;
  try { savedTheme = localStorage.getItem('ivan-contact-theme'); } catch {}
  setTheme(savedTheme === 'dark');

  toggle.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark-mode');
    setTheme(dark);
    try { localStorage.setItem('ivan-contact-theme', dark ? 'dark' : 'light'); } catch {}
  });
})();
