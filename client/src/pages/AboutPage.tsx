import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AboutPage = () => (
  <div className="min-h-screen bg-gradient-mesh dark:bg-[#0f0b1f]">
    <Navbar />
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">About CabShare</h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
        CabShare is a smart ride-sharing platform connecting passengers and drivers heading the same way. Our mission
        is to make daily commutes more affordable, more social, and better for the planet — one shared ride at a time.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          ['Our Mission', 'Reduce traffic and emissions by making carpooling the easiest way to commute.'],
          ['Our Vision', 'A world where every empty car seat is put to good use.'],
          ['Our Values', 'Safety, transparency, and community come first in everything we build.'],
        ].map(([title, desc]) => (
          <div key={title} className="glass-card p-6">
            <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
          </div>
        ))}
      </div>
    </section>
    <Footer />
  </div>
);

export default AboutPage;
