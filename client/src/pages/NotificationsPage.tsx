import { HiOutlineCheck, HiOutlineBell } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import { ListSkeleton } from '@/components/LoadingSkeleton';
import { useGetMyNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from '@/redux/api/miscApi';
import clsx from 'clsx';

const NotificationsPage = () => {
  const { data, isLoading } = useGetMyNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = data?.data.notifications || [];

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{data?.data.unreadCount || 0} unread</p>
        </div>
        <button onClick={() => markAllRead()} className="btn-secondary text-sm"><HiOutlineCheck /> Mark all as read</button>
      </div>

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => !n.isRead && markRead(n._id)}
              className={clsx('glass-card flex w-full items-start gap-3 p-4 text-left', !n.isRead && 'border-l-4 border-primary-500')}
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300">
                <HiOutlineBell />
              </span>
              <div>
                <p className="font-semibold text-slate-800 dark:text-white">{n.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </button>
          ))}
          {!notifications.length && <p className="glass-card p-10 text-center text-slate-500 dark:text-slate-400">You're all caught up!</p>}
        </div>
      )}
    </DashboardLayout>
  );
};

export default NotificationsPage;
