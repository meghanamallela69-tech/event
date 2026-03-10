import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash, FaStar, FaSearch } from "react-icons/fa";
import { API_BASE } from "../../lib/http";
import useAuth from "../../context/useAuth";

const AdminServices = () => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "wedding",
    price: "",
    rating: "0",
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);

  const categories = [
    { value: "wedding", label: "Wedding" },
    { value: "corporate", label: "Corporate" },
    { value: "birthday", label: "Birthday" },
    { value: "catering", label: "Catering" },
    { value: "photography", label: "Photography" },
    { value: "decoration", label: "Decoration" },
    { value: "concert", label: "Concert" },
    { value: "camping", label: "Camping" },
    { value: "gaming", label: "Gaming" },
    { value: "anniversary", label: "Anniversary" },
    { value: "party", label: "Party" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      console.log("=== Fetching Admin Services ===");
      console.log("API Base:", API_BASE);
      console.log("Token exists:", !!token);
      
      if (!token) {
        console.error("❌ No token found! User not authenticated.");
        toast.error("Please login as admin to view services");
        setServices([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      const config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      };
      
      console.log("Making request to:", `${API_BASE}/services/admin/all`);
      const response = await axios.get(`${API_BASE}/services/admin/all`, config);
      
      console.log("✅ Response received:", response.data);
      console.log("✅ Services count:", response.data.services?.length || 0);
      
      if (response.data.success) {
        const servicesData = response.data.services || [];
        setServices(servicesData);
        
        if (servicesData.length === 0) {
          console.log("⚠️ Database has no services yet");
          toast.success("No services in database. Create services to manage them here.");
        } else {
          console.log("✅ Loaded", servicesData.length, "services:");
          servicesData.forEach(s => {
            console.log(`  - ${s.title} | Category: ${s.category} | Price: ₹${s.price} | Active: ${s.isActive}`);
          });
        }
      } else {
        throw new Error("API returned success: false");
      }
    } catch (error) {
      console.error("❌ Error fetching services:", error.message);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      
      let errorMsg = "Failed to fetch services";
      if (error.response?.status === 401) {
        errorMsg = "Unauthorized. Please login as admin.";
        console.error("🔒 Authentication failed - 401 Unauthorized");
      } else if (error.response?.status === 403) {
        errorMsg = "Access denied. Admin role required.";
        console.error("🔒 Authorization failed - 403 Forbidden");
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      toast.error(errorMsg);
      setServices([]);
    } finally {
      setLoading(false);
      console.log("=== Fetch complete ===");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for images - for new service, need at least 1 image
    // For editing, can keep existing images or add new ones
    const totalImages = editingService 
      ? formData.images.length + imageFiles.length 
      : imageFiles.length;
    
    if (totalImages === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    
    if (totalImages > 4) {
      toast.error("Maximum 4 images allowed");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("price", formData.price);
    data.append("rating", formData.rating);
    
    // For editing, send remaining existing images
    if (editingService) {
      data.append("existingImages", JSON.stringify(formData.images));
    }

    imageFiles.forEach((file) => {
      data.append("images", file);
    });

    try {
      if (editingService) {
        await axios.put(`${API_BASE}/services/admin/service/${editingService._id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Service updated successfully");
      } else {
        await axios.post(`${API_BASE}/services/admin/service`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Service created successfully");
      }

      resetForm();
      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      await axios.delete(`${API_BASE}/services/admin/service/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Service deleted successfully");
      fetchServices();
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      price: String(service.price || ""),
      rating: String(service.rating || "0"),
      images: service.images,
    });
    // Clear any existing image files/previews when editing
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls([]);
    setImageFiles([]);
    setIsModalOpen(true);
  };

  // Remove existing image when editing
  const removeExistingImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "wedding",
      price: "",
      rating: "0",
      images: [],
    });
    // Clear preview URLs
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls([]);
    setImageFiles([]);
    setEditingService(null);
  };

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    
    if (newFiles.length === 0) return;
    
    // Combine with existing files
    const combinedFiles = [...imageFiles, ...newFiles];
    
    if (combinedFiles.length > 4) {
      toast.error("Maximum 4 images allowed. You can only add " + (4 - imageFiles.length) + " more image(s).");
      return;
    }
    
    setImageFiles(combinedFiles);
    
    // Create preview URLs for all selected images
    const previewUrls = combinedFiles.map(file => URL.createObjectURL(file));
    
    // Revoke old preview URLs to prevent memory leaks
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls(previewUrls);
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    
    const newPreviews = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviewUrls(newPreviews);
  };

  const filteredServices = services.filter(
    (service) =>
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Image Slider Component
  const ImageSlider = ({ images, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    if (!images || images.length === 0) {
      return (
        <div className="h-32 w-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">No Image</span>
        </div>
      );
    }
    
    const nextImage = (e) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    };
    
    const prevImage = (e) => {
      e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };
    
    return (
      <div className="relative h-32 w-full overflow-hidden bg-gray-100 group">
        <img
          src={images[currentIndex]?.url}
          alt={`${title} ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaChevronLeft className="text-xs" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaChevronRight className="text-xs" />
            </button>
            
            {/* Image Counter */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Services</h1>
        <p className="text-sm text-gray-600">View and manage all services</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Services Grid - 4 cards per row */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredServices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-600">No services found</h3>
              <p className="text-gray-500 text-sm mt-1">
                {searchTerm ? "Try adjusting your search" : "No services available"}
              </p>
            </div>
          ) : (
            filteredServices.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                {/* Image */}
                <div className="relative h-40 w-full overflow-hidden bg-gray-100">
                  <img
                    src={service.images[0]?.url || "/placeholder.jpg"}
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <FaStar className="text-yellow-400 text-sm" />
                    <span className="text-sm font-medium">{service.rating}</span>
                  </div>
                  {/* Image count badge if multiple images */}
                  {service.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded-lg text-xs">
                      +{service.images.length - 1} more
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                      {service.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      service.isActive 
                        ? "bg-green-100 text-green-700" 
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-800 mt-1 line-clamp-1" title={service.title}>
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2 flex-grow">
                    {service.description}
                  </p>
                  <p className="text-lg font-bold text-amber-600 mt-2">
                    {formatPrice(service.price)}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEdit(service)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      <FaEdit className="text-xs" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm"
                    >
                      <FaTrash className="text-xs" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingService ? "Edit Service" : "Add New Service"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="Enter price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                      min="1"
                    />
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                {/* Active Status (only when editing) */}
                {editingService && (
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive !== false}
                        onChange={(e) =>
                          setFormData({ ...formData, isActive: e.target.checked })
                        }
                        className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Active (visible on public services page)
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Uncheck to hide from public page while keeping in admin dashboard
                    </p>
                  </div>
                )}

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images (1-4)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    disabled={imageFiles.length >= 4}
                  />
                  {imageFiles.length >= 4 && (
                    <p className="text-sm text-amber-600 mt-1">
                      Maximum 4 images reached. Remove an image to add more.
                    </p>
                  )}
                  
                  {/* Existing Images (when editing) */}
                  {editingService && formData.images.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {formData.images.map((img, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <img
                              src={img.url}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* New Image Previews */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">New Images:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-2">
                    {editingService 
                      ? `${formData.images.length + imageFiles.length} of 4 images (${formData.images.length} existing, ${imageFiles.length} new)`
                      : `${imageFiles.length} of 4 images selected`
                    }
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    {editingService ? "Update" : "Create"} Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
