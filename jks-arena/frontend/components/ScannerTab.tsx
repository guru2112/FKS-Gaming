"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "@/lib/apiClient";

interface ScannerTabProps {
  bookings?: any[];
  onRefresh?: () => void;
}

export default function ScannerTab({ bookings, onRefresh }: ScannerTabProps) {
  // Scanner UI States
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Two-Step Verification States
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingBooking, setPendingBooking] = useState<any | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode("qr-reader");

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
          setActiveCameraId(backCamera ? backCamera.id : devices[0].id);
        }
      })
      .catch((err) => console.error("Error getting cameras", err));

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // 🔥 STEP 1: Scan Success -> Show Preview
  const onScanSuccess = useCallback(async (decodedText: string) => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
    
    const finalId = decodedText.includes("/qr/") ? decodedText.split("/qr/").pop() : decodedText;
    
    // Look up the booking locally to preview details
    const found = bookings?.find(b => b.qrId === finalId || b._id === finalId);
    
    setPendingToken(finalId || "");
    setPendingBooking(found || { _id: finalId, unknown: true });
  }, [bookings]);

  const startScanner = useCallback(async () => {
    if (!scannerRef.current || !activeCameraId) return;

    try {
      if (scannerRef.current.isScanning) await scannerRef.current.stop();

      setIsScanning(true);
      await scannerRef.current.start(
        activeCameraId,
        {
          fps: 15,
          qrbox: (w, h) => ({ width: Math.floor(Math.min(w, h) * 0.7), height: Math.floor(Math.min(w, h) * 0.7) })
        },
        onScanSuccess,
        () => {} // ignore scan failures
      );
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setIsScanning(false);
    }
  }, [activeCameraId, onScanSuccess]);

  useEffect(() => {
    if (activeCameraId && !scanResult && !pendingToken) {
      void startScanner();
    }
  }, [activeCameraId, scanResult, pendingToken, startScanner]);

  // 🔥 STEP 2: Manual Start -> Hit Backend API
  async function handleStartSession() {
    if (!pendingToken) return;
    setIsActivating(true);

    try {
      const data = await api.post<{ booking?: any; message?: string }>("/api/admin/scan", { token: pendingToken });

      // Hide pending preview and show final success result
      setPendingToken(null);
      setPendingBooking(null);
      setScanResult({ success: true, message: `Timer Started for ${data.booking?.device || "Console"}!`, data: data.booking });

      if (onRefresh) onRefresh();

    } catch (err: any) {
      setScanResult({ success: false, message: err.message || "Failed to start session." });
    } finally {
      setIsActivating(false);
    }
  }

  function resetScanner() { 
    setScanResult(null); 
    setPendingToken(null);
    setPendingBooking(null);
  }

  const clipPathStyle = { clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto bg-white/80 backdrop-blur-md p-8 rounded-[32px] shadow-xl border border-black/5">
      
      {/* HEADER & CAMERA SELECTOR */}
      <div className="text-center mb-6 w-full">
        <h2 className="font-display text-2xl font-black uppercase text-[#1A1A1A] tracking-wide">Terminal Scanner</h2>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-6 mt-1">Scan pass to preview session</p>
        
        {cameras.length > 0 && !scanResult && !pendingToken && (
          <select 
            value={activeCameraId}
            onChange={(e) => setActiveCameraId(e.target.value)}
            className="w-full bg-white border border-slate-200 hover:border-[#ff6b35]/40 text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all"
          >
            {cameras.map(cam => (
              <option key={cam.id} value={cam.id}>{cam.label || `Camera ${cam.id.substring(0, 5)}`}</option>
            ))}
          </select>
        )}
      </div>

      {/* 1. CAMERA VIEW */}
      <div 
        id="qr-reader" 
        className={`w-full overflow-hidden rounded-2xl border-4 ${isScanning ? 'border-[#ff6b35] shadow-[0_0_20px_rgba(255,107,53,0.18)]' : 'border-slate-100'} ${scanResult || pendingToken ? 'hidden' : 'block'}`}
      ></div>

      {/* 2. PENDING VERIFICATION VIEW (The new middle step) */}
      {pendingToken && !scanResult && (
        <div className="w-full p-6 rounded-2xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 shadow-[0_0_30px_rgba(255,107,53,0.08)]">
          <p className="font-black uppercase tracking-widest text-center text-sm text-[#ff6b35] mb-4">
            Booking Detected
          </p>

          {pendingBooking && !pendingBooking.unknown ? (
            <div className="space-y-4 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white p-5 rounded-xl border border-black/5">
               <div className="flex justify-between border-b border-black/5 pb-3">
                 <span className="text-slate-500">Player</span>
                 <span className="text-slate-900">{pendingBooking.userName}</span>
               </div>
               <div className="flex justify-between items-center border-b border-black/5 pb-3">
                 <span className="text-slate-500">Console</span>
                 <span className="text-[#ff6b35] font-black">{pendingBooking.device}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-500">Duration</span>
                 <span className="text-slate-900">{pendingBooking.durationHours} Hours</span>
               </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white p-5 rounded-xl border border-black/5 text-center">
              <span className="text-slate-500 block mb-2">Pass ID:</span>
              <span className="text-slate-900 break-all">{pendingToken}</span>
              <p className="text-[9px] text-slate-500 mt-3 normal-case tracking-normal">Details will be verified securely upon starting.</p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <button 
              onClick={handleStartSession}
              disabled={isActivating}
              style={clipPathStyle}
              className="w-full bg-[#ff6b35] text-white py-4 text-xs font-black uppercase tracking-widest hover:brightness-95 transition-colors shadow-[0_0_15px_rgba(255,107,53,0.20)] disabled:opacity-50"
            >
              {isActivating ? "Starting Timer..." : "Start Session Timer"}
            </button>
            
            <button 
              onClick={resetScanner}
              disabled={isActivating}
              className="w-full bg-white/70 border border-black/5 text-slate-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
            >
              Cancel & Rescan
            </button>
          </div>
        </div>
      )}

      {/* 3. SUCCESS / FINAL RESULT VIEW */}
      {scanResult && (
        <div className={`mt-2 w-full p-6 rounded-2xl border ${scanResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
          <p className={`font-black uppercase tracking-widest text-center text-sm ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {scanResult.message}
          </p>
          
          {scanResult.data && (
            <div className="mt-6 space-y-4 text-xs font-bold uppercase tracking-wider text-slate-700 bg-white p-5 rounded-xl border border-black/5">
               <div className="flex justify-between border-b border-black/5 pb-3">
                 <span className="text-slate-500">Player</span>
                 <span className="text-slate-900">{scanResult.data.userName}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-slate-500">Console</span>
                 <span className="text-[#ff6b35] font-black">{scanResult.data.device}</span>
               </div>
            </div>
          )}

          <button 
            onClick={resetScanner}
            style={clipPathStyle}
            className="mt-8 w-full bg-[#ff6b35] text-white py-4 text-xs font-black uppercase tracking-widest hover:brightness-95 transition-colors shadow-[0_0_15px_rgba(255,107,53,0.20)]"
          >
            Scan Next Player
          </button>
        </div>
      )}
    </div>
  );
}