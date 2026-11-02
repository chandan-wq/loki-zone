"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Printer, X, ShieldCheck, MapPin, Phone, Truck, Package, AlertTriangle, CheckCircle2 } from "lucide-react";
import { AdminOrder } from "@/store/useAdminStore";

interface CourierDispatchSlipProps {
  order: AdminOrder;
  courierPartner?: string;
  onClose: () => void;
  onStatusChange?: (newStatus: AdminOrder["status"]) => void;
}

export default function CourierDispatchSlip({
  order,
  courierPartner = "Pathao Express / Nepal Can Move",
  onClose,
  onStatusChange,
}: CourierDispatchSlipProps) {
  const [partner, setPartner] = useState(courierPartner);
  const [courierAwb, setCourierAwb] = useState(
    `NCM-${order.id.replace(/[^0-9]/g, "").slice(-6) || Math.floor(100000 + Math.random() * 900000)}`
  );

  const isCOD = order.paymentMethod?.toLowerCase().includes("cash") || order.paymentMethod?.toLowerCase().includes("cod");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:fixed print:inset-0">
      {/* Container: Screen view vs Print view */}
      <div className="bg-[#121824] border border-slate-800 rounded-3xl max-w-2xl w-full text-xs shadow-2xl relative overflow-hidden print:border-none print:shadow-none print:max-w-none print:w-full print:bg-white print:text-black">
        
        {/* On-Screen Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between p-4 bg-[#0d121c] border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-500 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Official Courier Dispatch Slip &amp; Shipping Label</h3>
              <p className="text-[10px] text-slate-400 font-mono">Format: A5 / A6 Thermal Label Compatible</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition shadow-md shadow-red-600/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip Now</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Courier Partner Selection & Controls (Hidden when printing) */}
        <div className="p-4 bg-[#0b0f17] border-b border-slate-800/80 flex flex-wrap items-center gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-400">Logistics Partner:</label>
            <select
              value={partner}
              onChange={(e) => setPartner(e.target.value)}
              className="bg-[#121824] border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-red-500"
            >
              <option value="Pathao Express">Pathao Express (Inside Valley Same-Day)</option>
              <option value="Nepal Can Move">Nepal Can Move (Nationwide Express)</option>
              <option value="Sundar Courier">Sundar Courier (Overnight Express)</option>
              <option value="LOKI Dedicated Courier">LOKI Direct Messenger</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-400">AWB / Airway Bill #:</label>
            <input
              type="text"
              value={courierAwb}
              onChange={(e) => setCourierAwb(e.target.value)}
              className="bg-[#121824] border border-slate-700 text-white rounded-lg px-2 py-1 text-xs font-mono font-bold w-36 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* =========================================================================
            PRINTABLE SLIP BODY (Target for print styling: crisp black & white)
            ========================================================================= */}
        <div id="courier-dispatch-printable-slip" className="p-6 bg-white text-black font-sans print:p-4">
          
          {/* Header Row: Company & Barcode */}
          <div className="border-b-2 border-black pb-3 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tighter uppercase text-black">
                  LOKI ZONE NEPAL
                </span>
                <span className="text-[10px] uppercase font-bold border border-black px-1.5 py-0.5 rounded">
                  ITTF AUTHORIZED
                </span>
              </div>
              <p className="text-[10px] text-gray-700 mt-0.5">
                Official Distributor of LOKI Table Tennis Equipment in Nepal
              </p>
              <p className="text-[10px] font-semibold text-gray-600">
                New Road, Kathmandu | Tel: +977-9800000000 | info@lokizone.com.np
              </p>
            </div>
            
            <div className="text-right">
              <div className="inline-block bg-black text-white px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded">
                {partner.split(" ")[0]} PARCEL
              </div>
              <div className="text-[11px] font-mono font-bold mt-1 text-gray-800">
                AWB: {courierAwb}
              </div>
              <div className="text-[10px] font-mono text-gray-600">
                Order: #{order.id}
              </div>
            </div>
          </div>

          {/* Barcode Mock Visual */}
          <div className="py-2.5 my-2 border-b border-dashed border-gray-400 flex items-center justify-between">
            <div className="font-mono text-xs tracking-widest bg-gray-100 px-3 py-1 border border-gray-300 rounded font-black">
              * {order.id} *
            </div>
            <div className="text-[10px] font-mono text-gray-600">
              DISPATCH DATE: {order.date || new Date().toISOString().split("T")[0]}
            </div>
          </div>

          {/* SENDER & RECEIVER 2-COLUMN GRID */}
          <div className="grid grid-cols-2 gap-4 my-3 text-xs">
            {/* Sender */}
            <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg">
              <span className="text-[9px] font-mono uppercase font-bold text-gray-500 block mb-1">
                SHIP FROM (SENDER):
              </span>
              <div className="font-bold text-black text-sm">LOKI ZONE NEPAL HUB</div>
              <div className="text-[11px] text-gray-700 mt-0.5">Central Fulfillment Warehouse</div>
              <div className="text-[11px] text-gray-700">New Road, Kathmandu, Bagmati</div>
              <div className="font-bold text-black text-[11px] mt-1">Tel: 9800000000</div>
            </div>

            {/* Consignee / Receiver (Large & High Contrast for Courier Driver) */}
            <div className="p-3 bg-gray-100 border-2 border-black rounded-lg">
              <span className="text-[9px] font-mono uppercase font-black text-red-700 block mb-1">
                DELIVER TO (RECIPIENT):
              </span>
              <div className="font-black text-black text-base uppercase tracking-tight">
                {order.customerName}
              </div>
              <div className="text-sm font-black text-black bg-yellow-200 inline-block px-1.5 py-0.5 rounded my-1 border border-yellow-400">
                📞 {order.phone}
              </div>
              <div className="text-xs font-bold text-gray-900 mt-0.5 leading-snug">
                {order.address}
              </div>
              <div className="text-xs font-black text-black uppercase mt-1">
                CITY: {order.city}
              </div>
            </div>
          </div>

          {/* PAYMENT & CASH COLLECTION DIRECTIVE (MOST CRITICAL FOR COURIER) */}
          <div className={`p-3 rounded-lg border-2 my-3 flex items-center justify-between ${
            isCOD
              ? "bg-amber-50 border-amber-500 text-amber-950"
              : "bg-emerald-50 border-emerald-500 text-emerald-950"
          }`}>
            <div>
              <div className="text-[10px] font-mono uppercase font-black tracking-wider">
                PAYMENT STATUS &amp; INSTRUCTION FOR COURIER:
              </div>
              <div className="text-sm font-black mt-0.5">
                {isCOD ? "⚠️ CASH ON DELIVERY (COD) — COLLECT FROM CUSTOMER" : "✅ PREPAID ORDER — DO NOT COLLECT CASH"}
              </div>
              <div className="text-[11px] text-gray-700">
                Payment Method: <span className="font-bold uppercase">{order.paymentMethod}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-gray-600 font-bold">
                AMOUNT TO COLLECT:
              </div>
              <div className="text-lg font-black font-mono">
                {isCOD ? `NPR ${order.total.toLocaleString()}` : "NPR 0 (PAID)"}
              </div>
            </div>
          </div>

          {/* ITEM CONTENT TABLE */}
          <div className="my-3 border border-gray-300 rounded-lg overflow-hidden text-xs">
            <div className="bg-gray-100 p-2 font-bold text-gray-700 border-b border-gray-300 flex justify-between text-[11px]">
              <span>ITEM DETAILS &amp; QUANTITY</span>
              <span>QTY × RATE</span>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-2 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-black">{item.name}</span>
                    <span className="text-gray-500 ml-2 font-mono text-[10px]">SKU: {item.id}</span>
                  </div>
                  <span className="font-mono font-bold text-gray-900">
                    {item.quantity} × NPR {item.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-2 bg-gray-50 border-t border-gray-300 flex justify-between font-bold text-[11px]">
              <span>Subtotal: NPR {order.subtotal.toLocaleString()} | Delivery: {order.deliveryFee === 0 ? "FREE" : `NPR ${order.deliveryFee}`}</span>
              <span className="text-black font-black">TOTAL: NPR {order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* HANDLING INSTRUCTIONS & DELIVERY NOTES */}
          <div className="p-2.5 bg-gray-50 border border-gray-300 rounded-lg my-2 text-[10px] text-gray-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-black uppercase">
              <AlertTriangle className="w-3 h-3 text-red-600" />
              <span>HANDLING: FRAGILE TOURNAMENT TABLE TENNIS EQUIPMENT • KEEP DRY • DO NOT BEND</span>
            </div>
            {order.courierNote && (
              <div className="text-gray-700 italic border-t border-gray-200 pt-1">
                <strong>Customer / Delivery Note:</strong> {order.courierNote}
              </div>
            )}
          </div>

          {/* SIGNATURE & CONFIRMATION BOX */}
          <div className="grid grid-cols-2 gap-4 pt-3 mt-3 border-t border-dashed border-gray-400 text-[10px]">
            <div>
              <span className="block font-bold text-gray-600">Dispatched By (LOKI Store):</span>
              <div className="mt-4 border-b border-black w-36"></div>
              <span className="text-gray-500 mt-0.5 block">Staff Signature / Date</span>
            </div>
            <div>
              <span className="block font-bold text-gray-600">Received in Good Condition By:</span>
              <div className="mt-4 border-b border-black w-44"></div>
              <span className="text-gray-500 mt-0.5 block">Customer Signature / Receiver Mobile</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center text-[9px] text-gray-500 mt-4 pt-2 border-t border-gray-200">
            For parcel return, address changes, or issues, please contact LOKI Zone Nepal Support Hotline: 9800000000.
          </div>
        </div>

      </div>
    </div>
  );
}
