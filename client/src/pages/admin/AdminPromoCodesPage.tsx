import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useGetAllPromoCodesQuery, useCreatePromoCodeMutation, useDeletePromoCodeMutation } from '@/redux/api/promoCodeApi';

interface FormValues {
  code: string;
  description: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minFare: number;
  validUntil: string;
}

const AdminPromoCodesPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useGetAllPromoCodesQuery();
  const [createPromo, { isLoading: creating }] = useCreatePromoCodeMutation();
  const [deletePromo] = useDeletePromoCodeMutation();
  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues: { discountType: 'flat', minFare: 0 } });

  const promos = data?.data.promos || [];

  const onSubmit = async (values: FormValues) => {
    try {
      await createPromo({ ...values, discountValue: Number(values.discountValue), minFare: Number(values.minFare) }).unwrap();
      toast.success('Promo code created');
      reset();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not create promo code');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Promo Codes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create and manage discount codes.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary"><HiOutlinePlus /> New Code</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card mb-6 grid gap-4 p-6 sm:grid-cols-2">
          <input {...register('code', { required: true })} placeholder="CODE (e.g. WELCOME50)" className="input-field uppercase" />
          <input {...register('description')} placeholder="Description" className="input-field" />
          <select {...register('discountType')} className="input-field">
            <option value="flat">Flat (₹)</option>
            <option value="percentage">Percentage (%)</option>
          </select>
          <input {...register('discountValue', { required: true })} type="number" placeholder="Discount Value" className="input-field" />
          <input {...register('minFare')} type="number" placeholder="Minimum Fare (₹)" className="input-field" />
          <input {...register('validUntil', { required: true })} type="date" className="input-field" />
          <button type="submit" disabled={creating} className="btn-primary sm:col-span-2">{creating ? 'Creating...' : 'Create Promo Code'}</button>
        </form>
      )}

      {isLoading ? (
        <ListSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {promos.map((p) => (
            <div key={p._id} className="glass-card flex items-center justify-between p-5">
              <div>
                <p className="font-mono font-bold text-primary-700 dark:text-primary-300">{p.code}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {p.discountType === 'flat' ? `₹${p.discountValue} off` : `${p.discountValue}% off`} · Used {p.usedCount} times
                </p>
              </div>
              <button onClick={() => deletePromo(p._id)} className="text-red-400 hover:text-red-600"><HiOutlineTrash /></button>
            </div>
          ))}
          {!promos.length && <p className="glass-card col-span-2 p-10 text-center text-slate-500 dark:text-slate-400">No promo codes yet.</p>}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminPromoCodesPage;
