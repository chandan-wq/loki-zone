"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  UploadCloud,
  Edit,
  Trash2,
  Calculator,
  Copy,
  Check,
  Download,
  Percent,
  Sparkles,
  TrendingUp,
  X,
  CheckCircle2,
} from "lucide-react";
import { RateSheetItem, useAdminStore } from "@/store/useAdminStore";

interface WholesaleRateMatrixProps {
  isMaster: boolean;
  rateSheetItems: RateSheetItem[];
  onAddRateItem: (item: RateSheetItem) => void;
  onUpdateRateItem: (sku: string, updated: Partial<RateSheetItem>) => void;
  onDeleteRateItem: (sku: string, name: string) => void;
  showToast: (msg: string) => void;
}

export default function WholesaleRateMatrix({
  isMaster,
  rateSheetItems,
  onAddRateItem,
  onUpdateRateItem,
  onDeleteRateItem,
  showToast,
}: WholesaleRateMatrixProps) {
  // Calculator State
  const [selectedSku, setSelectedSku] = useState<string>(
    rateSheetItems[0]?.sku || "LK-D10-CB"
  );
  const [calcQuantity, setCalcQuantity] = useState<number>(20);
  const [customDiscountPercent, setCustomDiscountPercent] = useState<number>(15);
  const [pricingMode, setPricingMode] = useState<"tier" | "custom">("tier");
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RateSheetItem | null>(null);

  // New Item Form State
  const [newItem, setNewItem] = useState<Partial<RateSheetItem>>({
    sku: "",
    name: "",
    retailNPR: 2500,
    tier1_9: 2500,
    tier10_49: 2125,
    tier50plus: 1875,
  });

  const selectedItem =
    rateSheetItems.find((item) => item.sku === selectedSku) || rateSheetItems[0];

  // Calculate wholesale numbers
  const retailPrice = selectedItem ? selectedItem.retailNPR : 2500;
  let effectiveUnitPrice = retailPrice;

  if (pricingMode === "tier") {
    if (calcQuantity >= 50) {
      effectiveUnitPrice = selectedItem?.tier50plus || Math.round(retailPrice * 0.75);
    } else if (calcQuantity >= 10) {
      effectiveUnitPrice = selectedItem?.tier10_49 || Math.round(retailPrice * 0.85);
    } else {
      effectiveUnitPrice = retailPrice;
    }
  } else {
    effectiveUnitPrice = Math.round(retailPrice * (1 - customDiscountPercent / 100));
  }

  const standardTotal = retailPrice * calcQuantity;
  const wholesaleTotal = effectiveUnitPrice * calcQuantity;
  const totalSavings = standardTotal - wholesaleTotal;
  const effectiveDiscountPercent =
    standardTotal > 0 ? Math.round((totalSavings / standardTotal) * 100) : 0;

  const handleCopyQuote = () => {
    if (!selectedItem) return;
    const text = `🏓 *LOKI ZONE NEPAL — OFFICIAL WHOLESALE QUOTATION*
---------------------------------------
*Product:* ${selectedItem.name} (${selectedItem.sku})
*Order Quantity:* ${calcQuantity} units
*Standard Retail Rate:* NPR ${retailPrice.toLocaleString()} / unit
*Wholesale Unit Rate:* NPR ${effectiveUnitPrice.toLocaleString()} / unit
*Total Retail Value:* NPR ${standardTotal.toLocaleString()}
*Wholesale Payable:* NPR ${wholesaleTotal.toLocaleString()}
*Total Club / Dealer Savings:* NPR ${totalSavings.toLocaleString()} (${effectiveDiscountPercent}% OFF)
---------------------------------------
✅ *ITTF Approved Authentic Equipment*
🚚 *Nationwide Express Delivery to Your Academy/Club*
📞 *Contact LOKI Nepal Wholesale Desk:* 9800000000
🌐 *https://loki-zone.vercel.app*`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    showToast("📋 Official wholesale quotation copied to clipboard!");
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  const handleExportCSV = () => {
    const header = "SKU,Product Name,Standard Retail (1-9 pcs),Wholesale Tier (10-49 pcs),Club Bulk Tier (50+ pcs)\n";
    const rows = rateSheetItems
      .map(
        (r) =>
          `"${r.sku}","${r.name}",${r.retailNPR},${r.tier10_49},${r.tier50plus}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `LOKI_Nepal_Rate_Sheet_Q4_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("📥 Rate sheet CSV exported successfully!");
  };

  const handleSaveNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.sku || !newItem.name || !newItem.retailNPR) {
      showToast("Please fill in SKU, Name, and Retail Price.");
      return;
    }
    const retail = Number(newItem.retailNPR);
    const itemToAdd: RateSheetItem = {
      sku: newItem.sku.trim().toUpperCase(),
      name: newItem.name.trim(),
      retailNPR: retail,
      tier1_9: retail,
      tier10_49: newItem.tier10_49 ? Number(newItem.tier10_49) : Math.round(retail * 0.85),
      tier50plus: newItem.tier50plus ? Number(newItem.tier50plus) : Math.round(retail * 0.75),
    };
    onAddRateItem(itemToAdd);
    setIsAddModalOpen(false);
    setNewItem({
      sku: "",
      name: "",
      retailNPR: 2500,
      tier1_9: 2500,
      tier10_49: 2125,
      tier50plus: 1875,
    });
    showToast(`✅ Added rate item "${itemToAdd.name}"!`);
  };

  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    onUpdateRateItem(editingItem.sku, editingItem);
    setEditingItem(null);
    showToast(`✅ Updated rate item "${editingItem.name}"!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                ACTIVE WHOLESALE MATRIX Q4 2026
              </span>
              <span className="text-xs text-slate-400 font-mono">v4.3 Production</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-2 tracking-tight">
              LOKI Official Academy &amp; Dealer Rate Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Tiered volume pricing engine for Table Tennis Academies, Provincial Clubs, and Authorized Dealers across Nepal.
              Discounts auto-calculate for 10–49 pcs (15% off) and 50+ pcs (25% off).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV Matrix</span>
            </button>
            {isMaster && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Rate Item</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* INTERACTIVE QUOTE & MARGIN CALCULATOR */}
      <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Live Wholesale Quotation &amp; Margin Calculator
              </h3>
              <p className="text-[11px] text-slate-400">
                Instant deal pricing generator for phone or WhatsApp inquiries
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyQuote}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              copiedQuote
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
          >
            {copiedQuote ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Quotation Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy WhatsApp Quote</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          {/* Col 1: Product Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300">
              Select Product SKU:
            </label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-red-500"
            >
              {rateSheetItems.map((item) => (
                <option key={item.sku} value={item.sku}>
                  {item.name} ({item.sku}) - NPR {item.retailNPR.toLocaleString()}
                </option>
              ))}
            </select>

            <div className="p-3 bg-[#0b0f17] border border-slate-800 rounded-xl space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Standard Retail (1-9 pcs):</span>
                <span className="font-mono font-bold text-white">
                  NPR {selectedItem?.retailNPR.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-400">
                <span>Tier 10–49 pcs (-15%):</span>
                <span className="font-mono font-bold">
                  NPR {selectedItem?.tier10_49.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-amber-400">
                <span>Club Bulk 50+ pcs (-25%):</span>
                <span className="font-mono font-bold">
                  NPR {selectedItem?.tier50plus.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Col 2: Quantity & Discount Mode */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300">
              Order Quantity (Units):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={calcQuantity}
                onChange={(e) => setCalcQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-red-500"
              />
              <div className="flex gap-1">
                {[10, 25, 50, 100].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setCalcQuantity(qty)}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition"
                  >
                    {qty}x
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Pricing Method:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPricingMode("tier")}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition border ${
                    pricingMode === "tier"
                      ? "bg-red-600 text-white border-red-500"
                      : "bg-[#0b0f17] text-slate-400 border-slate-800"
                  }`}
                >
                  Standard Matrix Tier
                </button>
                <button
                  type="button"
                  onClick={() => setPricingMode("custom")}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition border ${
                    pricingMode === "custom"
                      ? "bg-red-600 text-white border-red-500"
                      : "bg-[#0b0f17] text-slate-400 border-slate-800"
                  }`}
                >
                  Custom Discount %
                </button>
              </div>
            </div>

            {pricingMode === "custom" && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Custom Discount: {customDiscountPercent}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="1"
                  value={customDiscountPercent}
                  onChange={(e) => setCustomDiscountPercent(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            )}
          </div>

          {/* Col 3: Calculated Financial Summary Card */}
          <div className="bg-[#0b0f17] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-2">
                DEAL CALCULATION BREAKDOWN
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Retail Price:</span>
                  <span className="font-mono text-slate-300">NPR {retailPrice.toLocaleString()} / pc</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Applied Rate:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    NPR {effectiveUnitPrice.toLocaleString()} / pc
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Standard Retail Total:</span>
                  <span className="font-mono text-slate-300 line-through">
                    NPR {standardTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-amber-400 pt-1.5 border-t border-slate-800 font-semibold">
                  <span>Total Discount Savings:</span>
                  <span className="font-mono font-bold">
                    - NPR {totalSavings.toLocaleString()} ({effectiveDiscountPercent}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                WHOLESALE PAYABLE TOTAL:
              </span>
              <div className="text-xl font-black font-mono text-white mt-0.5 text-emerald-400">
                NPR {wholesaleTotal.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-[#121824] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Official Tiered Wholesale Catalog Matrix</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {rateSheetItems.length} registered SKUs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold bg-[#0d121c]">
                <th className="py-3 px-4">Item SKU &amp; Name</th>
                <th className="py-3 px-4">Standard Retail (1-9 pcs)</th>
                <th className="py-3 px-4 text-emerald-400">Wholesale Tier (10-49 pcs) [-15%]</th>
                <th className="py-3 px-4 text-amber-400">Club Bulk Tier (50+ pcs) [-25%]</th>
                {isMaster && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rateSheetItems.map((item) => (
                <tr key={item.sku} className="hover:bg-slate-800/20 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                    Rs. {item.retailNPR.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    Rs. {item.tier10_49.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                    Rs. {item.tier50plus.toLocaleString()}
                  </td>
                  {isMaster && (
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingItem({ ...item })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit Rate Item"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRateItem(item.sku, item.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD RATE ITEM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 max-w-md w-full text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white">Add Rate Matrix Item</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveNewItem} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">SKU Code</label>
                <input
                  type="text"
                  placeholder="e.g. LK-SHOE-SWIFT"
                  value={newItem.sku}
                  onChange={(e) => setNewItem({ ...newItem, sku: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white font-mono uppercase"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. LOKI Court Swift TT Shoes"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Retail NPR</label>
                  <input
                    type="number"
                    value={newItem.retailNPR}
                    onChange={(e) => {
                      const ret = Number(e.target.value);
                      setNewItem({
                        ...newItem,
                        retailNPR: ret,
                        tier1_9: ret,
                        tier10_49: Math.round(ret * 0.85),
                        tier50plus: Math.round(ret * 0.75),
                      });
                    }}
                    className="w-full px-2 py-1.5 bg-[#0b0f17] border border-slate-700 rounded-lg text-white font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-400 mb-0.5">10-49 pcs (-15%)</label>
                  <input
                    type="number"
                    value={newItem.tier10_49}
                    onChange={(e) => setNewItem({ ...newItem, tier10_49: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-[#0b0f17] border border-slate-700 rounded-lg text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-400 mb-0.5">50+ pcs (-25%)</label>
                  <input
                    type="number"
                    value={newItem.tier50plus}
                    onChange={(e) => setNewItem({ ...newItem, tier50plus: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-[#0b0f17] border border-slate-700 rounded-lg text-white font-mono text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-md shadow-red-600/30"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT RATE ITEM */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl p-6 max-w-md w-full text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white">Edit Rate Item: {editingItem.name}</h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEditItem} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0b0f17] border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Retail NPR</label>
                  <input
                    type="number"
                    value={editingItem.retailNPR}
                    onChange={(e) => setEditingItem({ ...editingItem, retailNPR: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-[#0b0f17] border border-slate-700 rounded-lg text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-400 mb-0.5">10-49 pcs</label>
                  <input
                    type="number"
                    value={editingItem.tier10_49}
                    onChange={(e) => setEditingItem({ ...editingItem, tier10_49: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-[#0b0f17] border border-slate-700 rounded-lg text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-400 mb-0.5">50+ pcs</label>
                  <input
                    type="number"
                    value={editingItem.tier50plus}
                    onChange={(e) => setEditingItem({ ...editingItem, tier50plus: Number(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-[#0b0f17] border border-slate-700 rounded-lg text-white font-mono text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-md shadow-red-600/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
