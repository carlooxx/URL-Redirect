async function updateRedirectRules() {
  
  try {
    const result = await chrome.storage.sync.get(['enabled', 'redirects']);
    
    if (result.enabled === false) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: await getRuleIds()
      });
      return;
    }
    
    const redirects = result.redirects || [];
    
    const existingRuleIds = await getRuleIds();
    
    const rules = [];
    
    redirects.forEach((redirect, index) => {
      if (redirect.enabled === false) { return }
      
      const ruleId = index + 1;
      
      if (!redirect.sourceUrl || !redirect.targetUrl) {
        return;
      }
      
      let sourceUrl = redirect.sourceUrl;
      let targetUrl = redirect.targetUrl;
      
      let urlFilter = sourceUrl;
      if (urlFilter.endsWith('*')) {
        urlFilter = urlFilter.slice(0, -1);
      }
      
      const rule = {
        id: ruleId,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            url: targetUrl
          }
        },
        condition: {
          urlFilter: urlFilter,
          resourceTypes: ['main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object', 'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'webtransport', 'webbundle', 'other']
        }
      };
      
      rules.push(rule);
    });
    
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: rules
    });
    
  } catch (error) {
    console.error('Error updating rules:', error);
  }
}

async function getRuleIds() {
  const rules = await chrome.declarativeNetRequest.getDynamicRules();
  return rules.map(rule => rule.id);
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.enabled || changes.redirects)) {
    updateRedirectRules();
  }
});

chrome.runtime.onInstalled.addListener(async function() {

  const result = await chrome.storage.sync.get(['enabled', 'redirects']);
  
  if (result.enabled === undefined) {
    await chrome.storage.sync.set({ enabled: true });
  }
  
  if (!result.redirects) {
    await chrome.storage.sync.set({ redirects: [] });
  }
  
  updateRedirectRules();
});

updateRedirectRules();

chrome.runtime.onConnect.addListener(function(port) {
  if (port.name !== "devtools-panel") {
    return;
  }
});
