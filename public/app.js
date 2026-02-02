/**
 * Family Chat Client
 * WebSocket connection and UI logic for OpenClaw Family Chat
 */

class FamilyChat {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.userName = localStorage.getItem('userName') || 'Family Member';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.connect();
    this.loadSavedName();
  }

  // WebSocket Connection
  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('[Chat] Connecting to:', wsUrl);
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('[Chat] Connected');
      this.connected = true;
      this.updateConnectionStatus();
    };
    
    this.ws.onclose = () => {
      console.log('[Chat] Disconnected');
      this.connected = false;
      this.updateConnectionStatus();
      // Reconnect after 3 seconds
      setTimeout(() => this.connect(), 3000);
    };
    
    this.ws.onerror = (error) => {
      console.error('[Chat] Error:', error);
    };
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }

  handleMessage(message) {
    switch (message.type) {
      case 'init':
        console.log('[Chat] Initialized:', message.data);
        break;
        
      case 'gateway':
        this.handleGatewayMessage(message.data);
        break;
        
      case 'music-results':
        this.displayMusicResults(message.data);
        break;
    }
  }

  handleGatewayMessage(data) {
    // Handle agent responses
    if (data.type === 'res' && data.method === 'message') {
      if (data.ok && data.payload) {
        this.addMessage(data.payload.text || 'I received your message!', 'bot');
      } else {
        this.addMessage('Sorry, I had trouble understanding that.', 'bot', true);
      }
    }
    
    // Handle events from gateway
    if (data.type === 'event') {
      switch (data.event) {
        case 'message':
          this.addMessage(data.payload.message, 'bot');
          break;
      }
    }
  }

  // UI Event Listeners
  setupEventListeners() {
    // Message input
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    sendBtn.addEventListener('click', () => this.sendMessage());
    
    // Quick replies
    document.querySelectorAll('.quick-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sendMessage(btn.dataset.message);
      });
    });
    
    // Music panel toggle
    document.getElementById('musicToggle').addEventListener('click', () => {
      this.togglePanel('music');
    });
    
    document.getElementById('closeMusic').addEventListener('click', () => {
      this.closePanel('music');
    });
    
    // Settings panel toggle
    document.getElementById('settingsToggle').addEventListener('click', () => {
      this.togglePanel('settings');
    });
    
    document.getElementById('closeSettings').addEventListener('click', () => {
      this.closePanel('settings');
    });
    
    // Music search
    const musicSearch = document.getElementById('musicSearch');
    const musicSearchBtn = document.getElementById('musicSearchBtn');
    
    musicSearch.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.searchMusic();
      }
    });
    
    musicSearchBtn.addEventListener('click', () => this.searchMusic());
    
    // Settings
    document.getElementById('userName').addEventListener('change', (e) => {
      this.userName = e.target.value;
      localStorage.setItem('userName', e.target.value);
    });
    
    // Quick action buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handleQuickAction(btn.dataset.action);
      });
    });
  }

  loadSavedName() {
    document.getElementById('userName').value = this.userName;
  }

  // Send Message
  sendMessage(text = null) {
    const input = document.getElementById('messageInput');
    const message = text || input.value.trim();
    
    if (!message) return;
    
    // Add to UI immediately
    this.addMessage(message, 'user');
    input.value = '';
    
    // Send to server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'chat',
        text: message,
        user: this.userName
      }));
    }
    
    // Show typing indicator
    this.showTyping();
  }

  // Add Message to Chat
  addMessage(text, type, isError = false) {
    const container = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    
    messageDiv.className = `message ${type}-message ${isError ? 'error-message' : ''}`;
    
    const avatar = type === 'bot' ? '🤖' : this.userName.charAt(0).toUpperCase();
    const name = type === 'bot' ? 'Syn' : this.userName;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check for YouTube links
    let content = text;
    const youtubeMatch = text.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    
    if (youtubeMatch) {
      content = text.replace(youtubeMatch[0], '');
      content += `<div class="youtube-embed">
        <iframe src="https://www.youtube.com/embed/${youtubeMatch[1]}" allowfullscreen></iframe>
      </div>`;
    }
    
    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <div class="message-name">${name}</div>
        <div class="message-text">${content}</div>
        <div class="message-time">${time}</div>
      </div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
  }

  showTyping() {
    const container = document.getElementById('messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    container.appendChild(typingDiv);
    container.scrollTop = container.scrollHeight;
  }

  hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  }

  // Music Search
  searchMusic() {
    const input = document.getElementById('musicSearch');
    const query = input.value.trim();
    
    if (!query) return;
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'music-search',
        query: query
      }));
    }
  }

  displayMusicResults(results) {
    const container = document.getElementById('musicResults');
    
    if (!results || results.length === 0) {
      container.innerHTML = '<div class="music-placeholder"><p>No results found 😔</p></div>';
      return;
    }
    
    container.innerHTML = results.map(item => `
      <div class="music-result" onclick="window.open('https://www.youtube.com/watch?v=${item.videoId}', '_blank')">
        <div class="music-thumbnail">
          ${item.thumbnail ? `<img src="${item.thumbnail}" alt="">` : '🎵'}
        </div>
        <div class="music-info">
          <div class="music-title">${this.escapeHtml(item.title)}</div>
          <div class="music-channel">${this.escapeHtml(item.channel)}</div>
        </div>
      </div>
    `).join('');
  }

  // Quick Actions
  handleQuickAction(action) {
    switch (action) {
      case 'play-music':
        this.togglePanel('music');
        break;
      case 'weather':
        this.sendMessage("What's the weather like today?");
        break;
      case 'reminder':
        this.sendMessage("Set a reminder for tomorrow at 9 AM");
        break;
    }
  }

  // Panel Management
  togglePanel(panel) {
    const panelEl = document.getElementById(`${panel}Panel`);
    panelEl.classList.toggle('open');
    
    // Close other panel
    const otherPanel = panel === 'music' ? 'settings' : 'music';
    document.getElementById(`${otherPanel}Panel`).classList.remove('open');
  }

  closePanel(panel) {
    document.getElementById(`${panel}Panel`).classList.remove('open');
  }

  // Connection Status
  updateConnectionStatus() {
    const statusEl = document.getElementById('connectionStatus');
    if (this.connected) {
      statusEl.textContent = '🟢 Connected';
      statusEl.classList.add('connected');
    } else {
      statusEl.textContent = '🔴 Disconnected';
      statusEl.classList.remove('connected');
    }
  }

  // Utility
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.chat = new FamilyChat();
});
