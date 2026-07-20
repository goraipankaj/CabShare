import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiOutlinePlus } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useAddVehicleMutation, useGetMyVehiclesQuery } from '@/redux/api/driverApi';
import { VEHICLE_TYPES } from '@/constants';

interface FormValues {
  type: string;
  brand: string;
  model: string;
  color: string;
  registrationNumber: string;
  seatingCapacity: number;
  year?: number;
}

const VehiclesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useGetMyVehiclesQuery();
  const [addVehicle, { isLoading: adding }] = useAddVehicleMutation();
  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues: { seatingCapacity: 4 } });

  const vehicles = data?.data.vehicles || [];

  const onSubmit = async (values: FormValues) => {
    try {
      await addVehicle({ ...values, seatingCapacity: Number(values.seatingCapacity), year: values.year ? Number(values.year) : undefined }).unwrap();
      toast.success('Vehicle added - pending verification');
      reset();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not add vehicle');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">My Vehicles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your registered vehicles.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary"><HiOutlinePlus /> Add Vehicle</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <select {...register('type', { required: true })} className="input-field">
            {VEHICLE_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
          <input {...register('brand', { required: true })} placeholder="Brand (e.g. Maruti Suzuki)" className="input-field" />
          <input {...register('model', { required: true })} placeholder="Model" className="input-field" />
          <input {...register('color', { required: true })} placeholder="Color" className="input-field" />
          <input {...register('registrationNumber', { required: true })} placeholder="Registration Number" className="input-field" />
          <input {...register('seatingCapacity', { required: true })} type="number" placeholder="Seating Capacity" className="input-field" />
          <input {...register('year')} type="number" placeholder="Year (optional)" className="input-field" />
          <button type="submit" disabled={adding} className="btn-primary sm:col-span-2">{adding ? 'Adding...' : 'Add Vehicle'}</button>
        </form>
      )}

      {isLoading ? (
        <ListSkeleton count={2} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {vehicles.map((v) => (
            <div key={v._id} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800 dark:text-white">{v.brand} {v.model}</p>
                <StatusBadge status={v.verificationStatus} />
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{v.color} · {v.registrationNumber} · {v.seatingCapacity} seats</p>
            </div>
          ))}
          {!vehicles.length && !showForm && (
            <p className="glass-card col-span-2 p-10 text-center text-slate-500 dark:text-slate-400">No vehicles added yet.</p>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default VehiclesPage;
