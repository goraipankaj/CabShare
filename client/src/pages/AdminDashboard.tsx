import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend,
} from 'chart.js';
import {
  HiOutlineUserGroup, HiOutlineTruck, HiOutlineCash, HiOutlineClipboardList, HiOutlineQuestionMarkCircle,
} from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { StatSkeleton } from '@/components/LoadingSkeleton';
import { useGetDashboardStatsQuery, useGetRevenueAnalyticsQuery, useGetRideAnalyticsQuery } from '@/redux/api/miscApi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#a855f7',
  ongoing: '#7c3aed',
  completed: '#10b981',
  cancelled: '#ef4444',
};

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: revenue } = useGetRevenueAnalyticsQuery({ range: 30 });
  const { data: rideAnalytics } = useGetRideAnalyticsQuery({ range: 30 });

  const revenueChartData = {
    labels: revenue?.data.revenue.map((r: any) => r._id) || [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: revenue?.data.revenue.map((r: any) => r.revenue) || [],
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const statusData = rideAnalytics?.data.statusBreakdown || [];
  const doughnutData = {
    labels: statusData.map((s: any) => s._id),
    datasets: [
      {
        data: statusData.map((s: any) => s.count),
        backgroundColor: statusData.map((s: any) => STATUS_COLORS[s._id] || '#94a3b8'),
        borderWidth: 0,
      },
    ],
  };

  return (
    <DashboardLayout>
      <h1 className="mb-1 text-2xl font-extrabold text-slate-800 dark:text-white">Admin Dashboard</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Platform-wide overview and analytics.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Users" value={stats?.data.totalUsers || 0} icon={<HiOutlineUserGroup />} variant="solid" />
            <StatCard label="Total Drivers" value={stats?.data.totalDrivers || 0} icon={<HiOutlineTruck />} />
            <StatCard label="Total Revenue" value={`₹${stats?.data.totalRevenue || 0}`} icon={<HiOutlineCash />} />
            <StatCard label="Total Bookings" value={stats?.data.totalBookings || 0} icon={<HiOutlineClipboardList />} />
            <StatCard label="Open Tickets" value={stats?.data.openTickets || 0} icon={<HiOutlineQuestionMarkCircle />} />
          </>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="mb-4 font-bold text-slate-800 dark:text-white">Revenue (Last 30 Days)</h2>
          <Line data={revenueChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="glass-card p-6">
          <h2 className="mb-4 font-bold text-slate-800 dark:text-white">Ride Status Breakdown</h2>
          {statusData.length ? <Doughnut data={doughnutData} /> : <p className="text-sm text-slate-500 dark:text-slate-400">No ride data yet.</p>}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Pending Driver Verifications</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">{stats?.data.pendingDriverVerifications || 0}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Ongoing Rides</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">{stats?.data.ongoingRides || 0}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">Completed Rides</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-800 dark:text-white">{stats?.data.completedRides || 0}</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
