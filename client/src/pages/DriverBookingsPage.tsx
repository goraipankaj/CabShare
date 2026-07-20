import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useGetDriverBookingsQuery, useAcceptBookingMutation, useRejectBookingMutation } from '@/redux/api/bookingApi';

const DriverBookingsPage = () => {
  const { data, isLoading } = useGetDriverBookingsQuery();
  const [acceptBooking] = useAcceptBookingMutation();
  const [rejectBooking] = useRejectBookingMutation();

  const bookings = data?.data.bookings || [];

  const handleAccept = async (id: string) => {
    try {
      await acceptBooking(id).unwrap();
      toast.success('Booking accepted');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not accept booking');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectBooking({ id }).unwrap();
      toast.success('Booking rejected');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not reject booking');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Manage Bookings</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Review and respond to passenger booking requests.</p>

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b._id} className="glass-card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{b.passenger.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {b.ride.source.address} → {b.ride.destination.address} · {b.seatsBooked} seat(s) · ₹{b.totalFare}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={b.status} />
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => handleAccept(b._id)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white hover:bg-emerald-600">
                      <HiOutlineCheck />
                    </button>
                    <button onClick={() => handleReject(b._id)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white hover:bg-red-600">
                      <HiOutlineX />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {!bookings.length && <p className="glass-card p-10 text-center text-slate-500 dark:text-slate-400">No booking requests yet.</p>}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DriverBookingsPage;
