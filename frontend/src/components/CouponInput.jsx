import { useState } from "react";
import axios from "axios";
import { API_BASE, authHeaders } from "../lib/http";
import toast from "react-hot-toast";
import { FaTicketAlt, FaTimes, FaSpinner } from "react-icons/fa";

const CouponInput = ({ 
  totalAmount, 
  eventId, 
  onCouponApplied, 
  onCouponRemoved, 
  token,
  appliedCoupon = null 
}) => {
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponData, setCouponData] = useState(appliedCoupon);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(
        `${API_BASE}/coupons/apply`,
        {
          code: couponCode.trim(),
          totalAmount: totalAmount,
          eventId: eventId
        },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        const couponResult = response.data;
        setCouponData(couponResult);
        toast.success(`Coupon applied! You saved ₹${couponResult.discountAmount}`);
        
        // Notify parent component
        if (onCouponApplied) {
          onCouponApplied(couponResult);
        }
      }
    } catch (error) {
      console.error("Apply coupon error:", error);
      toast.error(error.response?.data?.message || "Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setLoading(true);
    
    try {
      const response = await axios.post(
        `${API_BASE}/coupons/remove`,
        { totalAmount: totalAmount },
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        setCouponData(null);
        setCouponCode("");
        toast.success("Coupon removed");
        
        // Notify parent component
        if (onCouponRemoved) {
          onCouponRemoved();
        }
      }
    } catch (error) {
      console.error("Remove coupon error:", error);
      toast.error("Failed to remove coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApplyCoupon();
    }
  };

  return (
    <div className="space-y-4">
      {/* Coupon Input */}
      {!couponData && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FaTicketAlt className="text-blue-500" />
            <span className="font-medium text-gray-900">Have a coupon code?</span>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Enter coupon code"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={loading || !couponCode.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <FaSpinner className="animate-spin" /> : null}
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Applied Coupon Display */}
      {couponData && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FaTicketAlt className="text-green-600" />
              <span className="font-medium text-green-800">
                Coupon Applied: {couponData.coupon?.code}
              </span>
            </div>
            <button
              onClick={handleRemoveCoupon}
              disabled={loading}
              className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
              title="Remove coupon"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaTimes />}
            </button>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Original Amount:</span>
              <span className="line-through text-gray-500">₹{couponData.originalAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Discount ({couponData.coupon?.discountType === "percentage" ? `${couponData.coupon?.discountValue}%` : `₹${couponData.coupon?.discountValue}`}):</span>
              <span className="text-green-700 font-medium">-₹{couponData.discountAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-green-200 pt-1">
              <span className="font-medium text-green-800">Final Amount:</span>
              <span className="font-bold text-green-800">₹{couponData.finalAmount?.toLocaleString()}</span>
            </div>
            <div className="text-xs text-green-600 mt-2">
              🎉 You saved ₹{couponData.savings?.toLocaleString()}!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponInput;