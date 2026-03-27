import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import MerchantLayout from "../../components/merchant/MerchantLayout";
import toast from "react-hot-toast";
import { FiUpload, FiX, FiImage, FiCalendar, FiClock, FiMapPin, FiTag, FiPlus, FiTrash2 } from "react-icons/fi";
import { FaHandshake, FaTicketAlt, FaCrown, FaUser } from "react-icons/fa";

// ── Event Type Selection Modal ──────────────────────────────────────────────
const EventTypeModal = ({ onSelect }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Choose Event Type</h2>
      <p className="text-gray-500 text-center mb-8">Select how you want to offer this event</p>

      <div className="grid grid-cols-2 gap-4">
        {/* Full Service */}
        <button
          type="button"
          onClick={() => onSelect("full-service")}
          className="group flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition">
            <FaHandshake className="text-blue-600 text-2xl" />
          </div>
          <span className="font-semibold text-gray-800 text-center">Full Service Event</span>
          <span className="text-xs text-gray-500 text-center leading-relaxed">
            Client books your service for a fixed price. No ticket limit.
          </span>
        </button>

        {/* Ticketed */}
        <button
          type="button"
          onClick={() => onSelect("ticketed")}
          className="group flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 cursor-pointer"
        >
          <div className="w-14 h-14 rounded-full bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition">
            <FaTicketAlt className="text-purple-600 text-2xl" />
          </div>
          <span className="font-semibold text-gray-800 text-center">Ticketed Event</span>
          <span className="text-xs text-gray-500 text-center leading-relaxed">
            Sell tickets with a fixed date, time and total capacity.
          </span>
        </button>
      </div>
    </div>
  </div>
);

