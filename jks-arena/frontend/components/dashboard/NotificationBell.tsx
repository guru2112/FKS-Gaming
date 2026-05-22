"use client";

import { useCallback, useEffect, useLayoutEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  NotificationItem,
} from "@/lib/auth";

// ─── Relative Time ────────────────────────────────────
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── Date Group ───────────────────────────────────────
function getDateGroup(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - itemDate.getTime()) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This Week";
  return "Earlier";
}

// ─── Type Icons ───────────────────────────────────────
function getTypeIcon(type: string) {
  switch (type) {
    case "booking":
      return (
        <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "reminder":
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case "games":
      return (
        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <svg className="w-4.5 h-4.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
      );
  }
}

export default function NotificationBell({ active = true }: { active?: boolean }) {

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_token") || ""
      : "";

  // ─── FETCH NOTIFICATIONS ─────────────────────────────
  const loadNotifications = useCallback(async () => {
    try {
      if (!token) return;
      const data = await fetchNotifications(token);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    if (!active) return;

    const timeout = setTimeout(() => void loadNotifications(), 0);
    const interval = setInterval(() => void loadNotifications(), 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [loadNotifications, active]);

  // Listen for event-driven refreshes (after booking, push, etc.)
  useEffect(() => {
    if (!active) return;
    const handler = () => void loadNotifications();
    window.addEventListener("refresh-notifications", handler);
    return () => window.removeEventListener("refresh-notifications", handler);
  }, [loadNotifications, active]);

  // ─── UNREAD COUNT ────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ─── GROUPED NOTIFICATIONS ───────────────────────────
  const grouped = useMemo(() => {
    const groups: Record<string, NotificationItem[]> = {};
    for (const n of notifications) {
      const g = getDateGroup(n.createdAt);
      if (!groups[g]) groups[g] = [];
      groups[g].push(n);
    }
    return groups;
  }, [notifications]);

  const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"];

  // ─── MARK READ ───────────────────────────────────────
  async function handleRead(id: string) {
    try {
      await markNotificationRead(id, token);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
    } catch (err) {
      console.error(err);
    }
  }

  function handleClick(item: NotificationItem) {
    handleRead(item._id);
    if (item.link) {
      setIsOpen(false);
      router.push(item.link);
    }
  }

  // ─── MARK ALL READ ───────────────────────────────────
  async function handleReadAll() {
    try {
      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  }

  const bellRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 80, right: 24, left: undefined as number | undefined });

  useEffect(() => { setMounted(true); }, []);

  useLayoutEffect(() => {
    if (isOpen && bellRef.current) {
      const rect = bellRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      if (vw < 640) {
        setDropdownPos({ top: rect.bottom + 12, left: 16, right: 16 });
      } else {
        setDropdownPos({ top: rect.bottom + 16, right: Math.max(16, vw - rect.right), left: undefined });
      }
    }
  }, [isOpen]);

  // ─── RENDER ──────────────────────────────────────────
  return (
    <div className="relative" ref={bellRef}>
      {/* BELL BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-12 h-12 rounded-2xl border border-[#ff6b35]/15 bg-white shadow-sm text-slate-500 hover:text-[#ff6b35] transition-all duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-[#ff6b35] flex items-center justify-center text-white text-[10px] font-black shadow-lg animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {/* DROPDOWN */}
      {isOpen && mounted && createPortal(
        <div
          className="fixed w-[380px] max-w-[92vw] max-h-[520px] overflow-hidden rounded-3xl border border-[#ff6b35]/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] z-[200]"
          style={{ top: dropdownPos.top, right: dropdownPos.right, left: dropdownPos.left }}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff6b35]">Notifications</p>
              <h3 className="mt-1 text-lg font-black text-[#1A1A1A]">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </h3>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleReadAll}
                className="text-[10px] font-black uppercase tracking-widest text-[#ff6b35] hover:text-[#e55a2b] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* LIST */}
          <div className="max-h-[440px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-400">No notifications yet</p>
                <p className="text-xs text-slate-300 mt-1">Bookings and updates will appear here</p>
              </div>
            ) : (
              groupOrder.map((group) => {
                const items = grouped[group];
                if (!items || items.length === 0) return null;
                return (
                  <div key={group}>
                    <div className="sticky top-0 px-5 py-2 bg-slate-50/90 backdrop-blur-sm border-b border-slate-100 z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{group}</p>
                    </div>
                    {items.map((item) => (
                      <button
                        key={item._id}
                        onClick={() => handleClick(item)}
                        className={`w-full text-left px-5 py-3.5 border-b border-slate-50 transition-all duration-200 hover:bg-[#ff6b35]/[0.04] ${
                          !item.isRead ? "bg-[#ff6b35]/[0.03]" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getTypeIcon(item.type)}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-[13px] leading-tight truncate ${!item.isRead ? "font-black text-[#1A1A1A]" : "font-semibold text-slate-600"}`}>
                                {item.title}
                              </p>
                              <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                                {timeAgo(item.createdAt)}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                              {item.message}
                            </p>

                            {item.link && (
                              <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-[#ff6b35]">
                                <span>View Details</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {!item.isRead && (
                            <div className="w-2 h-2 rounded-full bg-[#ff6b35] shrink-0 mt-2" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
