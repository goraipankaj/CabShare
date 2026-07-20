import { Link } from 'react-router-dom';
import { HiOutlineClipboardList, HiOutlineCreditCard, HiOutlineStar, HiOutlineSearch } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import RideCard from '@/components/RideCard';
import { StatSkeleton, ListSkeleton } from '@/components/LoadingSkeleton';
import { useGetMyBookingsQuery } from '@/redux/api/bookingApi';
import { useGetMyWalletQuery } from '@/redux/api/miscApi';
import { useSearchRidesQuery } from '@/redux/api/rideApi';
import { useAppSelector } from '@/hooks/redux';

const PassengerDashboard = () => {
  const { user } = useAppSelector((s) => s.auth);
  const { data: bookingsData, isLoading: bookingsLoading } = useGetMyBookingsQuery({ limit: 5 });
  const { data: walletData, isLoading: walletLoading } = useGetMyWalletQuery();
  const { data: ridesData, isLoading: ridesLoading } = useSearchRidesQuery({ limit: 4 });

  const bookings = bookingsData?.data.bookings || [];
  const completedCount = bookings.filter((b) => b.status === 'completed').length;

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Passenger Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Here's what's happening with your rides.</p>
        </div>
        <Link to="/rides/search" className="btn-primary">
          <HiOutlineSearch /> Find a Ride
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {bookingsLoading || walletLoading ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Total Bookings" value={bookingsData?.data.pagination.total || 0} icon={<HiOutlineClipboardList />} variant="solid" />
            <StatCard label="Completed Trips" value={completedCount} icon={<HiOutlineStar />} />
            <StatCard label="Wallet Balance" value={`₹${walletData?.data.wallet.balance || 0}`} icon={<HiOutlineCreditCard />} />
            <StatCard label="Your Rating" value={user?.ratingAverage?.toFixed(1) || 'New'} icon={<HiOutlineStar />} />
          </>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Rides Near You</h2>
            <Link to="/rides/search" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
          </div>
          {ridesLoading ? (
            <ListSkeleton count={2} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {(ridesData?.data.rides || []).map((ride) => <RideCard key={ride._id} ride={ride} />)}
              {!ridesData?.data.rides.length && (
                <p className="glass-card col-span-2 p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                  No rides available right now. Check back soon!
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Bookings</h2>
            <Link to="/bookings" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
          </div>
          {bookingsLoading ? (
            <ListSkeleton count={3} />
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 4).map((b) => (
                <Link key={b._id} to={`/bookings/${b._id}`} className="glass-card block p-4">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{b.ride.source.address} → {b.ride.destination.address}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 capitalize">{b.status} · ₹{b.totalFare}</p>
                </Link>
              ))}
              {!bookings.length && (
                <p className="glass-card p-6 text-center text-sm text-slate-500 dark:text-slate-400">No bookings yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PassengerDashboard;
