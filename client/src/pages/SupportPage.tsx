import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useCreateTicketMutation, useGetMyTicketsQuery } from '@/redux/api/supportApi';

interface FormValues {
  subject: string;
  category: string;
  description: string;
}

const CATEGORIES = ['booking_issue', 'payment_issue', 'driver_complaint', 'passenger_complaint', 'technical', 'other'];

const SupportPage = () => {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useGetMyTicketsQuery();
  const [createTicket, { isLoading: creating }] = useCreateTicketMutation();
  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues: { category: 'other' } });

  const tickets = data?.data.tickets || [];

  const onSubmit = async (values: FormValues) => {
    try {
      await createTicket(values).unwrap();
      toast.success('Support ticket created - our team will respond shortly');
      reset();
      setShowForm(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not create ticket');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Support</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Need help? Raise a ticket and we'll get back to you.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">New Ticket</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="glass-card mb-6 space-y-4 p-6">
          <input {...register('subject', { required: true })} placeholder="Subject" className="input-field" />
          <select {...register('category')} className="input-field">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
          <textarea {...register('description', { required: true })} placeholder="Describe your issue..." rows={4} className="input-field" />
          <button type="submit" disabled={creating} className="btn-primary w-full">{creating ? 'Submitting...' : 'Submit Ticket'}</button>
        </form>
      )}

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t._id} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-800 dark:text-white">{t.subject}</p>
                <StatusBadge status={t.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 capitalize">{t.category.replace('_', ' ')}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t.description}</p>
            </div>
          ))}
          {!tickets.length && <p className="glass-card p-10 text-center text-slate-500 dark:text-slate-400">No support tickets yet.</p>}
        </div>
      )}
    </DashboardLayout>
  );
};

export default SupportPage;
