import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaCog, FaSave, FaUndo, FaPercentage, FaDollarSign, FaEnvelope, FaPhone, FaStore } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminSettings = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/admin-settings/settings`, { 
        headers: authHeaders(token) 
      });
      
      if (response.data.success) {
        setSettings(response.data.settings);
        setFormData(response.data.settings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error(error.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'boolean' ? checked : value 
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.put(
        `${API_BASE}/admin-settings/settings`,
        formData,
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Settings saved successfully");
        setSettings(formData);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all settings to default?")) return;

    try {
      const response = await axios.post(
        `${API_BASE}/admin-settings/settings/reset`,
        {},
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Settings reset to default");
        loadSettings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset settings");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Platform Settings</h2>
        <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
      </div>

      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaStore /> General Settings
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                name="platformName"
                value={formData.platformName || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Event Management System"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Support Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="supportEmail"
                    value={formData.supportEmail || ''}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="support@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone || ''}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency || 'INR'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Booking Quantity
                </label>
                <input
                  type="number"
                  name="maxBookingQuantity"
                  value={formData.maxBookingQuantity || 10}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaPercentage /> Financial Settings
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Commission Percentage (%)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPercentage className="text-gray-400" />
                </div>
                <input
                  type="number"
                  name="commissionPercentage"
                  value={formData.commissionPercentage || 10}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Percentage charged as platform commission on each transaction</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Rate (%)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaDollarSign className="text-gray-400" />
                </div>
                <input
                  type="number"
                  name="taxRate"
                  value={formData.taxRate || 0}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Tax percentage applied to transactions</p>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <FaCog /> Feature Settings
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-900">Enable Coupons</p>
                <p className="text-sm text-gray-500">Allow users to use promotional codes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableCoupons"
                  checked={formData.enableCoupons || false}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-900">Enable Reviews</p>
                <p className="text-sm text-gray-500">Allow users to leave reviews and ratings</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableReviews"
                  checked={formData.enableReviews || false}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded">
              <div>
                <p className="font-medium text-red-900">Maintenance Mode</p>
                <p className="text-sm text-red-600">Disable platform access for users (Admin access only)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={formData.maintenanceMode || false}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <FaSave /> Save Settings
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <FaUndo /> Reset to Default
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminSettings;
