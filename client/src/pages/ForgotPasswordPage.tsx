import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FaCarSide } from 'react-icons/fa';
import { useForgotPasswordMutation } from '@/redux/api/authApi';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

const ForgotPasswordPage = () => {
  const [forgotPassword, { isLoading, isSuccess }] = useForgotPasswordMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await forgotPassword(data).unwrap();
      toast.success('If that account exists, a reset link has been sent');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Something went wrong');
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter your email and we'll send you a reset link.</p>

          {isSuccess ? (
            <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              Check your inbox for a password reset link.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-field" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            <Link to="/login" className="font-semibold text-primary-600 hover:underline">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
