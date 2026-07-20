import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useGetMyBookingsQuery } from '@/redux/api/bookingApi';

const MyBookingsPage = () => {
  const { data, isLoading } = useGetMyBookingsQuery();
  const bookings = data?.data.bookings || [];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">My Bookings</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Track and manage all your ride bookings.</p>

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <Link key={b._id} to={`/bookings/${b._id}`} className="glass-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{b.ride.source.address} → {b.ride.destination.address}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {new Date(b.ride.departureDate).toDateString()} · {b.seatsBooked} seat(s) · ₹{b.totalFare}
                </p>
              </div>
              <StatusBadge status={b.status} />
            </Link>
          ))}
          {!bookings.length && (
            <p className="glass-card p-10 text-center text-slate-500 dark:text-slate-400">
              No bookings yet. <Link to="/rides/search" className="font-semibold text-primary-600 hover:underline">Find a ride →</Link>
            </p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyBookingsPage;
