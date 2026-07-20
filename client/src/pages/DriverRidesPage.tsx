import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePlay, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useGetMyRidesQuery, useStartRideMutation, useCompleteRideMutation, useCancelRideMutation, useDeleteRideMutation } from '@/redux/api/rideApi';

const DriverRidesPage = () => {
  const { data, isLoading } = useGetMyRidesQuery();
  const [startRide] = useStartRideMutation();
  const [completeRide] = useCompleteRideMutation();
  const [cancelRide] = useCancelRideMutation();
  const [deleteRide] = useDeleteRideMutation();

  const rides = data?.data.rides || [];

  const run = async (fn: () => Promise<any>, successMsg: string) => {
    try {
      await fn();
      toast.success(successMsg);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Action failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">My Rides</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage all the rides you've published.</p>
        </div>
        <Link to="/driver/rides/new" className="btn-primary"><HiOutlinePlus /> Publish Ride</Link>
      </div>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div key={ride._id} className="glass-card p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{ride.source.address} → {ride.destination.address}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {new Date(ride.departureDate).toDateString()} · {ride.departureTime} · {ride.availableSeats}/{ride.totalSeats} seats · ₹{ride.pricePerSeat}/seat
                  </p>
                </div>
                <StatusBadge status={ride.status} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {ride.status === 'scheduled' && (
                  <>
                    <button onClick={() => run(() => startRide(ride._id).unwrap(), 'Ride started')} className="btn-secondary text-sm">
                      <HiOutlinePlay /> Start Ride
                    </button>
                    <button onClick={() => run(() => cancelRide({ id: ride._id }).unwrap(), 'Ride cancelled')} className="btn-secondary text-sm text-red-600">
                      <HiOutlineX /> Cancel
                    </button>
                    <button onClick={() => run(() => deleteRide(ride._id).unwrap(), 'Ride deleted')} className="btn-secondary text-sm text-red-600">
                      <HiOutlineTrash /> Delete
                    </button>
                  </>
                )}
                {ride.status === 'ongoing' && (
                  <button onClick={() => run(() => completeRide(ride._id).unwrap(), 'Ride completed')} className="btn-primary text-sm">
                    <HiOutlineCheck /> Complete Ride
                  </button>
                )}
              </div>
            </div>
          ))}
          {!rides.length && (
            <p className="glass-card p-10 text-center text-slate-500 dark:text-slate-400">
              You haven't published any rides yet. <Link to="/driver/rides/new" className="font-semibold text-primary-600 hover:underline">Publish one now →</Link>
            </p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DriverRidesPage;
