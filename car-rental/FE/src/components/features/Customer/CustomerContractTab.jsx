import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FaFileContract, FaSearch, FaEye, FaSignature, FaTimes,
  FaCheckCircle, FaClock, FaExclamationTriangle, FaArrowLeft, FaSync,
  FaUser, FaCar, FaCalendarAlt, FaDownload, FaPrint
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  getCustomerContracts, getContractById, signContract
} from "@/services/api";
import SignatureModal, { SignatureDisplay } from "@/components/common/SignatureModal";

const statusConfig = {
  6:  { label: "Bản nháp",   color: "bg-yellow-100 text-yellow-800", icon: <FaClock /> },
  7:  { label: "Đã ký",      color: "bg-blue-100 text-blue-800",     icon: <FaSignature /> },
  8:  { label: "Hoạt động",   color: "bg-green-100 text-green-800",   icon: <FaCheckCircle /> },
  9:  { label: "Hết hạn",     color: "bg-gray-100 text-gray-600",     icon: <FaExclamationTriangle /> },
  10: { label: "Chấm dứt",   color: "bg-red-100 text-red-800",       icon: <FaTimes /> },
};

const StatusBadge = ({ statusId }) => {
  const cfg = statusConfig[statusId] || { label: "Không xác định", color: "bg-gray-100 text-gray-500", icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ── Contract List ──────────────────────────────────────────────────────────
const CustomerContractList = ({ contracts, loading, onView, onRefresh }) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = contracts.filter(c => {
    const matchSearch =
      c.contractCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      c.carInfo?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.contractStatusId === parseInt(filterStatus);
    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-3 rounded-full">
            <FaFileContract className="text-emerald-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Hợp đồng của tôi</h2>
            <p className="text-gray-500 text-sm">Xem và ký hợp đồng thuê xe điện tử</p>
          </div>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
          <FaSync className={loading ? "animate-spin" : ""} /> Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[250px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Tìm kiếm mã hợp đồng, chủ xe, xe..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FaSync className="animate-spin text-3xl text-emerald-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FaFileContract className="mx-auto text-5xl mb-4" />
          <p className="text-lg">Chưa có hợp đồng nào</p>
          <p className="text-sm mt-2">Khi chủ xe tạo hợp đồng, bạn sẽ thấy ở đây</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.contractId}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => onView(c.contractId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-50 p-3 rounded-lg">
                    <FaFileContract className="text-emerald-600 text-lg" />
                  </div>
                  <div>
                    <p className="font-mono font-semibold text-emerald-700">{c.contractCode}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1"><FaCar className="text-gray-400" /> {c.carInfo || "—"}</span>
                      <span className="flex items-center gap-1"><FaCalendarAlt className="text-gray-400" /> {c.startDate} → {c.endDate}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={c.signedBySupplier ? "text-green-600" : "text-gray-400"}>
                        {c.signedBySupplier ? "✓ Chủ xe đã ký" : "○ Chủ xe chưa ký"}
                      </span>
                      <span>•</span>
                      <span className={c.signedByCustomer ? "text-green-600" : "text-orange-500 font-medium"}>
                        {c.signedByCustomer ? "✓ Bạn đã ký" : "⚡ Cần ký"}
                      </span>
                    </div>
                  </div>
                  <StatusBadge statusId={c.contractStatusId} />
                  <FaEye className="text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Contract Detail ────────────────────────────────────────────────────────
const CustomerContractDetail = ({ contractId, onBack }) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getContractById(contractId);
      if (res.success) setContract(res.data);
      else toast.error(res.message || "Lỗi tải hợp đồng");
    } catch (err) {
      toast.error("Lỗi tải hợp đồng");
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => { load(); }, [load]);

  const handleSign = async (signatureBase64) => {
    try {
      setSigning(true);
      const res = await signContract(contractId, signatureBase64);
      if (res.success) {
        toast.success(res.message || "Ký hợp đồng thành công! ✍️");
        setContract(res.data);
        setShowSignModal(false);
      } else {
        toast.error(res.message || "Lỗi ký hợp đồng");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi ký hợp đồng");
    } finally { setSigning(false); }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <FaSync className="animate-spin text-3xl text-emerald-500" />
    </div>
  );
  if (!contract) return <div className="text-center py-20 text-gray-400">Không tìm thấy hợp đồng</div>;

  const canSign = !contract.signedByCustomer && (contract.contractStatusId === 6 || contract.contractStatusId === 7);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Back + Title */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition">
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFileContract className="text-emerald-600" /> {contract.contractCode}
          </h2>
          <p className="text-gray-500 text-sm">Tạo lúc: {new Date(contract.createdAt).toLocaleString("vi-VN")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-600">
            <FaPrint /> In
          </button>
          <StatusBadge statusId={contract.contractStatusId} />
        </div>
      </div>

      {/* Notification Banner for unsigned */}
      {canSign && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-full">
            <FaSignature className="text-orange-600 text-xl" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-orange-800">Hợp đồng cần chữ ký của bạn</p>
            <p className="text-sm text-orange-600">Vui lòng đọc kỹ điều khoản và ký xác nhận bên dưới</p>
          </div>
          <button onClick={() => setShowSignModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition font-semibold flex items-center gap-2 shadow-lg">
            <FaSignature /> Ký ngay
          </button>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Supplier */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3"><FaUser /> Chủ xe</div>
          <p className="font-medium text-gray-800">{contract.supplierName || "—"}</p>
        </div>

        {/* Car */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3"><FaCar /> Xe thuê</div>
          <p className="font-medium text-gray-800">{contract.carBrand} {contract.carModel}</p>
          <p className="text-sm text-gray-500">Biển số: {contract.licensePlate || "—"}</p>
        </div>

        {/* Period */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3"><FaCalendarAlt /> Thời gian thuê</div>
          <p className="font-medium text-gray-800">{contract.startDate}</p>
          <p className="text-sm text-gray-500">đến</p>
          <p className="font-medium text-gray-800">{contract.endDate}</p>
        </div>
      </div>

      {/* Terms */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
          <FaFileContract /> Điều khoản hợp đồng
        </h3>
        <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg max-h-[500px] overflow-y-auto leading-relaxed">
          {contract.termsAndConditions || "Chưa có điều khoản"}
        </pre>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Supplier Signature */}
        <div className={`rounded-xl p-5 border ${contract.signedBySupplier ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
            <FaSignature className={contract.signedBySupplier ? "text-green-600" : "text-gray-400"} />
            <span className="font-semibold text-sm">{contract.signedBySupplier ? "Chủ xe đã ký ✓" : "Chủ xe chưa ký"}</span>
          </div>
          <SignatureDisplay
            signature={contract.supplierSignature}
            label="Chữ ký chủ xe"
            signed={contract.signedBySupplier}
          />
        </div>

        {/* Customer Signature */}
        <div className={`rounded-xl p-5 border ${contract.signedByCustomer ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"}`}>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
            <FaSignature className={contract.signedByCustomer ? "text-green-600" : "text-orange-500"} />
            <span className="font-semibold text-sm">{contract.signedByCustomer ? "Bạn đã ký ✓" : "Bạn chưa ký"}</span>
          </div>
          <SignatureDisplay
            signature={contract.customerSignature}
            label="Chữ ký của bạn"
            signed={contract.signedByCustomer}
          />
          {canSign && (
            <button onClick={() => setShowSignModal(true)}
              className="mt-3 w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm rounded-lg hover:from-emerald-700 hover:to-teal-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 font-semibold">
              <FaSignature /> Ký hợp đồng
            </button>
          )}
        </div>
      </div>

      {/* Both signed confirmation */}
      {contract.signedByCustomer && contract.signedBySupplier && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-center">
          <FaCheckCircle className="mx-auto text-3xl text-green-600 mb-2" />
          <p className="font-bold text-green-800">Hợp đồng đã được ký bởi cả hai bên</p>
          <p className="text-sm text-green-600 mt-1">Hợp đồng có hiệu lực từ {contract.startDate} đến {contract.endDate}</p>
        </div>
      )}

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onSave={handleSign}
        title="Ký hợp đồng thuê xe"
        signerLabel="Chữ ký khách hàng (Customer)"
        loading={signing}
      />
    </motion.div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const CustomerContractTab = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewContractId, setViewContractId] = useState(null);

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCustomerContracts();
      // interceptor already unwraps ApiResponse<T>.data
      const list = Array.isArray(res) ? res : (res?.data || res || []);
      setContracts(list);
    } catch (err) {
      toast.error("Lỗi tải danh sách hợp đồng");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadContracts(); }, [loadContracts]);

  if (viewContractId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <CustomerContractDetail
          contractId={viewContractId}
          onBack={() => { setViewContractId(null); loadContracts(); }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <CustomerContractList
        contracts={contracts}
        loading={loading}
        onView={setViewContractId}
        onRefresh={loadContracts}
      />
    </motion.div>
  );
};

export default CustomerContractTab;
