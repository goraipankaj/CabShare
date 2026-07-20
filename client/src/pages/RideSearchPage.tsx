import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { VEHICLE_TYPES } from '@/constants';
import { HiOutlineFilter, HiOutlineSearch, HiOutlineLocationMarker, HiOutlineStar } from 'react-icons/hi';
import { FaCarSide, FaMotorcycle } from 'react-icons/fa';
import { useGetMyWalletQuery } from '@/redux/api/miscApi';
import { useCreateMockBookingMutation } from '@/redux/api/bookingApi';
import toast from 'react-hot-toast';

const CITIES = [
  'Phagwara',
  'Jalandhar',
  'Kapurthala',
  'Lovely Professional University',
  'Amritsar',
  'Law gate',
  'Ludhiyana',
  'Beas',
  'Hardaspur',
];

const INDIAN_NAMES = [
  'Aarav Sharma', 'Aditya Verma', 'Amit Patel', 'Arjun Singh',
  'Ishaan Gupta', 'Kabir Malhotra', 'Neha Iyer', 'Pooja Nair',
  'Pranav Joshi', 'Rahul Mehta', 'Rohan Das', 'Sanjay Kumar',
  'Siddharth Rao', 'Sneha Reddy', 'Vikram Choudhury', 'Ananya Sen',
  'Meera Deshmukh', 'Rajesh Patil', 'Priya Sharma', 'Kiran Patel',
  'Deepak Gupta', 'Sunita Rao', 'Gaurav Verma', 'Jyoti Nair'
];

interface MockCab {
  id: string;
  type: 'SUV' | 'Sedan' | 'auto' | 'bike';
  driverName: string;
  fare: number;
  rating: number;
}

