import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import useAuth from "./useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const useNotificationBadges = () => {
  const { token } = useAuth();
  const [badgeCounts, setBadgeCounts] = useState({
    bookings: 0,
    payments: 0,
    total: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(false);

  // Fetch unread counts
  const fetchUnreadCounts = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/notifications/unread-counts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setBadgeCounts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching unread counts:", error);
    }
  }, [token]);

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/notifications/mark-all-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Refresh counts to get accurate state
        await fetchUnreadCounts();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Mark specific notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/v1/notifications/${notificationId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Refresh counts
        await fetchUnreadCounts();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Reset booking badge only
  const resetBookingBadge = useCallback(async () => {
    try {
      // Mark all booking-type notifications as read
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/notifications/mark-booking-read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Refresh counts to get accurate state
        await fetchUnreadCounts();
      }
    } catch (error) {
      console.error("Error resetting booking badge:", error);
      // Fallback: just refresh counts
      await fetchUnreadCounts();
    }
  }, [token, fetchUnreadCounts]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    fetchUnreadCounts();
    
    const interval = setInterval(fetchUnreadCounts, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchUnreadCounts]);

  return {
    badgeCounts,
    refreshBadges: fetchUnreadCounts,
    markAllAsRead,
    markAsRead,
    resetBookingBadge,
  };
};

export default useNotificationBadges;
