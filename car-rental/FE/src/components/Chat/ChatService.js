import * as signalR from '@microsoft/signalr';

class ChatService {
  constructor(userId, username, onMessage) {
    this.userId = userId;
    this.username = username;
    this.onMessage = onMessage;
    this.connection = null;
  }

  async connect() {
    const token = localStorage.getItem('token');
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL || 'http://localhost:5277'}/hub/chat`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.on('ReceiveMessage', (message) => {
      console.log('[SignalR] ReceiveMessage:', message);
      this.onMessage(this._normalize(message));
    });

    this.connection.on('MessageSent', (message) => {
      console.log('[SignalR] MessageSent:', message);
      this.onMessage(this._normalize(message));
    });

    try {
      await this.connection.start();
      console.log('[SignalR] Connected to /hub/chat');
    } catch (err) {
      console.error('[SignalR] Connection failed:', err);
    }
  }

  // Normalize backend ChatMessageDto → frontend format
  _normalize(msg) {
    return {
      ...msg,
      content: msg.messageText || msg.content || '',
      timestamp: msg.sentAt || msg.timestamp,
    };
  }

  sendMessage(message) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('SendMessage', {
        receiverId: message.receiverId,
        messageText: message.content || message.messageText || '',
        messageType: 'text',
        imageUrls: message.imageUrls || []
      }).catch(err => console.error('[SignalR] SendMessage error:', err));
    } else {
      console.error('[SignalR] Not connected, state:', this.connection?.state);
    }
  }

  disconnect() {
    this.connection?.stop();
  }
}

export default ChatService;
