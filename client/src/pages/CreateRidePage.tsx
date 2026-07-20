import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { useCreateRideMutation } from '@/redux/api/rideApi';
import { useGetMyVehiclesQuery } from '@/redux/api/driverApi';
import { GENDER_PREFERENCES } from '@/constants';

interface FormValues {
  vehicle: string;
  sourceAddress: string;
  sourceLat: number;
  sourceLng: number;
  destAddress: string;
  destLat: number;
  destLng: number;
  departureDate: string;
  departureTime: string;
  totalSeats: number;
  pricePerSeat: number;
  genderPreference: string;
  instantBooking: boolean;
}

const CreateRidePage = () => {
  const navigate = useNavigate();
  const { data: vehiclesData, isLoading: vehiclesLoading } = useGetMyVehiclesQuery();
  const [createRide, { isLoading }] = useCreateRideMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { totalSeats: 3, pricePerSeat: 100, genderPreference: 'any', instantBooking: true },
  });

  const vehicles = (vehiclesData?.data.vehicles || []).filter((v) => v.verificationStatus === 'approved');

  const onSubmit = async (values: FormValues) => {
    try {
      await createRide({
        vehicle: values.vehicle,
        source: { address: values.sourceAddress, lat: Number(values.sourceLat), lng: Number(values.sourceLng) },
        destination: { address: values.destAddress, lat: Number(values.destLat), lng: Number(values.destLng) },
        departureDate: values.departureDate,
        departureTime: values.departureTime,
        totalSeats: Number(values.totalSeats),
        pricePerSeat: Number(values.pricePerSeat),
        genderPreference: values.genderPreference,
        instantBooking: values.instantBooking,
      }).unwrap();
      toast.success('Ride published successfully!');
      navigate('/driver/rides');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not publish ride');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Publish a New Ride</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Fill in your route and schedule details.</p>

      {!vehiclesLoading && !vehicles.length && (
        <div className="glass-card mb-6 border-l-4 border-amber-400 p-4 text-sm text-amber-700 dark:text-amber-300">
          You need at least one verified vehicle before you can publish a ride.{' '}
          <a href="/driver/vehicles" className="font-semibold underline">Add a vehicle →</a>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card max-w-2xl space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Vehicle</label>
          <select {...register('vehicle', { required: true })} className="input-field">
            <option value="">Select a verified vehicle</option>
            {vehicles.map((v) => <option key={v._id} value={v._id}>{v.brand} {v.model} ({v.registrationNumber})</option>)}
          </select>
          {errors.vehicle && <p className="mt-1 text-xs text-red-500">Vehicle is required</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <input {...register('sourceAddress', { required: true })} placeholder="Source Address" className="input-field sm:col-span-3" />
          <input {...register('sourceLat', { required: true })} type="number" step="any" placeholder="Source Latitude" className="input-field" />
          <input {...register('sourceLng', { required: true })} type="number" step="any" placeholder="Source Longitude" className="input-field" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <input {...register('destAddress', { required: true })} placeholder="Destination Address" className="input-field sm:col-span-3" />
          <input {...register('destLat', { required: true })} type="number" step="any" placeholder="Destination Latitude" className="input-field" />
          <input {...register('destLng', { required: true })} type="number" step="any" placeholder="Destination Longitude" className="input-field" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input {...register('departureDate', { required: true })} type="date" className="input-field" />
          <input {...register('departureTime', { required: true })} type="time" className="input-field" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Total Seats</label>
            <input {...register('totalSeats', { required: true, min: 1, max: 8 })} type="number" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Price per Seat (₹)</label>
            <input {...register('pricePerSeat', { required: true, min: 0 })} type="number" className="input-field" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Gender Preference</label>
          <select {...register('genderPreference')} className="input-field">
            {GENDER_PREFERENCES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" {...register('instantBooking')} className="rounded border-slate-300 text-primary-600" />
          Enable instant booking (skip manual approval)
        </label>

        <button type="submit" disabled={isLoading || !vehicles.length} className="btn-primary w-full">
          {isLoading ? 'Publishing...' : 'Publish Ride'}
        </button>
      </form>
    </DashboardLayout>
  );
};

export default CreateRidePage;
