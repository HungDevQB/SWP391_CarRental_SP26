import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getCarConditionReportsByBooking } from '@/services/api';
import LoadingSpinner from '@/components/ui/Loading/LoadingSpinner';
import './CarConditionReportView.scss';

const CustomerCarConditionReportView = ({ 
    isOpen, 
    onClose, 
    bookingId
}) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && bookingId) {
            fetchReports();
        }
    }, [isOpen, bookingId]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await getCarConditionReportsByBooking(bookingId);
            console.log('📊 Customer view - API response:', response);
            
            // API trả về trực tiếp array
            const reportsData = Array.isArray(response) ? response : (response.data || []);
            console.log('📊 Reports data:', reportsData);
            
            // Debug images specifically
            reportsData.forEach((report, index) => {
                console.log(`📸 Report ${index + 1} images:`, report.images);
                if (report.images && report.images.length > 0) {
                    report.images.forEach((img, imgIndex) => {
                        console.log(`📸 Image ${imgIndex + 1}:`, {
                            imageId: img.imageId,
                            imageUrl: img.imageUrl,
                            imageType: img.imageType,
                            description: img.description
                        });
                    });
                }
            });
            
            setReports(reportsData);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Không thể tải báo cáo');
        } finally {
            setLoading(false);
        }
    };

    const getConditionColor = (condition) => {
        switch (condition) {
            case 'EXCELLENT': return '#4CAF50';
            case 'GOOD': return '#8BC34A';
            case 'FAIR': return '#FF9800';
            case 'POOR': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    const getConditionLabel = (condition) => {
        switch (condition) {
            case 'EXCELLENT': return 'Xuất sắc';
            case 'GOOD': return 'Tốt';
            case 'FAIR': return 'Khá';
            case 'POOR': return 'Kém';
            default: return condition;
        }
    };

    // Helper hiển thị badge trạng thái (simplified for customer)
    const getStatusBadge = (report) => {
        const status = report.statusName?.toLowerCase();
        if (status === 'pending') {
            return <div className="status-badge pending"><i className="fas fa-clock"></i> Chờ xác nhận</div>;
        }
        if (status === 'confirmed') {
            return <div className="status-badge confirmed"><i className="fas fa-check-circle"></i> Đã xác nhận</div>;
        }
        if (status === 'disputed') {
            return <div className="status-badge disputed"><i className="fas fa-exclamation-triangle"></i> Đang tranh chấp</div>;
        }
        if (status === 'resolved') {
            return <div className="status-badge resolved"><i className="fas fa-gavel"></i> Đã xử lý</div>;
        }
        if (status === 'cancelled' || status === 'canceled') {
            return <div className="status-badge cancelled"><i className="fas fa-ban"></i> Đã hủy</div>;
        }
        // Fallback legacy
        if (report.isConfirmed) {
            return <div className="status-badge confirmed"><i className="fas fa-check-circle"></i> Đã xác nhận</div>;
        }
        return <div className="status-badge pending"><i className="fas fa-clock"></i> Chờ xác nhận</div>;
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="car-condition-view-modal customer-view">
                <div className="modal-header">
                    <h3>
                        <i className="fas fa-clipboard-list"></i>
                        Báo cáo tình trạng xe
                    </h3>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-content">
                    {loading ? (
                        <div className="loading-container">
                            <LoadingSpinner size="large" color="blue" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="no-reports">
                            <i className="fas fa-clipboard"></i>
                            <h4>Chưa có báo cáo nào</h4>
                            <p>Chưa có báo cáo tình trạng xe nào được tạo cho đặt xe này.</p>
                        </div>
                    ) : (
                        <div className="reports-container">
                            {reports.map((report) => (
                                <div key={report.reportId} className="report-card customer-readonly">
                                    <div className="report-header">
                                        <div className="report-title">
                                            <h4>
                                                <i className={`fas ${report.reportType === 'PICKUP' ? 'fa-download' : 'fa-upload'}`}></i>
                                                {report.reportType === 'PICKUP' ? 'Báo cáo khi nhận xe' : 'Báo cáo khi trả xe'}
                                            </h4>
                                            <div className="report-meta">
                                                <span className="report-date">
                                                    <i className="fas fa-clock"></i>
                                                    {new Date(report.reportDate).toLocaleString('vi-VN')}
                                                </span>
                                                <span className="reporter">
                                                    <i className="fas fa-user"></i>
                                                    Báo cáo bởi: {report.reporterName || 'Chủ xe'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="report-status">
                                            {getStatusBadge(report)}
                                        </div>
                                    </div>

                                    <div className="report-content">
                                        {/* Basic Info */}
                                        <div className="info-section">
                                            <h5>Thông tin cơ bản</h5>
                                            <div className="info-grid">
                                                <div className="info-item">
                                                    <label>Mức nhiên liệu:</label>
                                                    <div className="fuel-display">
                                                        <span>{report.fuelLevel}%</span>
                                                        <div className="fuel-bar">
                                                            <div 
                                                                className="fuel-fill" 
                                                                style={{ width: `${report.fuelLevel}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="info-item">
                                                    <label>Số km:</label>
                                                    <span className="mileage">
                                                        {report.mileage?.toLocaleString()} km
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Condition Assessment */}
                                        <div className="condition-section">
                                            <h5>Đánh giá tình trạng</h5>
                                            <div className="condition-grid">
                                                {[
                                                    { key: 'exteriorCondition', label: 'Ngoại thất', icon: 'fa-car' },
                                                    { key: 'interiorCondition', label: 'Nội thất', icon: 'fa-chair' },
                                                    { key: 'engineCondition', label: 'Động cơ', icon: 'fa-cog' },
                                                    { key: 'tireCondition', label: 'Lốp xe', icon: 'fa-circle' }
                                                ].map(({ key, label, icon }) => (
                                                    <div key={key} className="condition-item">
                                                        <div className="condition-label">
                                                            <i className={`fas ${icon}`}></i>
                                                            {label}
                                                        </div>
                                                        <div 
                                                            className="condition-badge"
                                                            style={{ 
                                                                backgroundColor: getConditionColor(report[key]),
                                                                color: 'white'
                                                            }}
                                                        >
                                                            {getConditionLabel(report[key])}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {(report.damageNotes || report.additionalNotes) && (
                                            <div className="notes-section">
                                                <h5>Ghi chú</h5>
                                                {report.damageNotes && (
                                                    <div className="note-item damage-note">
                                                        <strong>Ghi chú về hư hỏng:</strong>
                                                        <p>{report.damageNotes}</p>
                                                    </div>
                                                )}
                                                {report.additionalNotes && (
                                                    <div className="note-item additional-note">
                                                        <strong>Ghi chú bổ sung:</strong>
                                                        <p>{report.additionalNotes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Images */}
                                        {report.images && report.images.length > 0 ? (
                                            <div className="images-section">
                                                <h5>Hình ảnh minh chứng ({report.images.length})</h5>
                                                <div className="images-grid">
                                                    {report.images.map((image, index) => {
                                                        console.log(`🖼️ Rendering image ${index + 1}:`, image);
                                                        
                                                        // Xử lý đường dẫn ảnh
                                                        let imageSrc = image.imageUrl;
                                                        
                                                        // Nếu imageUrl không bắt đầu với http hoặc /, thêm vào
                                                        if (!imageSrc.startsWith('http') && !imageSrc.startsWith('/')) {
                                                            imageSrc = `/${imageSrc}`;
                                                        }
                                                        
                                                        // Nếu đường dẫn tương đối, thêm base URL
                                                        if (imageSrc.startsWith('/uploads/')) {
                                                            imageSrc = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${imageSrc}`;
                                                        }
                                                        
                                                        console.log(`🖼️ Final image src:`, imageSrc);
                                                        
                                                        return (
                                                            <div key={index} className="image-item">
                                                                <div className="image-container">
                                                                    <img 
                                                                        src={imageSrc}
                                                                        alt={image.description || `Image ${index + 1}`}
                                                                        onClick={() => window.open(imageSrc, '_blank')}
                                                                        onError={(e) => {
                                                                            console.error('🖼️ Image load error:', imageSrc);
                                                                            e.target.style.display = 'none';
                                                                            e.target.nextSibling.style.display = 'block';
                                                                        }}
                                                                        onLoad={() => {
                                                                            console.log('🖼️ Image loaded successfully:', imageSrc);
                                                                        }}
                                                                    />
                                                                    <div className="image-error" style={{display: 'none', padding: '20px', background: '#f5f5f5', textAlign: 'center', border: '1px dashed #ccc'}}>
                                                                        <i className="fas fa-image" style={{fontSize: '2rem', color: '#ccc', marginBottom: '10px'}}></i>
                                                                        <p>Không thể tải ảnh</p>
                                                                        <small>{imageSrc}</small>
                                                                    </div>
                                                                </div>
                                                                <div className="image-info">
                                                                    <div className="image-type">
                                                                        {image.imageType === 'exterior_front' && 'Mặt trước xe'}
                                                                        {image.imageType === 'exterior_back' && 'Mặt sau xe'}
                                                                        {image.imageType === 'interior_dashboard' && 'Taplo nội thất'}
                                                                        {image.imageType === 'damage_detail' && 'Chi tiết hư hỏng'}
                                                                        {image.imageType === 'other' && 'Khác'}
                                                                        {!['exterior_front', 'exterior_back', 'interior_dashboard', 'damage_detail', 'other'].includes(image.imageType) && image.imageType}
                                                                    </div>
                                                                    {image.description && (
                                                                        <div className="image-description">
                                                                            {image.description}
                                                                        </div>
                                                                    )}
                                                                    <div className="image-debug" style={{fontSize: '10px', color: '#666', marginTop: '5px'}}>
                                                                        URL: {image.imageUrl}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="no-images" style={{padding: '20px', textAlign: 'center', background: '#f9f9f9', border: '1px dashed #ddd', marginTop: '16px'}}>
                                                <i className="fas fa-camera" style={{fontSize: '2rem', color: '#ccc', marginBottom: '10px'}}></i>
                                                <p>Không có hình ảnh minh chứng</p>
                                            </div>
                                        )}

                                        {/* Confirmation Section - Read-only for customer */}
                                        {report.isConfirmed && (
                                            <div className="confirmation-section">
                                                <div className="confirmation-info">
                                                    <i className="fas fa-check-circle"></i>
                                                    <span>
                                                        Đã được xác nhận bởi {report.confirmedByName || 'Chủ xe'} 
                                                        vào {new Date(report.confirmedAt).toLocaleString('vi-VN')}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Customer Info Notice */}
                                        <div className="customer-notice">
                                            <i className="fas fa-info-circle"></i>
                                            <span>
                                                Đây là báo cáo tình trạng xe do bạn đã tạo. 
                                                Nếu có thắc mắc, vui lòng liên hệ với chủ xe hoặc hỗ trợ khách hàng.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn secondary" onClick={onClose}>
                        <i className="fas fa-times"></i>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerCarConditionReportView;
