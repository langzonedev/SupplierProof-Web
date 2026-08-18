(() => {
  const $ = id => document.getElementById(id);
  const toast = $('toast');
  let toastTimer;

  const notify = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  };

  const setValue = (id, value) => {
    const el = $(id);
    if (!el) return;
    el.value = value;
    el.classList.remove('input-error');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const focusError = (el, message) => {
    el.classList.add('input-error');
    el.focus();
    el.setAttribute('aria-invalid', 'true');
    notify(message);
  };

  document.addEventListener('input', event => {
    if (event.target.matches('input, textarea, select')) {
      event.target.classList.remove('input-error');
      event.target.removeAttribute('aria-invalid');
    }
  });

  $('saveProfile')?.addEventListener('click', event => {
    const businessName = $('businessName');
    if (!businessName.value.trim()) {
      event.stopImmediatePropagation();
      focusError(businessName, 'Add a business name.');
    } else {
      setTimeout(() => notify('Business saved.'), 0);
    }
  }, true);

  $('runMatch')?.addEventListener('click', event => {
    const buyer = $('buyerName');
    const requirements = $('requirements');
    if (!buyer.value.trim()) {
      event.stopImmediatePropagation();
      focusError(buyer, 'Add a customer name.');
      return;
    }
    if (!requirements.value.trim()) {
      event.stopImmediatePropagation();
      focusError(requirements, 'Add at least one requirement.');
    }
  }, true);

  $('addEvidence')?.addEventListener('click', () => {
    setTimeout(() => notify('Evidence added.'), 0);
  });

  $('loadSamples')?.addEventListener('click', event => {
    const count = Number(($('evidence-count')?.textContent || '0').match(/\d+/)?.[0] || 0);
    const existingSamples = [...document.querySelectorAll('.evidence-item .meta')]
      .some(el => el.textContent.includes('SAMPLE-'));
    if (count > 0 && existingSamples) {
      event.stopImmediatePropagation();
      notify('Sample pack already loaded.');
      return;
    }
    setTimeout(() => notify('Sample pack loaded.'), 0);
  }, true);

  $('loadBuyerSample')?.addEventListener('click', () => {
    setTimeout(() => notify('Sample request loaded.'), 0);
  });

  const quick = $('quickDemo');
  const status = $('quickDemoStatus');
  quick?.addEventListener('click', () => {
    quick.disabled = true;
    quick.textContent = 'Loading sample…';
    if (status) status.textContent = 'Loading supplier, evidence and request.';

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
      quick.textContent = 'Run demo again';
      if (status) status.textContent = 'Review what is ready and what needs work.';
      notify('Readiness review ready.');
    }, 120);
  });

  $('heroDemo')?.addEventListener('click', () => {
    $('workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => quick?.click(), 450);
  });

  const progress = document.createElement('div');
  progress.className = 'quick-progress';
  progress.setAttribute('aria-live', 'polite');
  document.querySelector('.workspace-head')?.insertAdjacentElement('afterend', progress);

  const updateProgress = () => {
    const supplier = $('profile-status')?.textContent === 'Saved';
    const evidence = Number(($('evidence-count')?.textContent || '0').match(/\d+/)?.[0] || 0) > 0;
    const result = $('resultScore')?.textContent !== 'No request';
    const saved = Number(($('history-count')?.textContent || '0').match(/\d+/)?.[0] || 0) > 0;
    const items = [
      [supplier, 'Business'],
      [evidence, 'Evidence'],
      [result, 'Mapped'],
      [saved, 'Saved']
    ];
    progress.innerHTML = items.map(([done, label]) =>
      `<span class="${done ? 'done' : ''}">${done ? '✓' : '○'} ${label}</span>`
    ).join('');
  };

  const updateViews = () => {
    document.querySelectorAll('.view').forEach(view => {
      const active = view.classList.contains('is-active');
      view.setAttribute('aria-hidden', String(!active));
    });
    document.querySelectorAll('.step').forEach(step => {
      if (step.classList.contains('is-active')) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
  };

  const observer = new MutationObserver(() => {
    updateProgress();
    updateViews();
  });
  ['profile-status', 'evidence-count', 'resultScore', 'history-count'].forEach(id => {
    const el = $(id);
    if (el) observer.observe(el, { childList: true, subtree: true, characterData: true });
  });
  document.querySelectorAll('.view').forEach(view => observer.observe(view, { attributes: true, attributeFilter: ['class'] }));

  $('saveResponse')?.addEventListener('click', () => {
    if ($('resultScore')?.textContent !== 'No request') {
      setTimeout(() => notify('Response saved.'), 0);
    }
  });

  $('copySummary')?.addEventListener('click', () => {
    if ($('resultScore')?.textContent !== 'No request') setTimeout(() => notify('Summary copied.'), 50);
  });

  $('downloadSummary')?.addEventListener('click', () => {
    if ($('resultScore')?.textContent !== 'No request') notify('Summary downloaded.');
  });

  updateProgress();
  updateViews();
})();
