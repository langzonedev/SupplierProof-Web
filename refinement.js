(() => {
  const $ = id => document.getElementById(id);
  const quick = $('quickDemo');
  const status = $('quickDemoStatus');
  if (!quick) return;

  const setValue = (id, value) => {
    const el = $(id);
    if (!el) return;
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  quick.addEventListener('click', () => {
    quick.disabled = true;
    quick.textContent = 'Preparing demo…';
    if (status) status.textContent = 'Creating a realistic supplier workspace and customer request.';

    setValue('businessName', 'Example Electrical Services Pty Ltd');
    setValue('abn', '12 345 678 901');
    setValue('contact', 'Alex Morgan');
    setValue('email', 'alex@example.com');
    setValue('industry', 'Electrical / trade services');
    setValue('region', 'South Australia');
    setValue('businessType', 'Electrical maintenance services for commercial and industrial customers');
    $('saveProfile')?.click();

    const evidenceCount = Number(($('evidence-count')?.textContent || '0').match(/\d+/)?.[0] || 0);
    if (evidenceCount === 0) $('loadSamples')?.click();

    $('loadBuyerSample')?.click();

    window.setTimeout(() => {
      $('runMatch')?.click();
      quick.disabled = false;
      quick.textContent = 'Run the 60-second demo again';
      if (status) status.textContent = 'Demo ready: review what this customer can receive now, what is expired, and what is still missing.';
    }, 100);
  });

  const progress = document.createElement('div');
  progress.className = 'quick-progress';
  progress.setAttribute('aria-live', 'polite');
  const workspace = document.querySelector('.workspace-head');
  workspace?.insertAdjacentElement('afterend', progress);

  const updateProgress = () => {
    const supplier = $('profile-status')?.textContent === 'Saved';
    const evidence = Number(($('evidence-count')?.textContent || '0').match(/\d+/)?.[0] || 0) > 0;
    const result = $('resultScore')?.textContent !== 'No request';
    const saved = Number(($('history-count')?.textContent || '0').match(/\d+/)?.[0] || 0) > 0;
    const items = [
      [supplier, 'Business'],
      [evidence, 'Reusable evidence'],
      [result, 'Customer mapped'],
      [saved, 'Response saved']
    ];
    progress.innerHTML = items.map(([done, label]) => `<span class="${done ? 'done' : ''}">${done ? '✓' : '○'} ${label}</span>`).join('');
  };

  const observer = new MutationObserver(updateProgress);
  ['profile-status', 'evidence-count', 'resultScore', 'history-count'].forEach(id => {
    const el = $(id);
    if (el) observer.observe(el, { childList: true, subtree: true, characterData: true });
  });
  updateProgress();

  const style = document.createElement('style');
  style.textContent = `
    .quick-demo{display:grid;grid-template-columns:1.25fr auto;gap:1rem;align-items:center;background:#fff;border:1px solid var(--line);border-left:5px solid var(--aubergine);border-radius:20px;padding:1.1rem 1.2rem;margin:0 0 1.2rem}
    .quick-demo h3{margin:.15rem 0 .3rem;font-size:1.15rem}.quick-demo p{margin:0;color:#6e6872}.quick-demo .eyebrow{color:var(--aubergine);opacity:1}.quick-demo button{white-space:nowrap}
    .quick-progress{display:flex;flex-wrap:wrap;gap:.45rem;margin:.1rem 0 1rem}.quick-progress span{display:inline-flex;align-items:center;border:1px solid #d8cfd6;background:#faf8f9;border-radius:999px;padding:.38rem .65rem;font-size:.76rem;font-weight:800;color:#746b77}.quick-progress span.done{background:#e8f3eb;border-color:#bdd9c5;color:#24643a}
    @media(max-width:760px){.quick-demo{grid-template-columns:1fr}.quick-demo button{width:100%}.quick-progress{display:grid;grid-template-columns:1fr 1fr}.quick-progress span{justify-content:center}}
  `;
  document.head.appendChild(style);
})();
