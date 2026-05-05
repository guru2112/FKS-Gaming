"use client";

import { useEffect, useState } from "react";

const GAME_OPTIONS = [
  "FIFA26",
  "WWE 2K26",
  "Forza Horizon 5",
  "It's Take Two",
  "Asphalt 9",
];

export default function MediaTab() {
  const [images, setImages] = useState<any[]>([]);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);

  async function fetchImages() {
    const res = await fetch("http://localhost:5000/api/media");
    const data = await res.json();
    setImages(data.items || []);
  }

  useEffect(() => {
    fetchImages();
  }, []);

  // 🔥 MULTIPLE UPLOAD
  async function handleUpload(e: any) {
    e.preventDefault();

    const files = e.target.file.files;

    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const base64 = await convertToBase64(file);

        await fetch("http://localhost:5000/api/media", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: files.length > 1
              ? `${e.target.name.value} - ${i + 1}`
              : e.target.name.value,
            category: e.target.category.value,
            gameName: e.target.gameName?.value,
            file: base64,
          }),
        });
      }

      fetchImages();
      e.target.reset();
      setCategory("");
    } catch (err) {
      console.error("Upload error:", err);
    }

    setUploading(false);
  }

  // 🔥 BASE64 CONVERTER
  function convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  // 🔥 DELETE
  async function handleDelete(id: string) {
    await fetch(`http://localhost:5000/api/media/${id}`, {
      method: "DELETE",
    });

    fetchImages();
  }

  return (
    <div className="space-y-6">

      {/* 🔥 UPLOAD */}
      <form
        onSubmit={handleUpload}
        className="bg-white p-5 shadow rounded space-y-3"
      >
        <input
          name="name"
          placeholder="Image Name"
          required
          className="border p-2 w-full"
        />

        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="border p-2 w-full"
        >
          <option value="">Select Category</option>
          <option value="Games">Games</option>
          <option value="Food">Food</option>
          <option value="Drinks">Drinks</option>
        </select>

        {category === "Games" && (
          <select name="gameName" required className="border p-2 w-full">
            <option value="">Select Game</option>
            {GAME_OPTIONS.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        )}

        {/* 🔥 FIX: MULTIPLE */}
        <input type="file" name="file" multiple required />

        <button
          className="bg-orange-500 text-white px-4 py-2"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {/* 🔥 GALLERY */}
      <div className="grid grid-cols-3 gap-4">
        {images.map((img) => (
          <div key={img._id} className="bg-white p-3 shadow">
            <img
              src={img.secure_url}
              className="h-40 w-full object-cover"
            />
            <p>{img.name}</p>
            <button
              onClick={() => handleDelete(img._id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}