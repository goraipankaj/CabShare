import toast from 'react-hot-toast';
import { HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import StatusBadge from '@/components/StatusBadge';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useGetAllDriversQuery, useVerifyDriverMutation } from '@/redux/api/driverApi';

const AdminDriversPage = () => {
  const { data, isLoading } = useGetAllDriversQuery({ limit: 30 });
  const [verifyDriver] = useVerifyDriverMutation();

  const drivers = data?.data.drivers || [];

  const handleVerify = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await verifyDriver({ id, status }).unwrap();
      toast.success(`Driver ${status}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not update verification');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Driver Verification</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Review and approve driver applications.</p>

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : (
        <div className="space-y-4">
          {drivers.map((d: any) => (
            <div key={d._id} className="glass-card flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{d.user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{d.user?.email} · License: {d.licenseNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={d.verificationStatus} />
                {d.verificationStatus === 'pending' && (
                  <>
                    <button onClick={() => handleVerify(d._id, 'approved')} className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white hover:bg-emerald-600">
                      <HiOutlineCheck />
                    </button>
                    <button onClick={() => handleVerify(d._id, 'rejected')} className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white hover:bg-red-600">
                      <HiOutlineX />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {!drivers.length && <p className="glass-card p-10 text-center text-slate-500 dark:text-slate-400">No drivers found.</p>}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDriversPage;
