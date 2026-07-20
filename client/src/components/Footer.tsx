import { Link } from 'react-router-dom';
import { FaCarSide, FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';

const Footer = () => (
  <footer className="border-t border-white/40 bg-white/60 py-10 dark:border-white/10 dark:bg-white/5">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-lg font-extrabold text-primary-700 dark:text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-purple text-white">
              <FaCarSide />
            </span>
            CabShare
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Ride together. Save together.</p>
          <div className="mt-4 flex gap-3 text-slate-400">
            <FaTwitter className="cursor-pointer hover:text-primary-600" />
            <FaInstagram className="cursor-pointer hover:text-primary-600" />
            <FaFacebook className="cursor-pointer hover:text-primary-600" />
          </div>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link to="/about" className="hover:text-primary-600">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-primary-600">Contact</Link></li>
            <li><Link to="/pricing" className="hover:text-primary-600">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white">Support</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link to="/faq" className="hover:text-primary-600">FAQ</Link></li>
            <li><Link to="/support" className="hover:text-primary-600">Help Center</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white">Legal</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li>Terms of Service</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>
      <div className="mt-8 border-t border-white/40 pt-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        © {new Date().getFullYear()} CabShare. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
