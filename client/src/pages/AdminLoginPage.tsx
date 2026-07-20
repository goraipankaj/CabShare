import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { HiOutlineShieldCheck } from 'react-icons/hi';
import { useAdminLoginMutation } from '@/redux/api/authApi';
import { useAppDispatch } from '@/hooks/redux';
import { setCredentials } from '@/redux/slices/authSlice';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [adminLogin, { isLoading }] = useAdminLoginMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await adminLogin(data).unwrap();
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      toast.success('Welcome, Admin');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid admin credentials');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-purple-dark px-4">
      <div className="w-full max-w-md">
        <div className="glass-card p-8">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-purple text-2xl text-white shadow-glow">
              <HiOutlineShieldCheck />
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">Admin Portal</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Restricted access - authorized personnel only</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <input {...register('email')} type="email" placeholder="admin@cabshare.app" className="input-field" />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            <input {...register('password')} type="password" placeholder="Password" className="input-field" />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Verifying...' : 'Login as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
