(() => {
  const fileInput = document.getElementById('evidenceFile');
  const fileLabel = document.getElementById('fileSelection');
  const addButton = document.getElementById('addEvidence');
  if (!fileInput || !addButton || !('indexedDB' in window)) return;

  const DB_NAME = 'supplierproof.attachments.v1';
  const STORE_NAME = 'files';
  const MAX_BYTES = 10 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx'];
  let dbPromise;

  const notify = message => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
  };

  const formatSize = bytes => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const extension = name => name.split('.').pop().toLowerCase();
  const isAllowed = file => ALLOWED_EXTENSIONS.includes(extension(file.name));

  const openDb = () => {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return dbPromise;
  };

  const putFile = async (id, file) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put({
        id,
        blob: file,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        lastModified: file.lastModified
      });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  };

  const getFile = async id => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const removeFile = async id => {
    try {
      const db = await openDb();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).delete(id);
    } catch {}
  };

  const clearFiles = async () => {
    try {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).clear();
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
    } catch {}
  };

  const inferEvidenceType = name => {
    const value = name.toLowerCase().replace(/[_-]+/g, ' ');
    const matches = [
      [/public.*liability|liability.*insurance/, 'Public liability insurance'],
      [/professional.*indemnity|pi.*insurance/, 'Professional indemnity insurance'],
      [/workers.*comp|workcover/, 'Workers compensation insurance'],
      [/whs|work.*health|safety.*polic/, 'WHS policy'],
      [/cyber|information.*security/, 'Cyber security policy'],
      [/privacy/, 'Privacy policy'],
      [/licen[cs]e|registration/, 'Trade licence'],
      [/environment/, 'Environmental policy'],
      [/modern.*slavery/, 'Modern slavery statement'],
      [/continuity|disaster.*recovery/, 'Business continuity plan']
    ];
    return matches.find(([pattern]) => pattern.test(value))?.[1] || null;
  };

  const resetFileInput = () => {
    fileInput.value = '';
    fileLabel.textContent = 'No file selected';
    fileLabel.classList.remove('has-file');
  };

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) {
      resetFileInput();
      return;
    }
    if (!isAllowed(file)) {
      resetFileInput();
      notify('Choose a PDF, DOC or DOCX file.');
      return;
    }
    if (file.size > MAX_BYTES) {
      resetFileInput();
      notify('File must be 10 MB or smaller.');
      return;
    }
    fileLabel.textContent = `${file.name} · ${formatSize(file.size)}`;
    fileLabel.classList.add('has-file');
    const suggestedType = inferEvidenceType(file.name);
    if (suggestedType) document.getElementById('evidenceType').value = suggestedType;
    const reference = document.getElementById('evidenceRef');
    if (!reference.value.trim()) reference.value = file.name.replace(/\.[^.]+$/, '');
  });

  addButton.addEventListener('click', async event => {
    const file = fileInput.files[0];
    if (!file) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!isAllowed(file) || file.size > MAX_BYTES) {
      notify('Choose a PDF, DOC or DOCX file under 10 MB.');
      return;
    }

    addButton.disabled = true;
    addButton.setAttribute('aria-busy', 'true');
    addButton.textContent = 'Saving file…';

    try {
      const id = uid();
      await putFile(id, file);
      state.evidence.push({
        id,
        type: document.getElementById('evidenceType').value,
        ref: document.getElementById('evidenceRef').value.trim(),
        owner: document.getElementById('evidenceOwner').value.trim(),
        review: document.getElementById('evidenceReview').value,
        issueDate: document.getElementById('issueDate').value,
        expiryDate: document.getElementById('expiryDate').value,
        notes: document.getElementById('evidenceNotes').value.trim(),
        fileKey: id,
        fileName: file.name,
        fileType: extension(file.name).toUpperCase(),
        fileSize: file.size,
        fileSizeLabel: formatSize(file.size)
      });
      save();
      renderEvidence();
      ['evidenceRef', 'evidenceOwner', 'issueDate', 'expiryDate', 'evidenceNotes'].forEach(id => document.getElementById(id).value = '');
      document.getElementById('evidenceReview').value = 'Current';
      resetFileInput();
      notify('Evidence and file saved.');
    } catch {
      notify('This browser could not save the file.');
    } finally {
      addButton.disabled = false;
      addButton.removeAttribute('aria-busy');
      addButton.textContent = 'Add evidence';
    }
  }, true);

  const downloadFile = async evidenceId => {
    const evidence = state.evidence.find(item => item.id === evidenceId);
    if (!evidence?.fileKey) return;
    try {
      const stored = await getFile(evidence.fileKey);
      if (!stored?.blob) throw new Error('missing');
      const url = URL.createObjectURL(stored.blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = stored.name || evidence.fileName || 'evidence-file';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      notify('File not found on this device.');
    }
  };

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-download-file]');
    if (!button) return;
    event.preventDefault();
    downloadFile(button.dataset.downloadFile);
  }, true);

  window.SupplierProofAttachments = {
    remove: removeFile,
    clear: clearFiles,
    download: downloadFile
  };
})();
