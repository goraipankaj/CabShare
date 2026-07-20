import { type ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import DashboardTopbar from './DashboardTopbar';
import { HiOutlineLogout, HiX } from 'react-icons/hi';
import { FaCarSide } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout as logoutAction } from '@/redux/slices/authSlice';
import { useLogoutMutation } from '@/redux/api/authApi';
import toast from 'react-hot-toast';
import { ADMIN_LINKS, DRIVER_LINKS, PASSENGER_LINKS } from './Sidebar';

const getLinksForRole = (role?: string) => {
  if (role === 'admin') return ADMIN_LINKS;
  if (role === 'driver') return DRIVER_LINKS;
  return PASSENGER_LINKS;
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();
  const mobileLinks = getLinksForRole(user?.role);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // ignore network errors on logout, clear client state regardless
    }
    dispatch(logoutAction());
    toast.success('Logged out successfully');
    navigate('/login');
    setMobileOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-mesh dark:bg-[#0f0b1f]">
      <Sidebar />

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-64 flex-col bg-white dark:bg-[#0f0b1f]">
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-2 text-xl font-extrabold text-primary-700 dark:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-purple text-white">
                  <FaCarSide />
                </span>
                CabShare
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-2xl text-slate-500 dark:text-slate-300">
                <HiX />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
              {mobileLinks.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-purple text-white shadow-soft'
                        : 'text-slate-600 hover:bg-primary-50 dark:text-slate-300 dark:hover:bg-white/10'
                    }`
                  }
                >
                  <Icon className="text-lg" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="border-t border-slate-200 p-3 dark:border-white/10">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <HiOutlineLogout className="text-lg" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
