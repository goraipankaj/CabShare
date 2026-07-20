import { Link } from 'react-router-dom';
import { HiOutlineStar, HiOutlineUsers } from 'react-icons/hi';
import { FaCarSide } from 'react-icons/fa';
import type { Ride } from '@/types';

const RideCard = ({ ride }: { ride: Ride }) => {
  const departure = new Date(ride.departureDate);

  return (
    <Link
      to={`/rides/${ride._id}`}
      className="glass-card block p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-purple text-white">
            <FaCarSide />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-white">{ride.driver?.name}</p>
            <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <HiOutlineStar className="text-amber-400" /> {ride.driver?.ratingAverage?.toFixed(1) || 'New'} · {ride.vehicle?.brand} {ride.vehicle?.model}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold text-primary-700 dark:text-primary-300">₹{ride.pricePerSeat}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">per seat</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm">
        <div className="flex-1">
          <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{ride.source.address}</p>
        </div>
        <div className="h-px flex-1 border-t border-dashed border-primary-300" />
        <div className="flex-1 text-right">
          <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{ride.destination.address}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{departure.toDateString()} · {ride.departureTime}</span>
        <span className="flex items-center gap-1">
          <HiOutlineUsers /> {ride.availableSeats}/{ride.totalSeats} seats left
        </span>
      </div>
    </Link>
  );
};

export default RideCard;
