import { Link } from 'react-router-dom';
import { HiCheck } from 'react-icons/hi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TIERS = [
  {
    name: 'Passenger',
    price: 'Free',
    desc: 'Book rides at driver-set fares. No hidden fees.',
    features: ['Search & book rides', 'Wallet & UPI payments', 'Live ride tracking', 'Emergency SOS'],
  },
  {
    name: 'Driver',
    price: '15% commission',
    desc: 'Publish rides and earn on every completed trip.',
    features: ['Publish unlimited rides', 'Instant or manual booking approval', 'Earnings dashboard', 'Priority support'],
    highlighted: true,
  },
  {
    name: 'Corporate Pool',
    price: 'Custom',
    desc: 'Dedicated pooling for teams and campuses.',
    features: ['Company-branded rides', 'Bulk employee onboarding', 'Usage analytics', 'Dedicated account manager'],
  },
];

const PricingPage = () => (
  <div className="min-h-screen bg-gradient-mesh dark:bg-[#0f0b1f]">
    <Navbar />
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Simple, Transparent Pricing</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400">No subscription fees. Pay only for the rides you take or complete.</p>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <div key={tier.name} className={tier.highlighted ? 'gradient-card p-8' : 'glass-card p-8'}>
            <h3 className={tier.highlighted ? 'text-lg font-bold text-white' : 'text-lg font-bold text-slate-800 dark:text-white'}>{tier.name}</h3>
            <p className={tier.highlighted ? 'mt-2 text-3xl font-extrabold text-white' : 'mt-2 text-3xl font-extrabold text-slate-900 dark:text-white'}>{tier.price}</p>
            <p className={tier.highlighted ? 'mt-2 text-sm text-white/80' : 'mt-2 text-sm text-slate-500 dark:text-slate-400'}>{tier.desc}</p>
            <ul className="mt-6 space-y-2">
              {tier.features.map((f) => (
                <li key={f} className={tier.highlighted ? 'flex items-center gap-2 text-sm text-white/90' : 'flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300'}>
                  <HiCheck className={tier.highlighted ? 'text-white' : 'text-primary-600'} /> {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className={tier.highlighted ? 'mt-6 block rounded-xl bg-white py-2.5 text-center font-semibold text-primary-700' : 'btn-primary mt-6 block w-full text-center'}
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </section>
    <Footer />
  </div>
);

export default PricingPage;
