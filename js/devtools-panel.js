const backgroundPageConnection = chrome.runtime.connect({
  name: "devtools-panel"
});

backgroundPageConnection.postMessage({
  action: "init",
  tabId: chrome.devtools.inspectedWindow.tabId
});

document.addEventListener('DOMContentLoaded', function() {

  const enableToggle = document.getElementById('enableToggle');
  const addRedirectButton = document.getElementById('addRedirect');
  const redirectList = document.getElementById('redirectList');
  const noRedirectsMessage = document.getElementById('noRedirects');
  const toggleStatus = document.getElementById('toggleStatus');
  const helpButton = document.getElementById('helpButton');
  const helpModal = document.getElementById('helpModal');
  const closeHelpModal = document.getElementById('closeHelpModal');
  
  helpButton.addEventListener('click', function() {
    helpModal.style.display = 'block';
  });
  
  closeHelpModal.addEventListener('click', function() {
    helpModal.style.display = 'none';
  });
  
  window.addEventListener('click', function(event) {
    if (event.target === helpModal) {
      helpModal.style.display = 'none';
    }
  });
  
  const infoBox = document.createElement('div');
  infoBox.className = 'info-box';
  infoBox.innerHTML = `
    <p><strong>Note about wildcard characters:</strong></p>
    <p>In the source URL, you can use * as a wildcard to match any string of characters.</p>
    <p>Example: <code>https://www.example.com/*</code> will match all subdomains of example.com.</p>
    <p>For URLs ending with an asterisk, the asterisk will be removed for matching.</p>
    <p>The target URL must not contain asterisks or other wildcard characters.</p>
  `;
  redirectList.insertBefore(infoBox, redirectList.firstChild);
  
  chrome.storage.sync.get(['enabled', 'redirects'], function(result) {

    enableToggle.checked = result.enabled !== undefined ? result.enabled : true;
    
    updateToggleStatus(enableToggle.checked);
    
    const redirects = result.redirects || [];
    
    renderRedirects(redirects);
  });
  
  function updateToggleStatus(isEnabled) {
    enableToggle.checked = isEnabled;
    toggleStatus.textContent = isEnabled ? 'Enabled' : 'Disabled';
  }
  
  enableToggle.addEventListener('change', function() {
    chrome.storage.sync.set({ enabled: enableToggle.checked });
    
    updateToggleStatus(enableToggle.checked);
  });
  
  addRedirectButton.addEventListener('click', function() {
    
    chrome.storage.sync.get(['redirects'], function(result) {
      const redirects = result.redirects || [];
      
      redirects.push({
        id: Date.now(),
        label: '',
        sourceUrl: '',
        targetUrl: '',
        enabled: true
      });
      
      chrome.storage.sync.set({ redirects: redirects }, function() {
        renderRedirects(redirects);
      });
    });
  });
  
  function renderRedirects(redirects) {
  
    const items = redirectList.querySelectorAll('.redirect-item');
    items.forEach(item => item.remove());
    
    if (redirects.length === 0) {
      noRedirectsMessage.style.display = 'block';
    } else {
      noRedirectsMessage.style.display = 'none';
      
      redirects.forEach(redirect => {
        const redirectItem = document.createElement('div');
        redirectItem.className = 'redirect-item';
        redirectItem.dataset.id = redirect.id;
        
        const labelInput = document.createElement('input');
        labelInput.type = 'text';
        labelInput.className = 'label-input name-input';
        labelInput.placeholder = 'Enter a name for this redirect (optional)';
        labelInput.value = redirect.label || '';
        
        labelInput.addEventListener('focus', function() {
          this.setAttribute('data-prev-value', this.value);
        });
        
        labelInput.addEventListener('blur', function() {
          if (this.value !== this.getAttribute('data-prev-value')) {
            updateRedirect(redirect.id, { label: this.value });
          }
        });
        
        const urlInputs = document.createElement('div');
        urlInputs.className = 'url-inputs';
        
        const sourceUrlInput = document.createElement('input');
        sourceUrlInput.type = 'text';
        sourceUrlInput.className = 'url-input source-url';
        sourceUrlInput.placeholder = 'Source URL';
        sourceUrlInput.value = redirect.sourceUrl || '';
        
        const targetUrlInput = document.createElement('input');
        targetUrlInput.type = 'text';
        targetUrlInput.className = 'url-input target-url';
        targetUrlInput.placeholder = 'Target URL';
        targetUrlInput.value = redirect.targetUrl || '';
        
        const actions = document.createElement('div');
        actions.className = 'actions';
        
        const enabledToggle = document.createElement('input');
        enabledToggle.type = 'checkbox';
        enabledToggle.className = 'redirect-toggle';
        enabledToggle.checked = redirect.enabled !== undefined ? redirect.enabled : true;
        
        const toggleLabel = document.createElement('label');
        toggleLabel.className = 'item-toggle-switch';
        
        const slider = document.createElement('span');
        slider.className = 'item-slider';
        
        toggleLabel.appendChild(enabledToggle);
        toggleLabel.appendChild(slider);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        
        urlInputs.appendChild(sourceUrlInput);
        urlInputs.appendChild(targetUrlInput);
        actions.appendChild(toggleLabel);
        actions.appendChild(deleteButton);
        
        redirectItem.appendChild(labelInput);
        redirectItem.appendChild(urlInputs);
        redirectItem.appendChild(actions);
        
        redirectList.appendChild(redirectItem);
        
        labelInput.addEventListener('input', function() {
          updateRedirect(redirect.id, { label: labelInput.value });
        });
        
        sourceUrlInput.addEventListener('input', function() {;
          updateRedirect(redirect.id, { sourceUrl: sourceUrlInput.value });
        });
        
        targetUrlInput.addEventListener('input', function() {
          updateRedirect(redirect.id, { targetUrl: targetUrlInput.value });
        });
        
        enabledToggle.addEventListener('change', function() {
          updateRedirect(redirect.id, { enabled: enabledToggle.checked });
        });
        
        deleteButton.addEventListener('click', function() {
          deleteRedirect(redirect.id);
        });
      });
    }
  }
  
  function updateRedirect(id, changes) {
    chrome.storage.sync.get(['redirects'], function(result) {
      const redirects = result.redirects || [];
      
      const index = redirects.findIndex(r => r.id === id);
      if (index !== -1) {
        redirects[index] = { ...redirects[index], ...changes };
        chrome.storage.sync.set({ redirects: redirects }, function() {
          console.log('Redirect updated');
        });
      } else {
        console.error(`Redirect with ID ${id} not found`);
      }
    });
  }
  
  function deleteRedirect(id) {
    
    chrome.storage.sync.get(['redirects'], function(result) {
      const redirects = result.redirects || [];
      
      const updatedRedirects = redirects.filter(r => r.id !== id);
      
      chrome.storage.sync.set({ redirects: updatedRedirects }, function() {
        console.log('Redirect deleted');
        renderRedirects(updatedRedirects);
      });
    });
  }
}); 