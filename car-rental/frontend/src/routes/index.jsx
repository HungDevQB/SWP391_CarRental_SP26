import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../store/AuthContext';

// Pages
import HomePage from '../pages/home/HomePage/HomePage';
import CarDetailPage from '../pages/cars/CarDetailPage/CarDetailPage';
import BookingConfirmationPage from '../pages/bookings/confirmation/BookingConfirmationPage/BookingConfirmationPage';
import BookingSuccessPage from '../pages/bookings/confirmation/BookingSuccessPage/BookingSuccessPage';
import PaymentPage from '../pages/payments/PaymentPage/PaymentPage';
import LoginRegister from '../pages/Auth/LoginRegister';
import FavoritePage from '../pages/favorites/FavoritePage/FavoritePage';
import ProfilePage from '../pages/profile/ProfilePage/ProfilePage';
import SearchPage from "../pages/cars/SearchPage/SearchPage";
import PaymentFailedPage from '../pages/payments/PaymentFailedPage';
import PlatformFeeSuccess from '../pages/payments/PlatformFeeSuccess';
import PlatformFeeCancel from '../pages/payments/PlatformFeeCancel';
import OwnerRegistrationPage from '../pages/owner/OwnerRegistrationPage';
import OwnerRegistrationSuccessPage from '../pages/owner/OwnerRegistrationSuccessPage';
import ForgotPassword from '../components/features/auth/ForgotPassword';
import ResetPassword from '../components/features/auth/ResetPassword';
import MessagePage from '../pages/chatMessage/Message';

// Components
import { ProtectedRoute } from '../components/features/auth/ProtectedRoute.jsx';

// Admin Pages
import AdminHome from '../components/features/admin/Home';
import Reports from '../components/features/admin/Reports';
import Users from '../components/features/admin/Users';
import Sidebar from '../components/features/admin/Sidebar';
import OwnerRequests from '../components/features/admin/OwnerRequests';
import PaymentsAdmin from '../components/features/admin/PaymentsAdmin';
import AdminCarApproval from '../components/features/admin/CarApprovalPage';
import CarConditionReportManagement from '../components/CarConditionReport/CarConditionReportManagement';

// Supplier Pages
import SupplierCarDashboard from '../components/features/Supplier/SupplierCarDashboard';

import AdminLayout from '../components/features/admin/AdminLayout';

const AppRoutes = () => {
    const { user } = useContext(AuthContext);

    return (
        <Routes>
            <Route path="/login" element={<LoginRegister />} />
            <Route
                path="/"
                element={
                    user ? (
                        user.role === 'admin' ? (
                            <Navigate to="/admin" replace />
                        ) : user.role === 'supplier' ? (
                            <Navigate to="/supplier/dashboard" replace />
                        ) : (
                            <HomePage />
                        )
                    ) : (
                        <HomePage />
                    )
                }
            />

            <Route path="/cars/:carId" element={<CarDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route
                path="/bookings/confirmation"
                element={
                    <ProtectedRoute>
                        <BookingConfirmationPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/booking-success"
                element={
                    <ProtectedRoute>
                        <BookingSuccessPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payment"
                element={
                    <ProtectedRoute>
                        <PaymentPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payment-failed"
                element={
                    <ProtectedRoute>
                        <PaymentFailedPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payment/platform-fee/success"
                element={
                    <ProtectedRoute>
                        <PlatformFeeSuccess />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/payment/platform-fee/cancel"
                element={
                    <ProtectedRoute>
                        <PlatformFeeCancel />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/favorites"
                element={
                    <ProtectedRoute>
                        <FavoritePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/customer/messages"
                element={
                    <ProtectedRoute requiredRole="customer">
                        <MessagePage />
                    </ProtectedRoute>
                }
            />

            {/* Supplier routes - Tất cả đều sử dụng SupplierCarDashboard */}
            <Route
                path="/supplier"
                element={
                    <ProtectedRoute requiredRole="supplier">
                        <Navigate to="/supplier/dashboard" replace />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/supplier/dashboard"
                element={
                    <ProtectedRoute requiredRole="supplier">
                        <SupplierCarDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/supplier/cars"
                element={
                    <ProtectedRoute requiredRole="supplier">
                        <Navigate to="/supplier/dashboard" replace />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/supplier/bookings"
                element={
                    <ProtectedRoute requiredRole="supplier">
                        <Navigate to="/supplier/dashboard" replace />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/supplier/reports"
                element={
                    <ProtectedRoute requiredRole="supplier">
                        <Navigate to="/supplier/dashboard" replace />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/supplier/profile"
                element={
                    <ProtectedRoute requiredRole="supplier">
                        <Navigate to="/supplier/dashboard" replace />
                    </ProtectedRoute>
                }
            />

            {/* Admin routes bọc bởi AdminLayout mới */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminHome />} />
                <Route path="reports" element={<Reports />} />
                <Route path="users" element={<Users />} />
                <Route path="owner-requests" element={<OwnerRequests />} />
                <Route path="car-approval" element={<AdminCarApproval />} />
                <Route path="payments" element={<PaymentsAdmin />} />
                <Route path="car-condition-reports" element={<CarConditionReportManagement />} />
            </Route>

            <Route path="/owner-registration" element={<OwnerRegistrationPage />} />
            <Route path="/owner-registration-success" element={<OwnerRegistrationSuccessPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default AppRoutes;