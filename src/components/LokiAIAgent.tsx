"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  X,
  Send,
  Sparkles,
  ShoppingBag,
  Check,
  ChevronDown,
  DollarSign,
  Tag,
  Truck,
  RotateCcw,
  ExternalLink,
  Flame,
  ArrowRight,
} from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/data/products";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
  actionPrompt?: string;
}

function LokiAIAgentContent() {
  const pathname = usePathname();
  const { products, storeSettings, coupons } = useAdminStore();
  const { addItem } = useCartStore();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Namaste! I am your LOKI AI Gear & Rate Advisor. I provide real-time equipment rates, active discounts, and delivery charges updated directly by our store team.",
      timestamp: "Just now",
      actionPrompt: "Ask me about any equipment rate or budget recommendations!",
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Hide AI agent on checkout, admin, and confirmation screens to avoid obstructing buttons
  if (
    pathname?.startsWith("/checkout") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/order-confirmation")
  ) {
    return null;
  }

  // Handle Quick Prompts
  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  // Process User Query based on Live Admin Rates
  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateRateGroundedResponse(query, products, storeSettings, coupons);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 450);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      category: product.category,
    });
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1800);
  };

  const isProductPage = pathname?.startsWith("/products/");

  return (
    <>
      {/* Floating Trigger Button (Bottom Right) */}
      <div
        className={`fixed right-4 sm:right-6 z-50 flex items-center gap-3 ${
          isProductPage ? "bottom-20 sm:bottom-6" : "bottom-6"
        }`}
      >
        {!isOpen && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-right-4 duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Check live rates &amp; gear</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center ${
            isOpen
              ? "bg-slate-900 text-white rotate-90"
              : "bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-500/20 shadow-red-600/30"
          }`}
          aria-label="Open AI Rate Advisor"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
          )}
        </button>
      </div>

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] max-h-[640px] h-[80vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-600/40">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm tracking-tight text-white">LOKI Rate Advisor</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LIVE SYNC
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Grounded in Live Store Rates</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Rate Prompt Pills Bar */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleQuickPrompt("What is the rate of Dragon 10?")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition"
            >
              Dragon 10 Rate?
            </button>
            <button
              onClick={() => handleQuickPrompt("Rackets under NPR 2500")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition"
            >
              Under 2,500?
            </button>
            <button
              onClick={() => handleQuickPrompt("What are the delivery charges?")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition"
            >
              Delivery Rates?
            </button>
            <button
              onClick={() => handleQuickPrompt("Any active coupon codes?")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition"
            >
              Coupons?
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-[#f8fafc]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-slate-900 text-white rounded-br-none shadow-sm"
                      : "bg-white text-slate-800 rounded-bl-none border border-slate-200/90 shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Interactive Recommended Products Cards */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                      {msg.recommendedProducts.map((p) => {
                        const isAdded = addedProductId === p.id;
                        return (
                          <div
                            key={p.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="relative w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                                <Image
                                  src={p.image}
                                  alt={p.name}
                                  width={36}
                                  height={36}
                                  className="object-contain"
                                />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-[11px] text-slate-900 truncate">
                                  {p.name}
                                </h5>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-red-600 text-xs">
                                    NPR {p.price.toLocaleString()}
                                  </span>
                                  {p.originalPrice > p.price && (
                                    <span className="text-[10px] text-slate-400 line-through">
                                      NPR {p.originalPrice.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddToCart(p)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-red-600 text-white font-bold text-[10px] flex items-center gap-1 transition flex-shrink-0 shadow-xs"
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingBag className="w-3 h-3" />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200/90 w-20 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-300" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about rates (e.g. Dragon 10 price, delivery fee)..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white transition shadow-md shadow-red-600/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// ========================================================
// REAL-TIME RATE GROUNDING ENGINE
// ========================================================
function generateRateGroundedResponse(
  query: string,
  products: Product[],
  settings: ReturnType<typeof useAdminStore.getState>["storeSettings"],
  coupons: ReturnType<typeof useAdminStore.getState>["coupons"]
): ChatMessage {
  const lower = query.toLowerCase();

  // 1. DELIVERY RATE INQUIRY
  if (
    lower.includes("delivery") ||
    lower.includes("shipping") ||
    lower.includes("charge") ||
    lower.includes("pokhara") ||
    lower.includes("kathmandu") ||
    lower.includes("bhaktapur") ||
    lower.includes("lalitpur") ||
    lower.includes("courier") ||
    lower.includes("dhulikhel")
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🚚 **Official Store Delivery Rates:**\n• **Inside Kathmandu Valley:** NPR ${settings.deliveryInsideValley}\n• **Outside Valley (Pokhara, Biratnagar, Chitwan, etc.):** NPR ${settings.deliveryOutsideValley}\n• **FREE SHIPPING Threshold:** Free delivery on any order above **NPR ${settings.freeShippingThreshold.toLocaleString()}**!\n\nAll deliveries dispatched via reliable courier partners with live tracking.`,
      timestamp: "Just now",
    };
  }

  // 2. COUPON / PROMO CODE INQUIRY
  if (
    lower.includes("coupon") ||
    lower.includes("discount") ||
    lower.includes("promo") ||
    lower.includes("offer") ||
    lower.includes("code")
  ) {
    const activeCoupons = coupons.filter((c) => c.active);
    if (activeCoupons.length === 0) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Currently, no general coupon codes are active, but all our items have direct discounts applied! You can also enjoy **FREE delivery** on orders over NPR ${settings.freeShippingThreshold.toLocaleString()}.`,
        timestamp: "Just now",
      };
    }

    const couponLines = activeCoupons
      .map(
        (c) =>
          `• **${c.code}**: ${
            c.discountType === "percent" ? `${c.discountValue}% OFF` : `NPR ${c.discountValue} OFF`
          } (Min spend: NPR ${c.minSpend.toLocaleString()})`
      )
      .join("\n");

    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🎟️ **Active Promotional Coupons:**\n${couponLines}\n\nEnter any of these codes during checkout to apply your discount rate!`,
      timestamp: "Just now",
    };
  }

  // 3. SPECIFIC PRODUCT PRICE / RATE INQUIRY (e.g. Dragon 10, Shoes, Jersey, Balls, Shorts, Case)
  const matched = products.filter(
    (p) =>
      lower.includes(p.name.toLowerCase()) ||
      lower.includes(p.id.toLowerCase()) ||
      (lower.includes("dragon 10") && p.id.includes("dragon-10")) ||
      (lower.includes("dragon 8") && p.id.includes("dragon-8")) ||
      (lower.includes("shoe") && p.category === "Footwear") ||
      (lower.includes("jersey") && p.id.includes("jersey")) ||
      (lower.includes("tshirt") && p.id.includes("jersey")) ||
      (lower.includes("ball") && p.category === "Balls") ||
      (lower.includes("short") && p.id.includes("shorts")) ||
      (lower.includes("case") && p.id.includes("case")) ||
      (lower.includes("rubber") && p.category === "Accessories")
  );

  if (matched.length > 0) {
    const primary = matched[0];
    const discountText = primary.discountPercent ? ` (${primary.discountPercent}% OFF)` : "";

    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🏓 **Updated Rate for ${primary.name}:**\n• Current Rate: **NPR ${primary.price.toLocaleString()}**${discountText}\n• Original Rate: NPR ${primary.originalPrice.toLocaleString()}\n• Stock Availability: **${
        primary.stockCount > 0 ? `${primary.stockCount} units in stock` : "Sold Out"
      }**\n• Category: ${primary.category}\n\n${primary.subtitle}`,
      timestamp: "Just now",
      recommendedProducts: [primary],
    };
  }

  // 4. BUDGET / PRICE RANGE INQUIRY (e.g. under 2500, under 2000, under 1500, under 3000)
  const numberMatch = query.match(/(?:under|below|less than|sasto|bhitra)\s*(?:npr|rs\.?)?\s*(\d+)/i) ||
    query.match(/(\d+)\s*(?:under|below|bhitra)/i);

  if (numberMatch && numberMatch[1]) {
    const budget = Number(numberMatch[1]);
    const affordable = products.filter((p) => p.price <= budget);

    if (affordable.length > 0) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `💰 Found **${affordable.length} gear options** under **NPR ${budget.toLocaleString()}** based on our current rates:`,
        timestamp: "Just now",
        recommendedProducts: affordable.slice(0, 3),
      };
    } else {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Our most affordable official gear starts at NPR 299 for ITTF 3-Star Competition Balls and NPR 499 for the Hard-Shell Racket Case.`,
        timestamp: "Just now",
        recommendedProducts: products.filter((p) => p.price <= 500),
      };
    }
  }

  // 5. GENERAL RACKET / ATTACKING RECOMMENDATION
  if (lower.includes("racket") || lower.includes("bat") || lower.includes("blade")) {
    const rackets = products.filter((p) => p.category === "Rackets");
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🏆 **Official LOKI Championship Racket Rates:**\n• **LOKI Dragon 10 Pro:** NPR 2,499 (5-Ply Carbon Mesh, 92 Control, 88 Spin)\n• **LOKI Dragon 8 Pro:** NPR 2,199 (7-Ply Hybrid Wood, Offensive Attacking Loop)\n\nBoth rackets come factory pre-assembled with sticky ITTF competition rubber sheets!`,
      timestamp: "Just now",
      recommendedProducts: rackets,
    };
  }

  // 6. DEFAULT INTELLIGENT HELPER
  return {
    id: `ai-${Date.now()}`,
    sender: "ai",
    text: `I am dynamically synchronized with the store admin rates. You can ask me:\n• *"What is the rate of Dragon 10?"*\n• *"Show me rackets under NPR 2,500"*\n• *"What are delivery rates for Pokhara / Outside Valley?"*\n• *"Any active coupon codes?"*`,
    timestamp: "Just now",
    recommendedProducts: products.slice(0, 2),
  };
}

export default function LokiAIAgent() {
  return (
    <React.Suspense fallback={null}>
      <LokiAIAgentContent />
    </React.Suspense>
  );
}
