"use client";

import { useEffect, useState, useMemo } from "react";
import { API_BASE_URL } from "@/lib/auth"; 

const APP_OPTIONS = ["Mobile", "Desktop"];
// 🔥 Added "Multiplayer" to the upload options
const FACILITY_OPTIONS = ["Screen", "PS", "Seating", "Simulator", "Multiplayer"];

export default function MediaTab() {
  const [images, setImages] = useState<any[]>([]);
  
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);

  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterGameName, setFilterGameName] = useState("ALL");
  const [filterFacilityType, setFilterFacilityType] = useState("ALL"); 
  const [searchQuery, setSearchQuery] = useState("");

  async function fetchImages() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/media`);
      const data = await res.json();
      setImages(data.items || []);
    } catch (error) { console.error("Failed to fetch images", error); }
  }

  useEffect(() => { fetchImages(); }, []);

  async function handleUpload(e: any) {
    e.preventDefault();
    const files = e.target.file.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      const token = localStorage.getItem("auth_token");
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await convertToBase64(file);
        await fetch(`${API_BASE_URL}/api/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            name: files.length > 1 ? `${e.target.name.value} - ${i + 1}` : e.target.name.value,
            description: e.target.description?.value, 
            category: e.target.category.value,
            gameName: e.target.gameName?.value,
            view: e.target.view?.value, 
            profileImageType: e.target.profileImageType?.value,
            facilityType: e.target.facilityType?.value, 
            file: base64,
          }),
        });
      }
      fetchImages();
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
    const token = localStorage.getItem("auth_token");
    try {
      await fetch(`${API_BASE_URL}/api/media/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      fetchImages();
    } catch (error) { console.error("Delete error", error); }
  }

  const uniqueUploadedGames = useMemo(() => {
    return Array.from(new Set(images.filter(img => img.category === "Games" && img.gameName).map(img => img.gameName)));
  }, [images]);

  const filteredImages = useMemo(() => {
    return images.filter(img => {
      const matchCategory = filterCategory === "ALL" || img.category === filterCategory;
      const matchGame = filterCategory !== "Games" || filterGameName === "ALL" || img.gameName === filterGameName;
      const matchFacility = filterCategory !== "Facilities" || filterFacilityType === "ALL" || img.facilityType === filterFacilityType;
      const matchSearch = !searchQuery || img.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCategory && matchGame && matchFacility && matchSearch;
    });
  }, [images, filterCategory, filterGameName, filterFacilityType, searchQuery]);

  const clearFilters = () => { setFilterCategory("ALL"); setFilterGameName("ALL"); setFilterFacilityType("ALL"); setSearchQuery(""); };
  const clipPathStyle = { clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" };
  
  const hasDynamicField = category === "Games" || category === "Application" || category === "Profile" || category === "Facilities";

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black uppercase text-[#1A1A1A] tracking-wide">Media Assets</h2>
        <button onClick={fetchImages} className="text-[10px] font-black text-slate-600 hover:text-[#ff6b35] uppercase tracking-widest flex items-center gap-2 transition-colors">
          <span>↻ Refresh Gallery</span>
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <form onSubmit={handleUpload} className="w-full xl:flex-[1.8] bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-black/5 shadow-lg space-y-6">
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
              <div className="col-span-1 md:col-span-4 animate-in fade-in">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-1">View</label>
                <select name="view" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold uppercase text-slate-900">
                  <option value="">Select View</option>
                  {APP_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
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
            
            {/* Facility Type Selection */}
            {category === "Facilities" && (
              <div className="col-span-1 md:col-span-4 animate-in fade-in">
                <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 px-1">Facility Type</label>
                <select name="facilityType" required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold uppercase text-slate-900 focus:ring-1 focus:ring-[#ff6b35] cursor-pointer">
                  <option value="">Select Option...</option>
                  {FACILITY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
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

        <div className="w-full xl:flex-[1] bg-white/80 backdrop-blur-md p-6 rounded-[32px] border border-black/5 shadow-lg space-y-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#ff6b35] mb-2 px-1">Gallery Filters</p>
          <div className="space-y-4">
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400" />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1.5">Category</label>
                <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setFilterGameName("ALL"); setFilterFacilityType("ALL"); }} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase text-slate-900">
                  <option value="ALL">All</option>
                  <option value="Games">Games</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Food">Food</option>
                  <option value="Profile">Profile</option>
                </select>
              </div>

              {/* Dynamic Filter */}
              {filterCategory === "Games" ? (
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1.5">Game Name</label>
                  <select value={filterGameName} onChange={(e) => setFilterGameName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase text-slate-900">
                    <option value="ALL">All</option>
                    {uniqueUploadedGames.map(game => <option key={game} value={game}>{game}</option>)}
                  </select>
                </div>
              ) : filterCategory === "Facilities" ? (
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1.5">Type</label>
                  <select value={filterFacilityType} onChange={(e) => setFilterFacilityType(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase text-slate-900">
                    <option value="ALL">All</option>
                    {FACILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              ) : (
                <div className="opacity-30 pointer-events-none">
                  <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1.5">N/A</label>
                  <select disabled className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase text-slate-900"><option>-</option></select>
                </div>
              )}
            </div>

            <button onClick={clearFilters} className="w-full h-[40px] rounded-xl border border-black/5 bg-white text-[9px] font-black uppercase text-slate-700 hover:bg-[#ff6b35] hover:text-white transition-colors">
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredImages.map((img) => (
          <div key={img._id} className="group flex flex-col bg-white border border-black/5 rounded-2xl overflow-hidden hover:border-[#ff6b35]/30 transition-all duration-300 shadow-sm">
            <div className="relative h-40 w-full overflow-hidden bg-slate-100">
              <img src={img.secure_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform opacity-90 group-hover:opacity-100" alt={img.name} />
              <span className="absolute top-2 left-2 bg-black/60 text-white text-[7px] font-black uppercase px-2 py-0.5 rounded-md">{img.category}</span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm uppercase truncate">{img.name}</p>
                {img.description && <p className="text-[10px] text-slate-600 mt-1 line-clamp-2 leading-tight">{img.description}</p>}
                
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#ff6b35] mt-1.5 opacity-80">
                  {img.category === "Facilities" && img.facilityType ? `Type: ${img.facilityType}` : 
                   img.gameName ? `Game: ${img.gameName}` : 
                   img.profileImageType ? `Type: ${img.profileImageType}` : "Asset"}
                </p>
              </div>
              <button onClick={() => handleDelete(img._id)} className="mt-3 w-full py-2 rounded-lg border border-red-500/20 text-red-500 text-[8px] font-black uppercase hover:bg-red-500/10 transition-colors">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}