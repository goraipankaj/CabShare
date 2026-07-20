import { Routes, Route } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import ProtectedRoute from '@/routes/ProtectedRoute';

import LandingPage from '@/pages/LandingPage';
import AboutPage from '@/pages/AboutPage';
import PricingPage from '@/pages/PricingPage';
import FaqPage from '@/pages/FaqPage';
import ContactPage from '@/pages/ContactPage';

import LoginPage from '@/pages/LoginPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import DriverOnboardingPage from '@/pages/DriverOnboardingPage';

import DashboardPage from '@/pages/DashboardPage';
import RideSearchPage from '@/pages/RideSearchPage';
import RideDetailsPage from '@/pages/RideDetailsPage';
import MyBookingsPage from '@/pages/MyBookingsPage';
import BookingDetailsPage from '@/pages/BookingDetailsPage';
import WalletPage from '@/pages/WalletPage';
import NotificationsPage from '@/pages/NotificationsPage';
import SupportPage from '@/pages/SupportPage';
import ProfilePage from '@/pages/ProfilePage';

import DriverRidesPage from '@/pages/DriverRidesPage';
import CreateRidePage from '@/pages/CreateRidePage';
import DriverBookingsPage from '@/pages/DriverBookingsPage';
import VehiclesPage from '@/pages/VehiclesPage';

import AdminUsersPage from '@/pages/admin/AdminUsersPage';
import AdminDriversPage from '@/pages/admin/AdminDriversPage';
import AdminRidesPage from '@/pages/admin/AdminRidesPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminPromoCodesPage from '@/pages/admin/AdminPromoCodesPage';
import AdminSupportPage from '@/pages/admin/AdminSupportPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';

import NotFoundPage from '@/pages/NotFoundPage';

const App = () => {
  const isBootstrapping = useAuthBootstrap();
  const theme = useAppSelector((s) => s.ui.theme);

  if (isBootstrapping) {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <div className="flex min-h-screen items-center justify-center bg-gradient-mesh dark:bg-[#0f0b1f]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Routes>
        {/* Public marketing pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/driver/onboarding" element={<ProtectedRoute allowedRoles={['driver']}><DriverOnboardingPage /></ProtectedRoute>} />

        {/* Shared authenticated routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Passenger */}
        <Route path="/rides/search" element={<ProtectedRoute allowedRoles={['passenger']}><RideSearchPage /></ProtectedRoute>} />
        <Route path="/rides/:id" element={<ProtectedRoute><RideDetailsPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute allowedRoles={['passenger']}><MyBookingsPage /></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetailsPage /></ProtectedRoute>} />

        {/* Driver */}
        <Route path="/driver/rides" element={<ProtectedRoute allowedRoles={['driver']}><DriverRidesPage /></ProtectedRoute>} />
        <Route path="/driver/rides/new" element={<ProtectedRoute allowedRoles={['driver']}><CreateRidePage /></ProtectedRoute>} />
        <Route path="/driver/bookings" element={<ProtectedRoute allowedRoles={['driver']}><DriverBookingsPage /></ProtectedRoute>} />
        <Route path="/driver/vehicles" element={<ProtectedRoute allowedRoles={['driver']}><VehiclesPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/drivers" element={<ProtectedRoute allowedRoles={['admin']}><AdminDriversPage /></ProtectedRoute>} />
        <Route path="/admin/rides" element={<ProtectedRoute allowedRoles={['admin']}><AdminRidesPage /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalyticsPage /></ProtectedRoute>} />
        <Route path="/admin/promo-codes" element={<ProtectedRoute allowedRoles={['admin']}><AdminPromoCodesPage /></ProtectedRoute>} />
        <Route path="/admin/support" element={<ProtectedRoute allowedRoles={['admin']}><AdminSupportPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettingsPage /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

export default App;
