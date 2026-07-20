import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useGetAllTicketsQuery, useUpdateTicketStatusMutation } from '@/redux/api/supportApi';

const AdminSupportPage = () => {
  const { data, isLoading } = useGetAllTicketsQuery();
  const [updateStatus] = useUpdateTicketStatusMutation();

  const tickets = data?.data.tickets || [];

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Ticket marked as ${status}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not update ticket');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Support Tickets</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Respond to and resolve user issues.</p>

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : (
        <div className="space-y-4">
          {tickets.map((t: any) => (
            <div key={t._id} className="glass-card p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-white">{t.subject}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.user?.name} ({t.user?.email}) · {t.category?.replace('_', ' ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={t.status} />
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t._id, e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-white/5"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t.description}</p>
            </div>
          ))}
          {!tickets.length && <p className="glass-card p-10 text-center text-slate-500 dark:text-slate-400">No support tickets.</p>}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminSupportPage;
