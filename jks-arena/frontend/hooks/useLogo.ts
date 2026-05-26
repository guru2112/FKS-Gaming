"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";

export function useLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogo() {
      try {
        const data = await api.get("/api/media/logo") as any;
        if (data && data.secure_url) {
          setLogoUrl(data.secure_url);
        }
      } catch (err) {
        console.error("Failed to fetch logo:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogo();
  }, []);

  return { logoUrl, loading };
}
