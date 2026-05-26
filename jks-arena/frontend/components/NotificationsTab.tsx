"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/auth";

export default function NotificationsTab() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("promo");
  const [targetType, setTargetType] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsFetchingUsers(true);
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users");
      } finally {
        setIsFetchingUsers(false);
      }
    };

    if (targetType === "specific" && users.length === 0) {
      fetchUsers();
    }
  }, [targetType, users.length]);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (targetType === "specific" && selectedUserIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/notifications/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          type,
          targetType,
          userIds: selectedUserIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send notification");

      toast.success(data.message);
      setTitle("");
      setMessage("");
      setSelectedUserIds([]);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-black uppercase tracking-wider text-[#1A1A1A]">
          Broadcast Center
        </h2>
        <p className="text-sm font-bold text-slate-500 tracking-wider">
          Send push and in-app notifications instantly.
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-black/5 shadow-sm space-y-6">
        
        {/* Type & Target */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1">Notification Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all"
            >
              <option value="promo">Promo / Offer</option>
              <option value="announcement">Announcement</option>
              <option value="games">New Game Alert</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1">Audience</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all"
            >
              <option value="all">All Users</option>
              <option value="specific">Specific Users</option>
            </select>
          </div>
        </div>

        {/* Specific Users Selector */}
        {targetType === "specific" && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 max-h-60 overflow-y-auto">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1">Select Recipients</label>
            {isFetchingUsers ? (
              <p className="text-xs text-slate-500 animate-pulse">Loading users...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {users.map(u => (
                  <label key={u._id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(u._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedUserIds(prev => [...prev, u._id]);
                        else setSelectedUserIds(prev => prev.filter(id => id !== u._id));
                      }}
                      className="w-4 h-4 text-[#ff6b35] rounded border-slate-300 focus:ring-[#ff6b35]"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{u.name}</span>
                      <span className="text-xs text-slate-500">{u.email}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1">Title</label>
            <input
              type="text"
              placeholder="e.g. 50% Off Weekend Passes!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 px-1">Message</label>
            <textarea
              rows={4}
              placeholder="Write your promotional message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all resize-none"
            />
          </div>
        </div>

        {/* Action */}
        <div className="pt-2">
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-4 bg-[#ff6b35] hover:bg-[#ff8559] text-white rounded-xl font-black uppercase tracking-widest text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b35]/20"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            )}
            {isLoading ? "Sending..." : "Blast Notification"}
          </button>
        </div>
      </div>
    </div>
  );
}
