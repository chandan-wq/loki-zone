"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";

export default function ContactPage() {
  const { storeSettings } = useAdminStore();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            WE ARE HERE TO HELP
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight">
            Contact LOKI Support
          </h1>
          <p className="text-sm text-gray-600">
            Have questions about racket specifications, bulk academy orders, or tracking an existing shipment?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 space-y-6">
              <h3 className="font-extrabold text-xl text-gray-950">
                Customer Care &amp; Flagship Center
              </h3>

              <div className="space-y-5 text-xs text-gray-600">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100/70 text-red-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 text-sm">Kathmandu Store</strong>
                    <span>New Baneshwor (Opposite Eyeplex Mall), Kathmandu, Nepal</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100/70 text-red-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 text-sm">Direct Phone &amp; WhatsApp</strong>
                    <span>{storeSettings.supportPhone || "+977 9841-000000"} / +977 1-4780000</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100/70 text-red-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 text-sm">Email Inquiries</strong>
                    <span>{storeSettings.supportEmail || "support@lokizone.com.np"}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100/70 text-red-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-gray-900 text-sm">Store Hours</strong>
                    <span>Sunday - Friday: 9:00 AM – 7:30 PM (Saturday Closed)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-xl">
            {sent ? (
              <div className="text-center py-12 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-xl font-bold text-gray-900">Message Received!</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Our table tennis gear expert will get back to you within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Rohan Sharma"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+977 98XXXXXXXX"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Message / Inquiry *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Ask about racket weight, rubber tackiness, or bulk discounts..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-600/30"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
