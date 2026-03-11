import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaIdCard, FaSearch, FaCheckCircle, FaTimesCircle, FaClock, FaSync,
  FaEye, FaChevronDown, FaChevronUp, FaUser, FaExclamationTriangle
} from "react-icons/fa";
import { toast } from "react-toastify";
import { getPendingLicenseVerifications, getCustomerLicense, verifyLicense } from "@/services/api";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

const statusMap = {
  verified:   { label: "Đã xác minh",   color: "bg-green-100 text-green-800",  icon: <FaCheckCircle /> },
  rejected:   { label: "Bị từ chối",    color: "bg-red-100 text-red-800",      icon: <FaTimesCircle /> },
  unverified: { label: "Chưa xác minh", color: "bg-yellow-100 text-yellow-800", icon: <FaClock /> },
};

const StatusBadge = ({ status }) => {
  const cfg = statusMap[status] || statusMap.unverified;
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ── Image Viewer Modal ─────────────────────────────────────────────────────
const ImageModal = ({ src, alt, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="max-w-[90vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
      <img src={src} alt={alt} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain" />
      <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow hover:bg-white">
        <FaTimesCircle className="text-gray-600 text-xl" />
      </button>
    </motion.div>
  </div>
);

// ── License Detail Card ────────────────────────────────────────────────────
const LicenseDetailCard = ({ item, onVerified }) => {
  const [expanded, setExpanded] = useState(false);
  const [licenseDetail, setLicenseDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewImage, setViewImage] = useState(null);

  const loadDetail = async () => {
    if (licenseDetail) { setExpanded(!expanded); return; }
    try {
      setLoadingDetail(true);
      const res = await getCustomerLicense(item.customerId);
      if (res.success) setLicenseDetail(res.data);
      else toast.error(res.message);
      setExpanded(true);
    } catch (err) {
      toast.error("Lỗi tải chi tiết bằng lái");
    } finally { setLoadingDetail(false); }
  };

  const handleVerify = async (approved) => {
    if (approved && !window.confirm("Xác nhận bằng lái của khách hàng hợp lệ?")) return;
    if (!approved && !rejectReason.trim()) {
      toast.warn("Vui lòng nhập lý do từ chối");
      return;
    }
    try {
      setSubmitting(true);
      const res = await verifyLicense(item.customerId, approved, approved ? null : rejectReason);
      if (res.success) {
        toast.success(approved ? "Xác minh bằng lái thành công!" : "Đã từ chối bằng lái");
        if (onVerified) onVerified();
      } else toast.error(res.message);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi xác minh");
    } finally { setSubmitting(false); }
  };

  const resolveImgSrc = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <motion.div layout className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {viewImage && <ImageModal src={viewImage.src} alt={viewImage.alt} onClose={() => setViewImage(null)} />}

      {/* Summary row */}
      <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition" onClick={loadDetail}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <FaUser className="text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{item.customerName}</p>
            <p className="text-sm text-gray-500">{item.customerEmail} • Booking #{item.bookingId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={item.verificationStatus || "unverified"} />
          {loadingDetail ? <FaSync className="animate-spin text-gray-400" /> : expanded ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && licenseDetail && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100">
            <div className="p-5">
              {/* License info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaIdCard /> Thông tin bằng lái</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Số bằng lái:</span> <span className="font-medium">{licenseDetail.drivingLicense || "Chưa cung cấp"}</span></p>
                    <p><span className="text-gray-500">CCCD/CMND:</span> <span className="font-medium">{licenseDetail.nationalId || "Chưa cung cấp"}</span></p>
                    <p><span className="text-gray-500">Họ tên:</span> <span className="font-medium">{licenseDetail.fullName || "—"}</span></p>
                    <p><span className="text-gray-500">Trạng thái:</span> <StatusBadge status={licenseDetail.verificationStatus} /></p>
                    {licenseDetail.verifiedAt && (
                      <p><span className="text-gray-500">Xác minh lúc:</span> <span className="font-medium">{new Date(licenseDetail.verifiedAt).toLocaleString("vi-VN")}</span></p>
                    )}
                    {licenseDetail.rejectionReason && (
                      <p className="text-red-600"><span className="text-gray-500">Lý do từ chối:</span> {licenseDetail.rejectionReason}</p>
                    )}
                  </div>
                </div>

                {/* License images */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaEye /> Hình ảnh bằng lái</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {licenseDetail.drivingLicenseFrontImage ? (
                      <div className="cursor-pointer group" onClick={() => setViewImage({ src: resolveImgSrc(licenseDetail.drivingLicenseFrontImage), alt: "Mặt trước" })}>
                        <img src={resolveImgSrc(licenseDetail.drivingLicenseFrontImage)} alt="Mặt trước"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:border-indigo-400 transition" />
                        <p className="text-xs text-center text-gray-500 mt-1">Mặt trước</p>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">Chưa có ảnh</div>
                    )}
                    {licenseDetail.drivingLicenseBackImage ? (
                      <div className="cursor-pointer group" onClick={() => setViewImage({ src: resolveImgSrc(licenseDetail.drivingLicenseBackImage), alt: "Mặt sau" })}>
                        <img src={resolveImgSrc(licenseDetail.drivingLicenseBackImage)} alt="Mặt sau"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:border-indigo-400 transition" />
                        <p className="text-xs text-center text-gray-500 mt-1">Mặt sau</p>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">Chưa có ảnh</div>
                    )}
                  </div>

                  {/* National ID images */}
                  <h4 className="font-semibold text-gray-700 mt-4 mb-3 flex items-center gap-2"><FaIdCard /> CCCD/CMND</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {licenseDetail.nationalIdFrontImage ? (
                      <div className="cursor-pointer group" onClick={() => setViewImage({ src: resolveImgSrc(licenseDetail.nationalIdFrontImage), alt: "CCCD mặt trước" })}>
                        <img src={resolveImgSrc(licenseDetail.nationalIdFrontImage)} alt="CCCD mặt trước"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:border-indigo-400 transition" />
                        <p className="text-xs text-center text-gray-500 mt-1">Mặt trước</p>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">Chưa có ảnh</div>
                    )}
                    {licenseDetail.nationalIdBackImage ? (
                      <div className="cursor-pointer group" onClick={() => setViewImage({ src: resolveImgSrc(licenseDetail.nationalIdBackImage), alt: "CCCD mặt sau" })}>
                        <img src={resolveImgSrc(licenseDetail.nationalIdBackImage)} alt="CCCD mặt sau"
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 group-hover:border-indigo-400 transition" />
                        <p className="text-xs text-center text-gray-500 mt-1">Mặt sau</p>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">Chưa có ảnh</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons - only show for unverified */}
              {(licenseDetail.verificationStatus === "unverified" || licenseDetail.verificationStatus === "rejected") && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => handleVerify(true)} disabled={submitting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium">
                      <FaCheckCircle /> {submitting ? "Đang xử lý..." : "Xác minh hợp lệ"}
                    </button>
                    {!showRejectForm ? (
                      <button onClick={() => setShowRejectForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium">
                        <FaTimesCircle /> Từ chối
                      </button>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex gap-2 items-start">
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                          placeholder="Nhập lý do từ chối (ảnh mờ, không khớp, hết hạn...)"
                          rows={2} className="flex-1 border border-red-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-400"
                        />
                        <button onClick={() => handleVerify(false)} disabled={submitting}
                          className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 transition">
                          Xác nhận từ chối
                        </button>
                        <button onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Hủy</button>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const SupplierLicenseVerification = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPendingLicenseVerifications();
      if (res.success) setItems(res.data || []);
    } catch (err) {
      toast.error("Lỗi tải danh sách xác minh");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const filtered = items.filter(i =>
    i.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    i.customerEmail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-3 rounded-full">
            <FaIdCard className="text-amber-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Xác minh Bằng lái xe</h2>
            <p className="text-gray-500 text-sm">Kiểm tra và xác minh giấy tờ khách hàng trước khi ký hợp đồng</p>
          </div>
        </div>
        <button onClick={loadItems}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
          <FaSync className={loading ? "animate-spin" : ""} /> Làm mới
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <FaExclamationTriangle className="text-blue-500 mt-0.5" />
        <div className="text-sm text-blue-700">
          <strong>Lưu ý:</strong> Bạn cần xác minh bằng lái xe của khách hàng trước khi ký hợp đồng thuê xe.
          Vui lòng kiểm tra kỹ các thông tin và hình ảnh bằng lái, CCCD/CMND khớp với thông tin đặt xe.
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Tìm kiếm khách hàng..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FaSync className="animate-spin text-3xl text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FaIdCard className="mx-auto text-5xl mb-4" />
          <p className="text-lg">Không có bằng lái nào cần xác minh</p>
          <p className="text-sm mt-1">Tất cả khách hàng đã được xác minh hoặc chưa có đơn đặt xe</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <LicenseDetailCard key={item.customerId} item={item} onVerified={loadItems} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SupplierLicenseVerification;
