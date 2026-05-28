"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { TrendingUp, Users, Clock, CalendarDays, MousePointerClick, Gamepad2, Filter, ArrowLeft, IndianRupee, BarChart3, Zap, CreditCard, Monitor, Globe } from "lucide-react";

interface AnalyticsTabProps {
  bookings: any[];
  users: any[];
  onBack: () => void;
}

const kpiConfig = [
  { key: "revenue", title: "Revenue", prefix: "₹", suffix: "", icon: IndianRupee, gradient: "from-[#ff6b35] to-[#ff8c61]" },
  { key: "bookings", title: "Bookings", prefix: "", suffix: "", icon: CalendarDays, gradient: "from-[#1A1A1A] to-[#3a3a3a]" },
  { key: "activeSessions", title: "Active", prefix: "", suffix: "", icon: Zap, gradient: "from-[#ff6b35] to-[#e85d2c]" },
  { key: "gamingHours", title: "Hours", prefix: "", suffix: "h", icon: Clock, gradient: "from-[#1A1A1A] to-[#3a3a3a]" },
  { key: "avgSession", title: "Avg Session", prefix: "", suffix: "m", icon: MousePointerClick, gradient: "from-[#ff6b35] to-[#ff8c61]" },
  { key: "newCustomers", title: "New Users", prefix: "", suffix: "", icon: Users, gradient: "from-[#1A1A1A] to-[#3a3a3a]" },
];

