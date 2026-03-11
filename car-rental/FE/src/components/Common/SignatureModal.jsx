import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { FaSignature, FaTimes, FaEraser, FaCheck, FaUndo } from "react-icons/fa";

/**
 * SignatureModal - Reusable electronic signature modal
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSave: (base64Png: string) => void
 * - title: string (default: "Ký hợp đồng")
 * - signerLabel: string (default: "Chữ ký của bạn")
 */
const SignatureModal = ({
  isOpen,
  onClose,
  onSave,
  title = "Ký hợp đồng điện tử",
  signerLabel = "Chữ ký của bạn",
  loading = false
}) => {
  const sigPad = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  if (!isOpen) return null;

  const handleClear = () => {
    sigPad.current?.clear();
    setIsEmpty(true);
  };

  const handleSave = () => {
    if (sigPad.current?.isEmpty()) {
      return;
    }
    // Get trimmed canvas as base64 PNG (removes whitespace around signature)
    const base64 = sigPad.current.getTrimmedCanvas().toDataURL("image/png");
    onSave(base64);
  };

  const handleEnd = () => {
    setIsEmpty(sigPad.current?.isEmpty() ?? true);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/20 p-2 rounded-lg">
              <FaSignature className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm text-indigo-100">{signerLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Canvas area */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
            <FaSignature className="text-gray-400" />
            Vui lòng ký vào khung bên dưới bằng chuột hoặc bút cảm ứng
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 relative overflow-hidden">
            <SignatureCanvas
              ref={sigPad}
              penColor="#1e3a5f"
              canvasProps={{
                width: 460,
                height: 200,
                className: "w-full h-[200px] cursor-crosshair",
                style: { width: "100%", height: "200px" }
              }}
              minWidth={1.5}
              maxWidth={3}
              onEnd={handleEnd}
            />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-gray-300 text-lg font-light italic">
                  Ký tại đây...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={handleClear}
            disabled={isEmpty || loading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <FaEraser /> Xóa & ký lại
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              disabled={isEmpty || loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg hover:from-indigo-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FaCheck /> Xác nhận ký
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * SignatureDisplay - Renders a base64 signature image inline
 * 
 * Props:
 * - signature: string (base64 data URL or null)
 * - label: string
 * - signed: boolean
 */
export const SignatureDisplay = ({ signature, label, signed }) => {
  if (!signed || !signature) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-gray-400">
        <FaSignature className="text-3xl mb-2" />
        <span className="text-sm">Chưa ký</span>
      </div>
    );
  }

  // Check if it's a base64 data URL (real signature) or a text token (legacy)
  const isBase64Image = signature.startsWith("data:image");

  return (
    <div className="flex flex-col items-center py-3">
      {isBase64Image ? (
        <img
          src={signature}
          alt={label}
          className="max-h-[100px] max-w-full object-contain border-b-2 border-gray-300 pb-2 mb-2"
        />
      ) : (
        <div className="flex items-center gap-2 text-green-600 mb-2">
          <FaCheck className="text-lg" />
          <span className="font-medium">Đã ký điện tử</span>
        </div>
      )}
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
};

export default SignatureModal;
