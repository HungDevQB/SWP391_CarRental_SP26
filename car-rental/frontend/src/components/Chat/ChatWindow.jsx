"use client"

import { useEffect, useState, useRef } from "react"
import { FaUserCircle, FaPhone, FaVideo, FaEllipsisV, FaTimes, FaChevronDown } from "react-icons/fa"
import UserList from "./UserList"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import ChatService from "./ChatService"

const ChatWindow = ({ currentUser, initialSelectedUser, suppliers = [] }) => {
  const [selectedUser, setSelectedUser] = useState(initialSelectedUser || null)
  const [messages, setMessages] = useState([])
  const [zoomImageUrl, setZoomImageUrl] = useState(null)
  // Đồng bộ selectedUser khi prop initialSelectedUser thay đổi
  useEffect(() => {
    if (initialSelectedUser) {
      setSelectedUser(initialSelectedUser);
      setMessages([]); // reset messages khi đổi user
    }
  }, [initialSelectedUser]);
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const bottomRef = useRef(null)
  const containerRef = useRef(null)

  // Reset messages khi chọn user mới
  const handleSelectUser = (user) => {
    setMessages([])
    setSelectedUser(user)
  }

  // Cuộn xuống cuối
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Kiểm tra vị trí cuộn
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const nearBottom = scrollHeight - scrollTop - clientHeight < 120
      setIsNearBottom(nearBottom)
      setShowScrollButton(!nearBottom)
    }
  }

  const chatServiceRef = useRef(null)

  // Kết nối WebSocket khi chọn user
  useEffect(() => {
    if (!currentUser || !selectedUser) return
    if (!currentUser.id || !selectedUser.id) return

    if (chatServiceRef.current) chatServiceRef.current.disconnect()

    // Tạo state tạm lưu lịch sử chat, sau đó merge với tin nhắn realtime
    let historyMessages = []
    const service = new ChatService(currentUser.id, currentUser.username, (msg) => {
      console.log("[WS][Supplier] [LOG] Đã nhận callback từ WebSocket:", msg)
      console.log("[WS][Supplier] Nhận message:", msg)
      setMessages((prev) => {
        // Nếu đã có messageId thì không thêm lại
        if (msg.messageId && prev.some((m) => m.messageId === msg.messageId)) return prev
        return [...prev, msg]
      })
    })

    console.log("[WS][Supplier] Kết nối WebSocket...")
    service.connect()
    chatServiceRef.current = service

    // Load lịch sử chat
    fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/chat-messages/between-users?senderId=${currentUser.id}&receiverId=${selectedUser.id}`,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("[WS][Supplier] Lịch sử chat:", data)
        historyMessages = Array.isArray(data) ? data : []
        // Chuẩn hóa: luôn có trường content
        historyMessages = historyMessages.map(m => ({
          ...m,
          content: m.content || m.messageContent
        }))
        setMessages((prev) => {
          // Merge lịch sử và tin nhắn realtime, tránh trùng lặp
          const all = [...historyMessages, ...prev].map(m => ({
            ...m,
            content: m.content || m.messageContent
          }))
          const unique = []
          const ids = new Set()
          for (const m of all) {
            if (m.messageId && ids.has(m.messageId)) continue
            if (m.messageId) ids.add(m.messageId)
            unique.push(m)
          }
          return unique
        })
      })
      .catch(() => setMessages([]))

    return () => service.disconnect()
  }, [currentUser, selectedUser])

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (isNearBottom) scrollToBottom()
  }, [messages, isNearBottom])

  const handleSend = (content, imageUrls) => {
    if ((!content && (!imageUrls || imageUrls.length === 0)) || !chatServiceRef.current) return
    if (!currentUser || !selectedUser || !currentUser.id || !selectedUser.id) return

    const msg = {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      sender: currentUser.username,
      receiver: selectedUser.username,
      content,
      imageUrls,
      timestamp: new Date().toISOString(),
    }

    console.log("[WS][Supplier] Gửi message:", msg)
    chatServiceRef.current.sendMessage(msg)
    // Không tự thêm vào mảng messages, chỉ chờ WebSocket trả về
  }

  return (
    <>
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

      <div className="flex h-[700px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <UserList
          currentUserId={currentUser.id}
          onSelect={handleSelectUser}
          initialSelectedUser={initialSelectedUser}
          users={suppliers}
        />

        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          {selectedUser ? (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 border-b border-blue-400">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <FaUserCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {selectedUser.fullName || selectedUser.username || selectedUser.email || "Khách hàng"}
                    </h3>
                    <p className="text-blue-100 text-sm">Đang hoạt động</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200">
                    <FaPhone className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200">
                    <FaVideo className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200">
                    <FaEllipsisV className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 border-b border-gray-300">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <FaUserCircle className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="font-semibold text-gray-700 text-lg">Chọn cuộc trò chuyện</h3>
                  <p className="text-gray-500 text-sm">Chọn một khách hàng để bắt đầu chat</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 min-h-0 relative">
            <div
              className="h-[480px] overflow-y-auto"
              ref={containerRef}
              onScroll={handleScroll}
            >
              <MessageList messages={messages} currentUserId={currentUser.id} setZoomImageUrl={setZoomImageUrl} />
              <div ref={bottomRef} />
            </div>
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 z-10 animate-bounce"
                title="Cuộn xuống tin nhắn mới nhất"
              >
                <FaChevronDown className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Message Input */}
          <MessageInput onSend={handleSend} disabled={!selectedUser} setZoomImageUrl={setZoomImageUrl} />
        </div>
      </div>
    </>
  )
}

export default ChatWindow
