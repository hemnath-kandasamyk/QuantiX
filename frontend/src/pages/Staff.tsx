import React, { useState, useEffect } from 'react';
import client from '../api/client';
import { useToast } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import { SkeletonTable } from '../components/Skeleton';
import { StatusStamp } from '../components/StatusStamp';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  ShieldCheck,
  Shield,
  Trash2,
  X,
  Plus,
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
}

export const Staff: React.FC = () => {
  const { showToast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as 'admin' | 'staff',
    phone: '',
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await client.get('/staff');
      setStaff(res.data);
    } catch {
      showToast('Error', 'Failed to fetch staff directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('Validation Error', 'Name and email are required.', 'error');
      return;
    }

    try {
      const res = await client.post('/staff', formData);
      setStaff((prev) => [...prev, res.data]);
      showToast('Staff Member Added', `Registered ${formData.name} in store directory.`);
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', role: 'staff', phone: '' });
    } catch {
      showToast('Error', 'Failed to register staff member.', 'error');
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${name}?`)) return;
    try {
      await client.delete(`/staff/${id}`);
      setStaff((prev) => prev.filter((s) => s.id !== id));
      showToast('Access Revoked', `Removed ${name} from staff directory.`);
    } catch {
      showToast('Error', 'Failed to remove staff member.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-rule)]">
        <div>
          <span className="section-label">ADMINISTRATIVE ACCESS CONTROL</span>
          <h1 className="font-serif-heading text-2xl md:text-3xl font-bold text-[var(--color-text-ink)]">
            Staff & Permissions Management
          </h1>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[var(--color-ink)] text-[var(--color-paper)] font-mono-num text-xs font-bold uppercase tracking-wider rounded transition-all hover:opacity-90 flex items-center justify-center gap-2 shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Grid / Table */}
      {loading ? (
        <SkeletonTable rows={4} cols={5} />
      ) : staff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Staff Accounts"
          description="Register employees to grant register access or manager permissions."
          actionLabel="Add Staff Member"
          onAction={() => setIsAddModalOpen(true)}
          stampText="NO STAFF"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <div
              key={member.id}
              className="ledger-card p-5 rounded flex flex-col justify-between hover:border-[var(--color-text-muted)] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] flex items-center justify-center font-bold text-xs text-[var(--color-text-ink)]">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--color-text-ink)]">
                        {member.name}
                      </h3>
                      <p className="text-[11px] text-[var(--color-text-muted)] font-mono-num">
                        Joined {member.joinedDate}
                      </p>
                    </div>
                  </div>

                  <StatusStamp
                    label={member.role}
                    variant={member.role === 'admin' ? 'amber' : 'green'}
                    animate={false}
                  />
                </div>

                <div className="space-y-1.5 text-xs font-mono-num text-[var(--color-text-muted)] py-3 border-t border-b border-[var(--color-rule-subtle)]">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    <span>{member.phone || 'No phone'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-2">
                <StatusStamp
                  label={member.status}
                  variant={member.status === 'ACTIVE' ? 'green' : 'neutral'}
                  animate={false}
                />

                <button
                  onClick={() => handleDeleteStaff(member.id, member.name)}
                  className="p-1.5 text-[var(--color-stamp-red)] hover:bg-[var(--color-stamp-red-bg)] rounded transition-colors text-xs font-mono-num font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="ledger-card max-w-md w-full p-6 rounded-lg shadow-2xl bg-[var(--color-paper-raised)] border border-[var(--color-rule)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-rule)] mb-4">
              <h3 className="font-serif-heading text-lg font-bold text-[var(--color-text-ink)]">
                Register Staff Member
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-ink)] p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div>
                <label className="block section-label mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sophia Chen"
                  required
                  className="w-full px-3 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
                />
              </div>

              <div>
                <label className="block section-label mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sophia@ledger.shop"
                  required
                  className="w-full px-3 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
                />
              </div>

              <div>
                <label className="block section-label mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555-0103"
                  className="w-full px-3 py-2 bg-[var(--color-paper-subtle)] border border-[var(--color-rule)] rounded text-xs text-[var(--color-text-ink)] focus:outline-none focus:border-[var(--color-stamp-amber)]"
                />
              </div>

              <div>
                <label className="block section-label mb-1">Role / Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'staff' })}
                    className={`py-2 px-3 rounded border text-xs font-mono-num font-bold uppercase transition-all ${
                      formData.role === 'staff'
                        ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]'
                        : 'border-[var(--color-rule)] bg-[var(--color-paper-subtle)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    Staff (Till & Catalog)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'admin' })}
                    className={`py-2 px-3 rounded border text-xs font-mono-num font-bold uppercase transition-all ${
                      formData.role === 'admin'
                        ? 'border-[var(--color-stamp-amber)] bg-[var(--color-stamp-amber-bg)] text-[var(--color-stamp-amber)]'
                        : 'border-[var(--color-rule)] bg-[var(--color-paper-subtle)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    Admin (Full Store Access)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-rule)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[var(--color-rule)] rounded text-xs font-mono-num text-[var(--color-text-muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] font-mono-num text-xs font-bold uppercase tracking-wider rounded transition-all hover:opacity-95"
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
