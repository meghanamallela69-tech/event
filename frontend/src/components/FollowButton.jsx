import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaUserPlus, FaUserCheck } from "react-icons/fa";
import axios from "axios";
import { API_BASE, authHeaders } from "../lib/http";
import useAuth from "../context/useAuth";
import toast from "react-hot-toast";

const FollowButton = ({ merchantId, merchantName, size = "md", className = "" }) => {
  const { token } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  useEffect(() => {
    checkFollowStatus();
  }, [merchantId]);

  const checkFollowStatus = async () => {
    if (!token || !merchantId) return;
    
    try {
      setCheckingStatus(true);
      const response = await axios.get(
        `${API_BASE}/follow/status/${merchantId}`,
        { headers: authHeaders(token) }
      );
      
      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
      }
    } catch (error) {
      console.error("Check follow status error:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!token) {
      toast.error("Please login to follow merchants");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/follow/${merchantId}`,
        {},
        { headers: authHeaders(token) }
      );

      if (response.data.success) {
        setIsFollowing(response.data.isFollowing);
        toast.success(
          response.data.isFollowing 
            ? `Now following ${merchantName}!` 
            : `Unfollowed ${merchantName}`
        );
      } else {
        throw new Error(response.data.message || "Follow action failed");
      }
    } catch (error) {
      console.error("Toggle follow error:", error);
      toast.error(error.response?.data?.message || "Failed to follow/unfollow merchant");
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <button 
        disabled 
        className={`${sizeClasses[size]} ${className} bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed flex items-center gap-2`}
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        Loading...
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`${sizeClasses[size]} ${className} ${
        isFollowing
          ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
          : "bg-purple-600 text-white hover:bg-purple-700"
      } rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          {isFollowing ? "Unfollowing..." : "Following..."}
        </>
      ) : (
        <>
          {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
          {isFollowing ? "Following" : "Follow"}
        </>
      )}
    </button>
  );
};

FollowButton.propTypes = {
  merchantId: PropTypes.string.isRequired,
  merchantName: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default FollowButton;