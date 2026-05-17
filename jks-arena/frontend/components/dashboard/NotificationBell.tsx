"use client";

import { useEffect, useState } from "react";

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  NotificationItem,
} from "@/lib/auth";

export default function NotificationBell() {

  const [
    notifications,
    setNotifications,
  ] = useState<NotificationItem[]>([]);

  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(
          "auth_token"
        ) || ""
      : "";

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  async function loadNotifications() {

    try {

      if (!token) return;

      const data =
        await fetchNotifications(
          token
        );

      setNotifications(data);

    } catch (err) {

      console.error(err);

    }

  }

  useEffect(() => {

    loadNotifications();

    const interval =
      setInterval(
        loadNotifications,
        15000
      );

    return () =>
      clearInterval(interval);

  }, []);

  // =====================================================
  // UNREAD COUNT
  // =====================================================

  const unreadCount =
    notifications.filter(
      (n) => !n.isRead
    ).length;

  // =====================================================
  // MARK SINGLE READ
  // =====================================================

  async function handleRead(
    id: string
  ) {

    try {

      await markNotificationRead(
        id,
        token
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                isRead: true,
              }
            : item
        )
      );

    } catch (err) {

      console.error(err);

    }

  }

  // =====================================================
  // MARK ALL READ
  // =====================================================

  async function handleReadAll() {

    try {

      await markAllNotificationsRead(token);

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

    } catch (err) {

      console.error(err);

    }

  }

  return (

    <div className="relative">

      {/* ===================================================== */}
      {/* BELL BUTTON */}
      {/* ===================================================== */}

      <button
        onClick={() =>
          setIsOpen(!isOpen)
        }
        className="relative flex items-center justify-center w-12 h-12 rounded-2xl border border-[#ff6b35]/15 bg-white shadow-sm text-slate-500 hover:text-[#ff6b35] transition-all duration-300"
      >

        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />

        </svg>

        {/* ===================================================== */}
        {/* BADGE */}
        {/* ===================================================== */}

        {unreadCount > 0 && (

          <div className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-[#ff6b35] flex items-center justify-center text-white text-[10px] font-black shadow-lg">

            {unreadCount}

          </div>

        )}

      </button>

      {/* ===================================================== */}
      {/* DROPDOWN */}
      {/* ===================================================== */}

      {isOpen && (

        <div className="absolute right-0 mt-4 w-[360px] max-h-[500px] overflow-hidden rounded-3xl border border-[#ff6b35]/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] z-50">

          {/* HEADER */}

          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

            <div>

              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff6b35]">

                Notifications

              </p>

              <h3 className="mt-1 text-lg font-black text-[#1A1A1A]">

                Activity Center

              </h3>

            </div>

            <button
              onClick={handleReadAll}
              className="text-[10px] font-black uppercase tracking-widest text-[#ff6b35]"
            >

              Mark all read

            </button>

          </div>

          {/* LIST */}

          <div className="max-h-[420px] overflow-y-auto">

            {notifications.length === 0 ? (

              <div className="flex flex-col items-center justify-center py-14 text-center">

                <p className="text-sm font-bold text-slate-400">

                  No notifications yet.

                </p>

              </div>

            ) : (

              notifications.map((item) => (

                <button
                  key={item._id}
                  onClick={() =>
                    handleRead(
                      item._id
                    )
                  }
                  className={`w-full text-left px-5 py-4 border-b border-slate-100 transition-all duration-300 hover:bg-[#ff6b35]/5 ${
                    !item.isRead
                      ? "bg-[#ff6b35]/[0.03]"
                      : ""
                  }`}
                >

                  <div className="flex items-start gap-3">

                    {/* STATUS DOT */}

                    <div
                      className={`mt-2 w-2 h-2 rounded-full shrink-0 ${
                        item.isRead
                          ? "bg-slate-300"
                          : "bg-[#ff6b35]"
                      }`}
                    />

                    {/* CONTENT */}

                    <div className="flex-1 min-w-0">

                      <div className="flex items-center justify-between gap-3">

                        <p className="text-sm font-black text-[#1A1A1A] truncate">

                          {item.title}

                        </p>

                      </div>

                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">

                        {item.message}

                      </p>

                    </div>

                  </div>

                </button>

              ))

            )}

          </div>

        </div>

      )}

    </div>

  );

}