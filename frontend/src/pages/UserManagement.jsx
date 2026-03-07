import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import UserTable from '../components/UserTable';
import Pagination from '../components/Pagination';
import { useDebounce } from '../hooks/useDebounce';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const debouncedSearch = useDebounce(search, 400);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(planFilter && { plan: planFilter }),
        ...(roleFilter && { role: roleFilter }),
      });
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setErrorMsg('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, planFilter, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, planFilter, roleFilter]);

  const handleEdit = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name, role: user.role, planType: user.planType, isVerified: user.isVerified });
    setErrorMsg('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await api.put(`/admin/users/${editUser._id}`, editForm);
      setSuccessMsg('User updated successfully.');
      setEditUser(null);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Update failed.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setSuccessMsg('User deleted.');
      setDeleteConfirm(null);
      fetchUsers();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white mb-1">👥 User Management</h1>
        <p className="text-gray-400">Search, filter, and manage all GamerHub users</p>
      </div>

      {successMsg && <div className="alert alert-success mb-4">✅ {successMsg}</div>}
      {errorMsg && <div className="alert alert-error mb-4">⚠️ {errorMsg}</div>}

      {/* Filters */}
      <div className="glass-card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-48">
          <input
            type="text" placeholder="🔍 Search name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input-field text-sm py-2"
          />
        </div>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)}
                className="input-field text-sm py-2 w-36">
          <option value="">All Plans</option>
          <option value="Free">Free</option>
          <option value="Silver">Silver</option>
          <option value="Gold">Gold</option>
        </select>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="input-field text-sm py-2 w-36">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={() => { setSearch(''); setPlanFilter(''); setRoleFilter(''); setPage(1); }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="glass-card p-4">
        <UserTable
          users={users}
          loading={loading}
          onEdit={handleEdit}
          onDelete={(id) => setDeleteConfirm(id)}
        />
        <Pagination pagination={pagination} onPageChange={setPage} />
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card p-6 w-full max-w-md animate-slide-up">
            <h2 className="text-lg font-bold text-white mb-5">Edit User: {editUser.name}</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                       className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Role</label>
                <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}
                        className="input-field">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Plan</label>
                <select value={editForm.planType} onChange={e => setEditForm({...editForm, planType: e.target.value})}
                        className="input-field">
                  <option value="Free">Free</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="verified" checked={editForm.isVerified}
                       onChange={e => setEditForm({...editForm, isVerified: e.target.checked})}
                       className="w-4 h-4 rounded" />
                <label htmlFor="verified" className="text-sm text-gray-300">Email Verified</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={editLoading} className="btn-primary flex-1 justify-center py-2.5 text-sm">
                  {editLoading ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button type="button" onClick={() => setEditUser(null)}
                        className="flex-1 py-2.5 text-sm border border-white/10 rounded-lg text-gray-300 hover:bg-white/5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card p-6 w-full max-w-sm text-center animate-slide-up">
            <p className="text-5xl mb-4">🗑️</p>
            <h2 className="text-xl font-bold text-white mb-2">Delete User?</h2>
            <p className="text-gray-400 text-sm mb-6">This action cannot be undone. The user will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)}
                      className="btn-danger flex-1 py-2.5 text-sm">
                Yes, Delete
              </button>
              <button onClick={() => setDeleteConfirm(null)}
                      className="flex-1 py-2.5 text-sm border border-white/10 rounded-lg text-gray-300 hover:bg-white/5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
