import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FaCarSide, FaUser } from 'react-icons/fa';
import { useRegisterMutation } from '@/redux/api/authApi';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/redux/slices/authSlice';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/\d/, 'Must contain at least one number'),
});
type FormData = z.infer<typeof schema>;

const RegisterPage = () => {
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await registerUser({ ...data, role }).unwrap();
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      toast.success('Account created! Please verify your email and phone.');
      navigate(role === 'driver' ? '/driver/onboarding' : '/dashboard');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-mesh px-4 py-10 dark:bg-[#0f0b1f]">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-primary-700 dark:text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-purple text-white shadow-soft"><FaCarSide /></span>
            CabShare
          </Link>
        </div>

        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Join CabShare in seconds.</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('passenger')}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${role === 'passenger' ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10' : 'border-slate-200 text-slate-500 dark:border-white/10'}`}
            >
              <FaUser /> Passenger
            </button>
            <button
              type="button"
              onClick={() => setRole('driver')}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${role === 'driver' ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10' : 'border-slate-200 text-slate-500 dark:border-white/10'}`}
            >
              <FaCarSide /> Driver
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div>
              <input {...register('name')} placeholder="Full Name" className="input-field" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <input {...register('email')} type="email" placeholder="Email Address" className="input-field" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <input {...register('phone')} placeholder="Phone Number (+919999999999)" className="input-field" />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
            </div>
            <div>
              <input {...register('password')} type="password" placeholder="Password" className="input-field" />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Creating account...' : `Sign up as ${role === 'driver' ? 'Driver' : 'Passenger'}`}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
