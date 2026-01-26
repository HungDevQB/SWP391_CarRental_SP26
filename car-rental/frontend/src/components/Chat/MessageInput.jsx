import React, { useState, useRef } from 'react';
import { FaPaperPlane, FaImage, FaTimes, FaTrash } from 'react-icons/fa';

const MessageInput = ({ onSend, disabled, setZoomImageUrl }) => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputFileRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() && images.length === 0) return;
    if (isUploading) return;

    setIsUploading(true);
    let imageUrls = [];
    
    if (images.length > 0) {
      for (const img of images) {
        const formData = new FormData();
        formData.append('file', img);
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/chat-messages/upload-image`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
          });
          imageUrls.push(await res.text());
        } catch (err) {
          alert('Lỗi upload ảnh');
          setIsUploading(false);
          return;
        }
      }
    }
    
    onSend(input, imageUrls);
    setInput('');
    setImages([]);
    setIsUploading(false);
    if (inputFileRef.current) inputFileRef.current.value = "";
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const clearAllImages = () => {
    setImages([]);
    if (inputFileRef.current) inputFileRef.current.value = "";
  };

  const canSend = !disabled && !isUploading && (input.trim() || images.length > 0);

  return (
    <div className="bg-white border-t border-gray-200">
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
                  src={URL.createObjectURL(img)} 
                  alt="preview" 
                  className="w-full h-20 object-cover rounded-lg border-2 border-gray-200 cursor-zoom-in hover:border-blue-300 transition-colors shadow-sm"
                  onClick={() => setZoomImageUrl && setZoomImageUrl(URL.createObjectURL(img))}
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

      {/* Input Section */}
      <form onSubmit={handleSend} className="p-4">
        <div className="flex items-end space-x-3">
          {/* Image Upload Button */}
          <div className="flex-shrink-0">
            <input
              type="file"
              accept="image/*"
              id="chat-img-upload"
              style={{ display: 'none' }}
              multiple
              onChange={e => setImages(prev => [...prev, ...Array.from(e.target.files)])}
              disabled={disabled || isUploading}
              ref={inputFileRef}
            />
            <label
              htmlFor="chat-img-upload"
              className={`cursor-pointer p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                disabled || isUploading 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
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
                  disabled 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                    : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400'
                }`}
                placeholder={disabled ? "Chọn người để chat..." : "Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={disabled || isUploading}
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              
              {/* Character counter for long messages */}
              {input.length > 200 && (
                <div className="absolute -bottom-6 right-2 text-xs text-gray-400">
                  {input.length}/1000
                </div>
              )}
            </div>
          </div>

          {/* Send Button */}
          <div className="flex-shrink-0">
            <button
              type="submit"
              className={`p-3 rounded-full font-medium transition-all duration-200 flex items-center justify-center relative ${
                canSend
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
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
        {!disabled && (
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
            <span>Nhấn Enter để gửi, Shift+Enter để xuống dòng</span>
            {images.length > 0 && (
              <span className="text-blue-600 font-medium">{images.length} ảnh sẵn sàng gửi</span>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageInput;