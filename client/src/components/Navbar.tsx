import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaCarSide } from 'react-icons/fa';
import { useAppSelector } from '@/hooks/redux';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f0b1f]/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-primary-700 dark:text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-purple text-white shadow-soft">
            <FaCarSide />
          </span>
          CabShare
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-sm font-medium text-slate-600 transition-colors hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-300">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Go to Dashboard
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </>
          )}
        </div>

        <button className="text-2xl text-slate-700 md:hidden dark:text-white" onClick={() => setOpen((o) => !o)}>
          {open ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/40 bg-white/95 px-4 py-4 md:hidden dark:border-white/10 dark:bg-[#0f0b1f]">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-3">
              {user ? (
                <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">Dashboard</button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary w-full text-center">Login</Link>
                  <Link to="/register" className="btn-primary w-full text-center">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
