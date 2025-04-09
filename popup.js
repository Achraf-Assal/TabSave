document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('saveSession');
    const sessionNameInput = document.getElementById('sessionName');
    const sessionsList = document.getElementById('sessionsList');
  
    // Save current tabs
    saveButton.addEventListener('click', async () => {
      const sessionName = sessionNameInput.value.trim();
      if (!sessionName) return;
  
      const windows = await chrome.windows.getAll({ populate: true });
      
      const sessionData = {
        name: sessionName,
        date: new Date().toISOString(),
        windows: windows.map(window => ({
          tabs: window.tabs.map(tab => ({
            url: tab.url,
            title: tab.title
          }))
        }))
      };
  
      // Send to background
      chrome.runtime.sendMessage(
        { action: 'SAVE_SESSION', session: sessionData },
        () => {
          sessionNameInput.value = '';
          loadSessions();
        }
      );
    });
  
    // Load sessions list
    async function loadSessions() {
      sessionsList.innerHTML = '';
      
      const sessions = await chrome.runtime.sendMessage({ 
        action: 'GET_SESSIONS' 
      });
  
      sessions.forEach((session, index) => {
        const sessionDiv = document.createElement('div');
        sessionDiv.className = 'session-item';
        
        sessionDiv.innerHTML = `
          <div>
            <strong>${session.name}</strong><br>
            <small>${new Date(session.date).toLocaleString()}</small>
          </div>
          <div class="session-actions">
            <button class="restore" data-index="${index}">Restore</button>
            <button class="delete" data-index="${index}">Delete</button>
          </div>
        `;
  
        sessionsList.appendChild(sessionDiv);
      });
  
      // Add event listeners
      document.querySelectorAll('.restore').forEach(button => {
        button.addEventListener('click', restoreSession);
      });
      
      document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', deleteSession);
      });
    }
  
    // Delete session
    async function deleteSession(e) {
      const index = e.target.dataset.index;
      await chrome.runtime.sendMessage({
        action: 'DELETE_SESSION',
        index: parseInt(index)
      });
      loadSessions();
    }
  
    // Restore session
    async function restoreSession(e) {
      const index = e.target.dataset.index;
      const sessions = await chrome.runtime.sendMessage({ 
        action: 'GET_SESSIONS' 
      });
      
      const session = sessions[index];
      session.windows.forEach((window, i) => {
        chrome.windows.create({
          url: window.tabs.map(tab => tab.url),
          focused: i === 0
        });
      });
    }
  
    // Initial load
    loadSessions();
  });