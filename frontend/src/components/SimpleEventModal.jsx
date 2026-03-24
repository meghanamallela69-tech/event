import React from "react";
import PropTypes from "prop-types";

const SimpleEventModal = ({ selectedEvent, setSelectedEvent, onBookNow }) => {
  if (!selectedEvent) return null;

  // Default features if not provided
  const defaultFeatures = [
    "Professional Photography",
    "Catering & Refreshments", 
    "Live Entertainment",
    "Decoration & Setup",
    "Sound & Lighting",
    "Event Coordinator"
  ];

  const features = selectedEvent.features && selectedEvent.features.length > 0 
    ? selectedEvent.features 
    : defaultFeatures;

  const eventImages = selectedEvent.images && selectedEvent.images.length > 0 
    ? selectedEvent.images.map(img => img.url || img) 
    : ["/party.jpg"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[700px] max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          className="absolute top-3 right-4 text-xl hover:text-gray-700 transition-colors"
          onClick={() => setSelectedEvent(null)}
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-2">
          {selectedEvent.title}
        </h2>
        
        <p className="text-gray-600 mb-4">
          {selectedEvent.description}
        </p>

        <h3 className="font-semibold mb-2">Gallery</h3>
        <div className="flex gap-4 mb-4 overflow-x-auto">
          {eventImages.map((img, i) => (
            <img 
              key={i} 
              src={img} 
              alt={`Event image ${i + 1}`}
              className="w-40 h-24 object-cover rounded flex-shrink-0" 
            />
          ))}
        </div>

        <h3 className="font-semibold mb-2">What's Included</h3>
        <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
          {features.map((f, i) => (
            <li key={i}>• {f}</li>
          ))}
        </ul>

        <div className="bg-gray-100 p-3 rounded mb-4">
          Organizer: {selectedEvent.createdBy?.name || selectedEvent.merchantName || "Event Organizer"}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900">
            ₹{selectedEvent.price ? selectedEvent.price.toLocaleString() : "Free"}
          </span>
          
          <button 
            className="font-semibold px-6 py-3 rounded-lg transition-colors"
            onClick={() => onBookNow && onBookNow(selectedEvent)}
            style={{ 
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#6d28d9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#7c3aed'}
          >
            <span style={{ color: 'white' }}>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

SimpleEventModal.propTypes = {
  selectedEvent: PropTypes.object,
  setSelectedEvent: PropTypes.func.isRequired,
  onBookNow: PropTypes.func
};

export default SimpleEventModal;