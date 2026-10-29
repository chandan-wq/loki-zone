"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Are all LOKI rackets and balls 100% genuine and ITTF approved?",
      a: "Yes! Every single LOKI racket, rubber sheet, and 3-star ball sold on LOKI Zone is 100% genuine, imported directly from the official manufacturer, and carries ITTF tournament certification logos for official match eligibility.",
    },
    {
      q: "How long does delivery take inside and outside Kathmandu Valley?",
      a: "Inside Kathmandu, Lalitpur, and Bhaktapur, orders placed before 2:00 PM are delivered same-day or within 24 hours. For outside the valley (Pokhara, Chitwan, Butwal, Biratnagar, Dharan, etc.), delivery takes 1 to 2 business days via express courier.",
    },
    {
      q: "How does the Free Delivery offer work?",
      a: "Orders totaling NPR 2,000 or more automatically qualify for FREE express nationwide delivery anywhere across Nepal! For orders under NPR 2,000, a flat standard delivery fee of NPR 150 applies.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support eSewa, Khalti, Fonepay QR (compatible with all Nepali mobile banking apps), Visa/Mastercard, and Cash on Delivery (COD) for your maximum convenience.",
    },
    {
      q: "What is your return and exchange policy?",
      a: "We offer a 7-day hassle-free return and replacement policy for unused equipment in its original plastic wrap and packaging with warranty stickers intact.",
    },
    {
      q: "Which handle style should I choose (FL vs ST vs AN)?",
      a: "FL (Flared) is the most popular style worldwide, flaring out at the bottom to prevent slippage during powerful topspin swings. ST (Straight) is preferred by defensive choppers and players who like to flip/twiddle the bat. AN (Anatomic) is shaped to conform to the palm contour.",
    },
  ];

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-950 tracking-tight">
            How Can We Assist You?
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Find answers to commonly asked questions regarding gear specs, delivery, and payments.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-100 bg-gray-50/50 overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-gray-900 hover:text-red-600 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? "rotate-180 text-red-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100/60 pt-3 bg-white">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
