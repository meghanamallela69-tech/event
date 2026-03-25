import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaStore, FaEnvelope, FaCheckCircle, FaBan, FaEdit, FaTrash, FaKey, FaPlus, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminMerchants = () => {
  const { token } = useAuth();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const loadMerchants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin/merchants`, { 
        headers: authHeaders(token) 
      });
      
      if (response.data.success) {
        setMerchants(response.data.merchants || []);
      }
    } catch (error) {
      console.error("Error loading merchants:", error);
      toast.error(error.response?.data?.message || "Failed to load merchants");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setEditingMerchant(null);
    setFormData({ name: '', email: '', phone: '' });
    setShowModal(true);
  };

  const openEditModal = (merchant) => {
    setEditingMerchant(merchant);
    setFormData({
      name: merchant.name || '',
      email: merchant.email || '',
      phone: merchant.phone || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingMerchant) {
        // Update existing merchant
        const response = await axios.put(
          `${API_BASE}/admin/merchants/${editingMerchant._id}`,
          formData,
          { headers: authHeaders(token) }
        );

        if (response.data.success) {
          toast.success("Merchant updated successfully");
          loadMerchants();
          setShowModal(false);
        }
      } else {
        // Create new merchant
        const response = await axios.post(
          `${API_BASE}/admin/create-merchant`,
          formData,
          { headers: authHeaders(token) }
        );

        if (response.data.success) {
          toast.success("Merchant created! Credentials sent to email");
          loadMerchants();
          setShowModal(false);
          setFormData({ name: '', email: '', phone: '' });
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingMerchant ? 'update' : 'create'} merchant`);
    }
  };

  const handleSuspend = async (id, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus === 'active' ? 'suspend' : 'activate'} this merchant?`)) {
      return;
    }

    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const response = await axios.put(
        `${API_BASE}/admin/merchants/${id}/suspend`,
        { status: newStatus },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success(`Merchant ${newStatus} successfully`);
        loadMerchants();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update merchant status");
    }
  };

  const handleResetPassword = async (id) => {
    if (!confirm("Are you sure you want to reset this merchant's password? A new password will be sent to their email.")) {
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/admin/merchants/${id}/reset-password`,
        {},
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Password reset! New password sent to merchant's email");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this merchant? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE}/admin/users/${id}`,
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Merchant deleted successfully");
        loadMerchants();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete merchant");
    }
  };

  const filteredMerchants = merchants.filter(merchant =>
    merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    merchant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1"><FaCheckCircle /> Active</span>;
    } else if (status === 'blocked') {
      return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1"><FaBan /> Blocked</span>;
    } else {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium flex items-center gap-1"><FaBan /> Suspended</span>;
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Merchants Management</h2>
            <p className="text-gray-600 mt-1">Manage all merchant accounts</p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaPlus /> Add Merchant
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Merchants</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{merchants.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaStore className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {merchants.filter(m => m.status === 'active').length}
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
              <p className="text-sm text-gray-600 font-medium">Inactive</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {merchants.filter(m => m.status !== 'active').length}
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

      {/* Merchants Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">All Merchants</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaStore className="mx-auto text-6xl text-gray-300 mb-4" />
            <p>{searchTerm ? 'No merchants found matching your search' : 'No merchants found'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Merchant Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
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
                {filteredMerchants.map((merchant) => (
                  <tr key={merchant._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{merchant.name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaEnvelope className="text-gray-400" />
                        {merchant.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {merchant.phone || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(merchant.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(merchant)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleSuspend(merchant._id, merchant.status)}
                          className={`${merchant.status === 'active' ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'} p-1`}
                          title={merchant.status === 'active' ? 'Suspend' : 'Activate'}
                        >
                          <FaBan />
                        </button>
                        <button
                          onClick={() => handleResetPassword(merchant._id)}
                          className="text-purple-600 hover:text-purple-800 p-1"
                          title="Reset Password"
                        >
                          <FaKey />
                        </button>
                        <button
                          onClick={() => handleDelete(merchant._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <FaTrash />
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingMerchant ? 'Edit Merchant' : 'Create New Merchant'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required={!editingMerchant}
                  disabled={!!editingMerchant}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Enter email address"
                />
                {editingMerchant && (
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              {!editingMerchant && (
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-blue-700">
                    ℹ️ A temporary password will be generated and sent to the merchant's email
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingMerchant ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMerchants;
