"use client";

import { useState } from "react";

import { API_BASE_URL } from "@/lib/auth";

export default function SecurityTab() {

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // =========================================================
  // 🔥 PASSWORD STRENGTH
  // =========================================================

  const getStrength = () => {

    if (newPassword.length < 6) {

      return {
        label: "Weak",
        color: "bg-red-500",
      };

    }

    if (newPassword.length < 10) {

      return {
        label: "Medium",
        color: "bg-yellow-500",
      };

    }

    return {
      label: "Strong",
      color: "bg-green-500",
    };

  };

  const strength =
    getStrength();

  // =========================================================
  // 🔥 UPDATE PASSWORD
  // =========================================================

  const handleUpdatePassword =
    async () => {

      try {

        setMessage(null);

        // =========================================================
        // 🔥 VALIDATION
        // =========================================================

        if (
          !currentPassword ||
          !newPassword ||
          !confirmPassword
        ) {

          return setMessage({
            type: "error",
            text: "All fields are required.",
          });

        }

        if (
          newPassword !==
          confirmPassword
        ) {

          return setMessage({
            type: "error",
            text: "Passwords do not match.",
          });

        }

        if (
          newPassword.length < 6
        ) {

          return setMessage({
            type: "error",
            text: "Password must be at least 6 characters.",
          });

        }

        const token =
          localStorage.getItem(
            "auth_token"
          );

        if (!token) {

          return setMessage({
            type: "error",
            text: "Authentication failed.",
          });

        }

        setIsLoading(true);

        // =========================================================
        // 🔥 API CALL
        // =========================================================

        const res = await fetch(
          `${API_BASE_URL}/api/user/change-password`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              currentPassword,
              newPassword,
            }),
          }
        );

        const data =
          await res.json();

        if (!res.ok) {

          throw new Error(
            data.message ||
              "Failed to update password."
          );

        }

        // =========================================================
        // 🔥 SUCCESS
        // =========================================================

        setMessage({
          type: "success",
          text:
            data.message ||
            "Password updated successfully!",
        });

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

      } catch (err: any) {

        setMessage({
          type: "error",
          text:
            err.message ||
            "Something went wrong.",
        });

      } finally {

        setIsLoading(false);

      }

    };

  return (

    <div className="rounded-[32px] border border-[#ff6b35]/15 bg-white/70 backdrop-blur-xl p-8 shadow-xl">

      {/* TITLE */}

      <div className="mb-8">

        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#ff6b35]">

          Security Settings

        </p>

        <h3 className="mt-3 text-3xl font-black text-[#1A1A1A]">

          Password & Authentication

        </h3>

      </div>

      {/* MESSAGE */}

      {message && (

        <div
          className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-bold ${
            message.type ===
            "success"

              ? "border-green-200 bg-green-50 text-green-600"

              : "border-red-200 bg-red-50 text-red-600"
          }`}
        >

          {message.text}

        </div>

      )}

      {/* FORM */}

      <div className="space-y-6">

        {/* CURRENT */}

        <div>

          <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-500">

            Current Password

          </label>

          <input
            type="password"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[#ff6b35]/15 bg-white/70 px-5 py-4 outline-none transition-all duration-300 focus:border-[#ff6b35]"
            placeholder="Enter current password"
          />

        </div>

        {/* NEW */}

        <div>

          <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-500">

            New Password

          </label>

          <input
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[#ff6b35]/15 bg-white/70 px-5 py-4 outline-none transition-all duration-300 focus:border-[#ff6b35]"
            placeholder="Enter new password"
          />

          {/* STRENGTH */}

          <div className="mt-3">

            <div className="mb-2 flex items-center justify-between">

              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">

                Password Strength

              </p>

              <p className="text-[10px] font-black uppercase tracking-widest text-[#ff6b35]">

                {strength.label}

              </p>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200">

              <div
                className={`h-full transition-all duration-300 ${strength.color}`}
                style={{
                  width:
                    strength.label ===
                    "Weak"

                      ? "33%"

                      : strength.label ===
                        "Medium"

                      ? "66%"

                      : "100%",
                }}
              />

            </div>

          </div>

        </div>

        {/* CONFIRM */}

        <div>

          <label className="mb-2 block text-[11px] font-black uppercase tracking-widest text-slate-500">

            Confirm Password

          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-[#ff6b35]/15 bg-white/70 px-5 py-4 outline-none transition-all duration-300 focus:border-[#ff6b35]"
            placeholder="Confirm new password"
          />

        </div>

        {/* BUTTON */}

        <button
          onClick={
            handleUpdatePassword
          }
          disabled={isLoading}
          className="mt-4 rounded-2xl bg-[#ff6b35] px-8 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-white shadow-[0_0_20px_rgba(255,107,53,0.3)] transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >

          {isLoading
            ? "Updating..."
            : "Update Password"}

        </button>

      </div>

    </div>

  );

}