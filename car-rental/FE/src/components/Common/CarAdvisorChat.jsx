import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const CarAdvisorChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Xin chào! Mình là trợ lý tư vấn xe. Bạn cần thuê xe như thế nào? (số chỗ, ngân sách, khu vực, loại nhiên liệu...)" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/car-advisor/chat`, {
        messages: newMessages
      });
      const { reply, cars } = res.data.data;
      setMessages(prev => [...prev, { role: "assistant", content: reply, cars }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Nút mở chat */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(102,126,234,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, color: "#fff", transition: "transform 0.2s"
        }}
        title="Tư vấn xe AI"
      >
        {open ? "✕" : "🚗"}
      </button>

      {/* Cửa sổ chat */}
      {open && (
        <div style={{
          position: "fixed", bottom: 90, right: 24, zIndex: 9999,
          width: 360, height: 520, borderRadius: 16,
          background: "#fff", boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            padding: "14px 16px", color: "#fff"
          }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>🚗 Tư vấn thuê xe AI</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Hỏi mình về bất kỳ xe nào bạn cần</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <div style={{
                  display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                }}>
                  <div style={{
                    maxWidth: "80%", padding: "9px 13px", borderRadius: 14,
                    fontSize: 13.5, lineHeight: 1.5,
                    background: msg.role === "user" ? "linear-gradient(135deg, #667eea, #764ba2)" : "#f0f2f5",
                    color: msg.role === "user" ? "#fff" : "#222",
                    borderBottomRightRadius: msg.role === "user" ? 4 : 14,
                    borderBottomLeftRadius: msg.role === "assistant" ? 4 : 14,
                  }}>
                    {msg.content}
                  </div>
                </div>

                {/* Gợi ý xe */}
                {msg.cars && msg.cars.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                    {msg.cars.map(car => (
                      <div
                        key={car.carId}
                        onClick={() => navigate(`/cars/${car.carId}`)}
                        style={{
                          display: "flex", gap: 10, background: "#f8f9ff",
                          borderRadius: 12, padding: 10, cursor: "pointer",
                          border: "1px solid #e0e5ff",
                          transition: "box-shadow 0.15s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(102,126,234,0.2)"}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                      >
                        {car.thumbnailUrl && (
                          <img src={car.thumbnailUrl} alt={car.carModel}
                            style={{ width: 64, height: 48, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#222", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {car.brandName} {car.carModel} {car.year && `(${car.year})`}
                          </div>
                          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
                            {car.seats && `${car.seats} chỗ`}{car.fuelTypeName && ` · ${car.fuelTypeName}`}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#667eea", marginTop: 3 }}>
                            {car.rentalPricePerDay?.toLocaleString("vi-VN")} đ/ngày
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "#f0f2f5", borderRadius: 14, padding: "9px 13px", fontSize: 20 }}>
                  <span style={{ animation: "pulse 1s infinite" }}>...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid #eee", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Nhập yêu cầu của bạn..."
              disabled={loading}
              style={{
                flex: 1, padding: "9px 13px", borderRadius: 20,
                border: "1.5px solid #dde", fontSize: 13.5, outline: "none",
                fontFamily: "inherit"
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                padding: "9px 16px", borderRadius: 20, border: "none",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.6 : 1
              }}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CarAdvisorChat;
