import { useState } from 'react';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineArrowUp, HiOutlineArrowDown } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import { ListSkeleton, StatSkeleton } from '@/components/LoadingSkeleton';
import { useGetMyWalletQuery, useGetMyTransactionsQuery, useCreateTopupOrderMutation, useVerifyTopupMutation } from '@/redux/api/miscApi';
import { RAZORPAY_KEY_ID } from '@/constants';

declare global {
  interface Window { Razorpay: any; }
}

const WalletPage = () => {
  const { data: walletData, isLoading: walletLoading } = useGetMyWalletQuery();
  const { data: txData, isLoading: txLoading } = useGetMyTransactionsQuery();
  const [createTopupOrder] = useCreateTopupOrderMutation();
  const [verifyTopup] = useVerifyTopupMutation();
  const [amount, setAmount] = useState(500);

  const handleTopup = async () => {
    try {
      const res = await createTopupOrder({ amount }).unwrap();
      const { order, keyId } = res.data;

      if (typeof window.Razorpay === 'undefined') {
        toast.error('Razorpay checkout script not loaded. Add the script tag from the README to index.html.');
        return;
      }

      const rzp = new window.Razorpay({
        key: keyId || RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'CabShare Wallet Top-up',
        handler: async (response: any) => {
          try {
            await verifyTopup({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              amount,
            }).unwrap();
            toast.success('Wallet topped up successfully!');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#7c3aed' },
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Could not start top-up. Add your Razorpay keys in server/.env.');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Wallet</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Manage your balance and view transaction history.</p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="gradient-card p-6 lg:col-span-1">
          {walletLoading ? <StatSkeleton /> : (
            <>
              <p className="text-sm text-white/80">Available Balance</p>
              <p className="mt-1 text-4xl font-extrabold text-white">₹{walletData?.data.wallet.balance || 0}</p>
              <div className="mt-6 flex items-center gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-24 rounded-xl border-0 bg-white/20 px-3 py-2 text-white placeholder-white/60 outline-none"
                />
                <button onClick={handleTopup} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-2 font-semibold text-primary-700">
                  <HiOutlinePlus /> Add Money
                </button>
              </div>
            </>
          )}
        </div>

        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="mb-4 font-bold text-slate-800 dark:text-white">Recent Transactions</h2>
          {txLoading ? (
            <ListSkeleton count={4} />
          ) : (
            <div className="space-y-3">
              {(txData?.data.transactions || []).map((tx) => (
                <div key={tx._id} className="flex items-center justify-between border-b border-white/40 pb-3 last:border-0 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.type === 'credit' ? <HiOutlineArrowDown /> : <HiOutlineArrowUp />}
                    </span>
                    <div>
                      <p className="text-sm font-medium capitalize text-slate-800 dark:text-white">{tx.category.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </span>
                </div>
              ))}
              {!txData?.data.transactions.length && <p className="text-center text-sm text-slate-500 dark:text-slate-400">No transactions yet.</p>}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WalletPage;
