import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import UserList from "@/components/Chat/UserList";
import MessageList from "@/components/Chat/MessageList";
import MessageInput from "@/components/Chat/MessageInput";
import ChatService from "@/components/Chat/ChatService";
import { useLocation } from "react-router-dom";
import { FaUserCircle, FaSearch, FaComments, FaLock, FaChevronDown } from "react-icons/fa";
import Header from "@/components/layout/Header/Header";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8081";

const Message = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const initialSelectedUser = location.state?.selectedUser || null;

  const [user, setUser] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(initialSelectedUser);
  const [messages, setMessages] = useState([]);
  const [zoomImageUrl, setZoomImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const bottomRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const chatServiceRef = React.useRef(null);

  // Lấy user profile khi vào trang
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await (await import('@/services/api')).getProfile();
        console.log('[Message.jsx] Profile fetched:', profile);
        // Map role from profile response to user object for frontend logic
        setUser({
          ...profile,
          role: profile.roleName || (profile.roleId === 3 ? "customer" : undefined)
        });
      } catch (err) {
        setUser(null);
      }
    };
    fetchProfile();
  }, []);

useEffect(() => {
  // Accept either role === "customer" or roleName === "customer" or roleId === 3
  const isCustomer = user && (user.role === "customer" || user.roleName === "customer" || user.roleId === 3);
  if (!user || !isCustomer || !(user?.userId || user?.id || user?.customerId)) {
    console.log('[Message.jsx] User missing id or role:', user);
    setError("auth");
    setLoading(false);
    return;
  }
  const token = localStorage.getItem("token");
  if (!token) {
    setError("auth");
    setLoading(false);
    return;
  }
  setLoading(true);
  setError(null);
  // Lấy customerId từ user
  const customerId = user?.userId || user?.id || user?.customerId;
  // Sử dụng hàm API mới để lấy danh sách supplier đã từng nhắn với customer
  import('@/services/api').then(apiModule => {
    apiModule.getSuppliersOfCustomer(customerId)
      .then(data => {
        setSuppliers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setSuppliers([]);
        setLoading(false);
      });
  });
}, [user]);


  useEffect(() => {
    if (initialSelectedUser) setSelectedSupplier(initialSelectedUser);
  }, [initialSelectedUser]);

  // Khi chọn supplier, load lịch sử chat và kết nối websocket
  useEffect(() => {
    if (!user || !selectedSupplier) return;
    if (!user.id && !user.userId && !user.customerId) return;
    if (!selectedSupplier.id && !selectedSupplier.userId) return;

    // Chỉ fetch lại khi đổi selectedSupplier
    if (chatServiceRef.current) chatServiceRef.current.disconnect();

    // Lấy lịch sử chat
    fetch(
      `${API_BASE}/api/chat/conversation/${selectedSupplier.id || selectedSupplier.userId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        const raw = Array.isArray(json) ? json : (json.data || []);
        const historyMessages = raw.map(m => ({
          ...m,
          content: m.messageText || m.content || m.messageContent || "",
          timestamp: m.sentAt || m.timestamp,
        }));
        setMessages(historyMessages);
      })
      .catch((err) => {
        console.error('[Customer][Message.jsx] Lỗi lấy lịch sử chat:', err);
        setMessages([]);
      });

    // Kết nối WebSocket
    const service = new ChatService(user.userId || user.id || user.customerId, user.fullName || user.username || user.email, (msg) => {
      setMessages((prev) => {
        // Đảm bảo msg có content
        const safeMsg = { ...msg, content: msg.content || msg.messageContent || "" };
        if (safeMsg.messageId && prev.some((m) => m.messageId === safeMsg.messageId)) return prev;
        return [...prev, safeMsg];
      });
    });
    service.connect();
    chatServiceRef.current = service;

    return () => service.disconnect();
  }, [user, selectedSupplier]);

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (isNearBottom && bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, isNearBottom]);

  const handleSend = (content, imageUrls) => {
    if ((!content && (!imageUrls || imageUrls.length === 0)) || !chatServiceRef.current) return;
    if (!user || !selectedSupplier) return;
    const msg = {
      senderId: user.userId || user.id || user.customerId,
      receiverId: selectedSupplier.id || selectedSupplier.userId,
      sender: user.fullName || user.username || user.email,
      receiver: selectedSupplier.fullName || selectedSupplier.username || selectedSupplier.email,
      content,
      imageUrls,
      timestamp: new Date().toISOString(),
    };
    chatServiceRef.current.sendMessage(msg);
  };

  const handleSelectUser = (supplier) => {
    setSelectedSupplier(supplier);
    // Không reset messages về rỗng ở đây nữa
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 120;
      setIsNearBottom(nearBottom);
      setShowScrollButton(!nearBottom);
    }
  };

const isCustomer = user && (user.role === "customer" || user.roleName === "customer" || user.roleId === 3);
if (!user || !isCustomer) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">Bạn cần đăng nhập bằng tài khoản khách hàng</h2>
          <p className="text-gray-500 mb-4">Vui lòng đăng nhập để xem tin nhắn với các nhà cung cấp.</p>
          <a href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">Đăng nhập</a>
        </div>
      </div>
    );
  }

  // Filter suppliers theo searchTerm
  const filteredSuppliers = Array.isArray(suppliers)
    ? suppliers.filter(sup => {
        const name = sup.fullName || sup.username || sup.email || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  return (
    <>
      <Header
        isUserDropdownOpen={isUserDropdownOpen}
        setIsUserDropdownOpen={setIsUserDropdownOpen}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold text-blue-700 mb-8">Tin nhắn với nhà cung cấp</h1>
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 flex overflow-hidden min-h-[600px]">
          <UserList
            currentUserId={user?.userId || user?.id || user?.customerId}
            onSelect={handleSelectUser}
            initialSelectedUser={selectedSupplier}
            users={suppliers}
          />
          <div className="flex-1 min-w-0 bg-white flex flex-col">
            {selectedSupplier ? (
              <>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 border-b border-blue-400">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <FaUserCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {selectedSupplier.fullName || selectedSupplier.username || selectedSupplier.email || "Nhà cung cấp"}
                      </h3>
                      <p className="text-blue-100 text-sm">Đang hoạt động</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-h-0 relative">
                  <div
                    className="h-[480px] overflow-y-auto"
                    ref={containerRef}
                    onScroll={handleScroll}
                  >
                    <MessageList messages={messages} currentUserId={user?.userId || user?.id || user?.customerId} setZoomImageUrl={setZoomImageUrl} />
                    <div ref={bottomRef} />
                  </div>
                  {showScrollButton && (
                    <button
                      onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                      className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-10 animate-bounce"
                      title="Cuộn xuống tin nhắn mới nhất"
                    >
                      <FaChevronDown className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <MessageInput onSend={handleSend} disabled={!selectedSupplier} setZoomImageUrl={setZoomImageUrl} />
              </>
            ) : (
              <div className="flex flex-col h-full items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <FaUserCircle className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-lg">Chọn cuộc trò chuyện</h3>
                  <p className="text-gray-500 text-sm">Chọn một nhà cung cấp để bắt đầu chat</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal phóng to ảnh */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setZoomImageUrl(null)}
        >
          <div className="relative max-w-[95vw] max-h-[95vh] p-4">
            <button
              className="absolute -top-2 -right-2 z-10 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
              onClick={() => setZoomImageUrl(null)}
            >
              <FaTimes className="w-4 h-4" />
            </button>
            <img
              src={zoomImageUrl || "/placeholder.svg"}
              alt="zoom-img"
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