// ── Main Component ──────────────────────────────────────────────────────────
const MerchantCreateEvent = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [eventType, setEventType] = useState(null); // null = show modal
  const [loading, setLoading] = useState(false);
  const [merchantCategories, setMerchantCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    // location & schedule
    location: "",
    date: "",
    time: "",
    duration: "1",
    // ticketed event type
    ticketedEventType: "upcoming", // "live" or "upcoming"
  });

  // Ticket types state — pre-seeded with Regular & VIP
  const [ticketTypes, setTicketTypes] = useState([
    { name: "Regular", price: "", quantity: "" },
    { name: "VIP", price: "", quantity: "" },
  ]);

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Add-on features state (full-service only)
  const ADDON_PRESETS = ["Photography", "Decoration", "Catering", "DJ / Music", "Lighting", "Videography", "Stage Setup", "Valet Parking"];
  const [addons, setAddons] = useState([{ name: "", price: "" }]);

  const handleAddAddon = () => setAddons((p) => [...p, { name: "", price: "" }]);
  const handleRemoveAddon = (i) => {
    if (addons.length <= 1) { setAddons([{ name: "", price: "" }]); return; }
    setAddons((p) => p.filter((_, idx) => idx !== i));
  };
  const handleAddonChange = (i, field, value) =>
    setAddons((p) => p.map((a, idx) => idx === i ? { ...a, [field]: value } : a));
  const handleAddonPreset = (i, name) =>
    setAddons((p) => p.map((a, idx) => idx === i ? { ...a, name } : a));

  // Fetch merchant categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await axios.get(`${API_BASE}/api/v1/categories`, {
          headers: authHeaders(token),
        });
        if (response.data.success) {
          setMerchantCategories(response.data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 4) {
      toast.error("You can upload maximum 4 images");
      return;
    }
    const newImages = [];
    const newPreviews = [];
    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB.`);
        return;
      }
      newImages.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === newImages.length) {
          setImages((p) => [...p, ...newImages]);
          setImagePreviews((p) => [...p, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (i) => {
    setImages((p) => p.filter((_, idx) => idx !== i));
    setImagePreviews((p) => p.filter((_, idx) => idx !== i));
  };

  // ── Ticket type handlers ──
  const handleTicketTypeChange = (index, field, value) => {
    setTicketTypes((prev) => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const handleAddTicketType = () => {
    setTicketTypes((prev) => [...prev, { name: "", price: "", quantity: "" }]);
  };

  const handleRemoveTicketType = (index) => {
    if (ticketTypes.length <= 1) { toast.error("At least one ticket type is required"); return; }
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (images.length === 0) { toast.error("Please upload at least one image"); return; }
    if (eventType === "ticketed") {
      if (!form.date) { toast.error("Date is required for ticketed events"); return; }
      if (!form.time) { toast.error("Time is required for ticketed events"); return; }
      // Validate ticket types
      for (let i = 0; i < ticketTypes.length; i++) {
        const t = ticketTypes[i];
        if (!t.name.trim()) { toast.error(`Ticket type ${i + 1}: name is required`); return; }
        if (t.price === "" || Number(t.price) < 0) { toast.error(`Ticket type "${t.name}": price is required`); return; }
        if (!t.quantity || Number(t.quantity) < 1) { toast.error(`Ticket type "${t.name}": quantity must be at least 1`); return; }
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("eventType", eventType);
      formData.append("location", form.location);

      if (eventType === "ticketed") {
        formData.append("date", form.date);
        formData.append("time", form.time);
        formData.append("duration", form.duration || 1);
        formData.append("ticketedEventType", form.ticketedEventType || "upcoming"); // NEW FIELD
        formData.append("ticketTypes", JSON.stringify(
          ticketTypes.map((t) => ({
            name: t.name.trim(),
            price: Number(t.price) || 0,
            quantity: Number(t.quantity) || 0,
          }))
        ));
        // price will be calculated from lowest ticketType price in backend
      } else {
        formData.append("price", form.price === "" ? 0 : Number(form.price));
        // Add-ons for full-service events
        formData.append("addons", JSON.stringify(
          addons
            .filter(a => a.name.trim())
            .map(a => ({ name: a.name.trim(), price: Number(a.price) || 0 }))
        ));
      }

      images.forEach((img) => formData.append("images", img));

      const { data } = await axios.post(`${API_BASE}/merchant/events`, formData, {
        headers: authHeaders(token),
      });
      toast.success("Event created successfully!");
      navigate("/dashboard/merchant/events");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["Conference", "Music", "Food", "Tech", "Wedding", "Party", "Outdoor", "Birthday", "Anniversary", "Other"];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <MerchantLayout>
      {/* Event Type Modal */}
      {!eventType && <EventTypeModal onSelect={setEventType} />}

      <section className="mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold">Create Event</h2>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-gray-600">Fields marked with * are required</p>
          {eventType && (
            <span
              className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold ${
                eventType === "ticketed"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {eventType === "ticketed" ? <FaTicketAlt /> : <FaHandshake />}
              {eventType === "ticketed" ? "Ticketed Event" : "Full Service Event"}
            </span>
          )}
          {eventType && (
            <button
              type="button"
              onClick={() => setEventType(null)}
              className="text-xs text-gray-400 hover:text-gray-600 underline ml-2"
            >
              Change
            </button>
          )}
        </div>
      </section>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg ring-1 ring-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event title (required)"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your event in detail..."
              />
            </div>

            {/* Category + Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {loadingCategories ? (
                    <option disabled>Loading categories...</option>
                  ) : merchantCategories.length > 0 ? (
                    merchantCategories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))
                  ) : (
                    <option disabled>No categories available</option>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Don't see your category? <a href="/dashboard/merchant/categories" target="_blank" className="text-blue-600 hover:underline">Create one</a>
                </p>
              </div>

              {eventType !== "ticketed" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0 for free"
                  />
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FiMapPin className="inline mr-1" />
                Location
                {eventType === "ticketed" && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Hyderabad, India"
              />
            </div>

            {/* ── Ticketed-only fields ── */}
            {eventType === "ticketed" && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-purple-800 flex items-center gap-2">
                  <FaTicketAlt /> Ticketed Event Details
                </h3>

                {/* Event Type Selection (Live/Upcoming) - NEW */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Status *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-purple-50 hover:border-purple-400 bg-white">
                      <input
                        type="radio"
                        name="ticketedEventType"
                        value="live"
                        checked={form.ticketedEventType === "live"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-800">Live Event</span>
                        <p className="text-xs text-gray-500 mt-1">Happening right now</p>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    </label>

                    <label className="relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-purple-50 hover:border-purple-400 bg-white">
                      <input
                        type="radio"
                        name="ticketedEventType"
                        value="upcoming"
                        checked={form.ticketedEventType === "upcoming"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <span className="font-semibold text-gray-800">Upcoming Event</span>
                        <p className="text-xs text-gray-500 mt-1">Scheduled for the future</p>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    </label>
                  </div>
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiCalendar className="inline mr-1" />
                      Event Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiClock className="inline mr-1" />
                      Event Time *
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                  <input
                    type="number"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    min="1"
                    max="72"
                    className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. 2"
                  />
                </div>

                {/* ── Ticket Types ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <FaTicketAlt className="text-purple-600" /> Ticket Types *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddTicketType}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    >
                      <FiPlus size={12} /> Add Type
                    </button>
                  </div>

                  <div className="space-y-3">
                    {ticketTypes.map((ticket, i) => (
                      <div key={i} className="flex items-center gap-2 bg-white border border-purple-200 rounded-lg px-3 py-2.5 shadow-sm">
                        {/* Icon by name */}
                        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-purple-100">
                          {ticket.name.toLowerCase() === "vip"
                            ? <FaCrown className="text-yellow-500 text-sm" />
                            : <FaUser className="text-purple-500 text-sm" />
                          }
                        </div>

                        {/* Name */}
                        <input
                          type="text"
                          value={ticket.name}
                          onChange={(e) => handleTicketTypeChange(i, "name", e.target.value)}
                          placeholder="Type (e.g. VIP)"
                          className="flex-1 min-w-0 border-0 outline-none text-sm font-medium text-gray-800 bg-transparent placeholder-gray-400"
                        />

                        {/* Price */}
                        <div className="flex items-center gap-1 border-l pl-2">
                          <span className="text-gray-500 text-xs">₹</span>
                          <input
                            type="number"
                            value={ticket.price}
                            onChange={(e) => handleTicketTypeChange(i, "price", e.target.value)}
                            placeholder="Price"
                            min="0"
                            className="w-20 border-0 outline-none text-sm text-gray-700 bg-transparent"
                          />
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-1 border-l pl-2">
                          <FaTicketAlt className="text-gray-400 text-xs" />
                          <input
                            type="number"
                            value={ticket.quantity}
                            onChange={(e) => handleTicketTypeChange(i, "quantity", e.target.value)}
                            placeholder="Qty"
                            min="1"
                            className="w-16 border-0 outline-none text-sm text-gray-700 bg-transparent"
                          />
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveTicketType(i)}
                          className="flex-shrink-0 p-1 text-red-400 hover:text-red-600 transition"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  {ticketTypes.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 flex gap-4">
                      <span>Total capacity: <strong className="text-purple-700">{ticketTypes.reduce((s, t) => s + (Number(t.quantity) || 0), 0)}</strong></span>
                      <span>Prices: <strong className="text-purple-700">
                        {ticketTypes.filter(t => t.price !== "").map(t => `₹${Number(t.price).toLocaleString('en-IN')}`).join(" · ") || "—"}
                      </strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add-on Features (Full Service) */}
            {eventType !== "ticketed" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                    <FiPlus className="text-blue-600" /> Add-on Features
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddAddon}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <FiPlus size={12} /> Add More
                  </button>
                </div>

                <div className="space-y-3">
                  {addons.map((addon, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-3 py-2.5 shadow-sm">
                      {/* Preset dropdown */}
                      <select
                        value={ADDON_PRESETS.includes(addon.name) ? addon.name : ""}
                        onChange={(e) => handleAddonPreset(i, e.target.value)}
                        className="flex-shrink-0 w-28 border-0 outline-none text-sm text-gray-600 bg-gray-100 rounded px-2 py-1"
                      >
                        <option value="">Custom</option>
                        {ADDON_PRESETS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>

                      {/* Name input */}
                      <input
                        type="text"
                        value={addon.name}
                        onChange={(e) => handleAddonChange(i, "name", e.target.value)}
                        placeholder="Feature name (e.g. Photography)"
                        className="flex-1 min-w-0 border-0 outline-none text-sm font-medium text-gray-800 bg-transparent placeholder-gray-400"
                      />

                      {/* Price input */}
                      <div className="flex items-center gap-1 border-l pl-2">
                        <span className="text-gray-500 text-xs">₹</span>
                        <input
                          type="number"
                          value={addon.price}
                          onChange={(e) => handleAddonChange(i, "price", e.target.value)}
                          placeholder="Price"
                          min="0"
                          className="w-20 border-0 outline-none text-sm text-gray-700 bg-transparent"
                        />
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => handleRemoveAddon(i)}
                        className="flex-shrink-0 p-1 text-red-400 hover:text-red-600 transition"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                {addons.filter(a => a.name.trim()).length > 0 && (
                  <div className="text-xs text-gray-500">
                    Total add-ons value: <strong className="text-blue-700">
                      ₹{addons.reduce((s, a) => s + (Number(a.price) || 0), 0).toLocaleString('en-IN')}
                    </strong>
                    {addons.filter(a => a.name.trim()).length > 0 && (
                      <span className="ml-2">({addons.filter(a => a.name.trim()).length} items)</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Images *</label>
              <p className="text-xs text-gray-500 mb-2">At least 1 image required (max 4)</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="images" className="cursor-pointer flex flex-col items-center gap-2">
                  <FiImage className="text-gray-400 text-4xl" />
                  <div>
                    <span className="text-blue-600 hover:text-blue-700 font-medium">Click to upload</span>
                    <span className="text-gray-500"> or drag and drop</span>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB (max 4 images)</p>
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                      <img src={preview} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/dashboard/merchant/events")}
                className="flex-1 px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !eventType}
                className="flex-1 px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 font-medium"
              >
                {loading ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MerchantLayout>
  );
};

export default MerchantCreateEvent;
