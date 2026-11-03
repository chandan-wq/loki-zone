"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Link as LinkIcon,
  Video as VideoIcon,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
  Loader2,
  Play,
} from "lucide-react";

interface MediaUploadInputProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  acceptVideo?: boolean;
  getAdminAuthHeaders: () => Promise<Record<string, string>>;
  placeholder?: string;
  helperText?: string;
  className?: string;
}

export default function MediaUploadInput({
  label,
  value,
  onChange,
  acceptVideo = false,
  getAdminAuthHeaders,
  placeholder,
  helperText,
  className = "",
}: MediaUploadInputProps) {
  const [mode, setMode] = useState<"upload" | "link">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo =
    value &&
    (value.endsWith(".mp4") ||
      value.endsWith(".webm") ||
      value.endsWith(".mov") ||
      value.includes("video_") ||
      value.includes("youtube.com") ||
      value.includes("youtu.be"));

  const handleFile = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const headers = await getAdminAuthHeaders();
      const uploadHeaders = { ...headers };
      delete uploadHeaders["Content-Type"];
      delete uploadHeaders["content-type"];

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: uploadHeaders,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload file to storage.");
      }

      onChange(data.url);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload media. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-300 text-xs">{label}</label>
        <div className="flex items-center gap-1 bg-[#0b0f17] p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition ${
              mode === "upload"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("link")}
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition ${
              mode === "link"
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Paste Link</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-2.5 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {mode === "upload" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
            dragOver
              ? "border-red-500 bg-red-500/10"
              : "border-slate-700/80 bg-[#0b0f17] hover:border-slate-600 hover:bg-slate-900/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={
              acceptVideo
                ? "image/png,image/jpeg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime"
                : "image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            }
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {isUploading ? (
            <div className="py-4 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-7 h-7 text-red-500 animate-spin" />
              <p className="text-xs font-bold text-white">Uploading to Cloud Storage...</p>
              <p className="text-[10px] text-slate-400">Saving securely to Supabase Storage</p>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center justify-center space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                {acceptVideo ? <VideoIcon className="w-5 h-5 text-red-400" /> : <UploadCloud className="w-5 h-5 text-red-400" />}
              </div>
              <p className="text-xs font-bold text-slate-200">
                Click to browse or drag &amp; drop {acceptVideo ? "photo or video" : "image"}
              </p>
              <p className="text-[10px] text-slate-400">
                {acceptVideo
                  ? "PNG, JPG, WEBP, GIF, SVG (max 15MB) • MP4, WebM (max 60MB)"
                  : "PNG, JPG, WEBP, GIF, SVG (max 15MB)"}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="relative">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={
                placeholder ||
                (acceptVideo
                  ? "https://... or /images/... or cloud storage URL"
                  : "https://... or /images/hero-bg.jpg")
              }
              className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-red-500 pr-10"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live Preview Display */}
      {value && (
        <div className="p-3 bg-[#0b0f17] border border-slate-800 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-14 h-14 rounded-lg bg-black border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
              {isVideo ? (
                <video
                  src={value}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <Image
                  src={value}
                  alt="Preview"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain p-1"
                  unoptimized={value.startsWith("http")}
                />
              )}
              {isVideo && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              )}
            </div>
            <div className="min-w-0 text-left">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>{isVideo ? "Active Video Selected" : "Active Image Selected"}</span>
              </span>
              <p className="text-xs text-white truncate max-w-[240px] font-mono mt-0.5" title={value}>
                {value}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-slate-400 hover:text-red-400 p-1 rounded-lg hover:bg-slate-800 transition flex-shrink-0"
            title="Remove media"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {helperText && <p className="text-[10px] text-slate-400">{helperText}</p>}
    </div>
  );
}
