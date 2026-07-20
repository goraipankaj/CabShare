import { NavLink, useNavigate } from 'react-router-dom';
import {
  HiOutlineViewGrid, HiOutlineSearch, HiOutlineClipboardList, HiOutlineCreditCard,
  HiOutlineBell, HiOutlineStar, HiOutlineQuestionMarkCircle, HiOutlineCog, HiOutlineLogout,
  HiOutlineUserGroup, HiOutlineTruck, HiOutlineChartBar, HiOutlineTicket,
} from 'react-icons/hi';
import { FaCarSide } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logout as logoutAction } from '@/redux/slices/authSlice';
import { useLogoutMutation } from '@/redux/api/authApi';
import toast from 'react-hot-toast';

const PASSENGER_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid, end: true },
  { to: '/rides/search', label: 'Search Rides', icon: HiOutlineSearch },
  { to: '/bookings', label: 'My Bookings', icon: HiOutlineClipboardList },
  { to: '/wallet', label: 'Wallet', icon: HiOutlineCreditCard },
  { to: '/notifications', label: 'Notifications', icon: HiOutlineBell },
  { to: '/support', label: 'Support', icon: HiOutlineQuestionMarkCircle },
  { to: '/profile', label: 'Profile', icon: HiOutlineCog },
];

const DRIVER_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid, end: true },
  { to: '/driver/rides', label: 'My Rides', icon: FaCarSide },
  { to: '/driver/bookings', label: 'Bookings', icon: HiOutlineClipboardList },
  { to: '/driver/vehicles', label: 'Vehicles', icon: HiOutlineTruck },
  { to: '/wallet', label: 'Earnings & Wallet', icon: HiOutlineCreditCard },
  { to: '/notifications', label: 'Notifications', icon: HiOutlineBell },
  { to: '/support', label: 'Support', icon: HiOutlineQuestionMarkCircle },
  { to: '/profile', label: 'Profile', icon: HiOutlineCog },
];

const ADMIN_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid, end: true },
  { to: '/admin/users', label: 'Users', icon: HiOutlineUserGroup },
  { to: '/admin/drivers', label: 'Drivers', icon: HiOutlineTruck },
  { to: '/admin/rides', label: 'Rides', icon: FaCarSide },
  { to: '/admin/analytics', label: 'Analytics', icon: HiOutlineChartBar },
  { to: '/admin/promo-codes', label: 'Promo Codes', icon: HiOutlineTicket },
  { to: '/admin/support', label: 'Support Tickets', icon: HiOutlineQuestionMarkCircle },
  { to: '/admin/settings', label: 'Settings', icon: HiOutlineCog },
];

const Sidebar = () => {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  const links = user?.role === 'admin' ? ADMIN_LINKS : user?.role === 'driver' ? DRIVER_LINKS : PASSENGER_LINKS;

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // ignore network errors on logout, clear client state regardless
    }
    dispatch(logoutAction());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="hidden h-screen w-64 flex-col border-r border-white/40 bg-white/70 backdrop-blur-xl lg:flex dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center gap-2 px-6 py-5 text-xl font-extrabold text-primary-700 dark:text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-purple text-white shadow-soft">
          <FaCarSide />
        </span>
        CabShare
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
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

      <div className="border-t border-white/40 p-3 dark:border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          <HiOutlineLogout className="text-lg" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
