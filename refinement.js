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
      quick.textContent = 'Reload sample';
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

  let evidenceFilter = 'all';

  const daysUntil = date => {
    if (!date) return null;
    const target = new Date(date + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((target - now) / 86400000);
  };

  const needsAction = evidence => {
    const days = daysUntil(evidence.expiryDate);
    return evidence.review === 'Needs review' || (days !== null && days <= 60);
  };

  const updateEvidenceWorkspace = () => {
    const queue = $('actionQueue');
    const items = document.querySelectorAll('#evidenceList .evidence-item');
    const actionCount = state.evidence.filter(needsAction).length;
    const expiring = state.evidence.filter(item => {
      const days = daysUntil(item.expiryDate);
      return days !== null && days >= 0 && days <= 60;
    }).length;
    const missingFiles = state.evidence.filter(item => !item.fileKey).length;

    if (queue) {
      if (!state.evidence.length) {
        queue.innerHTML = '<strong>Start with the documents customers ask for most.</strong><span>Insurance, licences and key policies.</span>';
      } else if (!actionCount) {
        queue.innerHTML = '<strong>Your evidence pack is current.</strong><span>No reviews or expiries due within 60 days.</span>';
      } else {
        queue.innerHTML = `<strong>${actionCount} item${actionCount === 1 ? '' : 's'} need attention.</strong><span>${expiring} expiring soon · ${missingFiles} without a file</span><button class="mini" data-show-actions>Show actions</button>`;
        queue.querySelector('[data-show-actions]')?.addEventListener('click', () => setEvidenceFilter('action'));
      }
    }

    items.forEach((item, index) => {
      const evidence = state.evidence[index];
      const show = evidenceFilter === 'all'
        || (evidenceFilter === 'action' && evidence && needsAction(evidence))
        || (evidenceFilter === 'files' && evidence?.fileKey);
      item.hidden = !show;
    });
  };

  const setEvidenceFilter = filter => {
    evidenceFilter = filter;
    document.querySelectorAll('[data-evidence-filter]').forEach(button => {
      const active = button.dataset.evidenceFilter === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    updateEvidenceWorkspace();
  };

  document.querySelectorAll('[data-evidence-filter]').forEach(button => {
    button.addEventListener('click', () => setEvidenceFilter(button.dataset.evidenceFilter));
  });

  const updatePackSummary = () => {
    const summary = $('packSummary');
    if (!summary) return;
    const request = state.activeRequest;
    if (!request) {
      summary.innerHTML = '';
      summary.hidden = true;
      return;
    }
    const counts = request.requirements.reduce((result, item) => {
      result[item.status] = (result[item.status] || 0) + 1;
      return result;
    }, {});
    const ready = counts.Matched || 0;
    const action = request.requirements.length - ready;
    summary.hidden = false;
    summary.innerHTML = `<div><span>Ready to attach</span><strong>${ready}</strong></div><div><span>Needs action</span><strong>${action}</strong></div><div><span>Due</span><strong>${request.dueDate || 'Not set'}</strong></div>`;
  };

  const evidenceObserver = new MutationObserver(updateEvidenceWorkspace);
  if ($('evidenceList')) evidenceObserver.observe($('evidenceList'), { childList: true });

  const resultsObserver = new MutationObserver(updatePackSummary);
  if ($('resultsList')) resultsObserver.observe($('resultsList'), { childList: true });

  updateEvidenceWorkspace();
  updatePackSummary();
  setEvidenceFilter('all');

  updateProgress();
  updateViews();
})();
