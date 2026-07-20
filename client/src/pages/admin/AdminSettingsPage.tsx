import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { API_BASE_URL } from '@/constants';
import { useAppSelector } from '@/hooks/redux';

interface SettingsForm {
  commissionPercentage: number;
  minFarePerKm: number;
  maxSeatsPerRide: number;
  cancellationWindowMinutes: number;
  supportEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
}

const AdminSettingsPage = () => {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm<SettingsForm>();

  useEffect(() => {
    fetch(`${API_BASE_URL}/admin/settings`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then((r) => r.json())
      .then((json) => {
        reset(json.data.settings);
        setLoading(false);
      });
  }, [accessToken, reset]);

  const onSubmit = async (values: SettingsForm) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      toast.success('Settings updated');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <DashboardLayout><p className="text-slate-500">Loading settings...</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Platform Settings</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Configure platform-wide rules and commission.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card max-w-2xl space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Commission (%)</label>
            <input {...register('commissionPercentage')} type="number" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Min Fare / km (₹)</label>
            <input {...register('minFarePerKm')} type="number" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Max Seats / Ride</label>
            <input {...register('maxSeatsPerRide')} type="number" className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cancellation Window (min)</label>
            <input {...register('cancellationWindowMinutes')} type="number" className="input-field" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Support Email</label>
          <input {...register('supportEmail')} type="email" className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Support Phone</label>
          <input {...register('supportPhone')} className="input-field" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input type="checkbox" {...register('maintenanceMode')} className="rounded border-slate-300 text-primary-600" />
          Maintenance Mode
        </label>
        <button type="submit" className="btn-primary w-full">Save Settings</button>
      </form>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
