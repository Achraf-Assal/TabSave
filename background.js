// Storage operations
const SessionManager = {
    async saveSession(session) {
      const { sessions = [] } = await chrome.storage.local.get('sessions');
      sessions.push(session);
      await chrome.storage.local.set({ sessions });
      return true;
    },
  
    async getSessions() {
      const { sessions = [] } = await chrome.storage.local.get('sessions');
      return sessions;
    },
  
    async deleteSession(index) {
      const { sessions = [] } = await chrome.storage.local.get('sessions');
      sessions.splice(index, 1);
      await chrome.storage.local.set({ sessions });
      return true;
    }
  };
  
  // Message handler
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'SAVE_SESSION':
        SessionManager.saveSession(request.session).then(sendResponse);
        return true; // Keep channel open for async response
  
      case 'GET_SESSIONS':
        SessionManager.getSessions().then(sendResponse);
        return true;
  
      case 'DELETE_SESSION':
        SessionManager.deleteSession(request.index).then(sendResponse);
        return true;
  
      default:
        sendResponse({ error: 'Invalid action' });
    }
  });