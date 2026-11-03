"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, Check, Image as ImageIcon, Link as LinkIcon, Plus, Trash2, Loader2, Sparkles } from "lucide-react";

export const LOKI_OFFICIAL_PRESETS = [
  {
    name: "Dragon 10 Carbon Racket",
    url: "/images/product-1-light.png",
    category: "Rackets",
  },
  {
    name: "RXTON 7 Carbon Pro Racket",
    url: "/images/pdp-main-racket.png",
    category: "Rackets",
  },
  {
    name: "RXTON 3 Rubber Sheet",
    url: "/images/loki-rxton-3-rubber.jpg",
    category: "Accessories",
  },
  {
    name: "Aeroflex Pro Jersey",
    url: "/images/loki-aeroflex-jersey.jpg",
    category: "Apparel",
  },
  {
    name: "Pro Match Shorts",
    url: "/images/loki-pro-shorts.jpg",
    category: "Apparel",
  },
  {
    name: "Court Swift Shoes",
    url: "/images/loki-court-swift-shoes.jpg",
    category: "Footwear",
  },
  {
    name: "3-Star Balls 6-Pack",
    url: "/images/loki-3-star-balls-pack.png",
    category: "Balls",
  },
  {
    name: "Tournament Hardshell Case",
    url: "/images/loki-hardshell-case.jpg",
    category: "Accessories",
  },
  {
    name: "Microfiber Sports Towel",
    url: "/images/loki-sports-towel.jpg",
    category: "Accessories",
  },
];

interface ProductImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  additionalImages?: string[];
  onChangeAdditionalImages?: (images: string[]) => void;
  getAdminAuthHeaders: () => Promise<Record<string, string>>;
}

