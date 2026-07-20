import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineStar, HiOutlineUsers, HiOutlineClock, HiOutlineLocationMarker } from 'react-icons/hi';
import { FaCarSide } from 'react-icons/fa';
import DashboardLayout from '@/components/DashboardLayout';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { useGetRideByIdQuery } from '@/redux/api/rideApi';
import { useCreateBookingMutation } from '@/redux/api/bookingApi';
import { useAppSelector } from '@/hooks/redux';

const RideDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const { data, isLoading } = useGetRideByIdQuery(id!);
  const [createBooking, { isLoading: booking }] = useCreateBookingMutation();
  const [seats, setSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'wallet' | 'upi'>('cash');

  const ride = data?.data.ride;

  const handleBook = async () => {
    if (!ride) return;
    try {
      const res = await createBooking({ ride: ride._id, seatsBooked: seats, paymentMethod }).unwrap();
      toast.success('Booking created successfully!');
      navigate(`/bookings/${res.data.booking._id}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not create booking');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <CardSkeleton />
      </DashboardLayout>
    );
  }

  if (!ride) {
    return (
      <DashboardLayout>
        <p className="text-center text-slate-500">Ride not found.</p>
      </DashboardLayout>
    );
  }

  const isOwnRide = user?._id === ride.driver._id;
  const totalFare = seats * ride.pricePerSeat;

  return (
    <DashboardLayout>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-purple text-2xl text-white shadow-soft">
              <FaCarSide />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">{ride.driver.name}</h1>
              <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                <HiOutlineStar className="text-amber-400" /> {ride.driver.ratingAverage?.toFixed(1) || 'New'} ({ride.driver.ratingCount} ratings)
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <HiOutlineLocationMarker className="mt-1 text-primary-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pickup</p>
                <p className="font-semibold text-slate-800 dark:text-white">{ride.source.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HiOutlineLocationMarker className="mt-1 text-accent-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Drop-off</p>
                <p className="font-semibold text-slate-800 dark:text-white">{ride.destination.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HiOutlineClock className="mt-1 text-primary-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Departure</p>
                <p className="font-semibold text-slate-800 dark:text-white">{new Date(ride.departureDate).toDateString()} at {ride.departureTime}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <HiOutlineUsers className="mt-1 text-primary-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Vehicle</p>
                <p className="font-semibold text-slate-800 dark:text-white">
                  {ride.vehicle.brand} {ride.vehicle.model} · {ride.vehicle.color} · {ride.vehicle.registrationNumber}
                </p>
              </div>
            </div>
          </div>

          {ride.route?.distanceKm && (
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/40 pt-4 dark:border-white/10">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Distance</p>
                <p className="font-semibold text-slate-800 dark:text-white">{ride.route.distanceKm.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Duration</p>
                <p className="font-semibold text-slate-800 dark:text-white">{Math.round(ride.route.durationMin || 0)} mins</p>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card h-fit p-6">
          <h2 className="font-bold text-slate-800 dark:text-white">Book This Ride</h2>
          <p className="mt-1 text-3xl font-extrabold text-primary-700 dark:text-primary-300">₹{ride.pricePerSeat}<span className="text-sm font-normal text-slate-500"> /seat</span></p>

          {isOwnRide ? (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              This is your own ride - you can't book it.
            </p>
          ) : ride.availableSeats === 0 ? (
            <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">This ride is fully booked.</p>
          ) : ride.status !== 'scheduled' ? (
            <p className="mt-4 rounded-xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-white/10 dark:text-slate-300">
              This ride is no longer accepting bookings.
            </p>
          ) : (
            <>
              <div className="mt-5">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Seats</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSeats((s) => Math.max(1, s - 1))} className="btn-secondary h-10 w-10 p-0">-</button>
                  <span className="w-8 text-center font-bold text-slate-800 dark:text-white">{seats}</span>
                  <button onClick={() => setSeats((s) => Math.min(ride.availableSeats, s + 1))} className="btn-secondary h-10 w-10 p-0">+</button>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
                <select className="input-field" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                  <option value="cash">Cash</option>
                  <option value="wallet">Wallet</option>
                  <option value="upi">UPI / Card (Razorpay)</option>
                </select>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/40 pt-4 dark:border-white/10">
                <span className="text-sm text-slate-500 dark:text-slate-400">Total Fare</span>
                <span className="text-xl font-extrabold text-slate-800 dark:text-white">₹{totalFare}</span>
              </div>

              <button onClick={handleBook} disabled={booking} className="btn-primary mt-4 w-full">
                {booking ? 'Booking...' : ride.instantBooking ? 'Confirm Booking' : 'Send Booking Request'}
              </button>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RideDetailsPage;
