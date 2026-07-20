import { useAppSelector } from '@/hooks/redux';
import PassengerDashboard from './PassengerDashboard';
import DriverDashboard from './DriverDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardPage = () => {
  const { user } = useAppSelector((s) => s.auth);

  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'driver') return <DriverDashboard />;
  return <PassengerDashboard />;
};

export default DashboardPage;
