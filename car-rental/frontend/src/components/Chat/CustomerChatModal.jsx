"use client"

import { useState, useRef, useEffect } from "react"
import { FaTimes, FaUserCircle, FaPaperPlane, FaImage, FaTrash, FaComments, FaChevronDown } from "react-icons/fa"
import ChatService from "./ChatService"

const CustomerChatModal = ({ open, onClose, customer, supplier }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [images, setImages] = useState([])
  const [chatService, setChatService] = useState(null)
  const [zoomImageUrl, setZoomImageUrl] = useState(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const messagesEndRef = useRef(null)
  const inputFileRef = useRef(null)
  const textareaRef = useRef(null)
  const containerRef = useRef(null)

  // Kiểm tra vị trí cuộn
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      setShowScrollButton(distanceFromBottom > 100)
      setIsNearBottom(distanceFromBottom < 50)
    }
  }

  // Cuộn xuống cuối
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Khi mở modal, gọi API lấy lịch sử chat và kết nối WebSocket
  useEffect(() => {
    let cs
    const fetchMessages = async () => {
      if (open && customer && supplier) {
        try {
          const token = sessionStorage.getItem("token")
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/chat-messages/between-users?senderId=${customer.id}&receiverId=${supplier.id}`,
            {
              headers: {
                Authorization: token ? `Bearer ${token}` : "",
                "Content-Type": "application/json",
              },
            },
          )
          const data = await res.json()
          setMessages(
            Array.isArray(data)
              ? data.map((msg) => ({
                  ...msg,
                  self: msg.senderId === customer.id,
                }))
              : [],
          )
        } catch (err) {
          setMessages([])
        }

        // Kết nối WebSocket
        cs = new ChatService(customer.id, customer.username, (msg) => {
          setMessages((prev) => {
            if (msg.messageId && prev.some((m) => m.messageId === msg.messageId)) return prev
            if (msg.id && prev.some((m) => m.id === msg.id)) return prev
            if (
              !msg.messageId &&
              !msg.id &&
              prev.some((m) => m.timestamp === msg.timestamp && m.content === msg.content)
            )
              return prev
            return [
              ...prev,
              {
                ...msg,
                self: msg.senderId === customer.id,
              },
            ]
          })
        })
        cs.connect()
        setChatService(cs)
      }
    }

    if (open && customer && supplier) {
      fetchMessages()
    }

    return () => {
      cs?.disconnect()
      setChatService(null)
    }
  }, [open, customer, supplier])

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (isNearBottom) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [messages, isNearBottom])

  // Khởi tạo cuộn xuống cuối khi mở modal
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
      }, 100)
    }
  }, [open])

  if (!open) return null

  const handleSend = async () => {
    if ((!input.trim() && images.length === 0) || !customer || !supplier || isUploading) return

    setIsUploading(true)
    const imageUrls = []

    if (images.length > 0) {
      for (const img of images) {
        const formData = new FormData()
        formData.append("file", img)
        try {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/chat-messages/upload-image`,
            {
              method: "POST",
              body: formData,
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            },
          )
          imageUrls.push(await res.text())
        } catch (err) {
          alert("Lỗi upload ảnh")
          setIsUploading(false)
          return
        }
      }
    }

    const msg = {
      senderId: customer.id,
      receiverId: supplier.id,
      content: input,
      imageUrls,
      timestamp: new Date().toISOString(),
    }

    setInput("")
    setImages([])
    setIsUploading(false)
    if (inputFileRef.current) inputFileRef.current.value = ""
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    chatService?.sendMessage(msg)
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const clearAllImages = () => {
    setImages([])
    if (inputFileRef.current) inputFileRef.current.value = ""
  }

  const canSend = !isUploading && (input.trim() || images.length > 0) && customer

  return (
    <>
      {/* Modal phóng to ảnh */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-200"
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

      {/* Modal chính */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg h-[700px] relative flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white relative flex-shrink-0">
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-200 text-xl z-10 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200 hover:scale-110"
              onClick={onClose}
              aria-label="Đóng chat"
            >
              <FaTimes />
            </button>

            <div className="flex flex-col items-center pt-6 pb-6">
              <div className="relative mb-3">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <FaUserCircle className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-3 border-white rounded-full animate-pulse"></div>
              </div>
              <div className="font-semibold text-xl mb-1 drop-shadow-sm">
                {supplier?.username || supplier?.email || "Chủ xe"}
              </div>
              <div className="text-sm text-blue-100 font-medium">Đang hoạt động</div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 relative min-h-0">
            <div
              ref={containerRef}
              className="h-full overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white scrollbar-hide"
              onScroll={handleScroll}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <FaComments className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Bắt đầu cuộc trò chuyện</h3>
                  <p className="text-gray-500 text-sm leading-relaxed text-center max-w-sm">
                    Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg, idx) => {
                    const currentDate = msg.timestamp ? new Date(msg.timestamp) : null
                    let showHourDivider = false
                    if (idx === 0 && currentDate) {
                      showHourDivider = true
                    } else if (currentDate && messages[idx - 1]?.timestamp) {
                      const prevDate = new Date(messages[idx - 1].timestamp)
                      showHourDivider =
                        currentDate.getHours() !== prevDate.getHours() ||
                        currentDate.getDate() !== prevDate.getDate() ||
                        currentDate.getMonth() !== prevDate.getMonth() ||
                        currentDate.getFullYear() !== prevDate.getFullYear()
                    }

                    const showAvatar = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId

                    return (
                      <div key={idx}>
                        {/* Time Divider */}
                        {showHourDivider && currentDate && (
                          <div className="flex justify-center my-4">
                            <span className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-xs font-semibold shadow-sm">
                              {currentDate.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "Asia/Ho_Chi_Minh",
                              })}{" "}
                              {currentDate.toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}

                        {/* Message */}
                        <div className={`flex ${msg.self ? "justify-end" : "justify-start"} group`}>
                          <div
                            className={`flex items-end space-x-2 max-w-[80%] ${
                              msg.self ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            {/* Avatar */}
                            {!msg.self && (
                              <div className={`flex-shrink-0 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                  <FaUserCircle className="w-6 h-6 text-gray-500" />
                                </div>
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div className={`relative ${msg.self ? "ml-auto" : ""}`}>
                              <div
                                className={`relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-md ${
                                  msg.self
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                                }`}
                              >
                                {/* Images */}
                                {msg.imageUrls && Array.isArray(msg.imageUrls) && msg.imageUrls.length > 0 && (
                                  <div
                                    className={`grid gap-2 mb-3 ${
                                      msg.imageUrls.length === 1
                                        ? "grid-cols-1"
                                        : msg.imageUrls.length === 2
                                          ? "grid-cols-2"
                                          : "grid-cols-2"
                                    }`}
                                  >
                                    {msg.imageUrls.map((url, i) => {
                                      const fullUrl = url.startsWith("http") ? url : `http://localhost:8080${url}`
                                      return (
                                        <div key={i} className="relative group/image">
                                          <img
                                            src={fullUrl || "/placeholder.svg"}
                                            alt="chat-img"
                                            className="w-full max-w-[150px] max-h-[150px] object-cover rounded-xl cursor-zoom-in transition-transform duration-200 hover:scale-105 shadow-sm"
                                            onClick={() => setZoomImageUrl(fullUrl)}
                                          />
                                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-10 rounded-xl transition-all duration-200 flex items-center justify-center">
                                            <FaImage className="w-5 h-5 text-white opacity-0 group-hover/image:opacity-100 transition-opacity duration-200" />
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}

                                {/* Text Content */}
                                {msg.content && (
                                  <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                    {msg.content}
                                  </div>
                                )}

                                {/* Timestamp */}
                                <div className={`text-xs mt-2 ${msg.self ? "text-blue-100" : "text-gray-400"}`}>
                                  {msg.timestamp
                                    ? new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                                        timeZone: "Asia/Ho_Chi_Minh",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </div>
                              </div>

                              {/* Message tail */}
                              <div
                                className={`absolute top-4 ${
                                  msg.self
                                    ? "-right-1 border-l-8 border-l-blue-500 border-t-4 border-b-4 border-t-transparent border-b-transparent"
                                    : "-left-1 border-r-8 border-r-white border-t-4 border-b-4 border-t-transparent border-b-transparent"
                                } ${showAvatar ? "block" : "hidden"}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Nút cuộn xuống */}
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

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 flex-shrink-0">
            {/* Image Preview Section */}
            {images.length > 0 && (
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <FaImage className="w-4 h-4 mr-2 text-blue-500" />
                    Ảnh đã chọn ({images.length})
                  </span>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                    onClick={clearAllImages}
                  >
                    <FaTrash className="w-3 h-3 mr-1" />
                    Xóa tất cả
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(img) || "/placeholder.svg"}
                        alt="preview"
                        className="w-full h-16 object-cover rounded-lg border-2 border-gray-200 cursor-zoom-in hover:border-blue-300 transition-colors shadow-sm"
                        onClick={() => setZoomImageUrl(URL.createObjectURL(img))}
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        onClick={() => removeImage(idx)}
                        title="Xóa ảnh này"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input Controls */}
            <div className="p-4">
              <div className="flex items-end space-x-3">
                {/* Image Upload Button */}
                <div className="flex-shrink-0">
                  <input
                    type="file"
                    accept="image/*"
                    id="customer-chat-img-upload"
                    style={{ display: "none" }}
                    multiple
                    onChange={(e) => setImages((prev) => [...prev, ...Array.from(e.target.files)])}
                    disabled={!customer || isUploading}
                    ref={inputFileRef}
                  />
                  <label
                    htmlFor="customer-chat-img-upload"
                    className={`cursor-pointer p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                      !customer || isUploading
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    title="Thêm ảnh"
                  >
                    <FaImage className="w-5 h-5" />
                  </label>
                </div>

                {/* Text Input */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      className={`w-full border-2 rounded-2xl px-4 py-3 pr-4 text-gray-800 text-sm placeholder-gray-500 resize-none transition-all duration-200 ${
                        !customer || isUploading
                          ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                          : "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
                      }`}
                      placeholder={
                        !customer
                          ? "Không thể gửi tin nhắn..."
                          : "Nhập tin nhắn..."
                      }
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      disabled={!customer || isUploading}
                      rows={1}
                      style={{ minHeight: "48px", maxHeight: "120px" }}
                    />

                    {/* Character counter for long messages */}
                    {input.length > 200 && (
                      <div className="absolute -bottom-6 right-2 text-xs text-gray-400">{input.length}/1000</div>
                    )}
                  </div>
                </div>

                {/* Send Button */}
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    className={`p-3 rounded-full font-medium transition-all duration-200 flex items-center justify-center relative ${
                      canSend
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={handleSend}
                    disabled={!canSend}
                    title={canSend ? "Gửi tin nhắn (Enter)" : "Nhập nội dung để gửi"}
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaPaperPlane className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Helper text */}
              {customer && (
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>Nhấn Enter để gửi, Shift+Enter để xuống dòng</span>
                  {images.length > 0 && (
                    <span className="text-blue-600 font-medium">{images.length} ảnh sẵn sàng gửi</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CustomerChatModal
