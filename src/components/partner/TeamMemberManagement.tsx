'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Check,
  X,
  UserPlus,
  Shield
} from 'lucide-react';
import { TEAM_MEMBER_ROLES, type TeamMemberRole } from '@/lib/team-member-roles';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface TeamMemberManagementProps {
  partnerId: string;
}

const ROLE_COLORS: Record<TeamMemberRole, string> = {
  view_no_financials: 'text-blue-400 bg-blue-900/30 border-blue-500/30',
  view_clicks_only: 'text-gray-400 bg-gray-900/30 border-gray-500/30',
};

export default function TeamMemberManagement({ partnerId }: TeamMemberManagementProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<TeamMemberRole>('view_clicks_only');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/partners/team-members?partnerId=${partnerId}`);
      const data = await res.json();
      setMembers(data.members || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && members.length === 0) {
      fetchMembers();
    }
  }, [isExpanded]);

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('view_clicks_only');
    setFormPassword('');
    setFormError('');
    setFormSuccess('');
    setShowPassword(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    if (!formName || !formEmail || !formPassword) {
      setFormError('All fields are required');
      setSubmitting(false);
      return;
    }

    if (formPassword.length < 6) {
      setFormError('Password must be at least 6 characters');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/partners/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId,
          name: formName,
          email: formEmail,
          role: formRole,
          password: formPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Failed to add team member');
        setSubmitting(false);
        return;
      }

      setFormSuccess(`Team member "${formName}" added successfully`);
      resetForm();
      setShowCreateForm(false);
      fetchMembers();
    } catch (error) {
      setFormError('Failed to add team member');
    }
    setSubmitting(false);
  };

  const handleToggleActive = async (member: TeamMember) => {
    try {
      const res = await fetch('/api/partners/team-members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member.id,
          partnerId,
          isActive: !member.is_active,
        }),
      });

      if (res.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error('Error toggling member status:', error);
    }
  };

  const handleDelete = async (member: TeamMember) => {
    if (!confirm(`Are you sure you want to remove "${member.name}" from your team?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/partners/team-members?memberId=${member.id}&partnerId=${partnerId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  return (
    <section className="mb-6 md:mb-10">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-[#111] border border-[#222] rounded-xl hover:border-gold/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900/30 rounded-lg">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-white">Team Members</h3>
            <p className="text-xs text-gray-500">
              Add team members to help track performance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {members.length} member{members.length !== 1 ? 's' : ''}
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
        <div className="mt-3 space-y-3">
          {/* Role Info */}
          <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-2">
              Team members can view your traffic and sales data but <span className="text-gold">cannot see financial amounts</span>.
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TEAM_MEMBER_ROLES) as TeamMemberRole[]).map(role => (
                <div
                  key={role}
                  className={`px-2 py-1 rounded text-xs border ${ROLE_COLORS[role]}`}
                >
                  {TEAM_MEMBER_ROLES[role].label}
                </div>
              ))}
            </div>
          </div>

          {/* Create New Team Member */}
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30 rounded-lg transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add Team Member
            </button>
          ) : (
            <form onSubmit={handleCreate} className="bg-[#111] border border-[#333] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white">Add Team Member</h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="mb-3 p-2 bg-red-900/30 border border-red-500/30 rounded text-red-400 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Team member name"
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white text-sm focus:border-gold/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="team@example.com"
                    autoComplete="new-email"
                    data-lpignore="true"
                    data-form-type="other"
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white text-sm focus:border-gold/50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Access Level *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as TeamMemberRole)}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded text-white text-sm focus:border-gold/50 focus:outline-none"
                  >
                    {(Object.keys(TEAM_MEMBER_ROLES) as TeamMemberRole[]).map(role => (
                      <option key={role} value={role}>
                        {TEAM_MEMBER_ROLES[role].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      className="w-full px-3 py-2 pr-10 bg-[#1a1a1a] border border-[#333] rounded text-white text-sm focus:border-gold/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    resetForm();
                  }}
                  className="px-3 py-2 bg-[#1a1a1a] border border-[#333] rounded text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          )}

          {/* Members List */}
          {loading ? (
            <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-center text-gray-500 text-sm">
              Loading...
            </div>
          ) : members.length === 0 ? (
            <div className="bg-[#111] border border-[#222] rounded-xl p-4 text-center text-gray-500 text-sm">
              No team members yet. Add one to share access to your dashboard.
            </div>
          ) : (
            <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b border-[#333] text-gray-400 bg-[#0a0a0a]">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left hidden sm:table-cell">Email</th>
                    <th className="px-4 py-2 text-left">Access</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-t border-[#222]">
                      <td className="px-4 py-2 text-white">{member.name}</td>
                      <td className="px-4 py-2 text-gray-400 hidden sm:table-cell">{member.email}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${ROLE_COLORS[member.role]}`}>
                          {TEAM_MEMBER_ROLES[member.role]?.label || member.role}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {member.is_active ? (
                          <span className="text-green-400 text-xs">Active</span>
                        ) : (
                          <span className="text-red-400 text-xs">Inactive</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleActive(member)}
                            className={`p-1 rounded transition ${
                              member.is_active
                                ? 'bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-400'
                                : 'bg-green-900/30 hover:bg-green-900/50 text-green-400'
                            }`}
                            title={member.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {member.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(member)}
                            className="p-1 rounded bg-red-900/30 hover:bg-red-900/50 text-red-400 transition"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
