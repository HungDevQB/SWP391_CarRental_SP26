import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaRobot, FaPaperPlane, FaTimes, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { sendCarAdvisorChat } from "@/services/api.js";
import { formatVND } from "@/utils/format";

const WELCOME =
    "Xin chào! Mình là trợ lý gợi ý xe. Bạn cho mình biết: ngân sách khoảng bao nhiêu/ngày, cần mấy chỗ, " +
    "ưu tiên hãng hoặc loại nhiên liệu, và đi ở khu vực nào — mình sẽ gợi ý vài xe phù hợp trong hệ thống.";

/**
 * Chatbox tư vấn chọn xe (backend: OpenAI nếu có API key, không thì gợi ý theo từ khóa).
 */
export default function AiCarAdvisorWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME, cars: [] }]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open, loading]);

    const send = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userTurn = { role: "user", content: text };
        const full = [...messages, userTurn];
        // Bỏ tin chào assistant đầu tiên khi gọi API (OpenAI ưu tiên bắt đầu bằng user)
        const forApi = full[0]?.role === "assistant" ? full.slice(1) : full;
        const historyForApi = forApi.map(({ role, content }) => ({ role, content }));
        setMessages((prev) => [...prev, userTurn]);
        setInput("");
        setLoading(true);

        try {
            const data = await sendCarAdvisorChat(historyForApi);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: data.reply || "Mình đã xem các lựa chọn trong hệ thống.",
                    cars: data.cars || [],
                },
            ]);
        } catch (e) {
            toast.error(e.message || "Không gửi được tin nhắn");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
            {open && (
                <div className="w-[min(100vw-2rem,22rem)] sm:w-[26rem] max-h-[min(70vh,28rem)] flex flex-col rounded-2xl border border-gray-200/80 bg-white/95 shadow-2xl backdrop-blur-md overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                            <FaRobot className="text-lg" />
                            Tư vấn chọn xe
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                            aria-label="Đóng"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 text-sm">
                        {messages.map((m, i) => (
                            <div key={i}>
                                <div
                                    className={`rounded-xl px-3 py-2 max-w-[95%] whitespace-pre-wrap ${
                                        m.role === "user"
                                            ? "ml-auto bg-blue-600 text-white rounded-br-sm"
                                            : "mr-auto bg-gray-100 text-gray-800 rounded-bl-sm"
                                    }`}
                                >
                                    {m.content}
                                </div>
                                {m.role === "assistant" && m.cars?.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {m.cars.map((car) => (
                                            <Link
                                                key={car.carId}
                                                to={`/cars/${car.carId}`}
                                                className="flex gap-2 p-2 rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all"
                                            >
                                                {car.thumbnailUrl ? (
                                                    <img
                                                        src={car.thumbnailUrl}
                                                        alt=""
                                                        className="w-16 h-12 object-cover rounded-lg shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-12 rounded-lg bg-gray-100 shrink-0" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-900 truncate">
                                                        {car.brandName} {car.carModel}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {car.seats ? `${car.seats} chỗ` : ""}
                                                        {car.fuelTypeName ? ` · ${car.fuelTypeName}` : ""}
                                                        {car.regionName ? ` · ${car.regionName}` : ""}
                                                    </p>
                                                    <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                                                        {formatVND(car.rentalPricePerDay)}/ngày
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-2 text-gray-500 text-xs px-1">
                                <FaSpinner className="animate-spin" />
                                Đang phân tích tiêu chí…
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="p-2 border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                            placeholder="Ví dụ: Ford 7 chỗ, ~1,5 triệu/ngày ở Hà Nội"
                            className="flex-1 min-w-0 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={send}
                            disabled={loading || !input.trim()}
                            className="shrink-0 rounded-xl bg-indigo-600 text-white px-3 py-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Gửi"
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all font-medium text-sm"
            >
                <FaRobot className="text-lg" />
                {open ? "Thu gọn" : "AI tư vấn xe"}
            </button>
        </div>
    );
}
