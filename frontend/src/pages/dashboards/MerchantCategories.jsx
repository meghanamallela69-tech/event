import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import { FaPlus, FaEdit, FaTrash, FaTags, FaImage } from "react-icons/fa";
import useAuth from "../../context/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const MerchantCategories = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(error.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Open modal for creating
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", image: null });
    setImagePreview(null);
    setShowModal(true);
  };

  // Open modal for editing
  const handleOpenEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: null,
    });
    setImagePreview(category.image);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      let response;
      if (editingCategory) {
        // Update existing category
        response = await axios.put(
          `${API_BASE_URL}/api/v1/categories/${editingCategory._id}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Create new category
        response = await axios.post(`${API_BASE_URL}/api/v1/categories`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.success) {
        toast.success(editingCategory ? "Category updated successfully" : "Category created successfully");
        fetchCategories();
        setShowModal(false);
        setFormData({ name: "", description: "", image: null });
        setImagePreview(null);
        setEditingCategory(null);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data?.message || "Failed to save category");
    }
  };

  // Handle delete
  const handleDelete = async (categoryId) => {
    try {
      const token = getToken();
      const response = await axios.delete(
        `${API_BASE_URL}/api/v1/categories/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Category deleted successfully");
        fetchCategories();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    }
  };

  return (
    <MerchantLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
            <p className="text-gray-600 mt-1">Create and manage your event categories</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaPlus />
            Create Category
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaTags className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {categories.filter((c) => c.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaTags className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">With Images</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {categories.filter((c) => c.image).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaImage className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Your Categories</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <FaTags className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Yet</h3>
              <p className="text-gray-600 mb-4">Create your first category to organize your events</p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FaPlus />
                Create Category
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        {category.isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-md truncate">{category.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-12 w-12 object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-sm text-gray-400">No image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(category)}
                            className="text-blue-600 hover:text-blue-900 transition"
                            title="Edit"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(category)}
                            className="text-red-600 hover:text-red-900 transition"
                            title="Delete"
                          >
                            <FaTrash size={18} />
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
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCategory ? "Edit Category" : "Create Category"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  minLength={2}
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Wedding, Corporate, Birthday"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  minLength={10}
                  maxLength={500}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe this category..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image (Optional)
                </label>
                <div className="mt-1 space-y-2">
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded-lg"
                      />
                      {!formData.image && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData((prev) => ({ ...prev, image: null }));
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Category</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </MerchantLayout>
  );
};

export default MerchantCategories;
