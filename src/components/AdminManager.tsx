import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ShieldAlert, Trash2, Plus, Mail } from 'lucide-react';

interface Admin {
  id: string;
  email: string;
  addedAt: string;
}

export function AdminManager() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'admins'));
      const adminList: Admin[] = [];
      snapshot.forEach(doc => {
        adminList.push({ id: doc.id, ...doc.data() } as Admin);
      });
      setAdmins(adminList);
    } catch (err: any) {
      setError(err.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setError('');
    setSuccess('');
    
    try {
      // Check if exists
      const q = query(collection(db, 'admins'), where('email', '==', newEmail.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setError('Admin already exists.');
        return;
      }
      
      const docId = newEmail.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
      await setDoc(doc(db, 'admins', docId), {
        email: newEmail.trim().toLowerCase(),
        addedAt: new Date().toISOString()
      });
      
      setSuccess('Admin added successfully.');
      setNewEmail('');
      fetchAdmins();
    } catch (err: any) {
      setError(err.message || 'Failed to add admin');
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this admin?')) return;
    try {
      await deleteDoc(doc(db, 'admins', id));
      setAdmins(admins.filter(a => a.id !== id));
      setSuccess('Admin removed.');
    } catch (err: any) {
      setError(err.message || 'Failed to remove admin');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-blue-500" />
              Administrator Access
            </h2>
            <p className="text-sm text-neutral-400 mt-1">Manage users who have access to the Tizzitech Admin Portal.</p>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleAddAdmin} className="flex gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                <input 
                  type="email"
                  required
                  placeholder="Enter email address to grant admin access"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Grant Access
            </button>
          </form>

          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6">{error}</div>}
          {success && <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-lg mb-6">{success}</div>}

          <div className="border border-neutral-800 rounded-lg overflow-hidden bg-black">
            <table className="w-full text-left">
              <thead className="bg-neutral-900 border-b border-neutral-800">
                <tr>
                  <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Email Address</th>
                  <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-wider">Granted On</th>
                  <th className="p-4 text-xs font-bold text-neutral-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {loading ? (
                  <tr><td colSpan={3} className="p-4 text-center text-neutral-500">Loading administrators...</td></tr>
                ) : admins.length === 0 ? (
                  <tr><td colSpan={3} className="p-4 text-center text-neutral-500">No administrators found.</td></tr>
                ) : admins.map(admin => (
                  <tr key={admin.id} className="hover:bg-neutral-900/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold text-sm">
                          {admin.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-white">{admin.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-neutral-400">
                      {new Date(admin.addedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleRemove(admin.id)}
                        className="text-neutral-500 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                        title="Revoke Access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
