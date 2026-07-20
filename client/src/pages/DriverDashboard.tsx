import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineCash, HiOutlineTruck, HiOutlineStar, HiOutlinePlus } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import StatCard from '@/components/StatCard';
import { StatSkeleton, ListSkeleton } from '@/components/LoadingSkeleton';
import StatusBadge from '@/components/StatusBadge';
import { useGetEarningsQuery, useGetMyDriverProfileQuery, useToggleAvailabilityMutation } from '@/redux/api/driverApi';
import { useGetMyRidesQuery } from '@/redux/api/rideApi';

const DriverDashboard = () => {
  const { data: driverData, isLoading: driverLoading } = useGetMyDriverProfileQuery();
  const { data: earningsData, isLoading: earningsLoading } = useGetEarningsQuery();
  const { data: ridesData, isLoading: ridesLoading } = useGetMyRidesQuery({ limit: 5 });
  const [toggleAvailability, { isLoading: toggling }] = useToggleAvailabilityMutation();

  const driver = driverData?.data.driver;
  const isVerified = driver?.verificationStatus === 'approved';

  const handleToggle = async () => {
    if (!isVerified) {
      toast.error('Your driver profile must be verified before going online');
      return;
    }
    try {
      const res = await toggleAvailability({}).unwrap();
      toast.success(res.data.isAvailable ? "You're now online" : "You're now offline");
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not update availability');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Driver Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isVerified ? 'Manage your rides and track your earnings.' : 'Your profile is pending verification.'}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleToggle} disabled={toggling} className={driver?.isAvailable ? 'btn-primary' : 'btn-secondary'}>
            {driver?.isAvailable ? '🟢 Online' : '⚪ Offline'}
          </button>
          <Link to="/driver/rides/new" className="btn-primary"><HiOutlinePlus /> Publish Ride</Link>
        </div>
      </div>

      {!driverLoading && !isVerified && (
        <div className="glass-card mb-6 border-l-4 border-amber-400 p-4 text-sm text-amber-700 dark:text-amber-300">
          Your driver profile or vehicle documents are still pending admin verification. You'll be able to publish rides once approved.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {earningsLoading ? (
          <>
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Total Earnings" value={`₹${earningsData?.data.totalEarnings || 0}`} icon={<HiOutlineCash />} variant="solid" />
            <StatCard label="Completed Trips" value={earningsData?.data.completedRides || 0} icon={<HiOutlineTruck />} />
            <StatCard label="Distance Covered" value={`${earningsData?.data.totalDistanceKm || 0} km`} icon={<HiOutlineTruck />} />
            <StatCard label="Your Rating" value={earningsData?.data.ratingAverage?.toFixed(1) || 'New'} icon={<HiOutlineStar />} />
          </>
        )}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Your Rides</h2>
          <Link to="/driver/rides" className="text-sm font-semibold text-primary-600 hover:underline">View all</Link>
        </div>
        {ridesLoading ? (
          <ListSkeleton count={3} />
        ) : (
          <div className="space-y-3">
            {(ridesData?.data.rides || []).map((ride) => (
              <div key={ride._id} className="glass-card flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{ride.source.address} → {ride.destination.address}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(ride.departureDate).toDateString()} · {ride.departureTime} · ₹{ride.pricePerSeat}/seat</p>
                </div>
                <StatusBadge status={ride.status} />
              </div>
            ))}
            {!ridesData?.data.rides.length && (
              <p className="glass-card p-6 text-center text-sm text-slate-500 dark:text-slate-400">You haven't published any rides yet.</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DriverDashboard;