function ChartCard({ title, icon: Icon, children, className = "" }: any) {
  return (
    <div className={`bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_2px_20px_rgba(0,0,0,0.04)] flex flex-col h-full relative overflow-hidden group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2 relative z-10">
        <Icon size={16} className="text-[#ff6b35]" strokeWidth={2.5} />
        <h3 className="text-xs font-black uppercase tracking-wider text-[#1A1A1A]/90">{title}</h3>
      </div>
      <div className="flex-1 min-h-0 relative z-10 px-1 pb-1">
        {children}
      </div>
    </div>
  );
}

export default function AnalyticsTab({ bookings, users, onBack }: AnalyticsTabProps) {
  const [dateFilter, setDateFilter] = useState("30days");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [bookingType, setBookingType] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [customRange, setCustomRange] = useState({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });

  const data = useMemo(() => {
    if (!bookings) bookings = [];
    if (!users) users = [];

    const now = new Date();
    let currentStartDate = new Date(0);
    let currentEndDate = new Date();
    let previousStartDate = new Date(0);
    let previousEndDate = new Date(0);
    let isAllTime = false;

    if (dateFilter === "today") {
      currentStartDate = new Date(); currentStartDate.setHours(0, 0, 0, 0);
      previousStartDate = new Date(currentStartDate); previousStartDate.setDate(previousStartDate.getDate() - 1);
      previousEndDate = new Date(currentStartDate);
    } else if (dateFilter === "7days") {
      currentStartDate = new Date(); currentStartDate.setDate(now.getDate() - 7);
      previousStartDate = new Date(currentStartDate); previousStartDate.setDate(previousStartDate.getDate() - 7);
      previousEndDate = new Date(currentStartDate);
    } else if (dateFilter === "30days") {
      currentStartDate = new Date(); currentStartDate.setDate(now.getDate() - 30);
      previousStartDate = new Date(currentStartDate); previousStartDate.setDate(previousStartDate.getDate() - 30);
      previousEndDate = new Date(currentStartDate);
    } else if (dateFilter === "specific") {
      currentStartDate = new Date(customDate); currentStartDate.setHours(0, 0, 0, 0);
      currentEndDate = new Date(customDate); currentEndDate.setHours(23, 59, 59, 999);
      previousStartDate = new Date(currentStartDate); previousStartDate.setDate(previousStartDate.getDate() - 1);
      previousEndDate = new Date(currentStartDate);
    } else if (dateFilter === "range") {
      currentStartDate = new Date(customRange.start); currentStartDate.setHours(0, 0, 0, 0);
      currentEndDate = new Date(customRange.end); currentEndDate.setHours(23, 59, 59, 999);
      const diffTime = Math.abs(currentEndDate.getTime() - currentStartDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      previousStartDate = new Date(currentStartDate); previousStartDate.setDate(previousStartDate.getDate() - diffDays);
      previousEndDate = new Date(currentStartDate);
    } else {
      isAllTime = true;
    }

    const currentBookings = bookings.filter((b) => {
      const bDate = new Date(b.slotStart || b.createdAt || b.inTime || new Date());
      const matchDate = isAllTime || (bDate >= currentStartDate && bDate <= currentEndDate);
      const matchDevice = deviceFilter === "all" || (b.device && b.device.toLowerCase() === deviceFilter.toLowerCase());
      const matchType = bookingType === "all" || (bookingType === "walk-in" && b.source === "offline") || (bookingType === "website" && b.source !== "offline");
      
      let hasCash = false;
      let hasOnline = false;
      if (b.payments && b.payments.length > 0) {
         hasCash = b.payments.some((p:any) => p.method === "cash");
         hasOnline = b.payments.some((p:any) => p.method !== "cash");
      } else if (b.amountPaid > 0) {
         if (b.paymentMethod === "online") hasOnline = true;
         else hasCash = true;
      }
      const matchPayment = paymentFilter === "all" || (paymentFilter === "cash" && hasCash) || (paymentFilter === "online" && hasOnline);
      
      return matchDate && matchDevice && matchType && matchPayment;
    });

    const previousBookings = bookings.filter((b) => {
      const bDate = new Date(b.slotStart || b.createdAt || b.inTime || new Date());
      const matchDate = !isAllTime && bDate >= previousStartDate && bDate < previousEndDate;
      const matchDevice = deviceFilter === "all" || (b.device && b.device.toLowerCase() === deviceFilter.toLowerCase());
      const matchType = bookingType === "all" || (bookingType === "walk-in" && b.source === "offline") || (bookingType === "website" && b.source !== "offline");
      
      let hasCash = false;
      let hasOnline = false;
      if (b.payments && b.payments.length > 0) {
         hasCash = b.payments.some((p:any) => p.method === "cash");
         hasOnline = b.payments.some((p:any) => p.method !== "cash");
      } else if (b.amountPaid > 0) {
         if (b.paymentMethod === "online") hasOnline = true;
         else hasCash = true;
      }
      const matchPayment = paymentFilter === "all" || (paymentFilter === "cash" && hasCash) || (paymentFilter === "online" && hasOnline);
      
      return matchDate && matchDevice && matchType && matchPayment;
    });

    const calcRevenue = (bList: any[]) => bList.reduce((acc, b) => {
      if (b.status === "completed" || b.status === "active") {
        const p = b.payments || [];
        if (p.length > 0) {
          return acc + p.reduce((sum: number, pay: any) => {
             const isCash = pay.method === "cash";
             const match = paymentFilter === "all" || (paymentFilter === "cash" && isCash) || (paymentFilter === "online" && !isCash);
             return sum + (match ? (pay.amount || 0) : 0);
          }, 0);
        } else {
           const isCash = b.paymentMethod !== "online";
           const match = paymentFilter === "all" || (paymentFilter === "cash" && isCash) || (paymentFilter === "online" && !isCash);
           return acc + (match ? (b.amountPaid || 0) : 0);
        }
      }
      return acc;
    }, 0);

    const calcHours = (bList: any[]) => bList.reduce((sum, b) => sum + (b.durationHours || 0), 0);

    const totalRevenue = calcRevenue(currentBookings);
    const prevRevenue = calcRevenue(previousBookings);
    const totalBookingsCount = currentBookings.length;
    const prevBookingsCount = previousBookings.length;
    const totalGamingHours = calcHours(currentBookings);
    const prevGamingHours = calcHours(previousBookings);
    const avgSession = totalBookingsCount ? Math.round((totalGamingHours / totalBookingsCount) * 60) : 0;
    const prevAvgSession = prevBookingsCount ? Math.round((prevGamingHours / prevBookingsCount) * 60) : 0;

    const newCustomers = users.filter((u) => { const d = new Date(u.createdAt || new Date()); return isAllTime || d >= currentStartDate; }).length;
    const prevCustomers = users.filter((u) => { const d = new Date(u.createdAt || new Date()); return !isAllTime && d >= previousStartDate && d < previousEndDate; }).length;

    const calcTrend = (curr: number, prev: number) => {
      if (isAllTime || prev === 0) return 0;
      return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    const trends = {
      revenue: calcTrend(totalRevenue, prevRevenue),
      bookings: calcTrend(totalBookingsCount, prevBookingsCount),
      gamingHours: calcTrend(totalGamingHours, prevGamingHours),
      avgSession: calcTrend(avgSession, prevAvgSession),
      newCustomers: calcTrend(newCustomers, prevCustomers),
    };

    const activeSessionsCount = bookings.filter((b) => b.status === "active").length;

    // Device Usage
    const deviceMap: Record<string, number> = {};
    currentBookings.forEach((b) => { if (b.device) { deviceMap[b.device] = (deviceMap[b.device] || 0) + (b.durationHours || 1); } });
    const deviceColors = ["#ff6b35", "#ff8c61", "#ffa382", "#2D3748"];
    const deviceData = Object.entries(deviceMap).map(([name, value], i) => ({ name: name.toUpperCase(), value: Number(value.toFixed(2)), fill: deviceColors[i % deviceColors.length] }));

    // Payment Method
    const paymentMap: Record<string, number> = {};
    currentBookings.forEach((b) => {
      if (b.status === "completed" || b.status === "active") {
        const p = b.payments || [];
        if (p.length > 0) { 
           p.forEach((pay: any) => { 
             const m = (pay.method || "other").toLowerCase(); 
             const isCash = m === "cash";
             const match = paymentFilter === "all" || (paymentFilter === "cash" && isCash) || (paymentFilter === "online" && !isCash);
             if (match) paymentMap[m] = (paymentMap[m] || 0) + (pay.amount || 0); 
           }); 
        } else if (b.amountPaid) { 
           const isCash = b.paymentMethod !== "online";
           const match = paymentFilter === "all" || (paymentFilter === "cash" && isCash) || (paymentFilter === "online" && !isCash);
           if (match) {
               const m = b.paymentMethod || "cash";
               paymentMap[m] = (paymentMap[m] || 0) + b.amountPaid; 
           }
        }
      }
    });
    const paymentColors = ["#ff6b35", "#2D3748", "#ff8c61", "#4A5568"];
    const paymentMethodData = Object.entries(paymentMap).filter(([_, v]) => v > 0).map(([name, value], i) => ({
      name: name === "upi" ? "UPI" : name.charAt(0).toUpperCase() + name.slice(1), value, fill: paymentColors[i % paymentColors.length],
    }));
    if (paymentMethodData.length === 0) paymentMethodData.push({ name: "No Data", value: 1, fill: "#e2e8f0" });

    // Booking Source
    const walkIn = currentBookings.filter((b) => b.source === "offline").length;
    const online = currentBookings.filter((b) => b.source !== "offline").length;
    const bookingSourceData = [{ name: "Walk-in", value: walkIn, fill: "#ff6b35" }, { name: "Website", value: online, fill: "#2D3748" }];

    // Peak Hours
    const hoursMap: Record<number, number> = {};
    currentBookings.forEach((b) => { const h = new Date(b.slotStart || b.inTime || new Date()).getHours(); if (!isNaN(h)) { hoursMap[h] = (hoursMap[h] || 0) + 1; } });
    const peakHoursData = [10, 12, 14, 16, 18, 20, 22].map((h) => ({ time: `${h > 12 ? h - 12 : h}${h >= 12 ? "PM" : "AM"}`, users: hoursMap[h] || 0 }));

    // Revenue Timeline
    const revenueMap: Record<string, { value: number; timestamp: number }> = {};
    currentBookings.forEach((b) => {
      if (b.status === "completed" || b.status === "active") {
        const d = new Date(b.slotStart || b.inTime || new Date());
        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const p = b.payments || [];
        let rev = 0;
        if (p.length > 0) {
           rev = p.reduce((sum: number, pay: any) => {
             const isCash = pay.method === "cash";
             const match = paymentFilter === "all" || (paymentFilter === "cash" && isCash) || (paymentFilter === "online" && !isCash);
             return sum + (match ? (pay.amount || 0) : 0);
           }, 0);
        } else {
           const isCash = b.paymentMethod !== "online";
           const match = paymentFilter === "all" || (paymentFilter === "cash" && isCash) || (paymentFilter === "online" && !isCash);
           rev = match ? (b.amountPaid || 0) : 0;
        }
        if (!revenueMap[dateStr]) revenueMap[dateStr] = { value: 0, timestamp: d.setHours(0,0,0,0) };
        revenueMap[dateStr].value += rev;
      }
    });
    const revenueData = Object.keys(revenueMap).length > 0 
      ? Object.values(revenueMap)
          .sort((a, b) => a.timestamp - b.timestamp) // oldest on left, newest on right
          .slice(-7)
          .map(item => ({ name: new Date(item.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: item.value }))
      : [{ name: "No Data", value: 0 }];

    // Top Games
    const gamesMap: Record<string, number> = {};
    currentBookings.forEach(b => { 
      const g = b.game || "General Gaming";
      const gList = g.split(",").map((s: string) => s.trim()).filter(Boolean);
      if (gList.length === 0) {
        gamesMap["General Gaming"] = (gamesMap["General Gaming"] || 0) + (b.durationHours || 1);
      } else {
        gList.forEach((gameStr: string) => {
          gamesMap[gameStr] = (gamesMap[gameStr] || 0) + (b.durationHours || 1);
        });
      }
    });
    const topGames = Object.entries(gamesMap).map(([name, hours]) => ({
      name, hours: Number(hours.toFixed(2)), popularity: Math.min(100, Math.round((hours / Math.max(1, totalGamingHours)) * 100))
    })).sort((a, b) => b.hours - a.hours).slice(0, 5);

    return {
      kpis: { revenue: totalRevenue, bookings: totalBookingsCount, activeSessions: activeSessionsCount, gamingHours: totalGamingHours, avgSession, newCustomers },
      trends,
      revenueData, peakHoursData,
      deviceData: deviceData.length > 0 ? deviceData : [{ name: "No Data", value: 1, fill: "#e2e8f0" }],
      bookingSourceData, paymentMethodData, topGames,
    };
  }, [bookings, users, dateFilter, deviceFilter, bookingType, paymentFilter, customDate, customRange]);

  const tooltipStyle = { borderRadius: "14px", border: "1px solid rgba(255,107,53,0.1)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", fontSize: "11px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)" };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-2.5 overflow-hidden">

      {/* ═══════ HEADER & FILTERS ═══════ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 shrink-0 pb-1">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-[#ff6b35] hover:border-[#ff6b35]/30 transition-all shadow-sm">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-4 bg-white border border-slate-100 rounded-2xl p-2 shadow-sm">
            {/* Date Range */}
            <div className="relative group px-3 border-r border-slate-100 flex items-center gap-2">
              <div className="flex items-center gap-3 cursor-pointer relative">
                <CalendarDays size={18} className="text-slate-400" />
                <div className="flex flex-col pr-6">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Date Range</span>
                  <span className="text-sm font-black text-[#1A1A1A]">
                    {dateFilter === "today" ? "Today" : dateFilter === "7days" ? "Last 7 Days" : dateFilter === "30days" ? "Last 30 Days" : dateFilter === "specific" ? "Specific Date" : dateFilter === "range" ? "Custom Range" : "All Time"}
                  </span>
                </div>
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                  <option value="today">Today</option><option value="7days">Last 7 Days</option><option value="30days">Last 30 Days</option><option value="specific">Specific Date</option><option value="range">Custom Range</option><option value="all">All Time</option>
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
              
              {/* Extra Inputs for Custom Dates */}
              {dateFilter === "specific" && (
                <input type="date" value={customDate} onChange={e => setCustomDate(e.target.value)} className="text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-[#ff6b35] transition-colors" />
              )}
              {dateFilter === "range" && (
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1">
                  <input type="date" value={customRange.start} onChange={e => setCustomRange(r => ({...r, start: e.target.value}))} className="text-[10px] font-bold text-slate-700 bg-transparent outline-none w-24" />
                  <span className="text-slate-400 text-xs font-bold">-</span>
                  <input type="date" value={customRange.end} onChange={e => setCustomRange(r => ({...r, end: e.target.value}))} className="text-[10px] font-bold text-slate-700 bg-transparent outline-none w-24" />
                </div>
              )}
            </div>
            
            {/* Game */}
            <div className="relative group px-3 border-r border-slate-100">
              <div className="flex items-center gap-3 cursor-pointer">
                <Gamepad2 size={18} className="text-slate-400" />
                <div className="flex flex-col pr-6">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Game</span>
                  <span className="text-sm font-black text-[#1A1A1A]">
                    {deviceFilter === "all" ? "All Games" : deviceFilter.toUpperCase()}
                  </span>
                </div>
                <select value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                  <option value="all">All Games</option><option value="ps1">PS1</option><option value="ps2">PS2</option><option value="ps3">PS3</option><option value="sim1">SIM1</option>
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            {/* Booking Type */}
            <div className="relative group px-3 border-r border-slate-100">
              <div className="flex items-center gap-3 cursor-pointer">
                <Users size={18} className="text-slate-400" />
                <div className="flex flex-col pr-6">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Booking Type</span>
                  <span className="text-sm font-black text-[#1A1A1A]">
                    {bookingType === "all" ? "All (Walk-in + Web)" : bookingType === "walk-in" ? "Walk-in" : "Website"}
                  </span>
                </div>
                <select value={bookingType} onChange={(e) => setBookingType(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                  <option value="all">All (Walk-in + Web)</option><option value="walk-in">Walk-in</option><option value="website">Website</option>
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="relative group px-3">
              <div className="flex items-center gap-3 cursor-pointer">
                <CreditCard size={18} className="text-slate-400" />
                <div className="flex flex-col pr-6">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Payment Method</span>
                  <span className="text-sm font-black text-[#1A1A1A]">
                     {paymentFilter === "all" ? "All (Cash + Online)" : paymentFilter === "cash" ? "Cash" : "Online"}
                  </span>
                </div>
                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                  <option value="all">All (Cash + Online)</option>
                  <option value="cash">Cash</option>
                  <option value="online">Online</option>
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 ml-auto">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#ff6b35] hover:bg-[#ff8c61] text-white rounded-xl font-bold text-[13px] transition-all shadow-md shadow-[#ff6b35]/20">
            <Filter size={16} /> Apply Filters
          </button>
          <button onClick={() => { setDateFilter("30days"); setDeviceFilter("all"); setBookingType("all"); setPaymentFilter("all"); }} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-[13px] transition-all shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reset
          </button>
        </div>
      </div>

      {/* ═══════ KPI STRIP ═══════ */}
      <div className="grid grid-cols-6 gap-3 shrink-0">
        {kpiConfig.map((kpi, i) => {
          const Icon = kpi.icon;
          const val = (data.kpis as any)[kpi.key];
          
          const mockSparkline = [5, 10, 8, 15, 12, 18, 14, 22, 19, 25].map((v, idx) => ({ value: v + (Math.sin(idx + i) * 6) }));
          const trendValue = (data.trends as any)[kpi.key] || 0;
          const isPositive = trendValue >= 0;
          const displayTrend = Math.abs(trendValue).toFixed(1);
          
          return (
            <div key={kpi.key} className="bg-white border border-slate-100 rounded-2xl flex flex-row items-center relative overflow-hidden group hover:border-[#ff6b35]/30 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 gap-2">
              <div className="flex-1 min-w-0 z-10 relative">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#ff6b35]/10 flex items-center justify-center text-[#ff6b35] shadow-inner shrink-0">
                    <Icon size={16} strokeWidth={2.5} />
                  </div>
                  <span className="text-[10px] font-bold text-[#1A1A1A]/70 uppercase tracking-wider truncate">{kpi.title}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <p className="text-xl font-black text-[#1A1A1A] leading-none font-display tracking-tight truncate">
                    {kpi.prefix}{val.toLocaleString()}{kpi.suffix}
                  </p>
                  
                  {kpi.key === "activeSessions" ? (
                    <span className="text-[9px] font-bold text-[#10B981] truncate">Live right now</span>
                  ) : dateFilter === "all" ? (
                    <span className="text-[9px] font-bold text-slate-400 truncate">All Time</span>
                  ) : (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className={`text-[9px] font-bold whitespace-nowrap ${isPositive ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                        {isPositive ? "▲" : "▼"} {displayTrend}%
                      </span>
                      <span className="text-[8px] text-slate-400 font-medium tracking-wide whitespace-nowrap hidden 2xl:inline-block">
                        vs prev {dateFilter === "today" ? "day" : dateFilter === "7days" ? "7 days" : "30 days"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sparkline */}
              <div className="w-16 h-12 opacity-80 z-0 group-hover:opacity-100 transition-opacity shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockSparkline}>
                    <defs>
                      <linearGradient id={`spark-${kpi.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#ff6b35" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#ff6b35" strokeWidth={1.5} fill={`url(#spark-${kpi.key})`} dot={false} activeDot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══════ MIDDLE ROW ═══════ */}
      <div className="grid grid-cols-4 gap-2.5 flex-1 min-h-0">

        {/* Revenue */}
        <ChartCard title="Revenue Overview" icon={TrendingUp} className="col-span-2">
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b35" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#ff6b35" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} dy={4} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`} />
                <RechartsTooltip contentStyle={tooltipStyle} formatter={(v: any) => [`₹${Number(v).toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="value" stroke="#ff6b35" strokeWidth={2.5} fillOpacity={1} fill="url(#revGrad)" dot={{ r: 3, fill: "#ff6b35", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Payments */}
        <ChartCard title="Payment Methods" icon={CreditCard}>
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.paymentMethodData} innerRadius="55%" outerRadius="80%" paddingAngle={4} dataKey="value" stroke="none">
                    {data.paymentMethodData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} formatter={(v: any, name: any) => [`₹${Number(v).toLocaleString()}`, String(name)]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-[#1A1A1A] leading-none font-display">₹{data.kpis.revenue.toLocaleString()}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Total</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-2 pb-2">
              {data.paymentMethodData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: d.fill }} />
                  <div className="leading-none">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{d.name}</p>
                    <p className="text-[11px] font-black text-[#1A1A1A]">₹{d.value.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Top Games */}
        <ChartCard title="Most Played" icon={Gamepad2}>
          <div className="flex flex-col h-full px-3 pb-2 overflow-hidden">
            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {data.topGames.map((game, i) => (
                <div key={i} className="group/game">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-lg flex shrink-0 items-center justify-center font-black text-[10px] ${i === 0 ? "bg-[#ff6b35] text-white shadow-md shadow-[#ff6b35]/30" : "bg-[#F3EFEC] text-[#1A1A1A]/60"}`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[#1A1A1A] uppercase text-[10px] truncate leading-none">{game.name}</span>
                        <span className="text-[10px] font-black text-[#ff6b35] shrink-0 ml-2 tabular-nums">{game.hours}h</span>
                      </div>
                      <div className="h-1 w-full bg-[#F3EFEC] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${i === 0 ? "bg-gradient-to-r from-[#ff6b35] to-[#ff8c61]" : "bg-[#1A1A1A]/15"}`} style={{ width: `${game.popularity}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ═══════ BOTTOM ROW ═══════ */}
      <div className="grid grid-cols-4 gap-2.5 flex-1 min-h-0">

        {/* Device Usage */}
        <ChartCard title="Device Usage" icon={Monitor}>
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.deviceData} innerRadius="50%" outerRadius="78%" paddingAngle={4} dataKey="value" stroke="none">
                    {data.deviceData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} formatter={(v: any, name: any) => [`${Number(v)} hrs`, String(name)]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-[#1A1A1A] leading-none font-display">{data.deviceData.length}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Devices</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-2 pb-2">
              {data.deviceData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: d.fill }} />
                  <div className="leading-none">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{d.name}</p>
                    <p className="text-[11px] font-black text-[#1A1A1A]">{d.value}h</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Booking Source */}
        <ChartCard title="Booking Source" icon={Globe}>
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.bookingSourceData} outerRadius="78%" dataKey="value" stroke="white" strokeWidth={3}>
                    {data.bookingSourceData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-5 px-2 pb-2">
              {data.bookingSourceData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: d.fill }} />
                  <div className="leading-none">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{d.name}</p>
                    <p className="text-[11px] font-black text-[#1A1A1A]">{d.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Peak Hours */}
        <ChartCard title="Peak Hours" icon={BarChart3} className="col-span-2">
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.peakHoursData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b35" />
                    <stop offset="100%" stopColor="#ff8c61" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} dy={4} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <RechartsTooltip cursor={{ fill: "rgba(255, 107, 53, 0.04)", radius: 8 }} contentStyle={tooltipStyle} />
                <Bar dataKey="users" name="Active Gamers" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
