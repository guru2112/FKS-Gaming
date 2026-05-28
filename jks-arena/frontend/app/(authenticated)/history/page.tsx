"use client";

import { useEffect, useState } from "react";
import { fetchBookings, type Booking } from "@/lib/auth";
import RecentSessionsTable from "@/components/dashboard/RecentSessionsTable";
import UserRescheduleModal from "@/components/UserRescheduleModal";

export default function HistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);

  const loadData = () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    fetchBookings(token)
      .then((data) => {
        setBookings(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // Initial load
    loadData();

    // 5-second background polling
    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRescheduleSuccess = () => {
    setRescheduleBooking(null);
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-8 h-8 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-6 max-w-[1200px] mx-auto pb-24 md:pb-6">
      <RecentSessionsTable 
        bookings={bookings} 
        onReschedule={(b) => setRescheduleBooking(b)} 
      />
      {rescheduleBooking && (
        <UserRescheduleModal
          booking={rescheduleBooking}
          onClose={() => setRescheduleBooking(null)}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </div>
  );
}