const RideSearchPage = () => {
  const navigate = useNavigate();
  const [sourceCity, setSourceCity] = useState('');
  const [destCity, setDestCity] = useState('');
  const [date, setDate] = useState('');
  const [bookingCabId, setBookingCabId] = useState<string | null>(null);
  const [modalConfig, setModalConfig] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }>({ show: false, type: 'success', title: '', message: '' });
  
  const [isLoadingCabs, setIsLoadingCabs] = useState(false);
  const [searchedCabs, setSearchedCabs] = useState<MockCab[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | undefined>(undefined);
  const [minRatingFilter, setMinRatingFilter] = useState<number | undefined>(undefined);

  const { data: walletData, refetch: refetchWallet } = useGetMyWalletQuery();
  const [createMockBooking, { isLoading: isBooking }] = useCreateMockBookingMutation();

  const walletBalance = walletData?.data.wallet.balance || 0;

  const today = new Date().toISOString().split('T')[0];

  const handleSearch = () => {
    if (!sourceCity || !destCity || !date) {
      setValidationError('Please select source, destination and date');
      return;
    }

    setValidationError(null);
    setIsLoadingCabs(true);
    setSearchedCabs([]);
    setHasSearched(false);

    setTimeout(() => {
      setHasSearched(true);
      const shuffledNames = [...INDIAN_NAMES].sort(() => 0.5 - Math.random());
      
      const baseFares: Record<string, number> = {
        'SUV': 350,
        'Sedan': 250,
        'auto': 100,
        'bike': 50
      };

      const multiplier = Math.max(1, sourceCity.length + destCity.length) * 5;
      
      const suvPrice = baseFares['SUV'] + multiplier + Math.floor(Math.random() * 50);
      const sedanPrice = baseFares['Sedan'] + multiplier + Math.floor(Math.random() * 30);
      const autoPrice = baseFares['auto'] + Math.floor(multiplier / 2) + Math.floor(Math.random() * 15);
      const bikePrice = baseFares['bike'] + Math.floor(multiplier / 4) + Math.floor(Math.random() * 10);

      const mockCabsList: MockCab[] = [
        {
          id: 'suv-' + Math.random(),
          type: 'SUV',
          driverName: shuffledNames[0],
          fare: suvPrice,
          rating: Number((Math.random() * 1.2 + 3.8).toFixed(1)),
        },
        {
          id: 'sedan-' + Math.random(),
          type: 'Sedan',
          driverName: shuffledNames[1],
          fare: sedanPrice,
          rating: Number((Math.random() * 1.2 + 3.8).toFixed(1)),
        },
        {
          id: 'auto-' + Math.random(),
          type: 'auto',
          driverName: shuffledNames[2],
          fare: autoPrice,
          rating: Number((Math.random() * 1.2 + 3.8).toFixed(1)),
        },
        {
          id: 'bike-' + Math.random(),
          type: 'bike',
          driverName: shuffledNames[3],
          fare: bikePrice,
          rating: Number((Math.random() * 1.2 + 3.8).toFixed(1)),
        },
      ];

      setSearchedCabs(mockCabsList);
      setIsLoadingCabs(false);
    }, 2000);
  };

  const handleBookCab = async (cab: MockCab) => {
    if (walletBalance < cab.fare) {
      setModalConfig({
        show: true,
        type: 'error',
        title: 'Insufficient Balance',
        message: `Your wallet balance is ₹${walletBalance}, but the fare is ₹${cab.fare}. Please add money to your wallet to book this ride.`,
        actionLabel: 'Add Money',
        onAction: () => navigate('/wallet'),
      });
      return;
    }

    setBookingCabId(cab.id);
    try {
      await createMockBooking({
        type: cab.type,
        driverName: cab.driverName,
        fare: cab.fare,
        rating: cab.rating,
        sourceCity,
        destCity,
        date,
      }).unwrap();

      refetchWallet();
      setModalConfig({
        show: true,
        type: 'success',
        title: 'Ride Booked!',
        message: 'Ride booked, thankyou.',
        actionLabel: 'View Booking History',
        onAction: () => navigate('/bookings'),
      });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to book ride.');
    } finally {
      setBookingCabId(null);
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bike':
        return <FaMotorcycle className="text-2xl" />;
      default:
        return <FaCarSide className="text-2xl" />;
    }
  };

  const filteredCabs = searchedCabs.filter((cab) => {
    if (vehicleTypeFilter && cab.type.toLowerCase() !== vehicleTypeFilter.toLowerCase()) return false;
    if (maxPriceFilter !== undefined && cab.fare > maxPriceFilter) return false;
    if (minRatingFilter !== undefined && cab.rating < minRatingFilter) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Search Rides</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Find a ride that matches your route, schedule, and budget.</p>

      {validationError && (
        <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-200/50 dark:border-red-900/50">
          {validationError}
        </div>
      )}

      <div className="glass-card mb-6 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg pointer-events-none" />
            <select
              className="input-field pl-10"
              value={sourceCity}
              onChange={(e) => {
                const val = e.target.value;
                setSourceCity(val);
                if (destCity === val) {
                  setDestCity('');
                }
              }}
            >
              <option value="">Select Source City</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <HiOutlineLocationMarker className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg pointer-events-none" />
            <select
              className="input-field pl-10"
              value={destCity}
              onChange={(e) => setDestCity(e.target.value)}
            >
              <option value="">Select Destination City</option>
              {CITIES.filter((city) => city !== sourceCity).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <input
            type="date"
            className="input-field"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <div className="flex gap-2">
            <button onClick={handleSearch} className="btn-primary flex-1">
              <HiOutlineSearch className="text-lg" /> Search
            </button>
            <button onClick={() => setShowFilters((s) => !s)} className="btn-secondary">
              <HiOutlineFilter /> Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-white/40 pt-4 sm:grid-cols-2 lg:grid-cols-3 dark:border-white/10">
            <select
              className="input-field"
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
            >
              <option value="">Any Vehicle Type</option>
              {VEHICLE_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
            <input
              type="number"
              placeholder="Max Price (₹)"
              className="input-field"
              value={maxPriceFilter !== undefined ? maxPriceFilter : ''}
              onChange={(e) => setMaxPriceFilter(e.target.value ? Number(e.target.value) : undefined)}
            />
            <input
              type="number"
              placeholder="Min Driver Rating"
              min={0}
              max={5}
              step={0.5}
              className="input-field"
              value={minRatingFilter !== undefined ? minRatingFilter : ''}
              onChange={(e) => setMinRatingFilter(e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        )}
      </div>

      {isLoadingCabs ? (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary-400/20" />
            <div className="absolute inset-2 animate-pulse rounded-full bg-primary-400/40" />
            <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-purple text-white shadow-lg">
              <HiOutlineSearch className="animate-spin text-2xl" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Searching for Cabs</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Finding the best fares and drivers for route:
          </p>
          <div className="mt-3 rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary-700 dark:bg-white/5 dark:text-primary-300">
            {sourceCity} → {destCity} · {new Date(date).toDateString()}
          </div>
        </div>
      ) : hasSearched ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {filteredCabs.map((cab) => (
            <div
              key={cab.id}
              className="glass-card flex flex-col justify-between p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-purple text-white shadow-md">
                      {getVehicleIcon(cab.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                        {cab.type}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {cab.driverName}
                        </span>
                        <span className="text-slate-300 dark:text-slate-600">|</span>
                        <div className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                          <HiOutlineStar className="fill-amber-500 text-amber-500" />
                          <span>{cab.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary-700 dark:text-primary-300">
                      ₹{cab.fare}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">estimated fare</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3 rounded-xl bg-slate-50/50 p-3 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-400">
                  <div className="flex-1 truncate">
                    <span className="font-semibold text-slate-500 block">FROM</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{sourceCity}</span>
                  </div>
                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                  <div className="flex-1 truncate">
                    <span className="font-semibold text-slate-500 block">TO</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{destCity}</span>
                  </div>
                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-500 block">DATE</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                      {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleBookCab(cab)}
                  disabled={bookingCabId !== null}
                  className="btn-primary w-full py-3 text-center justify-center font-bold text-sm tracking-wide disabled:opacity-50"
                >
                  {bookingCabId === cab.id ? 'Booking...' : 'Book Ride'}
                </button>
              </div>
            </div>
          ))}
          {!filteredCabs.length && (
            <p className="glass-card col-span-full p-10 text-center text-slate-500 dark:text-slate-400">
              No cabs found matching your filters. Try adjusting your search filters.
            </p>
          )}
        </div>
      ) : (
        <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-white/5 dark:text-primary-400">
            <HiOutlineSearch className="text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Find Your Ride</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Select your source city, destination city, and date above to browse available cabs and check fares.
          </p>
        </div>
      )}
      {/* Custom Modal Popup */}
      {modalConfig.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md scale-up-center rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-100 dark:border-white/10 mx-4">
            <div className="flex flex-col items-center text-center">
              {modalConfig.type === 'success' ? (
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
              
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {modalConfig.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {modalConfig.message}
              </p>
              
              <div className="mt-6 flex w-full gap-3">
                {modalConfig.actionLabel && modalConfig.onAction && (
                  <button
                    onClick={() => {
                      setModalConfig(prev => ({ ...prev, show: false }));
                      modalConfig.onAction?.();
                    }}
                    className="btn-primary flex-1"
                  >
                    {modalConfig.actionLabel}
                  </button>
                )}
                <button
                  onClick={() => setModalConfig(prev => ({ ...prev, show: false }))}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default RideSearchPage;

