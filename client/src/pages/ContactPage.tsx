import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! Our support team will get back to you shortly.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-mesh dark:bg-[#0f0b1f]">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-center text-4xl font-extrabold text-slate-900 dark:text-white">Get in Touch</h1>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {[
              [<HiOutlineMail key="m" />, 'Email', 'support@cabshare.app'],
              [<HiOutlinePhone key="p" />, 'Phone', '+91-9999999999'],
              [<HiOutlineLocationMarker key="l" />, 'Address', 'CabShare HQ, New Delhi, India'],
            ].map(([icon, label, value]) => (
              <div key={label as string} className="glass-card flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-purple text-xl text-white">{icon}</div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="font-semibold text-slate-800 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="glass-card space-y-4 p-6">
            <input required placeholder="Your Name" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" placeholder="Your Email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <textarea required placeholder="Your Message" rows={5} className="input-field" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button type="submit" className="btn-primary w-full">Send Message</button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ContactPage;
