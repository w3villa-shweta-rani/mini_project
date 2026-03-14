import { formatDate, getPlanBadgeClass, getPlanIcon, getInitials, truncate } from '../utils/helpers';

const UserTable = ({ users, onDelete, onEdit, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="spinner" />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-3">👥</p>
        <p className="text-lg font-medium">No users found</p>
        <p className="text-sm mt-1">Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Plan</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Verified</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-white/3 transition-colors group">
              {/* User */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {user.profileImageUrl || user.profileImage ? (
                    <img src={user.profileImageUrl || user.profileImage} alt={user.name}
                         className="w-8 h-8 rounded-full object-cover border border-primary/30" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                         style={{ background: 'linear-gradient(135deg, #6c63ff, #f50057)' }}>
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">{truncate(user.name, 20)}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.socialProvider}</p>
                  </div>
                </div>
              </td>

              {/* Email */}
              <td className="px-4 py-3 text-gray-300">{truncate(user.email, 28)}</td>

              {/* Plan */}
              <td className="px-4 py-3">
                <span className={getPlanBadgeClass(user.planType)}>
                  {getPlanIcon(user.planType)} {user.planType}
                </span>
              </td>

              {/* Role */}
              <td className="px-4 py-3">
                <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-free'}`}>
                  {user.role === 'admin' ? '🛡️' : '👤'} {user.role}
                </span>
              </td>

              {/* Verified */}
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  user.isVerified
                    ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                    : 'bg-red-500/15 text-red-400 border border-red-500/25'
                }`}>
                  {user.isVerified ? '✓ Yes' : '✗ No'}
                </span>
              </td>

              {/* Joined */}
              <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(user.createdAt)}</td>

              {/* Actions */}
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(user)}
                      className="px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(user._id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
