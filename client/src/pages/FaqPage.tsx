import { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FAQS = [
  { q: 'How do I book a ride?', a: 'Search for a ride using your source, destination, and travel date, then select a ride and confirm your booking with payment.' },
  { q: 'How do I become a driver?', a: 'Register as a driver, upload your license and vehicle documents, and wait for admin verification before publishing rides.' },
  { q: 'What payment methods are supported?', a: 'UPI, credit/debit cards, wallet balance, and cash (where enabled by the driver).' },
  { q: 'Is my ride tracked for safety?', a: 'Yes, every ride has live GPS tracking and an in-app SOS button for emergencies.' },
  { q: 'Can I cancel a booking?', a: 'Yes, you can cancel from your bookings page. Refunds are issued to your wallet automatically for prepaid bookings.' },
  { q: 'How are drivers verified?', a: 'Drivers must upload a valid license, vehicle RC, insurance, and pollution certificate, all reviewed by our admin team.' },
];

const FaqPage = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-gradient-mesh dark:bg-[#0f0b1f]">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-center text-4xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h1>
        <div className="mt-10 space-y-3">
          {FAQS.map((faq, i) => (
            <div key={faq.q} className="glass-card overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-slate-800 dark:text-white"
              >
                {faq.q}
                <HiChevronDown className={`transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <p className="px-5 pb-4 text-sm text-slate-500 dark:text-slate-400">{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FaqPage;
