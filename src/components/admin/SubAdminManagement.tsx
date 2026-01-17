'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Shield, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  EyeOff,
  Check,
  X,
  UserCog
} from 'lucide-react';
import { ADMIN_ROLES, type AdminRole } from '@/lib/admin-roles';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  created_by?: string;
}

const ROLE_COLORS: Record<AdminRole, string> = {
  super_admin: 'text-red-400 bg-red-900/30 border-red-500/30',
  admin: 'text-purple-400 bg-purple-900/30 border-purple-500/30',
  manager: 'text-blue-400 bg-blue-900/30 border-blue-500/30',
  support: 'text-green-400 bg-green-900/30 border-green-500/30',
};

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  super_admin: 'Full access to everything',
  admin: 'Can manage partners, orders, and support',
  manager: 'Can view all data and manage support',
  support: 'Limited to support tickets only',
};

export default function SubAdminManagement() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('support');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && users.length === 0) {
      fetchUsers();
    }
  }, [isExpanded]);

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('support');
    setFormPassword('');
    setFormError('');
    setFormSuccess('');
    setShowPassword(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formName || !formEmail || !formPassword) {
      setFormError('All fields are required');
      return;
    }

    if (formPassword.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          role: formRole,
          password: formPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Failed to create sub-admin');
        return;
      }

      setFormSuccess(`Sub-admin "${formName}" created successfully`);
      resetForm();
      setShowCreateForm(false);
      fetchUsers();
    } catch (error) {
      setFormError('Failed to create sub-admin');
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          isActive: !user.is_active,
        }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`Are you sure you want to delete "${user.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Filter out super_admin from display (they shouldn't be managed here)
  const managedUsers = users.filter(u => u.role !== 'super_admin');

  return (
    <section className="mb-10">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-[#111] border border-[#333] rounded-xl hover:border-gold/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900/30 rounded-lg">
            <UserCog className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-white">Sub-Admin Management</h2>
            <p className="text-sm text-gray-500">
              Manage executive-level administrators with varying access levels
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {managedUsers.length} sub-admin{managedUsers.length !== 1 ? 's' : ''}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Role Legend */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Access Levels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(Object.keys(ADMIN_ROLES) as AdminRole[])
                .filter(role => role !== 'super_admin')
                .map(role => (
                  <div
                    key={role}
                    className={`p-3 rounded-lg border ${ROLE_COLORS[role]}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">{ADMIN_ROLES[role].label}</span>
                    </div>
                    <p className="text-xs opacity-70">{ROLE_DESCRIPTIONS[role]}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Create New Sub-Admin Button/Form */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create New Sub-Admin
            </button>
          ) : (
            <form onSubmit={handleCreate} className="bg-[#111] border border-[#333] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Create New Sub-Admin</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 p-3 bg-green-900/30 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  {formSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-gold/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="admin@company.com"
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-gold/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Access Level *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as AdminRole)}
                    className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-gold/50 focus:outline-none"
                  >
                    <option value="support">Support - Limited Access</option>
                    <option value="manager">Manager - View & Support</option>
                    <option value="admin">Admin - Full Management</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-4 py-2 pr-10 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-gold/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-colors"
                >
                  Create Sub-Admin
                </button>
              </div>
            </form>
          )}

          {/* Users List */}
          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#333] text-gray-400 bg-[#0a0a0a]">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Access Level</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : managedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No sub-admins created yet. Click "Create New Sub-Admin" to add one.
                    </td>
                  </tr>
                ) : (
                  managedUsers.map((user) => (
                    <tr key={user.id} className="border-t border-[#222] hover:bg-[#1a1a1a]">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{user.name}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${ROLE_COLORS[user.role]}`}>
                          <Shield className="w-3 h-3" />
                          {ADMIN_ROLES[user.role]?.label || user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {user.is_active ? (
                          <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                            <Check className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                            <X className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString() 
                          : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`p-1.5 rounded transition ${
                              user.is_active
                                ? 'bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400'
                                : 'bg-green-900/30 hover:bg-green-900/50 text-green-400'
                            }`}
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 rounded bg-red-900/30 hover:bg-red-900/50 text-red-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
