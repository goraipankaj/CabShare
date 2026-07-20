import { Link } from 'react-router-dom';
import { HiOutlineBell, HiOutlineMoon, HiOutlineSun, HiOutlineMenu } from 'react-icons/hi';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { toggleTheme } from '@/redux/slices/uiSlice';
import { useGetMyNotificationsQuery } from '@/redux/api/miscApi';

const DashboardTopbar = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const { user } = useAppSelector((s) => s.auth);
  const theme = useAppSelector((s) => s.ui.theme);
  const dispatch = useAppDispatch();
  const { data } = useGetMyNotificationsQuery({ limit: 1 });
  const unread = data?.data.unreadCount || 0;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/40 bg-white/70 px-4 py-3 backdrop-blur-xl sm:px-6 dark:border-white/10 dark:bg-[#0f0b1f]/80">
      <div className="flex items-center gap-3">
        <button className="text-2xl text-slate-600 lg:hidden dark:text-slate-200" onClick={onMenuClick}>
          <HiOutlineMenu />
        </button>
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back,</p>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">{user?.name?.split(' ')[0]}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-primary-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
        >
          {theme === 'light' ? <HiOutlineMoon /> : <HiOutlineSun />}
        </button>

        <Link to="/notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-primary-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10">
          <HiOutlineBell />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Link>

        <Link to="/profile" className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-purple font-bold text-white shadow-soft">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user?.name?.charAt(0).toUpperCase()
          )}
        </Link>
      </div>
    </header>
  );
};

export default DashboardTopbar;
