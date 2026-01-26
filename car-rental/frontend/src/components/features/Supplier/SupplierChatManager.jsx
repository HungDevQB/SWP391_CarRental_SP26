import React, { useState, useEffect, useRef } from 'react';
import ChatBox from '../Common/ChatBox';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';


const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const SupplierChatManager = ({ supplierId, supplierName, customers: initialCustomers }) => {
  console.log('[SupplierChatManager] supplierId:', supplierId);
  const [customers, setCustomers] = useState(initialCustomers || []);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const stompClient = useRef(null);

  // Lắng nghe tin nhắn mới qua WebSocket để tự động thêm customer mới
  useEffect(() => {
    if (!supplierId) return;
    const socket = new SockJS(`${API_BASE}/ws-chat`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });
    client.onConnect = () => {
      client.subscribe(`/user/${supplierId}/queue/messages`, (message) => {
        const msg = JSON.parse(message.body);
        // Nếu customerId chưa có trong danh sách thì thêm vào
        setCustomers(prev => {
          if (!prev.some(c => c.userId === msg.senderId)) {
            return [...prev, { userId: msg.senderId, fullName: msg.sender || msg.senderName, username: msg.sender || msg.senderName }];
          }
          return prev;
        });
      });
    };
    client.activate();
    stompClient.current = client;
    return () => {
      client.deactivate();
    };
  }, [supplierId]);

  // Nếu prop customers thay đổi (ví dụ khi load lại trang), cập nhật danh sách
  useEffect(() => {
    setCustomers(initialCustomers || []);
  }, [initialCustomers]);

  return (
    <div className="flex h-full">
      {/* Sidebar danh sách customer */}
      <div className="w-80 bg-gray-100 border-r p-4">
        <h3 className="font-bold mb-4">Khách hàng đang chat</h3>
        {customers.map(cust => (
          <div
            key={cust.userId}
            className={`p-3 rounded cursor-pointer mb-2 hover:bg-blue-100 ${activeCustomer?.userId === cust.userId ? 'bg-blue-200 font-bold' : ''}`}
            onClick={() => setActiveCustomer(cust)}
          >
            {cust.fullName || cust.username}
          </div>
        ))}
      </div>
      {/* Khung chat */}
      <div className="flex-1 flex items-center justify-center">
        {activeCustomer ? (
          <ChatBox
            supplierId={supplierId}
            supplierName={supplierName}
            customerId={activeCustomer.userId}
            customerName={activeCustomer.fullName || activeCustomer.username}
            onClose={() => setActiveCustomer(null)}
          />
        ) : (
          <div className="text-gray-500 text-xl">Chọn khách hàng để bắt đầu chat</div>
        )}
      </div>
    </div>
  );
};

export default SupplierChatManager;