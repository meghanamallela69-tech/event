import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { API_BASE } from "../lib/http";
import useAuth from "../context/useAuth";

/**
 * COMPLETE WORKING BOOKING MODAL WITH COUPON SYSTEM
 * This is a clean, working implementation
 */
const BookingModalSimple = ({ service, isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  
  // State management
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  
  // Calculate total (simple version)
  const calculateTotal = () => {
    return service?.price || 1000;
  };
  
  // Fetch coupons when modal opens
  useEffect(() => {
    if (isOpen && service?._id) {
      fetchCoupons();
    }
  }, [isOpen, service]);
  
  // Fetch coupons from API
  const fetchCoupons = async () => {
    try {
      console.log('🔍 Fetching coupons for service:', service.title);
      
      const amount = calculateTotal();
      const url = `${API_BASE}/coupons/available?eventId=${service._id}&totalAmount=${amount}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📦 Coupon API Response:', response.data);
      
      if (response.data.success) {
        const coupons = response.data.coupons || [];
        console.log('✅ Found', coupons.length, 'coupons');
        setAvailableCoupons(coupons);
      } else {
        console.warn('⚠️ API returned success=false');
        setAvailableCoupons([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch coupons:', error.message);
      setAvailableCoupons([]);
      toast.error('Unable to load coupons');
    }
  };
  
  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_BASE}/coupons/apply`,
        {
          couponCode: couponCode.toUpperCase(),
          totalAmount: calculateTotal(),
          eventId: service._id
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setAppliedCoupon(response.data.coupon);
        setDiscount(response.data.discountAmount);
        toast.success(`Coupon applied! You saved ₹${response.data.discountAmount}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon');
    }
  };
  
  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    toast.success('Coupon removed');
  };
  
  if (!isOpen || !service) return null;
  
  const originalTotal = calculateTotal();
  const finalTotal = originalTotal - discount;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">Book Now</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Service Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold text-gray-800">{service.title}</h4>
            <p className="text-sm text-gray-600 mt-1">Price: ₹{originalTotal}</p>
          </div>
          
          {/* Coupons Section */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🎟️ Have a Promo Code?
            </h4>
            
            {/* Applied Coupon Display */}
            {appliedCoupon ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="font-bold text-green-800">{appliedCoupon.code}</div>
                      <div className="text-xs text-green-700">
                        {appliedCoupon.discountType === 'percentage' 
                          ? `${appliedCoupon.discountValue}% OFF` 
                          : `₹${appliedCoupon.discountValue} OFF`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="text-sm text-green-700">
                  Discount Applied: ₹{discount}
                </div>
              </div>
            ) : (
              /* Coupon Input & List */
              <>
                {/* Available Coupons Dropdown */}
                {availableCoupons.length > 0 && (
                  <div className="mb-3">
                    <details className="group">
                      <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium list-none">
                        🏷️ Available Offers ({availableCoupons.length}) ▼
                      </summary>
                      <div className="mt-2 space-y-2">
                        {availableCoupons.map((coupon) => (
                          <div
                            key={coupon._id}
                            onClick={() => {
                              setCouponCode(coupon.code);
                              toast.success(`Selected ${coupon.code}. Click Apply.`);
                            }}
                            className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-bold text-yellow-900">{coupon.code}</div>
                                <div className="text-xs text-yellow-700">
                                  {coupon.discountType === 'percentage' 
                                    ? `${coupon.discountValue}% OFF` 
                                    : `₹${coupon.discountValue} OFF`}
                                  {coupon.minAmount > 0 && ` | Min: ₹${coupon.minAmount}`}
                                </div>
                              </div>
                              <button className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300">
                                Select
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
                
                {/* Empty State */}
                {availableCoupons.length === 0 && (
                  <p className="text-xs text-gray-500 mb-3">No offers available</p>
                )}
                
                {/* Manual Entry */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Apply
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Price Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Original Amount</span>
              <span className="font-medium text-gray-700">₹{originalTotal}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Discount</span>
                <span className="font-semibold text-green-600">-₹{discount}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-base font-semibold text-gray-800">Total</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">₹{finalTotal}</div>
                {discount > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    🎉 You saved ₹{discount}!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSuccess({ total: finalTotal, coupon: appliedCoupon })}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModalSimple;
