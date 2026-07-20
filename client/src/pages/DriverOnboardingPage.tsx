import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaCarSide } from 'react-icons/fa';
import { useRegisterDriverMutation } from '@/redux/api/driverApi';

interface FormValues {
  licenseNumber: string;
  licenseExpiry: string;
  aadhaarNumber?: string;
}

const DriverOnboardingPage = () => {
  const navigate = useNavigate();
  const [registerDriver, { isLoading }] = useRegisterDriverMutation();
  const { register, handleSubmit } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    try {
      await registerDriver(values).unwrap();
      toast.success('Driver profile created! Add a vehicle next.');
      navigate('/driver/vehicles');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not create driver profile');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-mesh px-4 dark:bg-[#0f0b1f]">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-purple text-xl text-white shadow-soft"><FaCarSide /></span>
          <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-white">Driver Onboarding</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add your license details to get started.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-4 p-8">
          <input {...register('licenseNumber', { required: true })} placeholder="Driving License Number" className="input-field" />
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">License Expiry Date</label>
            <input {...register('licenseExpiry', { required: true })} type="date" className="input-field" />
          </div>
          <input {...register('aadhaarNumber')} placeholder="Aadhaar Number (optional)" className="input-field" />
          <button type="submit" disabled={isLoading} className="btn-primary w-full">
            {isLoading ? 'Submitting...' : 'Continue'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">
          You'll be able to upload license/vehicle documents and publish rides once an admin verifies your profile.
        </p>
      </div>
    </div>
  );
};

export default DriverOnboardingPage;
