import { type ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import DashboardTopbar from './DashboardTopbar';
import { HiX } from 'react-icons/hi';
import { FaCarSide } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <nav className="flex-1 space-y-1 px-3">
              <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-primary-50 dark:text-slate-200">
                Dashboard
              </NavLink>
            </nav>
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
