import React from "react";
import { Truck, Clock, ShieldCheck, MapPin } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            LOGISTICS &amp; FULFILLMENT
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight mt-1">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-xs text-gray-500 mt-2">
            Last updated: October 2026 • Fast, insured delivery across Nepal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <Truck className="w-5 h-5 text-red-600 mb-2" />
            <h4 className="font-bold text-xs text-gray-900">Free Over NPR 2,000</h4>
            <p className="text-[11px] text-gray-500 mt-1">
              Zero delivery charge nationwide on qualifying orders.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <Clock className="w-5 h-5 text-red-600 mb-2" />
            <h4 className="font-bold text-xs text-gray-900">24-48 Hour Transit</h4>
            <p className="text-[11px] text-gray-500 mt-1">
              Swift dispatch from Kathmandu Central Logistics Hub.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <ShieldCheck className="w-5 h-5 text-red-600 mb-2" />
            <h4 className="font-bold text-xs text-gray-900">Damage Protection</h4>
            <p className="text-[11px] text-gray-500 mt-1">
              Every parcel is bubble wrapped &amp; shock-insulated.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-gray-600 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-950">1. Delivery Zones &amp; Rates</h3>
            <p>
              We deliver to all 77 districts of Nepal. Orders inside Kathmandu, Lalitpur, and Bhaktapur are dispatched via our direct courier fleet within 24 hours. For other cities, express courier partners (Nepal Post EMS, Sundarban, Courier Plus) fulfill deliveries in 1 to 2 business days.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-950">2. Order Tracking</h3>
            <p>
              Once your shipment leaves our warehouse, you will receive an automated SMS with your direct tracking link and rider phone number for seamless coordination.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-950">3. Cash on Delivery (COD)</h3>
            <p>
              Cash on delivery is available throughout major urban centers in Nepal. Please inspect the outer security seal upon delivery before payment.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
