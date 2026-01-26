import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';


class ChatService {
  constructor(userId, username, onMessage) {
    this.userId = userId;
    this.username = username;
    this.onMessage = onMessage;
    this.stompClient = null;
  }

  connect() {
    const socket = new SockJS(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/ws-chat`);
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      },
      onConnect: () => {
        console.log('[WS] Connected to WebSocket');
        // Gửi sự kiện addUser để backend lưu username vào session
        this.stompClient.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({ senderId: this.userId, sender: this.username })
        });
        console.log('[WS] Đã gửi addUser:', { senderId: this.userId, sender: this.username });
        console.log('[WS] Subscribing to /user/queue/messages ...');
        this.stompClient.subscribe(
          '/user/queue/messages',
          (msg) => {
            console.log('[WS][Supplier] [LOG] Raw STOMP message:', msg);
            console.log('[WS][Supplier] Nhận message từ /user/queue/messages:', msg.body);
            try {
              const parsed = JSON.parse(msg.body);
              console.log('[WS][Supplier] Parsed message:', parsed);
              this.onMessage(parsed);
            } catch (e) {
              console.error('[WS][Supplier] Lỗi parse message:', e, msg.body);
            }
          }
        );
        console.log('[WS] Đã subscribe thành công.');
      },
      onStompError: (frame) => {
        console.error('[WS] STOMP error:', frame);
      },
      onWebSocketError: (event) => {
        console.error('[WS] WebSocket error:', event);
      }
    });
    console.log('[WS] Activating STOMP client...');
    this.stompClient.activate();
  }

  sendMessage(message) {
    console.log('[WS] Attempting to send message:', message);
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(message),
      });
      console.log('[WS] Message sent:', message);
    } else {
      console.error('[WS] Cannot send message, STOMP client not connected');
    }
  }

  disconnect() {
    if (this.stompClient) {
      console.log('[WS] Disconnecting STOMP client...');
      this.stompClient.deactivate();
    }
  }
}

export default ChatService;
