import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useGetAllRidesAdminQuery } from '@/redux/api/rideApi';

const AdminRidesPage = () => {
  const { data, isLoading } = useGetAllRidesAdminQuery({ limit: 30 });
  const rides = data?.data.rides || [];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">All Rides</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Platform-wide view of every published ride.</p>

      {isLoading ? (
        <ListSkeleton count={6} />
      ) : (
        <div className="space-y-3">
          {rides.map((ride) => (
            <div key={ride._id} className="glass-card flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{ride.source.address} → {ride.destination.address}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Driver: {ride.driver?.name} · {new Date(ride.departureDate).toDateString()} · ₹{ride.pricePerSeat}/seat
                </p>
              </div>
              <StatusBadge status={ride.status} />
            </div>
          ))}
          {!rides.length && <p className="glass-card p-10 text-center text-slate-500 dark:text-slate-400">No rides published yet.</p>}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminRidesPage;
