import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaClipboardList, FaUser, FaCalendarAlt, FaInfoCircle, FaSearch, FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminAuditLogs = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    entity: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...filters
      });

      const response = await axios.get(
        `${API_BASE}/admin-management/audit-logs?${queryParams}`, 
        { headers: authHeaders(token) }
      );
      
      if (response.data.success) {
        setLogs(response.data.logs || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalCount(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error loading audit logs:", error);
      toast.error(error.response?.data?.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadLogs();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionBadgeColor = (action) => {
    const colors = {
      create: 'bg-green-100 text-green-700',
      update: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      view: 'bg-gray-100 text-gray-700',
      login: 'bg-purple-100 text-purple-700',
      logout: 'bg-orange-100 text-orange-700',
      accept_booking: 'bg-green-100 text-green-700',
      reject_booking: 'bg-yellow-100 text-yellow-700',
      process_payment: 'bg-indigo-100 text-indigo-700',
      issue_refund: 'bg-pink-100 text-pink-700',
      resolve_complaint: 'bg-teal-100 text-teal-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  const formatAction = (action) => {
    return action.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Audit Logs</h2>
        <p className="text-gray-600 mt-1">Track all admin activities and system actions</p>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Log Entries</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaClipboardList className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="User, email, details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Type
              </label>
              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="view">View</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="accept_booking">Accept Booking</option>
                <option value="reject_booking">Reject Booking</option>
                <option value="process_payment">Process Payment</option>
                <option value="issue_refund">Issue Refund</option>
                <option value="resolve_complaint">Resolve Complaint</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entity
              </label>
              <select
                name="entity"
                value={filters.entity}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Entities</option>
                <option value="User">User</option>
                <option value="Event">Event</option>
                <option value="Booking">Booking</option>
                <option value="Payment">Payment</option>
                <option value="Complaint">Complaint</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaSearch /> Search
            </button>
            <button
              type="button"
              onClick={() => {
                setFilters({ action: '', entity: '', search: '' });
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">System Activity Logs</h3>
          <span className="text-sm text-gray-500">Showing {logs.length} of {totalCount} entries</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaClipboardList className="mx-auto text-6xl text-gray-300 mb-4" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getActionBadgeColor(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                        <div className="text-xs text-gray-500">{log.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {log.entity}
                        {log.entityId && (
                          <div className="text-xs text-gray-400 font-mono">
                            {log.entityId.toString().slice(-8)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">
                        {log.details || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400 text-xs" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
