import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { createCarConditionReport } from '@/services/api';
import './CarConditionReportModal.scss';

const CarConditionReportModal = ({ 
    isOpen, 
    onClose, 
    booking, 
    reportType, 
    currentUser,
    onSuccess 
}) => {
    const [reportData, setReportData] = useState({
        fuelLevel: 100,
        mileage: '',
        exteriorCondition: 'GOOD',
        interiorCondition: 'GOOD',
        engineCondition: 'GOOD',
        tireCondition: 'GOOD',
        damageNotes: '',
        additionalNotes: ''
    });
    
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const conditionOptions = [
        { value: 'EXCELLENT', label: 'Xuất sắc', color: '#4CAF50' },
        { value: 'GOOD', label: 'Tốt', color: '#8BC34A' },
        { value: 'FAIR', label: 'Khá', color: '#FF9800' },
        { value: 'POOR', label: 'Kém', color: '#F44336' }
    ];

    const imageTypeOptions = [
        { value: 'exterior_front', label: 'Mặt trước xe' },
        { value: 'exterior_back', label: 'Mặt sau xe' },
        { value: 'exterior_left', label: 'Bên trái xe' },
        { value: 'exterior_right', label: 'Bên phải xe' },
        { value: 'interior_dashboard', label: 'Taplo nội thất' },
        { value: 'interior_seats', label: 'Ghế ngồi' },
        { value: 'damage_detail', label: 'Chi tiết hư hỏng' },
        { value: 'fuel_gauge', label: 'Đồng hồ nhiên liệu' },
        { value: 'odometer', label: 'Đồng hồ số km' },
        { value: 'other', label: 'Khác' }
    ];

    const handleInputChange = (field, value) => {
        setReportData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type: 'other',
            description: ''
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index) => {
        const imageToRemove = images[index];
        URL.revokeObjectURL(imageToRemove.preview);
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const updateImageInfo = (index, field, value) => {
        setImages(prev => prev.map((img, i) => 
            i === index ? { ...img, [field]: value } : img
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!reportData.mileage) {
            toast.error('Vui lòng nhập số km hiện tại');
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData = {
                ...reportData,
                carId: booking.carId,
                reporterId: currentUser.userId,
                reportType: reportType.toUpperCase()
            };

            await createCarConditionReport(booking.bookingId, submitData, images);
            
            toast.success(
                reportType === 'pickup' 
                    ? 'Đã tạo báo cáo khi nhận xe thành công!' 
                    : 'Đã tạo báo cáo khi trả xe thành công!'
            );
            
            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating report:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi tạo báo cáo');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="car-condition-modal">
                <div className="modal-header">
                    <h3>
                        <i className="fas fa-clipboard-check"></i>
                        {reportType === 'pickup' ? 'Báo cáo tình trạng khi nhận xe' : 'Báo cáo tình trạng khi trả xe'}
                    </h3>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-content">
                    {/* Booking Info */}
                    <div className="booking-info">
                        <div className="info-item">
                            <strong>Mã đặt xe:</strong> #{booking.bookingId}
                        </div>
                        <div className="info-item">
                            <strong>Xe:</strong> {booking.carModel || booking.car?.model} - {booking.carLicensePlate}
                        </div>
                        <div className="info-item">
                            <strong>Thời gian:</strong> {new Date().toLocaleString('vi-VN')}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="report-form">
                        {/* Basic Information */}
                        <div className="form-section">
                            <h4>Thông tin cơ bản</h4>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Mức nhiên liệu (%)</label>
                                    <div className="fuel-level-container">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={reportData.fuelLevel}
                                            onChange={(e) => handleInputChange('fuelLevel', e.target.value)}
                                            className="fuel-slider"
                                        />
                                        <div className="fuel-display">
                                            <span className="fuel-value">{reportData.fuelLevel}%</span>
                                            <div className="fuel-gauge">
                                                <div 
                                                    className="fuel-fill" 
                                                    style={{ width: `${reportData.fuelLevel}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Số km hiện tại *</label>
                                    <input
                                        type="number"
                                        value={reportData.mileage}
                                        onChange={(e) => handleInputChange('mileage', e.target.value)}
                                        placeholder="Nhập số km"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Condition Assessment */}
                        <div className="form-section">
                            <h4>Đánh giá tình trạng</h4>
                            <div className="condition-grid">
                                {[
                                    { key: 'exteriorCondition', label: 'Ngoại thất', icon: 'fa-car' },
                                    { key: 'interiorCondition', label: 'Nội thất', icon: 'fa-chair' },
                                    { key: 'engineCondition', label: 'Động cơ', icon: 'fa-cog' },
                                    { key: 'tireCondition', label: 'Lốp xe', icon: 'fa-circle' }
                                ].map(({ key, label, icon }) => (
                                    <div key={key} className="condition-group">
                                        <label>
                                            <i className={`fas ${icon}`}></i>
                                            {label}
                                        </label>
                                        <div className="condition-options">
                                            {conditionOptions.map(option => (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    className={`condition-btn ${reportData[key] === option.value ? 'active' : ''}`}
                                                    style={{
                                                        borderColor: reportData[key] === option.value ? option.color : '#ddd',
                                                        backgroundColor: reportData[key] === option.value ? option.color : 'transparent',
                                                        color: reportData[key] === option.value ? 'white' : option.color
                                                    }}
                                                    onClick={() => handleInputChange(key, option.value)}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="form-section">
                            <h4>Ghi chú</h4>
                            <div className="form-group">
                                <label>Ghi chú về hư hỏng (nếu có)</label>
                                <textarea
                                    value={reportData.damageNotes}
                                    onChange={(e) => handleInputChange('damageNotes', e.target.value)}
                                    placeholder="Mô tả chi tiết các hư hỏng, trầy xước..."
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label>Ghi chú bổ sung</label>
                                <textarea
                                    value={reportData.additionalNotes}
                                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                                    placeholder="Các ghi chú khác..."
                                    rows="2"
                                />
                            </div>
                        </div>

                        {/* Images */}
                        <div className="form-section">
                            <h4>Hình ảnh minh chứng</h4>
                            <div className="image-upload-section">
                                <button
                                    type="button"
                                    className="upload-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <i className="fas fa-camera"></i>
                                    Thêm ảnh
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                                
                                <div className="images-preview">
                                    {images.map((image, index) => (
                                        <div key={index} className="image-item">
                                            <div className="image-preview">
                                                <img src={image.preview} alt={`Preview ${index}`} />
                                                <button
                                                    type="button"
                                                    className="remove-image"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </div>
                                            <div className="image-details">
                                                <select
                                                    value={image.type}
                                                    onChange={(e) => updateImageInfo(index, 'type', e.target.value)}
                                                    className="image-type-select"
                                                >
                                                    {imageTypeOptions.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="text"
                                                    value={image.description}
                                                    onChange={(e) => updateImageInfo(index, 'description', e.target.value)}
                                                    placeholder="Mô tả ảnh..."
                                                    className="image-description"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i>
                                        Lưu báo cáo
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CarConditionReportModal;