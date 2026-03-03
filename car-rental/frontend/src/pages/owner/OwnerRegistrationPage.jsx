import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCar,
  FaDollarSign,
  FaShieldAlt,
  FaClock,
  FaUsers,
  FaStar,
  FaCheckCircle,
  FaUpload,
  FaFileAlt,
  FaAward,
  FaBolt,
  FaHeart,
  FaBullseye,
  FaIdCard,
  FaUserCheck,
  FaArrowRight,
  FaPlay,
  FaQuoteRight,
  FaArrowLeft,
  FaExclamationTriangle,
  FaSpinner,
  FaTrash,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaInfoCircle,
  FaEye,
  FaEyeSlash,
  FaCrown,
  FaRocket,
  FaRegCommentDots,
  FaCalendar,
  FaDownload,
  FaEnvelope,
  FaHome,
  FaArrowUp,
} from "react-icons/fa";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { createOwnerRegistrationRequest } from "@/services/api";
import { getItem } from "@/utils/auth";
import heroBg from "@/assets/images/car-7.jpg";
import { motion } from "framer-motion";
import PhoneOtpVerification from "@/components/Common/PhoneOtpVerification";

// Badge component
function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm ${className}`}>
      {children}
    </span>
  );
}

// Card component
function Card({ children, className = "" }) {
  return <div className={`rounded-2xl shadow-xl bg-white ${className}`}>{children}</div>;
}

// CardHeader component
function CardHeader({ children, className = "" }) {
  return <div className={`px-6 pt-6 ${className}`}>{children}</div>;
}

// CardTitle component
function CardTitle({ children, className = "" }) {
  return <h3 className={`text-2xl font-bold text-gray-800 ${className}`}>{children}</h3>;
}

// CardContent component
function CardContent({ children, className = "" }) {
  return <div className={`px-6 pb-6 ${className}`}>{children}</div>;
}

// CardDescription component
function CardDescription({ children, className = "" }) {
  return <p className={`text-gray-600 ${className}`}>{children}</p>;
}

// Button component
function Button({ children, className = "", type = "button", onClick, disabled, size = "default", variant = "default" }) {
  const sizeStyles = size === "lg" ? "px-8 py-6 text-lg" : size === "sm" ? "px-4 py-2 text-sm" : "px-4 py-2 text-base";
  const variantStyles =
    variant === "outline"
      ? "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
      : variant === "destructive"
      ? "bg-red-100 hover:bg-red-200 text-red-600"
      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
}

// Input component
function Input({ className = "", ...props }) {
  return <input className={`h-14 text-lg px-4 border-2 rounded-2xl w-full transition-all duration-300 focus:ring-4 focus:ring-blue-100 ${className}`} {...props} />;
}

// Textarea component
function Textarea({ className = "", ...props }) {
  return <textarea className={`text-lg px-4 py-3 border-2 rounded-2xl w-full transition-all duration-300 focus:ring-4 focus:ring-blue-100 resize-none ${className}`} {...props} />;
}

// Tabs component
function Tabs({ children, value, onValueChange, className = "" }) {
  // Truyền activeTab và onValueChange xuống các con, nhưng KHÔNG ghi đè prop value của từng TabsTrigger
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { activeTab: value, onValueChange })
          : child
      )}
    </div>
  );
}

// TabsList component
function TabsList({ children, className = "" }) {
  return <div className={`flex ${className}`}>{children}</div>;
}

// TabsTrigger component
function TabsTrigger({ children, value, className = "", onValueChange, activeTab }) {
  const isActive = value === activeTab;
  return (
    <button
      className={`text-lg py-4 rounded-xl font-bold transition-all duration-200 px-6
        ${isActive
          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105"
          : "bg-white text-blue-600 hover:bg-blue-50 border border-blue-100"}
        ${className}`}
      onClick={() => onValueChange(value)}
      type="button"
      data-state={isActive ? "active" : "inactive"}
    >
      {children}
    </button>
  );
}

// TabsContent component
function TabsContent({ children, value, activeTab, className = "" }) {
  return value === activeTab ? <div className={className}>{children}</div> : null;
}

// Accordion component
function Accordion({ children, type = "single", collapsible, className = "" }) {
  const [openItem, setOpenItem] = useState(null);
  const handleToggle = (value) => {
    if (type === "single" && collapsible) {
      setOpenItem(openItem === value ? null : value);
    }
  };
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { isOpen: openItem === child.props.value, onToggle: handleToggle })
          : child
      )}
    </div>
  );
}

// AccordionItem component
function AccordionItem({ children, value, isOpen, onToggle, className = "" }) {
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { value, isOpen, onToggle })
          : child
      )}
    </div>
  );
}

// AccordionTrigger component
function AccordionTrigger({ children, value, isOpen, onToggle, className = "" }) {
  return (
    <button
      className={`w-full text-left text-lg font-semibold py-6 flex justify-between items-center hover:no-underline ${className}`}
      onClick={() => onToggle(value)}
      type="button"
    >
      {children}
      <span className="ml-2">{isOpen ? "-" : "+"}</span>
    </button>
  );
}

// AccordionContent component
function AccordionContent({ children, isOpen, className = "" }) {
  return isOpen ? <div className={`text-gray-600 pb-6 ${className}`}>{children}</div> : null;
}

// File Upload Component
const FileUpload = ({
  label,
  description,
  acceptedTypes,
  maxSize,
  onFileSelect,
  file,
  onRemove,
  required = false,
  icon,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFileSelect(droppedFile);
  };

  const handleFileSelect = async (selectedFile) => {
    if (selectedFile.size > maxSize) {
      toast.error(`File quá lớn. Tối đa: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setIsUploading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onFileSelect(selectedFile);
      toast.success("Tải file thành công!");
    } catch {
      toast.error("Lỗi khi tải file. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) handleFileSelect(selectedFile);
  };

  const handleView = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg">
          {icon}
        </div>
        <div>
          <label className="block text-lg font-bold text-gray-800">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>

      {!file ? (
        <div
          className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 cursor-pointer group ${
            isDragOver
              ? "border-blue-500 bg-blue-50 shadow-2xl scale-105"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-xl"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`file-${label}`).click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-blue-600 font-semibold">Đang tải file...</p>
            </div>
          ) : (
            <>
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <FaUpload className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Kéo thả file hoặc click để chọn</h3>
              <p className="text-gray-600 mb-6">
                Định dạng: {acceptedTypes} • Tối đa: {(maxSize / 1024 / 1024).toFixed(1)}MB
              </p>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold inline-flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <FaUpload className="mr-2 w-5 h-5" />
                Chọn file
              </div>
            </>
          )}
          <input
            id={`file-${label}`}
            type="file"
            accept={acceptedTypes}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <FaFileAlt className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-lg">{file.name}</h4>
                <p className="text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB • Đã tải thành công</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                onClick={handleView}
              >
                <FaEye className="w-4 h-4 mr-2" />
                Xem
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                onClick={onRemove}
              >
                <FaTrash className="w-4 h-4 mr-2" />
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const faqItems = [
  {
    title: "Tôi có thể kiếm được bao nhiều tiền mỗi tháng?",
    content:
      "Thu nhập trung bình của chủ xe dao động từ 10-25 triệu/tháng tùy thuộc vào loại xe, tần suất cho thuê và khu vực. Xe cao cấp và khu vực trung tâm thường có thu nhập cao hơn.",
  },
  {
    title: "Xe của tôi có được bảo hiểm không?",
    content:
      "Có, chúng tôi cung cấp bảo hiểm toàn diện cho tất cả xe trong hệ thống. Bảo hiểm bao gồm thiệt hại về xe, trách nhiệm dân sự và hỗ trợ 24/7.",
  },
  {
    title: "Quy trình xét duyệt mất bao lâu?",
    content:
      "Thông thường chúng tôi xét duyệt hồ sơ trong vòng 24-48 giờ làm việc. Sau khi được duyệt, bạn có thể bắt đầu đăng tin cho thuê xe ngay lập tức.",
  },
  {
    title: "Tôi có thể rút tiền như thế nào?",
    content:
      "Bạn có thể rút tiền hàng tuần qua tài khoản ngân hàng. Chúng tôi hỗ trợ chuyển khoản tự động và minh bạch 100% về doanh thu.",
  },
  {
    title: "Có phí tham gia không?",
    content:
      "Hoàn toàn miễn phí tham gia. Chúng tôi chỉ thu phí hoa hồng từ mỗi chuyến thuê thành công, đảm bảo lợi ích chung cho cả hai bên.",
  },
];

const OwnerRegistrationPage = () => {
  // Scroll to Top button state and logic
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    address: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [files, setFiles] = useState({ carDocuments: null, businessLicense: null, driverLicense: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("vehicle");
  const [faqOpen, setFaqOpen] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Nhận thông tin từ trang đăng ký
  useEffect(() => {
    if (location.state) {
      const { email, username, phone, password } = location.state;
      setFormData((prev) => ({
        ...prev,
        email: email || "",
        fullName: username || "",
        phoneNumber: phone ? formatPhoneNumber(phone) : "",
        password: password || "",
        confirmPassword: password || "", // tự động điền xác nhận mật khẩu luôn
      }));
    }
  }, [location.state]);

  // Format số điện thoại theo chuẩn
  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("84")) return `+${cleaned}`;
    if (cleaned.startsWith("0")) return `+84${cleaned.substring(1)}`;
    if (cleaned.length === 9 || cleaned.length === 10) return `+84${cleaned}`;
    return phone;
  };

  // Validate
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!formData.idNumber.trim()) newErrors.idNumber = "Vui lòng nhập số CMND/CCCD";
    else if (!/^\d{9,12}$/.test(formData.idNumber.replace(/\s/g, ""))) newErrors.idNumber = "Số CMND/CCCD không hợp lệ";
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = "Vui lòng nhập số điện thoại";
    else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phoneNumber.replace(/\s/g, ""))) newErrors.phoneNumber = "Số điện thoại không hợp lệ";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email không hợp lệ";
    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) newErrors.password = "Mật khẩu phải tối thiểu 8 ký tự, có chữ hoa, số và ký tự đặc biệt";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    if (!files.carDocuments) newErrors.carDocuments = "Vui lòng tải lên giấy tờ xe";
    if (!files.businessLicense) newErrors.businessLicense = "Vui lòng tải lên giấy phép kinh doanh";
    if (!files.driverLicense) newErrors.driverLicense = "Vui lòng tải lên bằng lái xe";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const formattedValue = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
      setIsPhoneVerified(false);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileSelect = (fileType, file) => {
    setFiles((prev) => ({ ...prev, [fileType]: file }));
    if (errors[fileType]) setErrors((prev) => ({ ...prev, [fileType]: "" }));
  };

  const handleFileRemove = (fileType) => {
    setFiles((prev) => ({ ...prev, [fileType]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin và hoàn thiện các trường bắt buộc");
      return;
    }
    setIsSubmitting(true);
    try {
      await createOwnerRegistrationRequest({
        ...formData,
        carDocuments: files.carDocuments,
        businessLicense: files.businessLicense,
        driverLicense: files.driverLicense,
      });
      toast.success("Đăng ký thành công! Chúng tôi sẽ xem xét và phản hồi trong vòng 24h.");
      navigate("/owner-registration-success");
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const scrollToForm = () => {
    document.getElementById("registration-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const tabs = [
    {
      value: "vehicle",
      label: (
        <span className="flex items-center justify-center">
          <FaCar className="w-5 h-5 mr-2" />
          Về xe
        </span>
      ),
      content: (
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl flex-nowrap min-w-0 w-auto max-w-fit">
              <FaCar className="text-blue-600 w-8 h-8 align-middle relative top-[2px]" />
              <span className="leading-none whitespace-nowrap">Yêu cầu về phương tiện</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {["Xe đời 2015 trở lên", "Tình trạng xe tốt, không tai nạn", "Có đầy đủ trang thiết bị an toàn"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 w-6 h-6" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {["Bảo hiểm còn hiệu lực", "Đăng kiểm còn hạn", "Nội thất sạch sẽ, nguyên vẹn"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 w-6 h-6" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "owner",
      label: (
        <span className="flex items-center justify-center">
          <FaUsers className="w-5 h-5 mr-2" />
          Về chủ xe
        </span>
      ),
      content: (
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl flex-nowrap min-w-0 w-auto max-w-fit">
              <FaUsers className="text-purple-600 w-8 h-8 align-middle relative top-[2px]" />
              <span className="leading-none whitespace-nowrap">Về chủ xe</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {["Từ 21 tuổi trở lên", "Có bằng lái xe hạng B2 trở lên", "Kinh nghiệm lái xe tối thiểu 2 năm"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 w-6 h-6" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {["Có smartphone để quản lý", "Thái độ phục vụ tốt", "Cam kết tuân thủ quy định"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 w-6 h-6" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
    {
      value: "documents",
      label: (
        <span className="flex items-center justify-center">
          <FaFileAlt className="w-5 h-5 mr-2" />
          Giấy tờ
        </span>
      ),
      content: (
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl flex-nowrap min-w-0 w-auto max-w-fit">
              <FaFileAlt className="text-orange-600 w-8 h-8 align-middle relative top-[2px]" />
              <span className="leading-none">Giấy tờ cần thiết</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {["CMND/CCCD còn hạn", "Bằng lái xe còn hạn", "Đăng ký xe (bản gốc)"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 w-6 h-6" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {["Giấy phép kinh doanh (nếu có)", "Bảo hiểm xe còn hiệu lực", "Giấy đăng kiểm còn hạn"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-500 w-6 h-6" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/50">
          <Link to="/" className="hover:text-blue-600 transition-colors font-medium">Trang chủ</Link>
          <span className="mx-3 text-gray-400">•</span>
          <span className="text-gray-700 font-bold">Đăng ký chủ xe</span>
        </div>

        {/* Hero Section */}
        <motion.section
          className="relative overflow-hidden"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
        >
          {/* Overlay màu gradient và overlay đen mờ */}
          <div className="absolute inset-0 z-0">
            <div className="w-full h-full bg-black/50 absolute inset-0"></div>
          </div>
          <div className="relative container mx-auto px-4 py-20 lg:py-32 z-10">
            <div className="max-w-6xl mx-auto text-center">
              <Badge className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0 text-lg px-6 py-3 shadow-lg animate-pulse">
                <FaCrown className="w-5 h-5 mr-2" />
                Trở thành đối tác của chúng tôi
              </Badge>
              <h1 className="text-5xl lg:text-8xl font-black mb-8 leading-tight drop-shadow-lg">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Kiếm tiền từ
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  chiếc xe của bạn
                </span>
              </h1>
              <p className="text-xl lg:text-2xl mb-12 text-white/95 leading-relaxed max-w-4xl mx-auto drop-shadow">
                Tham gia cộng đồng cho thuê xe và bắt đầu tạo thu nhập thụ động từ tài sản của bạn. Quy trình đơn giản,
                minh bạch và an toàn với hơn 10,000+ đối tác tin tưởng.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl px-10 py-6 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                  onClick={scrollToForm}
                >
                  <FaRocket className="mr-3 w-6 h-6" />
                  Đăng ký ngay
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 text-xl px-10 py-6 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 bg-white flex items-center justify-center"
                >
                  <FaPlay className="mr-3 w-6 h-6 text-blue-600" />
                  Xem video giới thiệu
                </Button>
              </div>
              <div className="relative">
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -top-10 -right-32 w-32 h-32 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-20 animate-pulse animation-delay-300"></div>
                <div className="absolute -bottom-16 -left-16 w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-20 animate-pulse animation-delay-600"></div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section className="py-20 bg-white/80 backdrop-blur-sm"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {[
                { icon: FaUsers, label: "Chủ xe đối tác", value: "10,000+", color: "from-blue-500 to-purple-500" },
                { icon: FaDollarSign, label: "Thu nhập TB/tháng", value: "15M+", color: "from-green-500 to-emerald-500" },
                { icon: FaStar, label: "Đánh giá", value: "4.8/5", color: "from-yellow-500 to-orange-500" },
                { icon: FaShieldAlt, label: "Bảo hiểm toàn diện", value: "100%", color: "from-purple-500 to-pink-500" },
              ].map((stat, index) => (
                <Card
                  key={index}
                  className="text-center border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm"
                >
                  <CardContent className="p-8">
                    <div
                      className={`w-20 h-20 bg-gradient-to-r ${stat.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                    >
                      <stat.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-4xl font-black text-gray-800 mb-2">{stat.value}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border-purple-200 text-lg px-6 py-3">
                <FaHeart className="w-5 h-5 mr-2" />
                Lợi ích vượt trội
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-black text-gray-800 mb-6">
                Tại sao chọn{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  chúng tôi?
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Chúng tôi mang đến giải pháp toàn diện để bạn tối đa hóa thu nhập từ xe của mình với công nghệ hiện đại và
                dịch vụ chuyên nghiệp
              </p>
            </div>
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: FaDollarSign,
                  title: "Thu nhập cao",
                  color: "from-green-500 to-emerald-500",
                  benefits: ["Thu nhập 10-20 triệu/tháng", "Thanh toán nhanh chóng", "Minh bạch 100%"],
                },
                {
                  icon: FaShieldAlt,
                  title: "An toàn tuyệt đối",
                  color: "from-blue-500 to-purple-500",
                  benefits: ["Bảo hiểm toàn diện", "Xác minh khách hàng", "Hỗ trợ 24/7"],
                },
                {
                  icon: FaBolt,
                  title: "Dễ dàng quản lý",
                  color: "from-orange-500 to-red-500",
                  benefits: ["App quản lý thông minh", "Theo dõi real-time", "Báo cáo chi tiết"],
                },
              ].map((benefit, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4 bg-white/95 backdrop-blur-sm group"
                >
                  <CardContent className="p-8">
                    <div
                      className={`w-20 h-20 bg-gradient-to-r ${benefit.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}
                    >
                      <benefit.icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">{benefit.title}</h3>
                    <ul className="space-y-4">
                      {benefit.benefits.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <FaCheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />
                          <span className="text-gray-700 font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>

        {/* How it Works Section */}
        <motion.section className="py-20 bg-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 text-lg px-6 py-3">
                <FaBullseye className="w-5 h-5 mr-2" />
                Quy trình đơn giản
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-black text-gray-800 mb-6">
                Cách thức{" "}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  hoạt động
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Chỉ với 4 bước đơn giản, bạn có thể bắt đầu kiếm tiền từ xe của mình và tham gia cộng đồng hàng nghìn đối
                tác thành công
              </p>
            </div>
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-4 gap-8">
                {[
                  {
                    step: 1,
                    title: "Đăng ký thông tin",
                    desc: "Điền form đăng ký và tải lên giấy tờ cần thiết",
                    color: "from-blue-500 to-purple-500",
                  },
                  {
                    step: 2,
                    title: "Xác minh hồ sơ",
                    desc: "Chúng tôi xem xét và xác minh thông tin trong 24h",
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    step: 3,
                    title: "Đăng tin cho thuê",
                    desc: "Tạo tin đăng với hình ảnh và mô tả xe của bạn",
                    color: "from-pink-500 to-red-500",
                  },
                  {
                    step: 4,
                    title: "Bắt đầu kiếm tiền",
                    desc: "Nhận booking và bắt đầu tạo thu nhập từ xe",
                    color: "from-green-500 to-emerald-500",
                  },
                ].map((step, index) => (
                  <div key={index} className="text-center relative">
                    <div className="relative mb-8">
                      <div
                        className={`w-24 h-24 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center mx-auto shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110`}
                      >
                        <span className="text-3xl font-black text-white">{step.step}</span>
                      </div>
                      {index < 3 && (
                        <div className="hidden lg:block absolute top-12 left-full w-full h-1 bg-gradient-to-r from-gray-200 to-gray-300 -z-10"></div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Requirements Section */}
        <motion.section className="py-24 bg-gradient-to-br from-orange-50 via-white to-blue-50 relative overflow-hidden"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-20 relative z-10">
              <Badge className="mb-4 bg-gradient-to-r from-orange-400 to-red-400 text-white border-0 text-base px-5 py-2 shadow-lg animate-pulse">
                <FaUserCheck className="w-5 h-5 mr-2" />
                Điều kiện tham gia
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-black mb-6 leading-tight drop-shadow-lg text-gray-800">
                Yêu cầu để trở thành <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">đối tác</span>
              </h2>
            </div>
            <div className="max-w-5xl mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-14 bg-white/90 backdrop-blur-2xl p-3 rounded-3xl shadow-2xl gap-4">
                  <TabsTrigger
                    value="vehicle"
                    className={`transition-all duration-300 text-xl py-6 rounded-2xl font-bold flex items-center justify-center gap-3 ${activeTab === "vehicle" ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-2xl scale-105" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:shadow-lg"}`}
                    activeTab={activeTab}
                    onValueChange={setActiveTab}
                  >
                    <FaCar className="w-7 h-7 mr-2" />
                    Về xe
                  </TabsTrigger>
                  <TabsTrigger
                    value="owner"
                    className={`transition-all duration-300 text-xl py-6 rounded-2xl font-bold flex items-center justify-center gap-3 ${activeTab === "owner" ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl scale-105" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:shadow-lg"}`}
                    activeTab={activeTab}
                    onValueChange={setActiveTab}
                  >
                    <FaUsers className="w-7 h-7 mr-2" />
                    Về chủ xe
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className={`transition-all duration-300 text-xl py-6 rounded-2xl font-bold flex items-center justify-center gap-3 ${activeTab === "documents" ? "bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-2xl scale-105" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:shadow-lg"}`}
                    activeTab={activeTab}
                    onValueChange={setActiveTab}
                  >
                    <FaFileAlt className="w-7 h-7 mr-2" />
                    Giấy tờ
                  </TabsTrigger>
                </TabsList>
                {/* Tab: Về xe */}
                {activeTab === "vehicle" && (
                  <TabsContent value="vehicle" activeTab={activeTab} className="space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                    >
                      <div className="rounded-3xl shadow-2xl bg-white/70 backdrop-blur-2xl border border-blue-100/40 p-10 flex flex-col gap-8">
                        <div className="flex items-center gap-5 mb-8">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <FaCar className="w-9 h-9" />
                          </div>
                          <h3 className="font-bold text-3xl text-gray-800">Yêu cầu về phương tiện</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                          <ul className="space-y-5">
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Xe đời 2015 trở lên</span>
                            </li>
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Tình trạng xe tốt, không tai nạn</span>
                            </li>
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Có đầy đủ trang thiết bị an toàn</span>
                            </li>
                          </ul>
                          <ul className="space-y-5">
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Bảo hiểm còn hiệu lực</span>
                            </li>
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Đăng kiểm còn hạn</span>
                            </li>
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Nội thất sạch sẽ, nguyên vẹn</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>
                )}
                {/* Tab: Về chủ xe */}
                {activeTab === "owner" && (
                  <TabsContent value="owner" activeTab={activeTab} className="space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                    >
                      <div className="rounded-3xl shadow-2xl bg-white/70 backdrop-blur-2xl border border-purple-100/40 p-10 flex flex-col gap-8">
                        <div className="flex items-center gap-5 mb-8">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <FaUsers className="w-9 h-9" />
                          </div>
                          <h3 className="font-bold text-3xl text-gray-800">Yêu cầu về chủ xe</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                          <ul className="space-y-5">
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Từ 21 tuổi trở lên</span>
                            </li>
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Có bằng lái xe hạng B2 trở lên</span>
                            </li>
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Kinh nghiệm lái xe tối thiểu 2 năm</span>
                            </li>
                          </ul>
                          <ul className="space-y-5">
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Có smartphone để quản lý</span>
                            </li>
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Thái độ phục vụ tốt</span>
                            </li>
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Cam kết tuân thủ quy định</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>
                )}
                {/* Tab: Giấy tờ */}
                {activeTab === "documents" && (
                  <TabsContent value="documents" activeTab={activeTab} className="space-y-8">
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                    >
                      <div className="rounded-3xl shadow-2xl bg-white/70 backdrop-blur-2xl border border-pink-100/40 p-10 flex flex-col gap-8">
                        <div className="flex items-center gap-5 mb-8">
                          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <FaFileAlt className="w-9 h-9" />
                          </div>
                          <h3 className="font-bold text-3xl text-gray-800">Giấy tờ cần thiết</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <ul className="space-y-5">
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">CMND/CCCD còn hạn</span>
                            </li>
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Bằng lái xe còn hạn</span>
                            </li>
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Đăng ký xe (bản gốc)</span>
                            </li>
                          </ul>
                          <ul className="space-y-5">
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Giấy phép kinh doanh (nếu có)</span>
                            </li>
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Bảo hiểm xe còn hiệu lực</span>
                            </li>
                            <li className="flex items-center gap-4 hover:scale-105 transition-transform">
                              <FaCheckCircle className="text-green-500 w-7 h-7" />
                              <span className="text-gray-700 font-semibold text-lg">Giấy đăng kiểm còn hạn</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section className="py-20 bg-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 text-lg px-6 py-3">
                <FaStar className="w-5 h-5 mr-2" />
                Câu chuyện thành công
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-black text-gray-800 mb-6">
                Chủ xe nói gì về{" "}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  chúng tôi
                </span>
              </h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: "Anh Minh",
                  car: "Honda City",
                  initial: "M",
                  review: "Tôi kiếm được 18 triệu/tháng từ chiếc xe của mình. Quy trình rất đơn giản và hỗ trợ tận tình.",
                  color: "from-blue-500 to-purple-500",
                },
                {
                  name: "Chị Lan",
                  car: "Toyota Vios",
                  initial: "L",
                  review: "An toàn và minh bạch. Tôi hoàn toàn yên tâm khi giao xe cho khách hàng qua nền tảng này.",
                  color: "from-green-500 to-emerald-500",
                },
                {
                  name: "Anh Tuấn",
                  car: "Mazda CX-5",
                  initial: "T",
                  review: "App quản lý rất tiện lợi. Tôi có thể theo dõi xe và thu nhập mọi lúc mọi nơi.",
                  color: "from-orange-500 to-red-500",
                },
              ].map((testimonial, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 bg-white/95 backdrop-blur-sm"
                >
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}
                      >
                        {testimonial.initial}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">{testimonial.name}</h4>
                        <p className="text-gray-600">Chủ xe {testimonial.car}</p>
                      </div>
                    </div>
                    <FaQuoteRight className="text-gray-300 w-8 h-8 mb-4" />
                    <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.review}"</p>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200 text-lg px-6 py-3">
                <FaClock className="w-5 h-5 mr-2" />
                Câu hỏi thường gặp
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-black text-gray-800 mb-6">
                Giải đáp{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  thắc mắc
                </span>
              </h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-0 px-6"
                  >
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline py-6 text-left">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-6 leading-relaxed">{item.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </motion.section>

        {/* Registration Form */}
        <motion.section id="registration-form" className="py-20 bg-white"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 text-lg px-6 py-3 shadow-lg">
                <FaArrowRight className="w-5 h-5 mr-2" />
                Bắt đầu ngay hôm nay
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-black text-gray-800 mb-6">
                Đăng ký trở thành{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  đối tác
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Điền thông tin bên dưới để bắt đầu hành trình kiếm tiền từ xe của bạn và tham gia cộng đồng hàng nghìn đối
                tác thành công
              </p>
            </div>
            <div className="max-w-5xl mx-auto">
              <Card className="border-0 shadow-3xl bg-white/95 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center rounded-t-3xl p-12">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                    <FaUsers className="w-12 h-12" />
                  </div>
                  <CardTitle className="text-4xl font-black mb-4">Thông tin đăng ký</CardTitle>
                  <CardDescription className="text-blue-100 text-xl">
                    Vui lòng điền đầy đủ thông tin để hoàn tất đăng ký
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-12">
                  <form onSubmit={handleSubmit} className="space-y-12">
                    <div>
                      <div className="flex items-center gap-4 mb-10">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-white shadow-xl">
                          <FaUser className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-800">Thông tin cá nhân</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-4">
                            Họ và tên <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              placeholder="Nhập họ và tên đầy đủ"
                              className={`h-16 text-lg px-6 rounded-2xl border-2 transition-all duration-300 ${
                                errors.fullName ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                              }`}
                            />
                            <FaUser className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          </div>
                          {errors.fullName && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {errors.fullName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-4">
                            Số CMND/CCCD <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              type="text"
                              name="idNumber"
                              value={formData.idNumber}
                              onChange={handleInputChange}
                              placeholder="Nhập số CMND/CCCD"
                              className={`h-16 text-lg px-6 rounded-2xl border-2 transition-all duration-300 ${
                                errors.idNumber ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                              }`}
                            />
                            <FaIdCard className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          </div>
                          {errors.idNumber && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {errors.idNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-4">
                            Số điện thoại <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              type="tel"
                              name="phoneNumber"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              placeholder="Ví dụ: +84123456789"
                              className={`h-16 text-lg px-6 rounded-2xl border-2 transition-all duration-300 ${
                                errors.phoneNumber ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                              }`}
                              disabled={isPhoneVerified}
                            />
                            <FaPhone className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          </div>
                          {errors.phoneNumber && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {errors.phoneNumber}
                            </p>
                          )}
                          {isPhoneVerified && (
                            <div className="text-green-600 text-sm font-semibold mt-2 flex items-center gap-2">
                              <span className="w-4 h-4 bg-green-500 rounded-full inline-block mr-2"></span>
                              Số điện thoại đã xác thực OTP!
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-4">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Nhập địa chỉ email"
                              className={`h-16 text-lg px-6 rounded-2xl border-2 transition-all duration-300 ${
                                errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                              }`}
                            />
                            <FaEnvelope className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          </div>
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-4">
                            Mật khẩu <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder="Nhập mật khẩu"
                              className={`h-16 text-lg px-6 rounded-2xl border-2 transition-all duration-300 ${errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                            />
                            <button
                              type="button"
                              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                              onClick={() => setShowPassword((v) => !v)}
                              tabIndex={-1}
                              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                              {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {errors.password}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-lg font-bold text-gray-800 mb-4">
                            Xác nhận mật khẩu <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="Nhập lại mật khẩu"
                              className={`h-16 text-lg px-6 rounded-2xl border-2 transition-all duration-300 ${errors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`}
                            />
                            <button
                              type="button"
                              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                              onClick={() => setShowConfirmPassword((v) => !v)}
                              tabIndex={-1}
                              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                              {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-8">
                        <label className="block text-lg font-bold text-gray-800 mb-4">
                          Địa chỉ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Nhập địa chỉ chi tiết"
                            rows={4}
                            className={`text-lg px-6 py-4 rounded-2xl border-2 transition-all duration-300 resize-none ${
                              errors.address ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                            }`}
                          />
                          <FaMapMarkerAlt className="absolute right-6 top-6 text-gray-400 w-5 h-5" />
                        </div>
                        {errors.address && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                            <FaExclamationTriangle className="w-4 h-4" />
                            {errors.address}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-4 mb-10">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white shadow-xl">
                          <FaFileAlt className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-black text-gray-800">Tải lên giấy tờ</h3>
                      </div>
                      <div className="space-y-10">
                        <div>
                          <FileUpload
                            label="Giấy tờ xe"
                            description="Đăng ký xe, bảo hiểm xe (PDF, JPG, PNG)"
                            acceptedTypes=".pdf,.jpg,.jpeg,.png"
                            maxSize={5 * 1024 * 1024}
                            onFileSelect={(file) => handleFileSelect("carDocuments", file)}
                            file={files.carDocuments}
                            onRemove={() => handleFileRemove("carDocuments")}
                            required={true}
                            icon={<FaCar className="w-6 h-6" />}
                          />
                          {errors.carDocuments && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {errors.carDocuments}
                            </p>
                          )}
                        </div>
                        <div>
                          <FileUpload
                            label="Giấy phép kinh doanh"
                            description="Giấy phép kinh doanh hoặc đăng ký hộ kinh doanh (PDF, JPG, PNG)"
                            acceptedTypes=".pdf,.jpg,.jpeg,.png"
                            maxSize={5 * 1024 * 1024}
                            onFileSelect={(file) => handleFileSelect("businessLicense", file)}
                            file={files.businessLicense}
                            onRemove={() => handleFileRemove("businessLicense")}
                            required={true}
                            icon={<FaAward className="w-6 h-6" />}
                          />
                          {errors.businessLicense && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {errors.businessLicense}
                            </p>
                          )}
                        </div>
                        <div>
                          <FileUpload
                            label="Bằng lái xe"
                            description="Bằng lái xe hạng B2 trở lên (PDF, JPG, PNG)"
                            acceptedTypes=".pdf,.jpg,.jpeg,.png"
                            maxSize={5 * 1024 * 1024}
                            onFileSelect={(file) => handleFileSelect("driverLicense", file)}
                            file={files.driverLicense}
                            onRemove={() => handleFileRemove("driverLicense")}
                            required={true}
                            icon={<FaIdCard className="w-6 h-6" />}
                          />
                          {errors.driverLicense && (
                            <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                              <FaExclamationTriangle className="w-4 h-4" />
                              {errors.driverLicense}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-xl">
                      <CardContent className="p-8">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center text-white shadow-xl flex-shrink-0">
                            <FaInfoCircle className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-2xl mb-6">Lưu ý quan trọng</h4>
                            <ul className="space-y-4 text-gray-700">
                              {[
                                "Tất cả thông tin phải chính xác và trung thực",
                                "Giấy tờ phải còn hiệu lực và rõ nét",
                                "Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48h",
                                "Bằng việc đăng ký, bạn đồng ý với điều khoản sử dụng",
                              ].map((note, idx) => (
                                <li key={idx} className="flex items-center gap-3">
                                  <FaCheckCircle className="text-green-500 w-6 h-6 flex-shrink-0" />
                                  <span className="font-medium">{note}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="flex flex-col sm:flex-row gap-6 pt-8">
                      <Link
                        to="/"
                        className="flex-1 h-16 text-xl font-bold rounded-2xl border-2 border-gray-300 hover:bg-gray-50 bg-transparent flex items-center justify-center transition-all duration-300"
                      >
                        <FaArrowLeft className="mr-3 w-6 h-6" />
                        Quay lại
                      </Link>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        size="lg"
                        className="flex-1 h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin mr-3 w-6 h-6" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="mr-3 w-6 h-6" />
                            Xác nhận đăng ký
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Scroll to Top Button */}
      {(() => {
        const [showScroll, setShowScroll] = React.useState(false);
        React.useEffect(() => {
          const handleScroll = () => {
            setShowScroll(window.scrollY > 200);
          };
          window.addEventListener('scroll', handleScroll);
          return () => window.removeEventListener('scroll', handleScroll);
        }, []);
        return showScroll ? (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-8 z-[100] w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:from-blue-700 hover:to-purple-700 hover:scale-110 transition-all flex items-center justify-center border-4 border-white animate-bounce"
            style={{ fontSize: 28 }}
            aria-label="Lên đầu trang"
          >
            <FaArrowUp />
          </button>
        ) : null;
      })()}
      <Footer />
    </div>
  );
}

export default OwnerRegistrationPage;