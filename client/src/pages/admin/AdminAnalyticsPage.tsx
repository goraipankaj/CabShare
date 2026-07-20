import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from 'chart.js';
import { HiOutlineDownload } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import { useGetBookingAnalyticsQuery, useGetRevenueAnalyticsQuery } from '@/redux/api/miscApi';
import { API_BASE_URL } from '@/constants';
import { useAppSelector } from '@/hooks/redux';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AdminAnalyticsPage = () => {
  const [range, setRange] = useState(30);
  const { data: bookingAnalytics, isLoading } = useGetBookingAnalyticsQuery({ range });
  const { data: revenue } = useGetRevenueAnalyticsQuery({ range });
  const { accessToken } = useAppSelector((s) => s.auth);

  const bookingChartData = {
    labels: bookingAnalytics?.data.bookingsByDay.map((b: any) => b._id) || [],
    datasets: [
      {
        label: 'Bookings',
        data: bookingAnalytics?.data.bookingsByDay.map((b: any) => b.bookings) || [],
        backgroundColor: '#a855f7',
        borderRadius: 8,
      },
    ],
  };

  const handleExport = async (type: string) => {
    const res = await fetch(`${API_BASE_URL}/admin/analytics/export?type=${type}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Analytics & Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Platform performance over time.</p>
        </div>
        <select value={range} onChange={(e) => setRange(Number(e.target.value))} className="input-field w-40">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      <div className="glass-card p-6">
        <h2 className="mb-4 font-bold text-slate-800 dark:text-white">Bookings Over Time</h2>
        {!isLoading && <Bar data={bookingChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="glass-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue ({range} days)</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">
            ₹{(revenue?.data.revenue || []).reduce((sum: number, r: any) => sum + r.revenue, 0)}
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Export Reports</p>
          <div className="flex flex-wrap gap-2">
            {['bookings', 'rides', 'users'].map((type) => (
              <button key={type} onClick={() => handleExport(type)} className="btn-secondary text-sm">
                <HiOutlineDownload /> {type}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalyticsPage;
