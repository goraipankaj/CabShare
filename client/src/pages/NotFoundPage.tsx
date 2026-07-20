import { Link } from 'react-router-dom';
import { FaCarSide } from 'react-icons/fa';

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-mesh px-4 text-center dark:bg-[#0f0b1f]">
    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-purple text-4xl text-white shadow-glow animate-float">
      <FaCarSide />
    </div>
    <h1 className="mt-6 text-6xl font-extrabold text-slate-900 dark:text-white">404</h1>
    <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">Looks like this route took a wrong turn.</p>
    <Link to="/" className="btn-primary mt-6">Back to Home</Link>
  </div>
);

export default NotFoundPage;
