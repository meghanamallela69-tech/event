/**
 * Calculates the status of an event based on its date and time.
 * @param {Object} event - The event object.
 * @returns {Object} - An object containing label, bg class, and text class.
 */
export const getEventStatus = (event) => {
  if (!event || !event.date) return { label: "Upcoming", bg: "bg-blue-100", text: "text-blue-700" };

  const now = new Date();
  const start = new Date(event.date);
  if (event.time) {
    const [hours, minutes] = event.time.split(":");
    start.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  }

  const end = new Date(start.getTime() + (event.duration || 1) * 60 * 60 * 1000);

  if (now >= start && now <= end) {
    return { label: "Live", bg: "bg-green-100", text: "text-green-700" };
  } else if (now > end) {
    return { label: "Completed", bg: "bg-gray-200", text: "text-gray-700" };
  } else {
    return { label: "Upcoming", bg: "bg-blue-100", text: "text-blue-700" };
  }
};
