import { BOOKING_STATUS_COLORS } from '@/constants';
import clsx from 'clsx';

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize',
      BOOKING_STATUS_COLORS[status] || 'bg-slate-100 text-slate-700'
    )}
  >
    {status.replace('_', ' ')}
  </span>
);

export default StatusBadge;
