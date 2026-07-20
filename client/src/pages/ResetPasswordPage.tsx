import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FaCarSide } from 'react-icons/fa';
import { useResetPasswordMutation } from '@/redux/api/authApi';

const schema = z.object({ password: z.string().min(8, 'Password must be at least 8 characters') });
type FormData = z.infer<typeof schema>;

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const email = params.get('email') || '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await resetPassword({ token, email, password: data.password }).unwrap();
      toast.success('Password reset successfully - please log in');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Reset link is invalid or expired');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-mesh px-4 dark:bg-[#0f0b1f]">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-primary-700 dark:text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-purple text-white shadow-soft"><FaCarSide /></span>
            CabShare
          </Link>
        </div>
        <div className="glass-card p-8">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Set a new password</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <input {...register('password')} type="password" placeholder="New Password" className="input-field" />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
