import { useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useGetAllUsersQuery, useUpdateUserStatusMutation } from '@/redux/api/miscApi';

const AdminUsersPage = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const { data, isLoading } = useGetAllUsersQuery({ search, role: roleFilter || undefined, limit: 20 });
  const [updateStatus] = useUpdateUserStatusMutation();

  const users = data?.data.users || [];

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`User status updated to ${status}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not update status');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Manage Users</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">View and manage all platform users.</p>

      <div className="mb-4 flex gap-3">
        <input placeholder="Search by name, email, phone" className="input-field" onChange={(e) => setSearch(e.target.value)} />
        <select className="input-field w-48" onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="passenger">Passenger</option>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {isLoading ? (
        <ListSkeleton count={6} />
      ) : (
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/40 text-left text-slate-500 dark:border-white/10 dark:text-slate-400">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u._id} className="border-b border-white/20 last:border-0 dark:border-white/5">
                  <td className="p-4 font-medium text-slate-800 dark:text-white">{u.name}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{u.email}</td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4 capitalize">{u.status}</td>
                  <td className="p-4">
                    <select
                      value={u.status}
                      onChange={(e) => handleStatusChange(u._id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-white/10 dark:bg-white/5"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!users.length && <p className="p-10 text-center text-slate-500 dark:text-slate-400">No users found.</p>}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminUsersPage;
