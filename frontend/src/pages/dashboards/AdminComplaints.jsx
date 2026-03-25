import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaExclamationTriangle, FaUser, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEye, FaCommentDollar, FaSearch, FaFilter } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminComplaints = () => {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [resolutionText, setResolutionText] = useState('');

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...filters
      });

      const response = await axios.get(
        `${API_BASE}/admin-management/complaints?${queryParams}`, 
        { headers: authHeaders(token) }
      );
      
      if (response.data.success) {
        setComplaints(response.data.complaints || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalCount(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error loading complaints:", error);
      toast.error(error.response?.data?.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, filters]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadComplaints();
  };

  const viewComplaint = async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE}/admin-management/complaints/${id}`, 
        { headers: authHeaders(token) }
      );
      
      if (response.data.success) {
        setSelectedComplaint(response.data.complaint);
        setShowModal(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load complaint details");
    }
  };

  const addNote = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/admin-management/complaints/${selectedComplaint._id}/note`,
        { note: noteText },
        { headers: authHeaders(token) }
      );
      
      if (response.data.success) {
        toast.success("Note added successfully");
        setNoteText('');
        setSelectedComplaint(response.data.complaint);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add note");
    }
  };

  const updateStatus = async (status) => {
    try {
      const response = await axios.put(
        `${API_BASE}/admin-management/complaints/${selectedComplaint._id}/status`,
        { status },
        { headers: authHeaders(token) }
      );
      
      if (response.data.success) {
        toast.success(`Status updated to ${status}`);
        setSelectedComplaint(response.data.complaint);
        loadComplaints();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const resolveComplaint = async () => {
    try {
      const response = await axios.post(
        `${API_BASE}/admin-management/complaints/${selectedComplaint._id}/resolve`,
        { resolutionText },
        { headers: authHeaders(token) }
      );
      
      if (response.data.success) {
        toast.success("Complaint resolved successfully");
        setResolutionText('');
        setSelectedComplaint(response.data.complaint);
        loadComplaints();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resolve complaint");
    }
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

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_review: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      payment: '$',
      booking: '📅',
      event: '🎉',
      service_quality: '⭐',
      technical_issue: '⚙️',
      refund: '💰',
      other: '📋'
    };
    return icons[category] || '📋';
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Complaints Management</h2>
        <p className="text-gray-600 mt-1">Review and resolve user complaints</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Complaints</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {complaints.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FaExclamationTriangle className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">In Review</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {complaints.filter(c => c.status === 'in_review').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaEye className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Resolved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {complaints.filter(c => c.status === 'resolved').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="User, subject..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="payment">Payment</option>
                <option value="booking">Booking</option>
                <option value="event">Event</option>
                <option value="service_quality">Service Quality</option>
                <option value="technical_issue">Technical Issue</option>
                <option value="refund">Refund</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
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
                setFilters({ status: '', category: '', priority: '', search: '' });
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">All Complaints</h3>
          <span className="text-sm text-gray-500">Showing {complaints.length} of {totalCount} entries</span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaExclamationTriangle className="mx-auto text-6xl text-gray-300 mb-4" />
            <p>No complaints found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{complaint.userName}</div>
                        <div className="text-xs text-gray-500">{complaint.userEmail}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{complaint.subject}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {complaint.description}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span>{getCategoryIcon(complaint.category)}</span>
                          <span className="capitalize">{complaint.category.replace(/_/g, ' ')}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeColor(complaint.priority)}`}>
                          {complaint.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(complaint.status)}`}>
                          {complaint.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400 text-xs" />
                          {formatDate(complaint.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => viewComplaint(complaint._id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
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

      {/* Complaint Detail Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Complaint Details</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    #{selectedComplaint._id.toString().slice(-8)} • {formatDate(selectedComplaint.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">User</p>
                  <p className="font-medium">{selectedComplaint.userName}</p>
                  <p className="text-sm text-gray-500">{selectedComplaint.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium capitalize">{selectedComplaint.category.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Priority</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadgeColor(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Subject & Description */}
              <div>
                <p className="text-sm text-gray-600">Subject</p>
                <p className="font-medium text-lg">{selectedComplaint.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
              </div>

              {/* Admin Notes */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Admin Notes</h4>
                <div className="space-y-2">
                  {selectedComplaint.adminNotes?.map((note, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-700">{note.note}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Added by {note.addedBy?.name} on {formatDate(note.addedAt)}
                      </p>
                    </div>
                  ))}
                  {(!selectedComplaint.adminNotes || selectedComplaint.adminNotes.length === 0) && (
                    <p className="text-gray-500 text-sm">No notes yet</p>
                  )}
                </div>
                
                {/* Add Note */}
                <div className="mt-3">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add an admin note..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                  <button
                    onClick={addNote}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FaCommentDollar /> Add Note
                  </button>
                </div>
              </div>

              {/* Resolution */}
              {selectedComplaint.resolution && (
                <div className="bg-green-50 p-4 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">Resolution</h4>
                  <p className="text-sm text-green-700">{selectedComplaint.resolution.resolutionText}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Resolved by {selectedComplaint.resolution.resolvedBy?.name} on {formatDate(selectedComplaint.resolution.resolvedAt)}
                  </p>
                </div>
              )}

              {/* Actions */}
              {!selectedComplaint.resolution && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Update Status</h4>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => updateStatus('pending')}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium"
                      >
                        Set Pending
                      </button>
                      <button
                        onClick={() => updateStatus('in_review')}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                      >
                        Set In Review
                      </button>
                      <button
                        onClick={() => updateStatus('resolved')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => updateStatus('closed')}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Resolve Complaint</h4>
                    <textarea
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Enter resolution details..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                    <button
                      onClick={resolveComplaint}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <FaCheckCircle /> Resolve & Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminComplaints;
