import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCarSide, FaLeaf, FaShieldAlt, FaWallet } from 'react-icons/fa';
import { HiOutlineSearch, HiOutlineCreditCard, HiOutlineLocationMarker } from 'react-icons/hi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FEATURES = [
  { icon: <FaWallet />, title: 'Save Money', desc: 'Split fuel and toll costs with fellow riders heading the same way.' },
  { icon: <FaLeaf />, title: 'Save the Planet', desc: 'Fewer cars on the road means a smaller carbon footprint for everyone.' },
  { icon: <FaShieldAlt />, title: 'Safe & Secure', desc: 'Verified drivers, live tracking, and an SOS button on every ride.' },
  { icon: <HiOutlineSearch />, title: 'Smart & Convenient', desc: 'Easy booking and real-time updates, wherever you are.' },
];

const STEPS = [
  { icon: <HiOutlineSearch />, title: 'Search a Ride', desc: 'Enter your pickup, drop-off, and travel date.' },
  { icon: <FaCarSide />, title: 'Book Your Seat', desc: 'Choose a ride that matches your budget and schedule.' },
  { icon: <HiOutlineLocationMarker />, title: 'Track & Ride', desc: 'Track your driver live and get real-time trip updates.' },
  { icon: <HiOutlineCreditCard />, title: 'Pay & Rate', desc: 'Pay seamlessly and rate your ride experience.' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-mesh dark:bg-[#0f0b1f]">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300">
              🚗 Ride Together, Save Together
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              Share Rides.<br />
              <span className="bg-gradient-purple bg-clip-text text-transparent">Save Money.</span><br />
              Save Planet.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600 dark:text-slate-300">
              Find and book affordable, verified rides in seconds — or publish your own ride and earn on every trip.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary px-8 py-3 text-base">Get Started Free</Link>
              <Link to="/rides/search" className="btn-secondary px-8 py-3 text-base">Find a Ride</Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              {[['126', 'Total Trips'], ['2,540', 'Money Saved'], ['45.6 kg', 'CO2 Saved']].map(([value, label]) => (
                <div key={label}>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="gradient-card animate-float p-8">
              <div className="flex items-center justify-between text-white/90">
                <span className="text-sm font-semibold">Your Next Ride</span>
                <FaCarSide className="text-2xl" />
              </div>
              <div className="mt-6 space-y-3">
                <div className="rounded-xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-xs text-white/70">From</p>
                  <p className="font-semibold text-white">Connaught Place, Delhi</p>
                </div>
                <div className="rounded-xl bg-white/15 p-4 backdrop-blur">
                  <p className="text-xs text-white/70">To</p>
                  <p className="font-semibold text-white">Cyber City, Gurugram</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-3xl font-extrabold text-white">₹120</span>
                <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white">3 seats left</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Why CabShare?</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Everything you need for a smarter commute.</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-purple text-xl text-white">
                {f.icon}
              </div>
              <h3 className="mt-4 font-bold text-slate-800 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white/50 py-16 dark:bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">How It Works</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Booking a ride takes less than a minute.</p>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-purple text-2xl text-white shadow-soft">
                  {s.icon}
                </div>
                <span className="mt-3 inline-block text-xs font-bold text-primary-500">STEP {i + 1}</span>
                <h3 className="mt-1 font-bold text-slate-800 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="gradient-card p-10">
          <h2 className="text-3xl font-extrabold text-white">Ready to share your first ride?</h2>
          <p className="mt-2 text-white/80">Join thousands of riders and drivers already saving with CabShare.</p>
          <Link to="/register" className="mt-6 inline-block rounded-xl bg-white px-8 py-3 font-semibold text-primary-700 shadow-soft transition-transform hover:scale-105">
            Create Free Account
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
