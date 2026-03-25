import { useState } from "react";
import axios from "axios";
import AdminLayout from "../../components/admin/AdminLayout";
import useAuth from "../../context/useAuth";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { API_BASE, authHeaders } from "../../lib/http";
import { toast } from "react-hot-toast";

const AdminProfile = () => {
  const { user, token } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "Administrator account"
  });

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Update profile via API
      await axios.put(
        `${API_BASE}/auth/profile`,
        profileData,
        { headers: authHeaders(token) }
      );
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      location: user?.location || "",
      bio: user?.bio || "Administrator account"
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    toast.info("Change password feature coming soon!");
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">My Profile</h2>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-5xl font-bold mx-auto">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <button className="absolute bottom-0 right-0 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition shadow-lg">
                <FaCamera />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">{user?.name || "Admin User"}</h3>
            <p className="text-sm text-gray-500 mb-4">Administrator</p>
            
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
              >
                <FaEdit />
                Edit Profile
              </button>
            </div>

            <div className="mt-6 pt-6 border-t space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <FaEnvelope className="text-gray-400" />
                <span className="truncate">{user?.email || "admin@example.com"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <FaUser className="text-gray-400" />
                <span>Role: Administrator</span>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
            <h4 className="font-semibold text-lg mb-4">Security</h4>
            <div className="space-y-3">
              <button
                onClick={handleChangePassword}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-left text-sm flex items-center justify-between"
              >
                <span>Change Password</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-left text-sm flex items-center justify-between">
                <span>Two-Factor Authentication</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Coming Soon</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Personal Information</h3>
              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                    {profileData.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700 flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    {profileData.email}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700 flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    {profileData.phone || "Not provided"}
                  </div>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    placeholder="Enter your location"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" />
                    {profileData.location || "Not provided"}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-700">
                    {profileData.bio}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
            <h4 className="font-semibold text-lg mb-4">Account Activity</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="text-lg font-semibold text-blue-600">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Last Login</p>
                <p className="text-lg font-semibold text-green-600">Today</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Account Status</p>
                <p className="text-lg font-semibold text-purple-600">Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