export default function ProductImagePicker({
  value,
  onChange,
  additionalImages = [],
  onChangeAdditionalImages,
  getAdminAuthHeaders,
}: ProductImagePickerProps) {
  const [activeTab, setActiveTab] = useState<"preset" | "upload" | "url">("preset");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState(value || "");
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const headers = await getAdminAuthHeaders();
      const formData = new FormData();
      formData.append("file", file);

      // Remove content-type so browser sets multipart boundary automatically
      const uploadHeaders = { ...headers };
      delete uploadHeaders["Content-Type"];
      delete uploadHeaders["content-type"];

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: uploadHeaders,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image.");
      }

      onChange(data.url);
      setCustomUrlInput(data.url);
    } catch (err: any) {
      console.error("Image upload failed:", err);
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddGalleryImage = (urlToAdd: string) => {
    const trimmed = urlToAdd.trim();
    if (!trimmed || !onChangeAdditionalImages) return;
    if (!additionalImages.includes(trimmed)) {
      onChangeAdditionalImages([...additionalImages, trimmed]);
    }
    setNewGalleryUrl("");
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    if (!onChangeAdditionalImages) return;
    onChangeAdditionalImages(additionalImages.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3 p-4 bg-[#0b0f17] border border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-200 text-xs">
          Product Primary Photography &amp; Angles
        </label>
        <span className="text-[10px] text-slate-400 font-mono">
          Supabase CDN &amp; High-Res Sync
        </span>
      </div>

      {/* Main Preview & Selected Info */}
      <div className="flex items-center gap-3.5 bg-[#121824] p-3 rounded-xl border border-slate-800">
        <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center relative overflow-hidden flex-shrink-0">
          {value ? (
            <Image
              src={value}
              alt="Product Preview"
              width={60}
              height={60}
              className="object-contain max-h-14 transition hover:scale-110"
              onError={() => {}}
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-white truncate">
            {value ? value.split("/").pop() : "No image selected"}
          </div>
          <p className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
            {value || "Select from official presets or upload a new studio photo"}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
              Active Primary Cover
            </span>
            {value.startsWith("https://") && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20">
                Cloud CDN
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("preset")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "preset"
              ? "bg-red-600 text-white"
              : "bg-slate-800/60 text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official LOKI Presets</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "upload"
              ? "bg-red-600 text-white"
              : "bg-slate-800/60 text-slate-400 hover:text-white"
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === "url"
              ? "bg-red-600 text-white"
              : "bg-slate-800/60 text-slate-400 hover:text-white"
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Custom URL</span>
        </button>
      </div>

      {/* Tab 1: Official Presets Grid */}
      {activeTab === "preset" && (
        <div className="space-y-2">
          <p className="text-[10px] text-slate-400">
            Click any authentic studio photography asset below to apply instantly:
          </p>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {LOKI_OFFICIAL_PRESETS.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    onChange(preset.url);
                    setCustomUrlInput(preset.url);
                  }}
                  className={`p-2 rounded-xl text-left border transition relative flex items-center gap-2 ${
                    isSelected
                      ? "bg-red-950/40 border-red-500 ring-1 ring-red-500"
                      : "bg-[#121824] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-0.5 flex-shrink-0">
                    <Image
                      src={preset.url}
                      alt={preset.name}
                      width={28}
                      height={28}
                      className="object-contain max-h-7"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold text-white truncate">
                      {preset.name}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">
                      {preset.category}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute right-1.5 top-1.5 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-white">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: File Upload (Supabase Storage) */}
      {activeTab === "upload" && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-red-500 rounded-xl p-5 text-center cursor-pointer bg-[#121824] transition group"
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-2 py-2">
                <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                <span className="text-xs font-bold text-slate-300">
                  Uploading to Supabase CDN...
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-red-600/20 text-slate-300 group-hover:text-red-400 flex items-center justify-center transition">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-white">
                  Click to Browse or Drag Image Here
                </div>
                <p className="text-[10px] text-slate-400">
                  PNG, JPG, WEBP up to 10MB • Auto-optimized on Supabase CDN
                </p>
              </div>
            )}
          </div>
          {uploadError && (
            <div className="text-[11px] text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-800">
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Custom URL */}
      {activeTab === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://example.com/image.jpg or /images/..."
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#121824] border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-red-500"
            />
            <button
              type="button"
              onClick={() => {
                if (customUrlInput.trim()) {
                  onChange(customUrlInput.trim());
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition"
            >
              Apply
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Paste any direct HTTPS image link or local path.
          </p>
        </div>
      )}

      {/* Multi-Angle Gallery Images Manager */}
      {onChangeAdditionalImages && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300">
              Multi-Angle Gallery Images ({additionalImages.length})
            </span>
            <span className="text-[9px] text-slate-500">
              Shown in Product Page Thumbnails
            </span>
          </div>

          {/* Existing Thumbnails */}
          {additionalImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {additionalImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 p-0.5 flex items-center justify-center overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`Angle ${idx + 1}`}
                    width={40}
                    height={40}
                    className="object-contain max-h-10"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                    title="Remove angle"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Angle Input */}
          <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
            <input
              type="text"
              placeholder="Paste angle image URL..."
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              className="flex-1 min-w-[160px] px-2.5 py-1.5 bg-[#121824] border border-slate-700 rounded-lg text-white text-[11px] focus:outline-none focus:border-red-500"
            />
            <button
              type="button"
              onClick={() => handleAddGalleryImage(newGalleryUrl)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] flex items-center gap-1 transition shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span>Add URL</span>
            </button>
            <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-sm shrink-0">
              <UploadCloud className="w-3 h-3" />
              <span>Upload Angle</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const headers = await getAdminAuthHeaders();
                    const uploadHeaders = { ...headers };
                    delete uploadHeaders["Content-Type"];
                    delete uploadHeaders["content-type"];
                    const formData = new FormData();
                    formData.append("file", f);
                    const res = await fetch("/api/admin/upload", {
                      method: "POST",
                      headers: uploadHeaders,
                      body: formData,
                    });
                    const data = await res.json();
                    if (data.success && data.url) {
                      handleAddGalleryImage(data.url);
                    }
                  } catch (err) {
                    console.error("Gallery angle upload error:", err);
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
