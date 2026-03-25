import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaUser, FaEnvelope, FaCheckCircle, FaBan, FaEye, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/users`, { 
        headers: authHeaders(token) 
      });
      
      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleBlockUnblock = async (id, currentStatus) => {
    const action = currentStatus === 'active' ? 'block' : 'unblock';
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE}/admin/users/${id}/status`,
        { status: newStatus },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success(`User ${action}ed successfully`);
        loadUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1"><FaCheckCircle /> Active</span>;
    } else {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1"><FaBan /> Blocked</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Users Management</h2>
        <p className="text-gray-600 mt-1">Manage all user accounts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUser className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Blocked Users</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {users.filter(u => u.status !== 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FaBan className="text-red-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">All Users</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaUser className="mx-auto text-6xl text-gray-300 mb-4" />
            <p>{searchTerm ? 'No users found matching your search' : 'No users found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaEnvelope className="text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {user.phone || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700' 
                          : user.role === 'merchant'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleBlockUnblock(user._id, user.status)}
                        className={`${user.status === 'active' ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'} px-3 py-1 rounded text-sm font-medium hover:bg-opacity-20 transition-colors`}
                      >
                        {user.status === 'active' ? 'Block' : 'Unblock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
