import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFileContract, FaSearch, FaEye, FaSignature, FaEdit, FaSave, FaTimes,
  FaCheckCircle, FaClock, FaExclamationTriangle, FaArrowLeft, FaSync,
  FaUser, FaCar, FaCalendarAlt, FaIdCard
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  getSupplierContracts, getContractById, generateContract,
  signContract, updateContractTerms, getSupplierOrders
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
const ContractList = ({ contracts, loading, onView, onRefresh }) => {
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
          <div className="bg-indigo-100 p-3 rounded-full">
            <FaFileContract className="text-indigo-600 text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Quản lý Hợp đồng</h2>
            <p className="text-gray-500 text-sm">Kiểm tra và quản lý hợp đồng thuê xe</p>
          </div>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <FaSync className={loading ? "animate-spin" : ""} /> Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[250px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Tìm kiếm mã hợp đồng, tên khách hàng, xe..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <FaSync className="animate-spin text-3xl text-indigo-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <FaFileContract className="mx-auto text-5xl mb-4" />
          <p className="text-lg">Chưa có hợp đồng nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Mã HĐ</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Xe</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Thời gian</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.contractId} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-sm font-medium text-indigo-600">{c.contractCode}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.customerName || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{c.carInfo || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.startDate} → {c.endDate}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge statusId={c.contractStatusId} /></td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => onView(c.contractId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition">
                      <FaEye /> Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Contract Detail ────────────────────────────────────────────────────────
const ContractDetail = ({ contractId, onBack }) => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [editingTerms, setEditingTerms] = useState(false);
  const [editedTerms, setEditedTerms] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getContractById(contractId);
      const contract = res?.contractId ? res : res?.data;
      if (contract) setContract(contract);
      else toast.error("Lỗi tải hợp đồng");
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
      const updated = res?.contractId ? res : res?.data;
      if (updated) { toast.success("Ký hợp đồng thành công!"); setContract(updated); setShowSignModal(false); }
      else toast.error(res?.message || "Lỗi ký hợp đồng");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi ký hợp đồng");
    } finally { setSigning(false); }
  };

  const handleSaveTerms = async () => {
    try {
      const res = await updateContractTerms(contractId, editedTerms);
      const updated = res?.contractId ? res : res?.data;
      if (updated) { toast.success("Cập nhật điều khoản thành công"); setContract(updated); setEditingTerms(false); }
      else toast.error(res?.message || "Lỗi cập nhật");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <FaSync className="animate-spin text-3xl text-indigo-500" />
    </div>
  );
  if (!contract) return <div className="text-center py-20 text-gray-400">Không tìm thấy hợp đồng</div>;

  const isDraft = contract.contractStatusId === 6;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      {/* Back + Title */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition"><FaArrowLeft className="text-gray-600" /></button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFileContract className="text-indigo-600" /> {contract.contractCode}
          </h2>
          <p className="text-gray-500 text-sm">Tạo lúc: {new Date(contract.createdAt).toLocaleString("vi-VN")}</p>
        </div>
        <StatusBadge statusId={contract.contractStatusId} />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Customer */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3"><FaUser /> Khách hàng</div>
          <p className="font-medium text-gray-800">{contract.customerName || "—"}</p>
          <p className="text-sm text-gray-500">{contract.customerEmail}</p>
          <p className="text-sm text-gray-500">{contract.customerPhone}</p>
          {/* License status */}
          {contract.customerLicense && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs">
                <FaIdCard className="text-gray-400" />
                <span>Bằng lái: </span>
                {contract.customerLicense.verificationStatus === "verified" ? (
                  <span className="text-green-600 font-medium">✓ Đã xác minh</span>
                ) : contract.customerLicense.verificationStatus === "rejected" ? (
                  <span className="text-red-600 font-medium">✗ Bị từ chối</span>
                ) : (
                  <span className="text-yellow-600 font-medium">⏳ Chưa xác minh</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Car */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-3"><FaCar /> Xe cho thuê</div>
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

      {/* Signature status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`rounded-xl p-4 border ${contract.signedBySupplier ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-center gap-2 mb-1">
            <FaSignature className={contract.signedBySupplier ? "text-green-600" : "text-gray-400"} />
            <span className="font-semibold text-sm">{contract.signedBySupplier ? "Bạn đã ký" : "Bạn chưa ký"}</span>
          </div>
          <SignatureDisplay
            signature={contract.supplierSignature}
            label="Chữ ký chủ xe"
            signed={contract.signedBySupplier}
          />
          {!contract.signedBySupplier && (contract.contractStatusId === 6 || contract.contractStatusId === 7) && (
            <button onClick={() => setShowSignModal(true)}
              className="mt-2 w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm rounded-lg hover:from-indigo-700 hover:to-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
              <FaSignature /> Ký hợp đồng
            </button>
          )}
        </div>
        <div className={`rounded-xl p-4 border ${contract.signedByCustomer ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
          <div className="flex items-center gap-2 mb-1">
            <FaSignature className={contract.signedByCustomer ? "text-green-600" : "text-gray-400"} />
            <span className="font-semibold text-sm">{contract.signedByCustomer ? "Khách đã ký" : "Khách chưa ký"}</span>
          </div>
          <SignatureDisplay
            signature={contract.customerSignature}
            label="Chữ ký khách hàng"
            signed={contract.signedByCustomer}
          />
        </div>
      </div>

      {/* Signature Modal */}
      <SignatureModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onSave={handleSign}
        title="Ký hợp đồng điện tử"
        signerLabel="Chữ ký chủ xe (Supplier)"
        loading={signing}
      />

      {/* Terms */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><FaFileContract /> Điều khoản hợp đồng</h3>
          {isDraft && !editingTerms && (
            <button onClick={() => { setEditedTerms(contract.termsAndConditions || ""); setEditingTerms(true); }}
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
              <FaEdit /> Chỉnh sửa
            </button>
          )}
        </div>
        {editingTerms ? (
          <div>
            <textarea value={editedTerms} onChange={e => setEditedTerms(e.target.value)} rows={20}
              className="w-full border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-2 mt-3 justify-end">
              <button onClick={() => setEditingTerms(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Hủy</button>
              <button onClick={handleSaveTerms} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1"><FaSave /> Lưu</button>
            </div>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg max-h-[500px] overflow-y-auto leading-relaxed">
            {contract.termsAndConditions || "Chưa có điều khoản"}
          </pre>
        )}
      </div>
    </motion.div>
  );
};

// ── Generate Contract from Order ───────────────────────────────────────────
const GenerateContractPanel = ({ onGenerated, contracts, onView }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getSupplierOrders();
        const confirmed = (Array.isArray(res) ? res : (res.data || res || [])).filter(o => {
          const statusName = (o.status?.statusName || o.statusName || "").toLowerCase();
          return statusName === "confirmed" || statusName === "approved";
        });
        setOrders(confirmed);
      } catch (err) {
        toast.error("Lỗi tải đơn hàng");
      } finally { setLoading(false); }
    })();
  }, []);

  const handleGenerate = async (bookingId) => {
    try {
      setGenerating(bookingId);
      const res = await generateContract(bookingId);
      const created = res?.contractId ? res : res?.data;
      if (created) {
        toast.success("Tạo hợp đồng thành công!");
        if (onGenerated) onGenerated();
      } else toast.error(res?.message || "Lỗi tạo hợp đồng");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Lỗi tạo hợp đồng");
    } finally { setGenerating(null); }
  };

  if (loading) return <div className="flex justify-center py-10"><FaSync className="animate-spin text-2xl text-indigo-500" /></div>;

  if (orders.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
        <FaFileContract className="text-indigo-600" /> Đơn đặt xe đã duyệt
      </h3>
      <div className="space-y-3">
        {orders.map(o => {
          const id = o.bookingId || o.id;
          const existing = (contracts || []).find(c => c.bookingId === id);
          return (
            <div key={id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-gray-800">Booking #{id}</span>
                <span className="text-sm text-gray-500 ml-3">
                  {o.carModel || o.car?.model || ""} • {o.customerName || o.customer?.fullName || ""}
                </span>
              </div>
              {existing ? (
                <button onClick={() => onView && onView(existing.contractId)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition flex items-center gap-1">
                  <FaEye /> Xem hợp đồng
                </button>
              ) : (
                <button onClick={() => handleGenerate(id)} disabled={generating === id}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-1">
                  <FaFileContract /> {generating === id ? "Đang tạo..." : "Tạo hợp đồng"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const SupplierContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewContractId, setViewContractId] = useState(null);

  const loadContracts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSupplierContracts();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setContracts(list);
    } catch (err) {
      toast.error("Lỗi tải danh sách hợp đồng");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadContracts(); }, [loadContracts]);

  if (viewContractId) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-8">
        <ContractDetail contractId={viewContractId} onBack={() => { setViewContractId(null); loadContracts(); }} />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8">
      <GenerateContractPanel onGenerated={loadContracts} contracts={contracts} onView={setViewContractId} />
      <ContractList contracts={contracts} loading={loading} onView={setViewContractId} onRefresh={loadContracts} />
    </motion.div>
  );
};

export default SupplierContractManagement;
