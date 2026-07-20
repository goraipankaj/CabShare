import { useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineShare, HiOutlineExclamationCircle, HiOutlineX } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { useGetBookingByIdQuery, useCancelBookingMutation, useShareTripMutation } from '@/redux/api/bookingApi';
import { useAppSelector } from '@/hooks/redux';

const BookingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((s) => s.auth);
  const { data, isLoading } = useGetBookingByIdQuery(id!);
  const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation();
  const [shareTrip] = useShareTripMutation();
  const [shareForm, setShareForm] = useState({ name: '', phone: '' });
  const [showShare, setShowShare] = useState(false);

  const booking = data?.data.booking;

  const handleCancel = async () => {
    if (!booking) return;
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking({ id: booking._id }).unwrap();
      toast.success('Booking cancelled');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not cancel booking');
    }
  };

  const handleShare = async () => {
    if (!booking || !shareForm.name || !shareForm.phone) return;
    try {
      await shareTrip({ id: booking._id, ...shareForm }).unwrap();
      toast.success(`Trip shared with ${shareForm.name}`);
      setShowShare(false);
      setShareForm({ name: '', phone: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not share trip');
    }
  };

  const handleSOS = () => {
    toast.success('Emergency alert sent to admin and your emergency contacts');
  };

  if (isLoading) return <DashboardLayout><CardSkeleton /></DashboardLayout>;
  if (!booking) return <DashboardLayout><p className="text-center text-slate-500">Booking not found.</p></DashboardLayout>;

  const canCancel = ['pending', 'accepted', 'confirmed'].includes(booking.status);
  const isPassenger = user?._id === booking.passenger._id;

  return (
    <DashboardLayout>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">Booking Details</h1>
            <StatusBadge status={booking.status} />
          </div>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Route</span><span className="font-semibold text-slate-800 dark:text-white">{booking.ride.source.address} → {booking.ride.destination.address}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Departure</span><span className="font-semibold text-slate-800 dark:text-white">{new Date(booking.ride.departureDate).toDateString()} at {booking.ride.departureTime}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Seats Booked</span><span className="font-semibold text-slate-800 dark:text-white">{booking.seatsBooked}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Total Fare</span><span className="font-semibold text-slate-800 dark:text-white">₹{booking.totalFare}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Payment</span><span className="font-semibold capitalize text-slate-800 dark:text-white">{booking.paymentStatus} ({booking.paymentMethod})</span></div>
            <div className="flex justify-between"><span className="text-slate-500">{isPassenger ? 'Driver' : 'Passenger'}</span><span className="font-semibold text-slate-800 dark:text-white">{isPassenger ? booking.driver.name : booking.passenger.name}</span></div>
          </div>

          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling} className="btn-secondary mt-6 text-red-600">
              <HiOutlineX /> Cancel Booking
            </button>
          )}
        </div>

        <div className="space-y-4">
          {isPassenger && (
            <div className="glass-card p-5">
              <h2 className="font-bold text-slate-800 dark:text-white">Safety</h2>
              <button onClick={handleSOS} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 font-semibold text-white shadow-soft transition-transform hover:scale-[1.02]">
                <HiOutlineExclamationCircle /> Emergency SOS
              </button>
              <button onClick={() => setShowShare((s) => !s)} className="btn-secondary mt-3 w-full">
                <HiOutlineShare /> Share Trip
              </button>
              {showShare && (
                <div className="mt-3 space-y-2">
                  <input placeholder="Contact Name" className="input-field" value={shareForm.name} onChange={(e) => setShareForm({ ...shareForm, name: e.target.value })} />
                  <input placeholder="Phone Number" className="input-field" value={shareForm.phone} onChange={(e) => setShareForm({ ...shareForm, phone: e.target.value })} />
                  <button onClick={handleShare} className="btn-primary w-full">Send</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingDetailsPage;
