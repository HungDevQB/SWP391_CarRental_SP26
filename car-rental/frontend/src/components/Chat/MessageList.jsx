"use client"

import { useEffect, useRef } from "react"
import { FaComments, FaUserCircle, FaImage } from "react-icons/fa"

const MessageList = ({ messages, currentUserId, setZoomImageUrl }) => {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])


  console.log('[MessageList] currentUserId:', currentUserId);
  if (Array.isArray(messages)) {
    console.log('[MessageList] messages array:', messages);
    messages.forEach((msg, idx) => {
      console.log(`[MessageList][${idx}] senderId:`, msg.senderId, 'receiverId:', msg.receiverId, 'content:', msg.content);
    })
  } else {
    console.log('[MessageList] messages is not an array:', messages)
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-6 mx-auto">
            <FaComments className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Bắt đầu cuộc trò chuyện</h3>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-gray-100" style={{scrollbarWidth: 'auto'}}>
      <div className="space-y-2">
        {messages.map((msg, idx) => {
          const isSelf = msg.senderId === currentUserId;
          const showAvatar = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId;
          // Bỏ hoàn toàn divider ngày/giờ, chỉ giữ timestamp nhỏ dưới mỗi tin nhắn
          return (
            <div key={idx} className={`flex ${isSelf ? "justify-end" : "justify-start"} group`}>
              <div
                className={`flex items-end space-x-2 max-w-[70%] ${isSelf ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                {/* Avatar */}
                {!isSelf && (
                  <div className={`flex-shrink-0 ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <FaUserCircle className="w-6 h-6 text-gray-500" />
                    </div>
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`relative ${isSelf ? "ml-auto" : ""}`}>
                  {/* Sender Name */}
                  {!isSelf && showAvatar && (
                    <div className="text-xs text-gray-500 mb-1 px-1 font-medium">
                      {msg.sender || msg.senderUsername}
                    </div>
                  )}

                  <div
                    className={`relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-md ${
                      isSelf
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
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
                          const fullUrl = url.startsWith("http") ? url : `http://localhost:8080${url}`;
                          return (
                            <div key={i} className="relative group/image">
                              <img
                                src={fullUrl || "/placeholder.svg"}
                                alt="chat-img"
                                className="w-full max-w-[200px] max-h-[200px] object-cover rounded-xl cursor-zoom-in transition-transform duration-200 hover:scale-105 shadow-sm"
                                onClick={() => setZoomImageUrl && setZoomImageUrl(fullUrl)}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover/image:bg-opacity-10 rounded-xl transition-all duration-200 flex items-center justify-center">
                                <FaImage className="w-6 h-6 text-white opacity-0 group-hover/image:opacity-100 transition-opacity duration-200" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Message Content */}
                    {msg.content && (
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</div>
                    )}

                    {/* Timestamp */}
                    <div className={`text-xs mt-2 ${isSelf ? "text-blue-100" : "text-gray-400"}`}>
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "Asia/Ho_Chi_Minh",
                          })
                        : ""}
                    </div>

                    {/* Message tail */}
                    <div
                      className={`absolute top-4 ${
                        isSelf
                          ? "-right-1 border-l-8 border-l-blue-500 border-t-4 border-b-4 border-t-transparent border-b-transparent"
                          : "-left-1 border-r-8 border-r-white border-t-4 border-b-4 border-t-transparent border-b-transparent"
                      } ${showAvatar ? "block" : "hidden"}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  )
}

export default MessageList
