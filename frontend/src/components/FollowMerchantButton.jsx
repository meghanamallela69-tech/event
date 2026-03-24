import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE, authHeaders } from "../lib/http";
import useAuth from "../context/useAuth";
import toast from "react-hot-toast";
import { FaHeart, FaRegHeart, FaSpinner } from "react-icons/fa";

const FollowMerchantButton = ({ merchantId, merchantName, className = "" }) => {
  const { token, user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (token && merchantId && user?.role === "user") {
      checkFollowStatus();
    } else {
      setCheckingStatus(false);
    }
  }, [token, merchantId, user]);

  const checkFollowStatus = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/follow/status/${merchantId}`,
        { headers: authHeaders(token) }
      );
      
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!token) {
      toast.error("Please login to follow merchants");
      return;
    }

    if (user?.role !== "user") {
      toast.error("Only users can follow merchants");
      return;
    }

    setLoading(true);

    try {
      let response;
      
      if (isFollowing) {
        // Unfollow
        response = await axios.delete(
          `${API_BASE}/follow/unfollow/${merchantId}`,
          { headers: authHeaders(token) }
        );
      } else {
        // Follow
        response = await axios.post(
          `${API_BASE}/follow/follow/${merchantId}`,
          {},
          { headers: authHeaders(token) }
        );
      }

      if (response.data.success) {
        setIsFollowing(!isFollowing);
        toast.success(
          isFollowing 
            ? `Unfollowed ${merchantName || "merchant"}` 
            : `Now following ${merchantName || "merchant"}`
        );
      } else {
        toast.error(response.data.message || "Failed to update follow status");
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error(error.response?.data?.message || "Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if user is not logged in or not a user role
  if (!token || user?.role !== "user" || checkingStatus) {
    return null;
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
        isFollowing
          ? "bg-red-100 text-red-700 hover:bg-red-200"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
      } ${className}`}
    >
      {loading ? (
        <FaSpinner className="animate-spin text-sm" />
      ) : isFollowing ? (
        <FaHeart className="text-sm" />
      ) : (
        <FaRegHeart className="text-sm" />
      )}
      <span className="text-sm">
        {loading ? "..." : isFollowing ? "Following" : "Follow"}
      </span>
    </button>
  );
};

export default FollowMerchantButton;