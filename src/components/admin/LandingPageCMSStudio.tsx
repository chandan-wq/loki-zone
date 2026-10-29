"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  TrendingUp,
  Crosshair,
  Layers,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  Zap,
  Plus,
  Trash2,
  Check,
  Search,
  MoveUp,
  MoveDown,
  RotateCw,
  Star,
  X,
  ExternalLink,
  Edit3,
  Save,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  useAdminStore,
  ShowcaseItemCMS,
  CategoryCardCMS,
  FinderOptionCMS,
  BrandStoryPillarCMS,
  ReviewCMS,
  FAQItemCMS,
} from "@/store/useAdminStore";
import { Product } from "@/data/products";

export default function LandingPageCMSStudio() {
  const {
    products,
    // 1. Best Sellers CMS
    bestSellersCMS,
    updateBestSellersCMS,
    setSelectedBestSellerProductIds,
    // 2. Equipment Finder CMS
    equipmentFinder,
    updateEquipmentFinder,
    updateFinderOption,
    setFinderRecommendedProducts,
    addFinderOption,
    deleteFinderOption,
    // 3. Category Section CMS
    categorySection,
    updateCategorySection,
    updateCategoryCard,
    addCategoryCard,
    deleteCategoryCard,
    // 4. Horizontal Showcase CMS
    horizontalShowcase,
    updateHorizontalShowcase,
    updateShowcaseItem,
    addShowcaseItem,
    deleteShowcaseItem,
    // 5. Brand Story CMS
    brandStory,
    updateBrandStory,
    updateBrandStoryPillar,
    addBrandStoryPillar,
    deleteBrandStoryPillar,
    // 6. Reviews CMS
    reviews,
    addReview,
    updateReview,
    deleteReview,
    // 7. FAQs CMS
    faqs,
    addFAQ,
    updateFAQ,
    deleteFAQ,
    // 8. CTA Banner CMS
    ctaBanner,
    updateCTABanner,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<
    | "bestsellers"
    | "finder"
    | "categories"
    | "showcase"
    | "brandstory"
    | "reviews"
    | "faqs"
    | "ctabanner"
  >("bestsellers");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // =============================================================
  // 1. BEST SELLERS & TRENDING STATE
  // =============================================================
  const [bsSearch, setBsSearch] = useState("");
  const [bsCategoryFilter, setBsCategoryFilter] = useState("All");

  const availableBsProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(bsSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(bsSearch.toLowerCase());
    const matchCat =
      bsCategoryFilter === "All" || p.category === bsCategoryFilter;
    return matchSearch && matchCat;
  });

  const selectedBsProductIds = bestSellersCMS?.selectedProductIds || [];
  const selectedBsProducts: Product[] = selectedBsProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const handleToggleBsProduct = (prodId: string) => {
    const current = [...selectedBsProductIds];
    const index = current.indexOf(prodId);
    if (index > -1) {
      current.splice(index, 1);
      showToast("Removed from Best Sellers");
    } else {
      current.push(prodId);
      showToast("Added to Best Sellers");
    }
    setSelectedBestSellerProductIds(current);
  };

  const handleMoveBsProduct = (index: number, direction: "up" | "down") => {
    const current = [...selectedBsProductIds];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= current.length) return;
    const temp = current[index];
    current[index] = current[target];
    current[target] = temp;
    setSelectedBestSellerProductIds(current);
  };

  // =============================================================
  // 2. PLAYSTYLE GUIDE (CONTROL, SPIN, SPEED) STATE
  // =============================================================
  const [activeStyleId, setActiveStyleId] = useState<string>("control");
  const [finderSearch, setFinderSearch] = useState("");
  const [showAddStyleModal, setShowAddStyleModal] = useState(false);
  const [newStyleForm, setNewStyleForm] = useState({
    id: "",
    title: "",
    tagline: "",
    description: "",
    badge: "",
  });

  const finderOptions = equipmentFinder?.options || [];
  const currentFinderOption =
    finderOptions.find((o) => o.id === activeStyleId) ||
    finderOptions[0] || {
      id: "control",
      title: "CONTROL",
      tagline: "Placement & Consistency",
      description: "Steady shots, safe push blocks, and accurate ball placement.",
      badge: "Great Control (92/100)",
      recommendedProductIds: [],
    };

  const finderSelectedIds = currentFinderOption.recommendedProductIds || [];
  const finderSelectedProducts: Product[] = finderSelectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const availableFinderProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(finderSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(finderSearch.toLowerCase())
  );

  const handleToggleFinderProduct = (prodId: string) => {
    const current = [...finderSelectedIds];
    const index = current.indexOf(prodId);
    if (index > -1) {
      current.splice(index, 1);
      showToast(`Removed from ${currentFinderOption.title} recommendations`);
    } else {
      current.push(prodId);
      showToast(`Added to ${currentFinderOption.title} recommendations`);
    }
    setFinderRecommendedProducts(currentFinderOption.id, current);
  };

  const handleCreateStyleOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStyleForm.title.trim()) return;
    const styleId =
      newStyleForm.id.trim().toLowerCase().replace(/\s+/g, "-") ||
      `style-${Date.now().toString().slice(-4)}`;
    const newOpt: FinderOptionCMS = {
      id: styleId,
      title: newStyleForm.title.toUpperCase(),
      tagline: newStyleForm.tagline || "Custom Playing Style",
      description: newStyleForm.description || "Recommended equipment for this style.",
      badge: newStyleForm.badge || "Pro Selection",
      recommendedProductIds: [],
    };
    addFinderOption(newOpt);
    setActiveStyleId(styleId);
    setShowAddStyleModal(false);
    setNewStyleForm({ id: "", title: "", tagline: "", description: "", badge: "" });
    showToast(`Added new style "${newOpt.title}"!`);
  };

  const handleDeleteStyleOption = (id: string) => {
    if (finderOptions.length <= 1) {
      alert("You must keep at least 1 playstyle option.");
      return;
    }
    if (confirm("Are you sure you want to delete this playstyle option?")) {
      deleteFinderOption(id);
      const remaining = finderOptions.filter((o) => o.id !== id);
      if (remaining.length > 0) {
        setActiveStyleId(remaining[0].id);
      }
      showToast("Playstyle option deleted.");
    }
  };

  // =============================================================
  // 3. PRODUCT CATEGORIES STATE
  // =============================================================
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: "",
    badge: "",
    tagline: "",
    href: "/category/all",
    image: "/images/product-1-light.png",
  });

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryForm.name.trim()) return;
    const newCat: CategoryCardCMS = {
      id: `cat-${Date.now().toString().slice(-4)}`,
      name: newCategoryForm.name,
      badge: newCategoryForm.badge || "New Category",
      tagline: newCategoryForm.tagline || "Explore this category",
      href: newCategoryForm.href || "/category/all",
      image: newCategoryForm.image || "/images/product-1-light.png",
    };
    addCategoryCard(newCat);
    setShowAddCategoryModal(false);
    setNewCategoryForm({
      name: "",
      badge: "",
      tagline: "",
      href: "/category/all",
      image: "/images/product-1-light.png",
    });
    showToast(`Added category "${newCat.name}"!`);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      deleteCategoryCard(id);
      showToast(`Deleted category "${name}"`);
    }
  };

  // =============================================================
  // 4. FEATURED PRODUCTS SHOWCASE STATE
  // =============================================================
  const [showAddShowcaseModal, setShowAddShowcaseModal] = useState(false);
  const [editingShowcaseId, setEditingShowcaseId] = useState<string | null>(null);
  const [showcaseForm, setShowcaseForm] = useState<Partial<ShowcaseItemCMS>>({});

  const handleStartEditShowcase = (item: ShowcaseItemCMS) => {
    setEditingShowcaseId(item.id);
    setShowcaseForm(item);
  };

  const handleSaveShowcaseItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShowcaseId) return;
    updateShowcaseItem(editingShowcaseId, showcaseForm);
    setEditingShowcaseId(null);
    showToast("Showcase item updated!");
  };

  const handleAddProductToShowcase = (prod: Product) => {
    const newItem: ShowcaseItemCMS = {
      id: "showcase-" + prod.id + "-" + Date.now().toString().slice(-4),
      name: prod.name,
      category: prod.category,
      tagline: prod.description || "Official tournament table tennis gear.",
      price: prod.price,
      originalPrice: prod.originalPrice || Math.round(prod.price * 1.25),
      image: prod.image,
      specs: [
        { label: "Control", value: String(prod.specs?.control || 88), percent: prod.specs?.control || 88, color: "bg-emerald-500" },
        { label: "Spin", value: String(prod.specs?.spin || 90), percent: prod.specs?.spin || 90, color: "bg-red-500" },
        { label: "Speed", value: String(prod.specs?.speed || 85), percent: prod.specs?.speed || 85, color: "bg-blue-500" },
      ],
      tag: "Pro Pick",
      ittfCertified: true,
      highlightNote: "Official ITTF Approved",
    };
    addShowcaseItem(newItem);
    showToast(`Added "${prod.name}" to showcase!`);
  };

  const handleDeleteShowcase = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from featured showcase?`)) {
      deleteShowcaseItem(id);
      showToast(`Removed "${name}" from showcase`);
    }
  };

  // =============================================================
  // 5. BRAND STORY & PILLARS STATE
  // =============================================================
  const [showAddPillarModal, setShowAddPillarModal] = useState(false);
  const [newPillarForm, setNewPillarForm] = useState({
    title: "",
    description: "",
    iconName: "Layers",
  });

  const handleCreatePillar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPillarForm.title.trim()) return;
    const newPillar: BrandStoryPillarCMS = {
      id: `pillar-${Date.now().toString().slice(-4)}`,
      title: newPillarForm.title,
      description: newPillarForm.description || "High quality materials and design.",
      iconName: newPillarForm.iconName,
    };
    addBrandStoryPillar(newPillar);
    setShowAddPillarModal(false);
    setNewPillarForm({ title: "", description: "", iconName: "Layers" });
    showToast(`Added feature card "${newPillar.title}"!`);
  };

  const handleDeletePillar = (id: string, title: string) => {
    if (confirm(`Delete feature card "${title}"?`)) {
      deleteBrandStoryPillar(id);
      showToast(`Deleted "${title}"`);
    }
  };

  // =============================================================
  // 6. CUSTOMER REVIEWS STATE
  // =============================================================
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    playerName: "",
    roleOrClub: "",
    rating: 5,
    equipment: "",
    comment: "",
  });

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.playerName.trim() || !newReviewForm.comment.trim()) return;
    const newRev: ReviewCMS = {
      id: `REV-${Date.now().toString().slice(-4)}`,
      playerName: newReviewForm.playerName,
      roleOrClub: newReviewForm.roleOrClub || "Table Tennis Player",
      rating: newReviewForm.rating,
      equipment: newReviewForm.equipment || "LOKI Equipment",
      comment: newReviewForm.comment,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      verified: true,
    };
    addReview(newRev);
    setShowAddReviewModal(false);
    setNewReviewForm({ playerName: "", roleOrClub: "", rating: 5, equipment: "", comment: "" });
    showToast(`Added review from "${newRev.playerName}"!`);
  };

  const handleDeleteReview = (id: string, name: string) => {
    if (confirm(`Delete review from "${name}"?`)) {
      deleteReview(id);
      showToast(`Deleted review from "${name}"`);
    }
  };

  // =============================================================
  // 7. FREQUENTLY ASKED QUESTIONS (FAQ) STATE
  // =============================================================
  const [showAddFAQModal, setShowAddFAQModal] = useState(false);
  const [newFAQForm, setNewFAQForm] = useState({
    question: "",
    answer: "",
    category: "general",
  });

  const handleCreateFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFAQForm.question.trim() || !newFAQForm.answer.trim()) return;
    const newFaq: FAQItemCMS = {
      id: `FAQ-${Date.now().toString().slice(-4)}`,
      question: newFAQForm.question,
      answer: newFAQForm.answer,
      category: newFAQForm.category as any,
    };
    addFAQ(newFaq);
    setShowAddFAQModal(false);
    setNewFAQForm({ question: "", answer: "", category: "general" });
    showToast("Added new FAQ!");
  };

  const handleDeleteFAQ = (id: string) => {
    if (confirm("Delete this FAQ question?")) {
      deleteFAQ(id);
      showToast("Deleted FAQ");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SECTION SELECTOR HEADER */}
      <div className="bg-[#111724] border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-red-500" />
              <span>Landing Page Design &amp; Content Editor</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any section below to edit text, add new items, or delete items. All changes update on the live website immediately.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition self-start sm:self-auto"
          >
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 8 NUMBERED SECTION BUTTONS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
          {/* Tab 1: Best Sellers */}
          <button
            onClick={() => setActiveTab("bestsellers")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              activeTab === "bestsellers"
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30"
                : "bg-[#0a0e17] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 font-bold">
                {selectedBsProducts.length} items
              </span>
            </div>
            <div className="mt-2">
              <span className="text-[10px] block opacity-75 font-mono">SECTION 1</span>
              <span className="text-xs font-bold block leading-tight">Best Sellers</span>
            </div>
          </button>

          {/* Tab 2: Playstyle Guide */}
          <button
            onClick={() => setActiveTab("finder")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              activeTab === "finder"
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30"
                : "bg-[#0a0e17] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <Crosshair className="w-4 h-4" />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 font-bold">
                {finderOptions.length} styles
              </span>
            </div>
            <div className="mt-2">
              <span className="text-[10px] block opacity-75 font-mono">SECTION 2</span>
              <span className="text-xs font-bold block leading-tight">Playstyle Guide</span>
            </div>
          </button>

          {/* Tab 3: Categories */}
          <button
            onClick={() => setActiveTab("categories")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              activeTab === "categories"
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30"
                : "bg-[#0a0e17] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <Layers className="w-4 h-4" />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 font-bold">
                {categorySection?.categories?.length || 0} cards
              </span>
            </div>
            <div className="mt-2">
              <span className="text-[10px] block opacity-75 font-mono">SECTION 3</span>
              <span className="text-xs font-bold block leading-tight">Categories</span>
            </div>
          </button>

          {/* Tab 4: Featured Showcase */}
          <button
            onClick={() => setActiveTab("showcase")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              activeTab === "showcase"
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30"
                : "bg-[#0a0e17] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 font-bold">
                {horizontalShowcase?.items?.length || 0} items
              </span>
            </div>
            <div className="mt-2">
              <span className="text-[10px] block opacity-75 font-mono">SECTION 4</span>
              <span className="text-xs font-bold block leading-tight">Top Showcase</span>
            </div>
          </button>

          {/* Tab 5: Why Choose LOKI */}
          <button
            onClick={() => setActiveTab("brandstory")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              activeTab === "brandstory"
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30"
                : "bg-[#0a0e17] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 font-bold">
                {brandStory?.pillars?.length || 0} cards
              </span>
            </div>
            <div className="mt-2">
              <span className="text-[10px] block opacity-75 font-mono">SECTION 5</span>
              <span className="text-xs font-bold block leading-tight">Why Choose LOKI</span>
            </div>
          </button>

          {/* Tab 6: Customer Reviews */}
          <button
            onClick={() => setActiveTab("reviews")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              activeTab === "reviews"
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30"
                : "bg-[#0a0e17] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <MessageSquare className="w-4 h-4" />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 font-bold">
                {reviews?.length || 0} reviews
              </span>
            </div>
            <div className="mt-2">
              <span className="text-[10px] block opacity-75 font-mono">SECTION 6</span>
              <span className="text-xs font-bold block leading-tight">Reviews</span>
            </div>
          </button>

          {/* Tab 7: FAQs */}
          <button
            onClick={() => setActiveTab("faqs")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              activeTab === "faqs"
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30"
                : "bg-[#0a0e17] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <HelpCircle className="w-4 h-4" />
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-black/20 font-bold">
                {faqs?.length || 0} FAQs
              </span>
            </div>
            <div className="mt-2">
              <span className="text-[10px] block opacity-75 font-mono">SECTION 7</span>
              <span className="text-xs font-bold block leading-tight">FAQs</span>
            </div>
          </button>

          {/* Tab 8: Bottom Banner */}
          <button
            onClick={() => setActiveTab("ctabanner")}
            className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
              activeTab === "ctabanner"
                ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30"
                : "bg-[#0a0e17] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <Zap className="w-4 h-4" />
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${ctaBanner.active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                {ctaBanner.active ? "Active" : "Off"}
              </span>
            </div>
            <div className="mt-2">
              <span className="text-[10px] block opacity-75 font-mono">SECTION 8</span>
              <span className="text-xs font-bold block leading-tight">Bottom Banner</span>
            </div>
          </button>
        </div>
      </div>

      {/* ============================================================= */}
      {/* 1. BEST SELLERS & TRENDING                                    */}
      {/* ============================================================= */}
      {activeTab === "bestsellers" && (
        <div className="space-y-6">
          {/* Header & Mode Selector */}
          <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                  <span>Section 1: Best Sellers &amp; Trending Products</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Control the headline and pick exactly which products appear in the popular products grid on the homepage.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-2 bg-[#0a0e17] p-1.5 rounded-2xl border border-slate-800">
                <button
                  onClick={() => {
                    updateBestSellersCMS({ mode: "manual" });
                    showToast("Switched to Manual Curated Selection");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    bestSellersCMS?.mode !== "automated"
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Manual Choice
                </button>
                <button
                  onClick={() => {
                    updateBestSellersCMS({ mode: "automated" });
                    showToast("Switched to Auto Sales Velocity");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    bestSellersCMS?.mode === "automated"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Auto by Sales
                </button>
              </div>
            </div>

            {/* Title / Subtitle Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Small Top Tag
                </label>
                <input
                  type="text"
                  value={bestSellersCMS?.eyebrow || ""}
                  onChange={(e) => updateBestSellersCMS({ eyebrow: e.target.value })}
                  placeholder="POPULAR PRODUCTS"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={bestSellersCMS?.title || ""}
                  onChange={(e) => updateBestSellersCMS({ title: e.target.value })}
                  placeholder="Trending & Best Sellers"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={bestSellersCMS?.subtitle || ""}
                  onChange={(e) => updateBestSellersCMS({ subtitle: e.target.value })}
                  placeholder="Top selling table tennis rackets, rubbers, and gear..."
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Currently Selected Products (With Order Controls & Delete Button) */}
          <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <span>Currently Featured ({selectedBsProducts.length} Products)</span>
                  <span className="text-[10px] bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-mono">
                    Sequence on homepage
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Use arrows to reorder, or click the red trash button to delete any product from the best sellers grid.
                </p>
              </div>

              {selectedBsProductIds.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Clear all products from best sellers?")) {
                      setSelectedBestSellerProductIds([]);
                      showToast("Cleared best sellers selection");
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-bold px-3 py-1.5 rounded-xl hover:bg-red-500/10 transition"
                >
                  Clear All
                </button>
              )}
            </div>

            {selectedBsProducts.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
                No products selected yet. Click any product in the catalog below to add it!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {selectedBsProducts.map((prod, idx) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-[#0a0e17] border border-slate-800 rounded-2xl flex items-center justify-between gap-3 group hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-500 w-4">
                        #{idx + 1}
                      </span>
                      <div className="relative w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-red-400 font-semibold">
                          NPR {prod.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveBsProduct(idx, "up")}
                        disabled={idx === 0}
                        title="Move Left/Up"
                        className="p-1 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 hover:bg-slate-800"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveBsProduct(idx, "down")}
                        disabled={idx === selectedBsProducts.length - 1}
                        title="Move Right/Down"
                        className="p-1 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 hover:bg-slate-800"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleBsProduct(prod.id)}
                        title="Delete from Best Sellers"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ADD Products From Store Catalog */}
          <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-black text-sm text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-500" />
                  <span>Add Products From Store Inventory</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any product to add it to the best sellers grid.
                </p>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bsSearch}
                    onChange={(e) => setBsSearch(e.target.value)}
                    placeholder="Search products..."
                    className="bg-[#0a0e17] border border-slate-800 text-white text-xs pl-8 pr-3 py-2 rounded-xl focus:border-red-500 focus:outline-none w-48"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {availableBsProducts.map((prod) => {
                const isSelected = selectedBsProductIds.includes(prod.id);
                return (
                  <button
                    key={prod.id}
                    onClick={() => handleToggleBsProduct(prod.id)}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between group relative ${
                      isSelected
                        ? "bg-red-600/10 border-red-500/50 shadow-md shadow-red-600/10"
                        : "bg-[#0a0e17] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                        <Check className="w-3 h-3" />
                      </span>
                    )}

                    <div>
                      <div className="relative w-full aspect-square rounded-xl bg-slate-900/80 overflow-hidden mb-2">
                        <Image
                          src={prod.image}
                          alt={prod.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
                        {prod.category}
                      </span>
                      <h5 className="font-bold text-xs text-white line-clamp-1 mt-0.5">
                        {prod.name}
                      </h5>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-red-400">
                        NPR {prod.price.toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          isSelected ? "text-red-400" : "text-emerald-400 group-hover:text-emerald-300"
                        }`}
                      >
                        {isSelected ? "Remove" : "+ Add"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 2. PLAYSTYLE GUIDE (CONTROL, SPIN, SPEED)                     */}
      {/* ============================================================= */}
      {activeTab === "finder" && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-red-500" />
                <span>Section 2: Playstyle Guide (Control, Spin, Speed)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Help customers pick gear based on their style. You can add new styles, delete styles, and customize recommended products for each style.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Small Top Tag
                </label>
                <input
                  type="text"
                  value={equipmentFinder?.eyebrow || ""}
                  onChange={(e) => updateEquipmentFinder({ eyebrow: e.target.value })}
                  placeholder="CHOOSE YOUR PLAYING STYLE"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={equipmentFinder?.title || ""}
                  onChange={(e) => updateEquipmentFinder({ title: e.target.value })}
                  placeholder="Find The Right Gear For Your Game"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={equipmentFinder?.subtitle || ""}
                  onChange={(e) => updateEquipmentFinder({ subtitle: e.target.value })}
                  placeholder="Whether you like control, spin, or fast attacking speed..."
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Style Tabs Bar + Add New Style Button */}
          <div className="flex flex-wrap items-center gap-2">
            {finderOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActiveStyleId(opt.id)}
                className={`py-2.5 px-4 rounded-2xl border text-center transition font-bold text-xs uppercase tracking-wider ${
                  activeStyleId === opt.id
                    ? "bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/30"
                    : "bg-[#111724] border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {opt.title} ({opt.recommendedProductIds?.length || 0})
              </button>
            ))}

            {/* ADD NEW STYLE BUTTON */}
            <button
              onClick={() => setShowAddStyleModal(true)}
              className="py-2.5 px-4 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Add New Style</span>
            </button>
          </div>

          {/* Active Style Edit Form & Delete Button */}
          <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="font-black text-sm text-white uppercase tracking-wider">
                  Editing Style: <span className="text-red-500">{currentFinderOption.title}</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Update style name, tagline, description, and recommended products.
                </p>
              </div>

              {/* DELETE STYLE BUTTON */}
              <button
                onClick={() => handleDeleteStyleOption(currentFinderOption.id)}
                className="px-3 py-1.5 rounded-xl bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Style</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Style Title
                </label>
                <input
                  type="text"
                  value={currentFinderOption.title}
                  onChange={(e) =>
                    updateFinderOption(currentFinderOption.id, { title: e.target.value })
                  }
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={currentFinderOption.tagline}
                  onChange={(e) =>
                    updateFinderOption(currentFinderOption.id, { tagline: e.target.value })
                  }
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={currentFinderOption.badge}
                  onChange={(e) =>
                    updateFinderOption(currentFinderOption.id, { badge: e.target.value })
                  }
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Explanation
                </label>
                <input
                  type="text"
                  value={currentFinderOption.description}
                  onChange={(e) =>
                    updateFinderOption(currentFinderOption.id, { description: e.target.value })
                  }
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Currently Recommended Products For This Style */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h5 className="font-bold text-xs text-white">
                Recommended Products for {currentFinderOption.title} ({finderSelectedProducts.length}):
              </h5>

              {finderSelectedProducts.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No products recommended yet for this style. Pick products below!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {finderSelectedProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-[#0a0e17] border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-10 h-10 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-contain p-1" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-red-400 font-semibold">NPR {p.price.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* DELETE / REMOVE RECOMMENDATION BUTTON */}
                      <button
                        onClick={() => handleToggleFinderProduct(p.id)}
                        className="text-xs text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ADD Store Products to this Style */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Select Products to Recommend for {currentFinderOption.title}:
                </span>
                <input
                  type="text"
                  value={finderSearch}
                  onChange={(e) => setFinderSearch(e.target.value)}
                  placeholder="Search products..."
                  className="bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-1.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {availableFinderProducts.map((prod) => {
                  const isChecked = finderSelectedIds.includes(prod.id);
                  return (
                    <button
                      key={prod.id}
                      onClick={() => handleToggleFinderProduct(prod.id)}
                      className={`p-2.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                        isChecked
                          ? "bg-red-600/10 border-red-500/60 shadow-md shadow-red-600/10"
                          : "bg-[#0a0e17] border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      {isChecked && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                      <div>
                        <div className="relative w-full aspect-square rounded-lg bg-slate-900 overflow-hidden mb-1.5">
                          <Image src={prod.image} alt={prod.name} fill className="object-contain p-1" />
                        </div>
                        <h6 className="font-bold text-[11px] text-white line-clamp-1">{prod.name}</h6>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-400 flex justify-between">
                        <span>NPR {prod.price}</span>
                        <span className={isChecked ? "text-red-400 font-bold" : "text-emerald-400"}>
                          {isChecked ? "Remove" : "+ Recommend"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ADD STYLE MODAL */}
          {showAddStyleModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-white">Add New Playstyle Option</h4>
                  <button onClick={() => setShowAddStyleModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateStyleOption} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Style Name (e.g. ALL-ROUND)</label>
                    <input
                      type="text"
                      required
                      value={newStyleForm.title}
                      onChange={(e) => setNewStyleForm({ ...newStyleForm, title: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={newStyleForm.tagline}
                      onChange={(e) => setNewStyleForm({ ...newStyleForm, tagline: e.target.value })}
                      placeholder="Balance of Attack & Defense"
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Badge</label>
                    <input
                      type="text"
                      value={newStyleForm.badge}
                      onChange={(e) => setNewStyleForm({ ...newStyleForm, badge: e.target.value })}
                      placeholder="All-Round Master (90/100)"
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Description</label>
                    <input
                      type="text"
                      value={newStyleForm.description}
                      onChange={(e) => setNewStyleForm({ ...newStyleForm, description: e.target.value })}
                      placeholder="Best for players who adapt to any opponent."
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStyleModal(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                    >
                      Create Style
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. PRODUCT CATEGORIES                                         */}
      {/* ============================================================= */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-red-500" />
                  <span>Section 3: Product Category Cards</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage the category boxes displayed on the homepage. Edit names, links, badges, or add and delete categories freely.
                </p>
              </div>

              {/* ADD CATEGORY BUTTON */}
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-600/30 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Small Top Tag
                </label>
                <input
                  type="text"
                  value={categorySection?.eyebrow || ""}
                  onChange={(e) => updateCategorySection({ eyebrow: e.target.value })}
                  placeholder="OUR PRODUCTS"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={categorySection?.title || ""}
                  onChange={(e) => updateCategorySection({ title: e.target.value })}
                  placeholder="Shop by Category"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={categorySection?.subtitle || ""}
                  onChange={(e) => updateCategorySection({ subtitle: e.target.value })}
                  placeholder="Find rackets, balls, rubbers, shoes, and clothing..."
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Category Cards List (With Edit Inputs & Delete Button) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(categorySection?.categories || []).map((cat) => (
              <div
                key={cat.id}
                className="bg-[#111724] border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                      <Image src={cat.image} alt={cat.name} fill className="object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[9px] font-mono uppercase text-slate-500">Category Name</label>
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => updateCategoryCard(cat.id, { name: e.target.value })}
                        className="font-bold text-sm text-white bg-transparent border-b border-slate-800 focus:border-red-500 focus:outline-none w-full"
                      />
                    </div>
                  </div>

                  {/* DELETE CATEGORY BUTTON */}
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={cat.badge}
                      onChange={(e) => updateCategoryCard(cat.id, { badge: e.target.value })}
                      placeholder="Badge"
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-2 rounded-xl focus:border-red-500 focus:outline-none mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">
                      Tagline / Description
                    </label>
                    <input
                      type="text"
                      value={cat.tagline}
                      onChange={(e) => updateCategoryCard(cat.id, { tagline: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-2 rounded-xl focus:border-red-500 focus:outline-none mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Page Link
                      </label>
                      <input
                        type="text"
                        value={cat.href}
                        onChange={(e) => updateCategoryCard(cat.id, { href: e.target.value })}
                        className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-2 rounded-xl focus:border-red-500 focus:outline-none mt-1 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Image Path
                      </label>
                      <input
                        type="text"
                        value={cat.image}
                        onChange={(e) => updateCategoryCard(cat.id, { image: e.target.value })}
                        className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-2 rounded-xl focus:border-red-500 focus:outline-none mt-1 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ADD CATEGORY MODAL */}
          {showAddCategoryModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-white">Add New Category Card</h4>
                  <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Table Tennis Robots"
                      value={newCategoryForm.name}
                      onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Badge Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Training Gear"
                      value={newCategoryForm.badge}
                      onChange={(e) => setNewCategoryForm({ ...newCategoryForm, badge: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. Automatic ball feeding machines for practice."
                      value={newCategoryForm.tagline}
                      onChange={(e) => setNewCategoryForm({ ...newCategoryForm, tagline: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Link URL</label>
                      <input
                        type="text"
                        value={newCategoryForm.href}
                        onChange={(e) => setNewCategoryForm({ ...newCategoryForm, href: e.target.value })}
                        className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Image Path</label>
                      <input
                        type="text"
                        value={newCategoryForm.image}
                        onChange={(e) => setNewCategoryForm({ ...newCategoryForm, image: e.target.value })}
                        className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                    >
                      Create Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. FEATURED PRODUCTS SHOWCASE                                 */}
      {/* ============================================================= */}
      {activeTab === "showcase" && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 space-y-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                <span>Section 4: Top Featured Products Slider</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Customize the large horizontal slider showing flagship rackets, rubbers, and gear directly under the hero section.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Small Top Tag
                </label>
                <input
                  type="text"
                  value={horizontalShowcase?.eyebrow || ""}
                  onChange={(e) => updateHorizontalShowcase({ eyebrow: e.target.value })}
                  placeholder="FEATURED GEAR"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={horizontalShowcase?.title || ""}
                  onChange={(e) => updateHorizontalShowcase({ title: e.target.value })}
                  placeholder="Fast & Powerful Rackets & Balls"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={horizontalShowcase?.subtitle || ""}
                  onChange={(e) => updateHorizontalShowcase({ subtitle: e.target.value })}
                  placeholder="Official competition rackets, high-spin rubbers..."
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Add from Store Products Bar */}
          <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 space-y-3">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Click Any Store Product to Add It to the Showcase:</span>
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAddProductToShowcase(p)}
                  className="px-3 py-1.5 rounded-xl bg-[#0a0e17] border border-slate-800 hover:border-red-500 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Showcase Cards List (With Edit & Delete Buttons) */}
          <div className="space-y-4">
            {(horizontalShowcase?.items || []).map((item) => (
              <div
                key={item.id}
                className="bg-[#111724] border border-slate-800 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                      {item.tag} • {item.category}
                    </span>
                    <h5 className="font-extrabold text-sm text-white">{item.name}</h5>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.tagline}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="font-bold text-white">NPR {item.price.toLocaleString()}</span>
                      {item.ittfCertified && (
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                          ITTF Approved
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleStartEditShowcase(item)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteShowcase(item.id, item.name)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                    title="Delete product from showcase"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Showcase Item Modal */}
          {editingShowcaseId && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-base text-white">Edit Showcase Product</h4>
                  <button onClick={() => setEditingShowcaseId(null)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveShowcaseItem} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Product Title</label>
                    <input
                      type="text"
                      value={showcaseForm.name || ""}
                      onChange={(e) => setShowcaseForm({ ...showcaseForm, name: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={showcaseForm.tagline || ""}
                      onChange={(e) => setShowcaseForm({ ...showcaseForm, tagline: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Price (NPR)</label>
                      <input
                        type="number"
                        value={showcaseForm.price || 0}
                        onChange={(e) => setShowcaseForm({ ...showcaseForm, price: Number(e.target.value) })}
                        className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Tag Pill</label>
                      <input
                        type="text"
                        value={showcaseForm.tag || ""}
                        onChange={(e) => setShowcaseForm({ ...showcaseForm, tag: e.target.value })}
                        className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingShowcaseId(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* 5. WHY CHOOSE LOKI (BRAND FEATURES / PILLARS)                  */}
      {/* ============================================================= */}
      {activeTab === "brandstory" && (
        <div className="space-y-6">
          <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-red-500" />
                  <span>Section 5: Why Choose LOKI (Brand Story &amp; Quality)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tell your customers why LOKI is the best brand for table tennis. Edit main headlines, descriptions, and feature cards.
                </p>
              </div>

              {/* ADD FEATURE PILLAR BUTTON */}
              <button
                onClick={() => setShowAddPillarModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-600/30 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Feature Card</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Small Top Tag
                </label>
                <input
                  type="text"
                  value={brandStory?.eyebrow || ""}
                  onChange={(e) => updateBrandStory({ eyebrow: e.target.value })}
                  placeholder="WHY CHOOSE LOKI"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={brandStory?.title || ""}
                  onChange={(e) => updateBrandStory({ title: e.target.value })}
                  placeholder="Professional Table Tennis Gear Built to Win"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Badge Year / Number
                </label>
                <input
                  type="text"
                  value={brandStory?.statNumber || ""}
                  onChange={(e) => updateBrandStory({ statNumber: e.target.value })}
                  placeholder="2026"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Badge Label
                </label>
                <input
                  type="text"
                  value={brandStory?.statLabel || ""}
                  onChange={(e) => updateBrandStory({ statLabel: e.target.value })}
                  placeholder="Official ITTF Approved Quality"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Main Story Description
                </label>
                <textarea
                  rows={3}
                  value={brandStory?.description || ""}
                  onChange={(e) => updateBrandStory({ description: e.target.value })}
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Feature Pillars Cards List (With Edit & Delete Buttons) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(brandStory?.pillars || []).map((pillar, idx) => (
              <div
                key={pillar.id}
                className="bg-[#111724] border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-red-500">Feature #{idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={pillar.iconName}
                      onChange={(e) => updateBrandStoryPillar(pillar.id, { iconName: e.target.value })}
                      className="bg-[#0a0e17] border border-slate-800 text-white text-[11px] px-2 py-1 rounded-lg"
                    >
                      <option value="Layers">Layers (Wood/Blade)</option>
                      <option value="Zap">Zap (Speed/Rubber)</option>
                      <option value="Crosshair">Crosshair (Control/Grip)</option>
                      <option value="ShieldCheck">ShieldCheck (Durability)</option>
                    </select>

                    {/* DELETE PILLAR BUTTON */}
                    <button
                      onClick={() => handleDeletePillar(pillar.id, pillar.title)}
                      className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Delete Feature Card"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Title</label>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={(e) => updateBrandStoryPillar(pillar.id, { title: e.target.value })}
                    className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-2 rounded-xl mt-1 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Description</label>
                  <textarea
                    rows={2}
                    value={pillar.description}
                    onChange={(e) => updateBrandStoryPillar(pillar.id, { description: e.target.value })}
                    className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-2 rounded-xl mt-1"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ADD FEATURE PILLAR MODAL */}
          {showAddPillarModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-white">Add New Feature Card</h4>
                  <button onClick={() => setShowAddPillarModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreatePillar} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Feature Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 100% Genuine ITTF Stamp"
                      value={newPillarForm.title}
                      onChange={(e) => setNewPillarForm({ ...newPillarForm, title: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Icon Style</label>
                    <select
                      value={newPillarForm.iconName}
                      onChange={(e) => setNewPillarForm({ ...newPillarForm, iconName: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    >
                      <option value="Layers">Layers (Wood/Blade)</option>
                      <option value="Zap">Zap (Speed/Rubber)</option>
                      <option value="Crosshair">Crosshair (Control/Grip)</option>
                      <option value="ShieldCheck">ShieldCheck (Durability)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Description</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. All competition gear is certified for national tournaments."
                      value={newPillarForm.description}
                      onChange={(e) => setNewPillarForm({ ...newPillarForm, description: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPillarModal(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                    >
                      Add Card
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* 6. CUSTOMER REVIEWS                                           */}
      {/* ============================================================= */}
      {activeTab === "reviews" && (
        <div className="space-y-6">
          <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-red-500" />
                  <span>Section 6: Customer &amp; Player Reviews</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage the customer reviews shown on the landing page. You can add new reviews, edit them, or delete old ones.
                </p>
              </div>

              {/* ADD REVIEW BUTTON */}
              <button
                onClick={() => setShowAddReviewModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-600/30 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Review</span>
              </button>
            </div>
          </div>

          {/* Reviews List (With Edit & Delete Buttons) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(reviews || []).map((rev) => (
              <div
                key={rev.id}
                className="bg-[#111724] border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>

                  {/* DELETE REVIEW BUTTON */}
                  <button
                    onClick={() => handleDeleteReview(rev.id, rev.playerName)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Player Name</label>
                    <input
                      type="text"
                      value={rev.playerName}
                      onChange={(e) => updateReview(rev.id, { playerName: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-2.5 py-1.5 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Club / City</label>
                    <input
                      type="text"
                      value={rev.roleOrClub}
                      onChange={(e) => updateReview(rev.id, { roleOrClub: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-2.5 py-1.5 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Equipment Used</label>
                  <input
                    type="text"
                    value={rev.equipment}
                    onChange={(e) => updateReview(rev.id, { equipment: e.target.value })}
                    className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Review Comment</label>
                  <textarea
                    rows={3}
                    value={rev.comment}
                    onChange={(e) => updateReview(rev.id, { comment: e.target.value })}
                    className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-2.5 py-1.5 rounded-xl"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ADD REVIEW MODAL */}
          {showAddReviewModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-white">Add Customer Review</h4>
                  <button onClick={() => setShowAddReviewModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateReview} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Player Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bikash Shrestha"
                      value={newReviewForm.playerName}
                      onChange={(e) => setNewReviewForm({ ...newReviewForm, playerName: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Club or Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Kathmandu Table Tennis Club"
                      value={newReviewForm.roleOrClub}
                      onChange={(e) => setNewReviewForm({ ...newReviewForm, roleOrClub: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Rating (1 to 5)</label>
                      <select
                        value={newReviewForm.rating}
                        onChange={(e) => setNewReviewForm({ ...newReviewForm, rating: Number(e.target.value) })}
                        className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                      >
                        <option value={5}>5 Stars (⭐⭐⭐⭐⭐)</option>
                        <option value={4}>4 Stars (⭐⭐⭐⭐)</option>
                        <option value={3}>3 Stars (⭐⭐⭐)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Product Used</label>
                      <input
                        type="text"
                        placeholder="e.g. LOKI Dragon 10"
                        value={newReviewForm.equipment}
                        onChange={(e) => setNewReviewForm({ ...newReviewForm, equipment: e.target.value })}
                        className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Comment</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Amazing racket with super fast speed and crisp feeling."
                      value={newReviewForm.comment}
                      onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddReviewModal(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                    >
                      Save Review
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ)                           */}
      {/* ============================================================= */}
      {activeTab === "faqs" && (
        <div className="space-y-6">
          <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-red-500" />
                  <span>Section 7: Frequently Asked Questions (FAQ)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Answer common questions about shipping, payments, returns, and racket advice. Add or delete questions anytime.
                </p>
              </div>

              {/* ADD FAQ BUTTON */}
              <button
                onClick={() => setShowAddFAQModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-red-600/30 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Question</span>
              </button>
            </div>
          </div>

          {/* FAQ Items List (With Edit & Delete Buttons) */}
          <div className="space-y-4">
            {(faqs || []).map((faq) => (
              <div
                key={faq.id}
                className="bg-[#111724] border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-bold">
                    {faq.category || "General"}
                  </span>

                  {/* DELETE FAQ BUTTON */}
                  <button
                    onClick={() => handleDeleteFAQ(faq.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Question</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => updateFAQ(faq.id, { question: e.target.value })}
                    className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-2 rounded-xl mt-1 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Answer</label>
                  <textarea
                    rows={2}
                    value={faq.answer}
                    onChange={(e) => updateFAQ(faq.id, { answer: e.target.value })}
                    className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-2 rounded-xl mt-1"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ADD FAQ MODAL */}
          {showAddFAQModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-white">Add New FAQ Question</h4>
                  <button onClick={() => setShowAddFAQModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateFAQ} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Question</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Do you deliver outside Kathmandu?"
                      value={newFAQForm.question}
                      onChange={(e) => setNewFAQForm({ ...newFAQForm, question: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Category</label>
                    <select
                      value={newFAQForm.category}
                      onChange={(e) => setNewFAQForm({ ...newFAQForm, category: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    >
                      <option value="shipping">Delivery / Shipping</option>
                      <option value="payment">Payment &amp; COD</option>
                      <option value="products">Products &amp; Authenticity</option>
                      <option value="warranty">Warranty &amp; Returns</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Answer</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="e.g. Yes, we deliver to all 77 districts within 48 to 72 hours."
                      value={newFAQForm.answer}
                      onChange={(e) => setNewFAQForm({ ...newFAQForm, answer: e.target.value })}
                      className="w-full bg-[#0a0e17] border border-slate-800 text-white px-3 py-2 rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddFAQModal(false)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                    >
                      Add Question
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* 8. BOTTOM BANNER (CALL TO ACTION)                             */}
      {/* ============================================================= */}
      {activeTab === "ctabanner" && (
        <div className="space-y-6">
          <div className="bg-[#111724] border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-500" />
                  <span>Section 8: Bottom Banner (Call to Action)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  The big highlight banner right before the footer. You can show or hide it, or edit the headlines and buttons.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Visible on site:</span>
                <button
                  onClick={() => {
                    updateCTABanner({ active: !ctaBanner.active });
                    showToast(ctaBanner.active ? "Banner hidden" : "Banner enabled");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    ctaBanner.active
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {ctaBanner.active ? "Active (Shown)" : "Hidden"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Small Top Tag
                </label>
                <input
                  type="text"
                  value={ctaBanner.eyebrow}
                  onChange={(e) => updateCTABanner({ eyebrow: e.target.value })}
                  placeholder="READY TO PLAY?"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Banner Headline
                </label>
                <input
                  type="text"
                  value={ctaBanner.title}
                  onChange={(e) => updateCTABanner({ title: e.target.value })}
                  placeholder="Get The Best Table Tennis Gear in Nepal"
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Subtitle Description
                </label>
                <textarea
                  rows={2}
                  value={ctaBanner.subtitle}
                  onChange={(e) => updateCTABanner({ subtitle: e.target.value })}
                  placeholder="Free nationwide delivery on orders over NPR 2,000..."
                  className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3.5 py-2.5 rounded-xl focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Primary Button Text &amp; Link
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={ctaBanner.primaryBtnText}
                    onChange={(e) => updateCTABanner({ primaryBtnText: e.target.value })}
                    placeholder="Shop All Products"
                    className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-2 rounded-xl"
                  />
                  <input
                    type="text"
                    value={ctaBanner.primaryBtnLink}
                    onChange={(e) => updateCTABanner({ primaryBtnLink: e.target.value })}
                    placeholder="/category/all"
                    className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-2 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Secondary Button Text &amp; Link
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={ctaBanner.secondaryBtnText}
                    onChange={(e) => updateCTABanner({ secondaryBtnText: e.target.value })}
                    placeholder="Contact Us / WhatsApp"
                    className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-2 rounded-xl"
                  />
                  <input
                    type="text"
                    value={ctaBanner.secondaryBtnLink}
                    onChange={(e) => updateCTABanner({ secondaryBtnLink: e.target.value })}
                    placeholder="/contact"
                    className="w-full bg-[#0a0e17] border border-slate-800 text-white text-xs px-3 py-2 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
