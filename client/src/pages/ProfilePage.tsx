import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import DashboardLayout from '@/components/DashboardLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { updateUser } from '@/redux/slices/authSlice';
import { API_BASE_URL } from '@/constants';

interface ProfileForm {
  name: string;
  gender: string;
}

interface AddressForm {
  label: string;
  address: string;
  lat: number;
  lng: number;
}

interface ContactForm {
  name: string;
  phone: string;
  relation: string;
}

const ProfilePage = () => {
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const { register, handleSubmit } = useForm<ProfileForm>({ defaultValues: { name: user?.name, gender: user?.gender } });
  const { register: registerAddr, handleSubmit: handleAddrSubmit, reset: resetAddr } = useForm<AddressForm>();
  const { register: registerContact, handleSubmit: handleContactSubmit, reset: resetContact } = useForm<ContactForm>();
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  const authedFetch = async (path: string, options: RequestInit = {}) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) },
    });
    if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
    return res.json();
  };

  const onProfileSubmit = async (values: ProfileForm) => {
    try {
      const json = await authedFetch('/users/me', { method: 'PATCH', body: JSON.stringify(values) });
      dispatch(updateUser(json.data.user));
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err.message || 'Could not update profile');
    }
  };

  const onAddressSubmit = async (values: AddressForm) => {
    try {
      const json = await authedFetch('/users/me/addresses', {
        method: 'POST',
        body: JSON.stringify({ ...values, lat: Number(values.lat), lng: Number(values.lng) }),
      });
      dispatch(updateUser({ savedAddresses: json.data.savedAddresses }));
      toast.success('Address saved');
      resetAddr();
      setShowAddrForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Could not save address');
    }
  };

  const removeAddress = async (addressId: string) => {
    try {
      const json = await authedFetch(`/users/me/addresses/${addressId}`, { method: 'DELETE' });
      dispatch(updateUser({ savedAddresses: json.data.savedAddresses }));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const onContactSubmit = async (values: ContactForm) => {
    try {
      const json = await authedFetch('/users/me/emergency-contacts', { method: 'POST', body: JSON.stringify(values) });
      dispatch(updateUser({ emergencyContacts: json.data.emergencyContacts }));
      toast.success('Emergency contact added');
      resetContact();
      setShowContactForm(false);
    } catch (err: any) {
      toast.error(err.message || 'Could not add contact');
    }
  };

  const removeContact = async (contactId: string) => {
    try {
      const json = await authedFetch(`/users/me/emergency-contacts/${contactId}`, { method: 'DELETE' });
      dispatch(updateUser({ emergencyContacts: json.data.emergencyContacts }));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">Profile & Settings</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Manage your personal info, addresses, and safety contacts.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="font-bold text-slate-800 dark:text-white">Basic Info</h2>
          <form onSubmit={handleSubmit(onProfileSubmit)} className="mt-4 space-y-4">
            <input {...register('name')} placeholder="Full Name" className="input-field" />
            <input value={user?.email} disabled className="input-field opacity-60" />
            <input value={user?.phone} disabled className="input-field opacity-60" />
            <select {...register('gender')} className="input-field">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            <button type="submit" className="btn-primary w-full">Save Changes</button>
          </form>
          <p className="mt-4 text-xs text-slate-400">Referral code: <span className="font-mono font-semibold">{user?.referralCode}</span></p>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-white">Saved Addresses</h2>
              <button onClick={() => setShowAddrForm((s) => !s)} className="text-primary-600"><HiOutlinePlus /></button>
            </div>
            {showAddrForm && (
              <form onSubmit={handleAddrSubmit(onAddressSubmit)} className="mt-3 space-y-2">
                <input {...registerAddr('label')} placeholder="Label (e.g. Home)" className="input-field" />
                <input {...registerAddr('address', { required: true })} placeholder="Full Address" className="input-field" />
                <div className="flex gap-2">
                  <input {...registerAddr('lat', { required: true })} type="number" step="any" placeholder="Lat" className="input-field" />
                  <input {...registerAddr('lng', { required: true })} type="number" step="any" placeholder="Lng" className="input-field" />
                </div>
                <button type="submit" className="btn-primary w-full">Save Address</button>
              </form>
            )}
            <div className="mt-3 space-y-2">
              {user?.savedAddresses.map((a) => (
                <div key={a._id} className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 text-sm dark:bg-white/5">
                  <span className="text-slate-700 dark:text-slate-200">{a.label ? `${a.label}: ` : ''}{a.address}</span>
                  <button onClick={() => a._id && removeAddress(a._id)} className="text-red-400 hover:text-red-600"><HiOutlineTrash /></button>
                </div>
              ))}
              {!user?.savedAddresses.length && <p className="text-sm text-slate-400">No saved addresses.</p>}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-white">Emergency Contacts</h2>
              <button onClick={() => setShowContactForm((s) => !s)} className="text-primary-600"><HiOutlinePlus /></button>
            </div>
            {showContactForm && (
              <form onSubmit={handleContactSubmit(onContactSubmit)} className="mt-3 space-y-2">
                <input {...registerContact('name', { required: true })} placeholder="Contact Name" className="input-field" />
                <input {...registerContact('phone', { required: true })} placeholder="Phone Number" className="input-field" />
                <input {...registerContact('relation')} placeholder="Relation (e.g. Parent)" className="input-field" />
                <button type="submit" className="btn-primary w-full">Save Contact</button>
              </form>
            )}
            <div className="mt-3 space-y-2">
              {user?.emergencyContacts.map((c) => (
                <div key={c._id} className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 text-sm dark:bg-white/5">
                  <span className="text-slate-700 dark:text-slate-200">{c.name} - {c.phone}</span>
                  <button onClick={() => c._id && removeContact(c._id)} className="text-red-400 hover:text-red-600"><HiOutlineTrash /></button>
                </div>
              ))}
              {!user?.emergencyContacts.length && <p className="text-sm text-slate-400">No emergency contacts added.</p>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
