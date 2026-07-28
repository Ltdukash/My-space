// ============================================================
// Ukash Limited — shared site behavior (language toggle, nav, FAQ, forms)
// ============================================================

// ---- Language toggle (EN / FR) ----
let currentLang = localStorage.getItem('ukash-lang') || 'fr';

function applyLanguage(lang){
  currentLang = lang;
  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem('ukash-lang', lang);

  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute('data-' + lang);
    if (text !== null) el.innerHTML = text;
  });
  document.querySelectorAll('[data-en-aria]').forEach(el => {
    const text = el.getAttribute('data-' + lang + '-aria');
    if (text !== null) el.setAttribute('aria-label', text);
  });
  document.querySelectorAll('[data-en-ph]').forEach(el => {
    const text = el.getAttribute('data-' + lang + '-ph');
    if (text !== null) el.setAttribute('placeholder', text);
  });

  document.querySelectorAll('.lang-toggle').forEach(group => {
    const frBtn = group.querySelector('[data-lang="fr"]');
    const enBtn = group.querySelector('[data-lang="en"]');
    if (frBtn) frBtn.classList.toggle('active', lang === 'fr');
    if (enBtn) enBtn.classList.toggle('active', lang === 'en');
  });

  // Let page-specific scripts (e.g. the calculator) know language changed
  document.dispatchEvent(new CustomEvent('ukash:langchange', { detail: { lang } }));
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-toggle [data-lang]').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
  });
  applyLanguage(currentLang);

  // ---- Mobile menu toggle ----
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobilePanel = document.querySelector('.mobile-panel');
  if (menuBtn && mobilePanel){
    menuBtn.addEventListener('click', () => {
      mobilePanel.classList.toggle('open');
    });
  }

  // ---- FAQ accordion ----
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // close siblings for an accordion feel
      item.parentElement.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) openItem.classList.remove('open');
      });
      item.classList.toggle('open', !isOpen);
    });
  });

  // ---- Ajax form submission (Apply + Contact pages) ----
  document.querySelectorAll('form.ajax-form').forEach(form => {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn){
        submitBtn.disabled = true;
        submitBtn.textContent = currentLang === 'fr' ? 'Envoi en cours...' : 'Sending...';
      }

      const successText = form.getAttribute('data-success-' + currentLang) ||
        (currentLang === 'fr'
          ? "Merci ! Votre demande a bien été reçue. Un membre de notre équipe vous recontactera sous un jour ouvré."
          : "Thank you! Your request has been received. Our team will follow up within one business day.");
      const errorText = currentLang === 'fr'
        ? "Une erreur s'est produite lors de l'envoi. Veuillez réessayer, ou contactez-nous directement."
        : "Something went wrong sending your request. Please try again, or contact us directly.";

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(response => {
        if (response.ok){
          form.innerHTML = '<p style="color: var(--mint); font-size: 1.05rem; line-height:1.6;">' + successText + '</p>';
        } else {
          alert(errorText);
          if (submitBtn){ submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
        }
      }).catch(() => {
        alert(errorText);
        if (submitBtn){ submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
      });
    });
  });
});
