"use client";

import { useState, useEffect } from "react";

import {
  updateProfile,
  fetchPublicMedia,
  type Profile,
  type MediaItem,
} from "@/lib/auth";

interface SettingsSectionProps {
  profile: Profile | null;

  onProfileUpdated: (
    updatedUser: Profile
  ) => Promise<void>;
}

export default function SettingsSection({
  profile,
  onProfileUpdated,
}: SettingsSectionProps) {

  /* =========================================================
     🔥 STATES
  ========================================================= */

  const [name, setName] =
    useState(
      profile?.name || ""
    );

  const [email, setEmail] =
    useState(
      profile?.email || ""
    );

  const [avatarUrl, setAvatarUrl] =
    useState(
      profile?.avatarUrl || ""
    );

  const [
    availableAvatars,
    setAvailableAvatars,
  ] = useState<MediaItem[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [message, setMessage] =
    useState<{
      text: string;

      type:
        | "success"
        | "error";
    } | null>(null);

  /* =========================================================
     🔥 SYNC PROFILE
  ========================================================= */

  useEffect(() => {

    setName(
      profile?.name || ""
    );

    setEmail(
      profile?.email || ""
    );

    setAvatarUrl(
      profile?.avatarUrl || ""
    );

  }, [profile]);

  /* =========================================================
     🔥 FETCH AVATARS
  ========================================================= */

  useEffect(() => {

    async function loadAvatars() {

      try {

        const items =
          await fetchPublicMedia(
            "Profile"
          );

        const avatars =
          items.filter(
            (item) =>
              item.profileImageType ===
              "Avatar"
          );

        setAvailableAvatars(
          avatars
        );

      } catch (err) {

        console.error(
          "Failed to fetch avatars:",
          err
        );

      }
    }

    loadAvatars();

  }, []);

  /* =========================================================
     🔥 SAVE PROFILE
  ========================================================= */

  const handleSave =
    async () => {

      setIsLoading(true);

      setMessage(null);

      try {

        const token =
          localStorage.getItem(
            "auth_token"
          );

        if (!token) {

          throw new Error(
            "No authentication token found"
          );

        }

        // ✅ Correct updateProfile usage

        const updatedData =
          await updateProfile(
            {
              name,
              email,
              avatarUrl,
            },
            token
          );

        // ✅ Handle returned profile safely

        const updatedUser =
          (updatedData as any)?.user ||
          updatedData;

        // ✅ Update parent state

        await onProfileUpdated(
          updatedUser
        );

        // ✅ Save latest profile locally

        localStorage.setItem(
          "profile",
          JSON.stringify(
            updatedUser
          )
        );

        setMessage({
          text:
            "Profile updated successfully!",

          type: "success",
        });

      } catch (err: any) {

        console.error(err);

        setMessage({
          text:
            err?.message ||
            "Failed to update profile",

          type: "error",
        });

      } finally {

        setIsLoading(false);

      }
    };

  /* =========================================================
     🔥 UI
  ========================================================= */

  return (

    <div className="bg-white border border-[#1A1A1A] rounded-[2.5rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)]">

      {/* ========================================================= */}
      {/* 🔥 TOP BANNER */}
      {/* ========================================================= */}

      <div className="relative h-40 bg-gradient-to-r from-[#FDF8F5] via-[#F3EFEC] to-[#ff6b35]/10 border-b border-[#1A1A1A]/10 overflow-hidden">

        {/* ========================================================= */}
        {/* 🔥 AVATAR STRIP */}
        {/* ========================================================= */}

        <div className="absolute inset-x-0 top-8 flex items-center justify-center gap-4 px-6 overflow-x-auto custom-scrollbar">

          {availableAvatars
            .slice(0, 10)
            .map((avatar) => (

              <button
                key={avatar._id}

                onClick={() =>
                  setAvatarUrl(
                    avatar.secure_url ||
                    ""
                  )
                }

                className={`relative shrink-0 rounded-full transition-all duration-300 ${
                  avatarUrl ===
                  avatar.secure_url

                    ? "scale-110"

                    : "opacity-70 hover:opacity-100 hover:scale-105"
                }`}
              >

                {/* ACTIVE GLOW */}

                {avatarUrl ===
                  avatar.secure_url && (

                  <div className="absolute inset-0 rounded-full bg-[#ff6b35]/30 blur-xl scale-125"></div>

                )}

                <div
                  className={`relative h-16 w-16 rounded-full overflow-hidden border-4 transition-all duration-300 ${
                    avatarUrl ===
                    avatar.secure_url

                      ? "border-[#ff6b35] shadow-[0_0_20px_rgba(255,107,53,0.45)]"

                      : "border-white/70"
                  }`}
                >

                  <img
                    src={
                      avatar.secure_url
                    }

                    alt="Avatar"

                    className="w-full h-full object-cover"
                  />

                </div>

              </button>

            ))}

        </div>

      </div>

      {/* ========================================================= */}
      {/* 🔥 CONTENT */}
      {/* ========================================================= */}

      <div className="px-6 md:px-10 pb-10 relative">

        {/* ========================================================= */}
        {/* 🔥 PROFILE HEADER */}
        {/* ========================================================= */}

        <div className="relative -mt-14 mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

          {/* LEFT SECTION */}

          <div className="flex items-end gap-5">

            {/* MAIN AVATAR */}

            <div className="relative">

              <div className="absolute inset-0 rounded-full bg-[#ff6b35]/20 blur-2xl"></div>

              <div className="relative w-32 h-32 rounded-full border-[5px] border-white bg-[#FDF8F5] overflow-hidden flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.12)]">

                {avatarUrl ? (

                  <img
                    key={avatarUrl}

                    src={avatarUrl}

                    alt="Avatar"

                    className="w-full h-full object-cover"
                  />

                ) : (

                  <span className="text-4xl text-[#ff6b35] font-black">

                    {profile?.name?.charAt(
                      0
                    )}

                  </span>

                )}

              </div>

              {/* ONLINE DOT */}

              <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-green-500 border-4 border-white shadow-lg"></div>

            </div>

            {/* USER INFO */}

            <div className="pb-2">

              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff6b35] mb-2">

                Active Gamer Profile

              </p>

              <h2 className="text-3xl font-black uppercase tracking-tight text-[#1A1A1A]">

                {name || "Player"}

              </h2>

              <p className="text-sm text-slate-500 mt-1">

                Customize your account settings & avatar

              </p>

            </div>

          </div>

          {/* SAVE BUTTON */}

          <button
            onClick={handleSave}

            disabled={isLoading}

            className="w-full lg:w-auto bg-[#ff6b35] text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.28em] shadow-[0_8px_25px_rgba(255,107,53,0.35)] hover:bg-[#e05a2b] transition-all duration-300 disabled:opacity-50"
          >

            {isLoading
              ? "Saving..."
              : "Save Changes"}

          </button>

        </div>

        {/* ========================================================= */}
        {/* 🔥 MESSAGE */}
        {/* ========================================================= */}

        {message && (

          <div
            className={`p-4 rounded-2xl text-sm font-bold mb-8 border shadow-sm ${
              message.type ===
              "success"

                ? "bg-green-50 border-green-200 text-green-600"

                : "bg-red-50 border-red-200 text-red-600"
            }`}
          >

            {message.text}

          </div>

        )}

        {/* ========================================================= */}
        {/* 🔥 FORM */}
        {/* ========================================================= */}

        <div className="grid md:grid-cols-2 gap-8">

          {/* NAME */}

          <div className="space-y-3">

            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 ml-1">

              Gamer Tag / Name

            </label>

            <input
              type="text"

              value={name}

              onChange={(e) =>
                setName(
                  e.target.value
                )
              }

              className="w-full bg-[#FDF8F5] border border-[#1A1A1A]/15 rounded-2xl px-5 py-4 text-[#1A1A1A] font-black focus:outline-none focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all shadow-sm"
            />

          </div>

          {/* EMAIL */}

          <div className="space-y-3">

            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 ml-1">

              Email Address

            </label>

            <input
              type="email"

              value={email}

              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }

              className="w-full bg-[#FDF8F5] border border-[#1A1A1A]/15 rounded-2xl px-5 py-4 text-[#1A1A1A] font-black focus:outline-none focus:border-[#ff6b35] focus:ring-2 focus:ring-[#ff6b35]/20 transition-all shadow-sm"
            />

          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* 🔥 SCROLLBAR */}
      {/* ========================================================= */}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ff6b35;
          border-radius: 999px;
        }
      `}</style>

    </div>
  );
}