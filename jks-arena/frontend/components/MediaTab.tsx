"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/apiClient";

const APP_OPTIONS = ["Mobile", "Desktop"];
const FACILITY_OPTIONS = ["Screen", "PS", "Seating", "Simulator", "Multiplayer"];
const DASHBOARD_OPTIONS = ["Sidebar", "Timer Card", "Mobile Menu", "Details Card", "Topbar", "PS", "Simulator", "Book Button"];

export default function MediaTab() {
  const [images, setImages] = useState<any[]>([]);
  
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);

  // New Hierarchy State
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchImages = useCallback(async () => {
    try {
      const data = await api.get("/api/media", { noRedirectOn401: true }) as { items: any[] };
      setImages(data.items || []);
    } catch (error) { console.error("Failed to fetch images", error); }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchImages();
    }, 0);
    return () => clearTimeout(timeout);
  }, [fetchImages]);

  async function handleUpload(e: any) {
    e.preventDefault();
    const files = e.target.file.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append("name", files.length > 1 ? `${e.target.name.value} - ${i + 1}` : e.target.name.value);
        if (e.target.description?.value) fd.append("description", e.target.description.value);
        fd.append("category", e.target.category.value);
        if (e.target.gameName?.value) fd.append("gameName", e.target.gameName.value);
        if (e.target.view?.value) fd.append("view", e.target.view.value);
        if (e.target.profileImageType?.value) fd.append("profileImageType", e.target.profileImageType.value);
        if (e.target.facilityType?.value) fd.append("facilityType", e.target.facilityType.value);
        if (e.target.dashboardType?.value) fd.append("dashboardType", e.target.dashboardType.value);
        fd.append("file", file);

        await api.post("/api/media", fd);
      }
      void fetchImages();
      e.target.reset();
      setCategory("");
    } catch (err) { console.error("Upload error:", err); }
    setUploading(false);
  }

  function convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      await api.delete(`/api/media/${id}`);
      void fetchImages();
    } catch (error) { console.error("Delete error", error); }
  }

  const clipPathStyle = { clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" };
  const hasDynamicField = category === "Games" || category === "Application" || category === "Profile" || category === "Facilities" || category === "Dashboard";

  // =======================================================================
  // HIERARCHY LOGIC
  // =======================================================================
  
  const categories = Array.from(new Set(images.map(img => img.category))).filter(Boolean);

  const getSubFolders = (cat: string) => {
    const catImages = images.filter(img => img.category === cat);
    const subs = new Set<string>();
    catImages.forEach(img => {
      if (cat === "Games" && img.gameName) subs.add(img.gameName);
      else if (cat === "Facilities" && img.facilityType) subs.add(img.facilityType);
      else if (cat === "Dashboard" && img.dashboardType) subs.add(img.dashboardType);
      else if (cat === "Application" && img.view) subs.add(img.view);
      else if (cat === "Profile" && img.profileImageType) subs.add(img.profileImageType);
    });
    return Array.from(subs).filter(Boolean);
  };

  let foldersToRender: {name: string, count: number}[] = [];
  let imagesToRender: any[] = [];

  if (searchQuery) {
    imagesToRender = images.filter(img => img.name.toLowerCase().includes(searchQuery.toLowerCase()));
  } else {
    if (currentPath.length === 0) {
      foldersToRender = categories.map(cat => ({
        name: cat,
        count: images.filter(img => img.category === cat).length
      }));
    } else if (currentPath.length === 1) {
      const activeCat = currentPath[0];
      const subFolders = getSubFolders(activeCat);
      
      if (subFolders.length > 0) {
        foldersToRender = subFolders.map(sub => ({
          name: sub,
          count: images.filter(img => {
            if (activeCat === "Games") return img.gameName === sub;
            if (activeCat === "Facilities") return img.facilityType === sub;
            if (activeCat === "Dashboard") return img.dashboardType === sub;
            if (activeCat === "Application") return img.view === sub;
            if (activeCat === "Profile") return img.profileImageType === sub;
            return false;
          }).length
        }));
      } else {
        imagesToRender = images.filter(img => img.category === activeCat);
      }
    } else if (currentPath.length === 2) {
      const activeCat = currentPath[0];
      const activeSub = currentPath[1];
      imagesToRender = images.filter(img => {
        if (img.category !== activeCat) return false;
        if (activeCat === "Games") return img.gameName === activeSub;
        if (activeCat === "Facilities") return img.facilityType === activeSub;
        if (activeCat === "Dashboard") return img.dashboardType === activeSub;
        if (activeCat === "Application") return img.view === activeSub;
        if (activeCat === "Profile") return img.profileImageType === activeSub;
        return false;
      });
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-black uppercase text-[#1A1A1A] tracking-wide">Media Assets</h2>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full sm:w-64 bg-white border border-black/5 shadow-sm rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/50 transition-all" 
            />
          </div>
          <button onClick={fetchImages} className="text-[10px] font-black text-slate-600 hover:text-[#ff6b35] uppercase tracking-widest flex items-center gap-2 transition-colors">
            <span>↻ Refresh</span>
          </button>
        </div>
      </div>

      {/* UPLOAD FORM */}
      <form onSubmit={handleUpload} className="w-full bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-black/5 shadow-lg space-y-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#ff6b35] mb-2 px-1">Upload New Asset</p>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          <div className={`col-span-1 ${hasDynamicField ? 'md:col-span-4' : 'md:col-span-6'}`}>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-1">Asset Name</label>
            <input name="name" placeholder="Name..." required className="w-full bg-white border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] transition-all" />
          </div>

          <div className={`col-span-1 ${hasDynamicField ? 'md:col-span-4' : 'md:col-span-6'}`}>
            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-1">Category</label>
            <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full appearance-none bg-white border border-slate-200 hover:border-[#ff6b35]/40 rounded-xl px-4 py-2.5 text-xs font-bold uppercase text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#ff6b35] cursor-pointer">
              <option value="">Select...</option>
              <option value="Games">Games</option>
              <option value="Food">Food</option>
              <option value="Drinks">Drinks</option>
              <option value="Application">Application</option>
              <option value="Profile">Profile Defaults</option>
              <option value="Facilities">Facilities</option>
              <option value="Dashboard">Dashboard BG</option>
              <option value="Logo">Logo</option>
            </select>
          </div>

          {/* Dynamic Fields */}
          {category === "Games" && (
            <div className="col-span-1 md:col-span-4 animate-in fade-in">
              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-1">Game Name</label>
              <input type="text" name="gameName" placeholder="e.g. FC24" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-[#ff6b35]" />
            </div>
          )}
          {category === "Application" && (
            <>
              <div className="col-span-1 md:col-span-2 animate-in fade-in">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-1">View</label>
                <select name="view" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold uppercase text-slate-900">
                  <option value="">Select View</option>
                  {APP_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="col-span-1 md:col-span-2 animate-in fade-in">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-1">Game Name</label>
                <input type="text" name="gameName" placeholder="e.g. Dirt 5" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-[#ff6b35]" />
              </div>
            </>
          )}
          {category === "Profile" && (
            <div className="col-span-1 md:col-span-4 animate-in fade-in">
              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-1">Image Type</label>
              <select name="profileImageType" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold uppercase text-slate-900">
                <option value="">Select Type</option>
                <option value="Avatar">Avatar</option>
                <option value="Header">Banner/Header</option>
              </select>
            </div>
          )}
          {category === "Facilities" && (
            <div className="col-span-1 md:col-span-4 animate-in fade-in">
              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-1">Facility Type</label>
              <select name="facilityType" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold uppercase text-slate-900 focus:ring-1 focus:ring-[#ff6b35] cursor-pointer">
                <option value="">Select Option...</option>
                {FACILITY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          )}
          {category === "Dashboard" && (
            <div className="col-span-1 md:col-span-4 animate-in fade-in">
              <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-1">Target Element</label>
              <select name="dashboardType" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold uppercase text-slate-900 focus:ring-1 focus:ring-[#ff6b35] cursor-pointer">
                <option value="">Select Target...</option>
                {DASHBOARD_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          )}

          <div className="col-span-1 md:col-span-12 animate-in fade-in">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-1">Description (Optional)</label>
            <input type="text" name="description" placeholder="Short description..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-[#ff6b35]" />
          </div>

          <div className="col-span-1 md:col-span-12">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-1">Select Files</label>
            <input type="file" name="file" multiple required className="w-full text-[10px] text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-slate-200 file:bg-white file:text-slate-700 cursor-pointer" />
          </div>
        </div>

        <button disabled={uploading} style={clipPathStyle} className="w-full bg-[#ff6b35] text-white py-3 text-[11px] font-black uppercase tracking-widest hover:brightness-95 transition-colors mt-2 shadow-[0_0_15px_rgba(255,107,53,0.20)] disabled:opacity-50">
          {uploading ? "Uploading..." : "Upload Assets"}
        </button>
      </form>

      {/* BREADCRUMBS */}
      {!searchQuery && (
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-black/5 shadow-sm overflow-x-auto">
          <button 
            onClick={() => setCurrentPath([])}
            className={`text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap ${currentPath.length === 0 ? "text-[#ff6b35]" : "text-slate-400 hover:text-slate-800"}`}
          >
            Root
          </button>
          {currentPath.map((path, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-slate-300">/</span>
              <button 
                onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                className={`text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap ${index === currentPath.length - 1 ? "text-[#ff6b35]" : "text-slate-400 hover:text-slate-800"}`}
              >
                {path}
              </button>
            </div>
          ))}
        </div>
      )}

      {searchQuery && <p className="text-xs font-bold text-slate-500">Search results for &quot;{searchQuery}&quot;</p>}

      {/* FOLDERS GRID */}
      {foldersToRender.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in">
          {foldersToRender.map((folder) => (
            <button 
              key={folder.name}
              onClick={() => setCurrentPath([...currentPath, folder.name])}
              className="group flex flex-col items-center justify-center bg-white border border-black/5 rounded-3xl p-6 hover:border-[#ff6b35]/30 hover:shadow-[0_8px_30px_rgba(255,107,53,0.12)] transition-all duration-300 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#ff6b35]/5 to-transparent blur-xl rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              
              <svg className="w-16 h-16 text-[#ff6b35]/80 group-hover:text-[#ff6b35] transition-colors mb-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
              </svg>
              
              <p className="font-bold text-slate-900 text-xs uppercase tracking-wider truncate w-full relative z-10">{folder.name}</p>
              <p className="text-[9px] font-black tracking-widest text-slate-400 mt-1 uppercase relative z-10">{folder.count} Items</p>
            </button>
          ))}
        </div>
      )}

      {/* IMAGES GRID */}
      {imagesToRender.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-4">
          {imagesToRender.map((img) => (
            <div key={img._id} className="group flex flex-col bg-white border border-black/5 rounded-2xl overflow-hidden hover:border-[#ff6b35]/30 transition-all duration-300 shadow-sm">
              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                <Image src={img.secure_url} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover group-hover:scale-110 transition-transform opacity-90 group-hover:opacity-100" alt={img.name} />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">{img.category}</span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/50">
                <div>
                  <p className="font-bold text-slate-900 text-sm uppercase truncate">{img.name}</p>
                  {img.description && <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{img.description}</p>}
                  
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#ff6b35] mt-2 opacity-80">
                    {img.category === "Facilities" && img.facilityType ? `Type: ${img.facilityType}` :
                     img.category === "Dashboard" && img.dashboardType ? `Target: ${img.dashboardType}` :
                     img.gameName ? `Game: ${img.gameName}` :
                     img.profileImageType ? `Type: ${img.profileImageType}` : "Asset"}
                  </p>
                </div>
                <button onClick={() => handleDelete(img._id)} className="mt-4 w-full py-2.5 rounded-xl border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-500/40 transition-all">
                  Delete Asset
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {foldersToRender.length === 0 && imagesToRender.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center opacity-60">
          <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">No media found</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Upload some assets to see them here.</p>
        </div>
      )}
    </div>
  );
}