import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import RideCard from '@/components/RideCard';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useSearchRidesQuery, type RideSearchParams } from '@/redux/api/rideApi';
import { GENDER_PREFERENCES, VEHICLE_TYPES } from '@/constants';
import { HiOutlineFilter } from 'react-icons/hi';

const RideSearchPage = () => {
  const [filters, setFilters] = useState<RideSearchParams>({});
  const [showFilters, setShowFilters] = useState(false);
  const { data, isLoading, isFetching } = useSearchRidesQuery(filters);

  const update = (patch: Partial<RideSearchParams>) => setFilters((f) => ({ ...f, ...patch }));

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Search Rides</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Find a ride that matches your route, schedule, and budget.</p>

      <div className="glass-card mb-6 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="date" className="input-field" onChange={(e) => update({ date: e.target.value })} />
          <button onClick={() => setShowFilters((s) => !s)} className="btn-secondary">
            <HiOutlineFilter /> More Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-white/40 pt-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10">
            <select className="input-field" onChange={(e) => update({ vehicleType: e.target.value || undefined })}>
              <option value="">Any Vehicle Type</option>
              {VEHICLE_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
            <select className="input-field" onChange={(e) => update({ gender: e.target.value || undefined })}>
              {GENDER_PREFERENCES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            <input type="number" placeholder="Max Price (₹)" className="input-field" onChange={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })} />
            <input type="number" placeholder="Min Driver Rating" min={0} max={5} step={0.5} className="input-field" onChange={(e) => update({ minRating: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
        )}
      </div>

      {isLoading || isFetching ? (
        <ListSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.data.rides || []).map((ride) => <RideCard key={ride._id} ride={ride} />)}
          {!data?.data.rides.length && (
            <p className="glass-card col-span-full p-10 text-center text-slate-500 dark:text-slate-400">
              No rides found matching your filters. Try adjusting your search.
            </p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default RideSearchPage;
