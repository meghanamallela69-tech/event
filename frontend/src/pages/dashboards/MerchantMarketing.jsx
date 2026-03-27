import { useState, useEffect } from "react";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import { FaEnvelope, FaShareAlt, FaTags, FaUsers, FaChartLine, FaCopy, FaWhatsapp, FaFacebook, FaEdit, FaTrash, FaPlus, FaPaperPlane } from "react-icons/fa";
import { BsMegaphone } from "react-icons/bs";
import axios from "axios";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { toast } from "react-hot-toast";

const MerchantMarketing = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("promotions");
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [events, setEvents] = useState([]);
  
  // Promo code form state
  const [promoForm, setPromoForm] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscount: "",
    minAmount: "",
    expiryDate: "",
    usageLimit: "",
    description: "",
    applyTo: "ALL", // "ALL" or "EVENT"
    eventId: null
  });

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: ""
  });

  // Share link state
  const [shareLinks, setShareLinks] = useState(null);

  useEffect(() => {
    console.log('🔄 Component mounted, loading data...');
    loadPromoCodes();
    loadMerchantEvents();
  }, []);
  
  // Debug: Log when events change
  useEffect(() => {
    if (events.length > 0) {
      console.log('✅ Events state updated:', events.length, 'events available in dropdown');
    } else if (events.length === 0 && promoForm.applyTo === "EVENT") {
      console.warn('⚠️ No events loaded but "Specific Event" is selected');
    }
  }, [events, promoForm.applyTo]);

  // Load promo codes
  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/marketing/promo-codes`,
        { headers: authHeaders(token) }
      );
      if (response.data.success) {
        setPromoCodes(response.data.coupons || []);
      }
    } catch (error) {
      console.error("Failed to load promo codes:", error);
      toast.error("Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  };

  // Load merchant events
  const loadMerchantEvents = async () => {
    try {
      console.log('🔍 Loading merchant events...');
      const response = await axios.get(
        `${API_BASE}/merchant/events`,
        { headers: authHeaders(token) }
      );
      console.log('📦 Events API Response:', response.data);
      if (response.data.success) {
        const eventsList = response.data.events || [];
        console.log('✅ Events loaded:', eventsList.length, 'events');
        console.log('Events data:', eventsList);
        setEvents(eventsList);
      } else {
        console.error('❌ Events API returned success=false');
      }
    } catch (error) {
      console.error("❌ Failed to load events:", error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      toast.error("Failed to load your events. Please refresh the page.");
    }
  };

  // Create promo code
  const handleCreatePromoCode = async (e) => {
    e.preventDefault();
    
    console.log('📤 Submitting coupon form:', promoForm);
    
    if (!promoForm.code || !promoForm.discountValue || !promoForm.expiryDate || !promoForm.usageLimit) {
      toast.error("Please fill all required fields");
      return;
    }
    
    // Validate eventId when applyTo is EVENT
    if (promoForm.applyTo === "EVENT" && !promoForm.eventId) {
      toast.error("Please select an event");
      return;
    }
    
    console.log('✅ Form validated, sending to API...');

    try {
      const response = await axios.post(
        `${API_BASE}/marketing/promo-codes`,
        promoForm,
        { headers: authHeaders(token) }
      );
      
      console.log('📥 API Response:', response.data);

      if (response.data.success) {
        toast.success("Promo code created successfully!");
        setPromoForm({
          code: "",
          discountType: "percentage",
          discountValue: "",
          maxDiscount: "",
          minAmount: "",
          expiryDate: "",
          usageLimit: "",
          description: "",
          applyTo: "ALL",
          eventId: null
        });
        setShowCreateForm(false);
        loadPromoCodes();
      }
    } catch (error) {
      console.error("Create promo code error:", error);
      toast.error(error.response?.data?.message || "Failed to create promo code");
    }
  };

  // Delete promo code
  const handleDeletePromoCode = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promo code?")) return;

    try {
      const response = await axios.delete(
        `${API_BASE}/marketing/promo-codes/${id}`,
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success("Promo code deleted successfully!");
        loadPromoCodes();
      }
    } catch (error) {
      console.error("Delete promo code error:", error);
      toast.error("Failed to delete promo code");
    }
  };

  // Generate share link
  const handleGenerateShareLink = async (eventId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/marketing/share-link/${eventId}`,
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        setShareLinks(response.data.shareLinks);
        toast.success("Share links generated!");
      }
    } catch (error) {
      console.error("Generate share link error:", error);
      toast.error("Failed to generate share link");
    }
  };

  // Copy link to clipboard
  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  // Send notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    
    if (!notificationForm.title || !notificationForm.message) {
      toast.error("Please fill both title and message");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/marketing/send-notification`,
        {
          ...notificationForm,
          eventId: selectedEvent || null
        },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        toast.success(`Notification sent to ${response.data.count} user(s)!`);
        setNotificationForm({ title: "", message: "" });
        setSelectedEvent("");
      }
    } catch (error) {
      console.error("Send notification error:", error);
      toast.error(error.response?.data?.message || "Failed to send notification");
    }
  };

  const marketingTools = [
    {
      id: "promotions",
      title: "Promotions & Discounts",
      icon: FaTags,
      description: "Create promotional offers and discount codes"
    },
    {
      id: "shareLinks",
      title: "Share Links",
      icon: FaShareAlt,
      description: "Generate and share event links"
    },
    {
      id: "notifications",
      title: "Send Notifications",
      icon: FaPaperPlane,
      description: "Send push notifications to users"
    }
  ];

  return (
    <MerchantLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Marketing Tools</h2>
        <p className="text-gray-600 mt-1">Promote your events and increase bookings</p>
      </div>

      {/* Stats Overview - 4 cards per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <FaTags className="text-white text-3xl" />
            </div>
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full font-medium">Active</span>
          </div>
          <h3 className="text-3xl font-bold mb-1 text-gray-900">{promoCodes.filter(c => c.status === 'active').length}</h3>
          <p className="text-sm text-gray-700 font-medium">Active Promo Codes</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <FaUsers className="text-white text-3xl" />
            </div>
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full font-medium">Reach</span>
          </div>
          <h3 className="text-3xl font-bold mb-1 text-gray-900">{events.length}</h3>
          <p className="text-sm text-gray-700 font-medium">Events to Promote</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-lg">
              <FaShareAlt className="text-white text-3xl" />
            </div>
            <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full font-medium">Shares</span>
          </div>
          <h3 className="text-3xl font-bold mb-1 text-gray-900">--</h3>
          <p className="text-sm text-gray-700 font-medium">Total Shares</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border border-orange-200 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500 rounded-lg">
              <BsMegaphone className="text-white text-3xl" />
            </div>
            <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full font-medium">Engagement</span>
          </div>
          <h3 className="text-3xl font-bold mb-1 text-gray-900">--</h3>
          <p className="text-sm text-gray-700 font-medium">Notifications Sent</p>
        </div>
      </div>

      {/* Marketing Tools Menu - 4 cards per row */}
      <div className="mb-8">
        <h3 className="font-semibold text-lg mb-4">Marketing Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketingTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={`p-6 rounded-xl border-2 cursor-pointer transition hover:shadow-lg ${
                activeTab === tool.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <tool.icon className={`text-4xl ${activeTab === tool.id ? "text-blue-600" : "text-gray-500"}`} />
                <div>
                  <h4 className={`font-semibold ${activeTab === tool.id ? "text-blue-900" : "text-gray-900"}`}>
                    {tool.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{tool.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === "promotions" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-lg">Promo Codes</h3>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <FaPlus /> Create Promo Code
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreatePromoCode} className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium mb-4">Create New Promo Code</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                    <input
                      type="text"
                      value={promoForm.code}
                      onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="SAVE20"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type *</label>
                    <select
                      value={promoForm.discountType}
                      onChange={(e) => setPromoForm({ ...promoForm, discountType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value *</label>
                    <input
                      type="number"
                      value={promoForm.discountValue}
                      onChange={(e) => setPromoForm({ ...promoForm, discountValue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="20"
                      required
                    />
                  </div>
                  {promoForm.discountType === "percentage" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount (₹)</label>
                      <input
                        type="number"
                        value={promoForm.maxDiscount}
                        onChange={(e) => setPromoForm({ ...promoForm, maxDiscount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="500"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount (₹)</label>
                    <input
                      type="number"
                      value={promoForm.minAmount}
                      onChange={(e) => setPromoForm({ ...promoForm, minAmount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit *</label>
                    <input
                      type="number"
                      value={promoForm.usageLimit}
                      onChange={(e) => setPromoForm({ ...promoForm, usageLimit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="100"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                    <input
                      type="date"
                      value={promoForm.expiryDate}
                      onChange={(e) => setPromoForm({ ...promoForm, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apply To *</label>
                    <select
                      value={promoForm.applyTo}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        console.log('🎯 Apply To changed to:', selectedValue);
                        setPromoForm({ 
                          ...promoForm, 
                          applyTo: selectedValue,
                          eventId: selectedValue === "ALL" ? null : promoForm.eventId 
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ALL">All Events</option>
                      <option value="EVENT">Specific Event</option>
                    </select>
                  </div>
                  
                  {promoForm.applyTo === "EVENT" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Event *</label>
                      <select
                        value={promoForm.eventId || ""}
                        onChange={(e) => {
                          const selectedEventId = e.target.value;
                          console.log('📅 Selected Event ID:', selectedEventId);
                          setPromoForm({ ...promoForm, eventId: selectedEventId });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Choose an event...</option>
                        {events.length === 0 ? (
                          <option disabled>No events available</option>
                        ) : (
                          events.map((event, index) => {
                            console.log(`Event ${index}:`, event);
                            return (
                              <option key={event._id} value={event._id}>
                                {event.title} {event.date ? `- ${new Date(event.date).toLocaleDateString()}` : ''}
                              </option>
                            );
                          })
                        )}
                      </select>
                      {events.length === 0 && (
                        <p className="text-xs text-orange-600 mt-1">
                          ⚠️ You haven't created any events yet. <br/>
                          <button 
                            type="button"
                            onClick={() => {
                              console.log('Navigating to create event...');
                              window.location.href = '/merchant/events/create';
                            }}
                            className="underline hover:text-orange-800"
                          >
                            Create your first event
                          </button>
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={promoForm.description}
                      onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Describe your promo code..."
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Create Promo Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Promo Codes List */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : promoCodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaTags className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No promo codes yet. Create your first promo code!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {promoCodes.map((code) => (
                  <div key={code._id} className="p-4 border rounded-lg hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-lg text-blue-600">{code.code}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            code.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {code.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Discount:</span>
                            <span className="ml-2 font-medium">
                              {code.discountType === 'percentage' ? `${code.discountValue}%` : `₹${code.discountValue}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Used:</span>
                            <span className="ml-2 font-medium">{code.usedCount}/{code.usageLimit}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Expires:</span>
                            <span className="ml-2 font-medium">
                              {new Date(code.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Remaining:</span>
                            <span className="ml-2 font-medium">{code.remainingUsage}</span>
                          </div>
                        </div>
                        {code.description && (
                          <p className="text-sm text-gray-600 mt-2">{code.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeletePromoCode(code._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "shareLinks" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-lg mb-6">Share Event Links</h3>
            
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaShareAlt className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No events found. Create an event to share!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => {
                      setSelectedEvent(e.target.value);
                      handleGenerateShareLink(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select an event --</option>
                    {events.map(event => (
                      <option key={event._id} value={event._id}>{event.title}</option>
                    ))}
                  </select>
                </div>

                {shareLinks && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Direct Link</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={shareLinks.direct}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                        />
                        <button
                          onClick={() => handleCopyLink(shareLinks.direct)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <FaCopy /> Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Share on Social Media</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <a
                          href={shareLinks.whatsapp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 border-2 border-green-500 rounded-lg hover:bg-green-50 transition flex flex-col items-center gap-2"
                        >
                          <FaWhatsapp className="text-green-600 text-2xl" />
                          <span className="text-sm font-medium">WhatsApp</span>
                        </a>
                        <a
                          href={shareLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition flex flex-col items-center gap-2"
                        >
                          <FaFacebook className="text-blue-600 text-2xl" />
                          <span className="text-sm font-medium">Facebook</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="font-semibold text-lg mb-6">Send Notifications</h3>
            
            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Event (Optional)</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- No specific event --</option>
                  {events.map(event => (
                    <option key={event._id} value={event._id}>{event.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Special Offer Just for You!"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  placeholder="Write your promotional message here..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FaPaperPlane /> Send Notification to All Users
              </button>
            </form>
          </div>
        )}
      </div>  {/* Close Tab Content div */}
    </MerchantLayout>
  );
};

export default MerchantMarketing;
