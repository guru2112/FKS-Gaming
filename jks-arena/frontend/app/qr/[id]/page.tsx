"use client";

import { QRCodeCanvas } from 'qrcode.react';
import { useParams } from 'next/navigation';

export default function GuestQRPage() {
  const params = useParams();
  const id = params?.id;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 text-center">
        <h1 className="font-display text-3xl text-slate-900 mb-2">JKS Arena Pass</h1>
        <p className="text-sm text-slate-500 mb-8">Scan this code at the arena desk</p>
        
        <div className="bg-slate-50 p-6 rounded-3xl inline-block border border-slate-100 mb-6">
          {id && <QRCodeCanvas value={String(id)} size={240} level="H" />}
        </div>
        
        <div className="text-left space-y-2 text-xs font-bold uppercase tracking-widest text-slate-400">
           <p>• QR ID: {id}</p>
           <p>• Unique per session</p>
        </div>
      </div>
    </div>
  );
}