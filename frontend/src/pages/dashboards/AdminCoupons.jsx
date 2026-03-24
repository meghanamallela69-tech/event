import { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import toast from "react-hot-toast";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaToggleOn, 
  FaToggleOff, 
  FaTicketAlt,
  FaPercentage,
  FaRupeeSign,
  FaCalendarAlt,
  FaUsers,
  FaEye
} from "react-icons/fa";

const AdminCoupons = () => {
  const { token } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscount: "",
    minAmount: "",
    expiryDate: "",
    usageLimit: "",
    description: ""
  });

  useEffect(() => {
    fetchCoupons();
    fetchStats();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${API_BASE}/coupons/all`, {
        headers: authHeaders(token)
      });
      
      if (response.data.success) {
        setCoupons(response.data.coupons || []);
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/coupons/stats`, {
        headers: authHeaders(token)
      });
      
      if (response.data.success) {
        setStats(response.data.stats || {});
      }
    } catch (error) {
      console.error("Failed to fetch coupon stats:", error);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${API_BASE}/coupons/create`, formData, {
        headers: authHeaders(token)
      });
      
      if (response.data.success) {
        toast.success("Coupon created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchCoupons();
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to create coupon:", error);
      toast.error(error.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(`${API_BASE}/coupons/${selectedCoupon._id}`, formData, {
        headers: authHeaders(token)
      });
      
      if (response.data.success) {
        toast.success("Coupon updated successfully!");
        setShowEditModal(false);
        setSelectedCoupon(null);
        resetForm();
        fetchCoupons();
      }
    } catch (error) {
      console.error("Failed to update coupon:", error);
      toast.error(error.response?.data?.message || "Failed to update coupon");
    }
  };

  const handleToggleStatus = async (couponId) => {
    try {
      const response = await axios.patch(`${API_BASE}/coupons/${couponId}/toggle`, {}, {
        headers: authHeaders(token)
      });
      
      if (response.data.success) {
        toast.success("Coupon status updated!");
        fetchCoupons();
      }
    } catch (error) {
      console.error("Failed to toggle coupon status:", error);
      toast.error("Failed to update coupon status");
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return;
    }
    
    try {
      const response = await axios.delete(`${API_BASE}/coupons/${couponId}`, {
        headers: authHeaders(token)
      });
      
      if (response.data.success) {
        toast.success("Coupon deleted successfully!");
        fetchCoupons();
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to delete coupon:", error);
      toast.error(error.response?.data?.message || "Failed to delete coupon");
    }
  };

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || "",
      minAmount: coupon.minAmount?.toString() || "",
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit.toString(),
      description: coupon.description || ""
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      maxDiscount: "",
      minAmount: "",
      expiryDate: "",
      usageLimit: "",
      description: ""
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getStatusBadge = (coupon) => {
    const isExpired = new Date() > new Date(coupon.expiryDate);
    const isUsedUp = coupon.usedCount >= coupon.usageLimit;
    
    if (!coupon.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>;
    }
    if (isExpired) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Expired</span>;
    }
    if (isUsedUp) {
      return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Used Up</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coupon Management</h1>
            <p className="text-gray-600">Create and manage discount coupons</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaPlus />
            Create Coupon
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FaTicketAlt className="text-2xl text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Coupons</p>
                <p className="text-2xl font-bold">{stats.totalCoupons || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FaToggleOn className="text-2xl text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Coupons</p>
                <p className="text-2xl font-bold">{stats.activeCoupons || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FaUsers className="text-2xl text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold">{stats.totalUsage || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <FaRupeeSign className="text-2xl text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Discount</p>
                <p className="text-2xl font-bold">₹{stats.totalDiscountGiven?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">All Coupons</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <FaTicketAlt className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-500">No coupons found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                          <div className="text-sm text-gray-500">{coupon.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {coupon.discountType === "percentage" ? (
                            <>
                              <FaPercentage className="text-blue-500" />
                              <span>{coupon.discountValue}%</span>
                              {coupon.maxDiscount && (
                                <span className="text-xs text-gray-500">(max ₹{coupon.maxDiscount})</span>
                              )}
                            </>
                          ) : (
                            <>
                              <FaRupeeSign className="text-green-500" />
                              <span>₹{coupon.discountValue}</span>
                            </>
                          )}
                        </div>
                        {coupon.minAmount > 0 && (
                          <div className="text-xs text-gray-500">Min: ₹{coupon.minAmount}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {coupon.usedCount} / {coupon.usageLimit}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="text-gray-400" />
                          <span className="text-sm text-gray-900">{formatDate(coupon.expiryDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(coupon)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(coupon)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(coupon._id)}
                            className={`${coupon.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}`}
                            title={coupon.isActive ? "Deactivate" : "Activate"}
                          >
                            {coupon.isActive ? <FaToggleOff /> : <FaToggleOn />}
                          </button>
                          {coupon.usedCount === 0 && (
                            <button
                              onClick={() => handleDeleteCoupon(coupon._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Coupon</h3>
            
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., SAVE20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type *
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value * {formData.discountType === "percentage" ? "(%)" : "(₹)"}
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={formData.discountType === "percentage" ? "20" : "100"}
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  required
                />
              </div>

              {formData.discountType === "percentage" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500"
                    min="0"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({...formData, minAmount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit *
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional description"
                  rows="2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Coupon</h3>
            
            <form onSubmit={handleUpdateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={selectedCoupon?.usedCount > 0}
                  required
                />
                {selectedCoupon?.usedCount > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Cannot change code of used coupon</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type *
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value * {formData.discountType === "percentage" ? "(%)" : "(₹)"}
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max={formData.discountType === "percentage" ? "100" : undefined}
                  required
                />
              </div>

              {formData.discountType === "percentage" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Discount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Amount (₹)
                </label>
                <input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({...formData, minAmount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit *
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={selectedCoupon?.usedCount || 1}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCoupon(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCoupons;