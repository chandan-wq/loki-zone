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
  RotateCcw,
  ExternalLink,
  Zap,
  MessageCircle,
} from "lucide-react";
import { useAdminStore } from "@/store/useAdminStore";
import { useCartStore } from "@/store/useCartStore";
import { Product } from "@/data/products";

export interface QuickAction {
  label: string;
  query: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  recommendedProducts?: Product[];
  actionPrompt?: string;
  quickActions?: QuickAction[];
  badge?: string;
  isOutOfStockNotice?: boolean;
  isNotFoundNotice?: boolean;
}

// Custom Table Tennis Paddle + AI Sparkle Icon
function TableTennisAIIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Paddle Rubber Blade */}
      <circle
        cx="10"
        cy="9.5"
        r="6.5"
        fill="currentColor"
        fillOpacity="0.25"
      />
      <circle
        cx="10"
        cy="9.5"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Blade Handle */}
      <path
        d="M14.5 14L19.5 19C20.05 19.55 20.05 20.45 19.5 21C18.95 21.55 18.05 21.55 17.5 21L12.5 16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* ITTF 3-Star Yellow Ball */}
      <circle
        cx="18.5"
        cy="5.5"
        r="2.5"
        fill="#FACC15"
        stroke="#FFFFFF"
        strokeWidth="0.8"
      />
      {/* AI Sparkle Star */}
      <path
        d="M5 3.5L5.6 4.9L7 5.5L5.6 6.1L5 7.5L4.4 6.1L3 5.5L4.4 4.9L5 3.5Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// Gentle audio notification chime (Web Audio API)
function playSoftChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(784, ctx.currentTime); // G5
    osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.1); // D6
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // Autoplay policy or unsupported audio context
  }
}

function LokiAIAgentContent() {
  const pathname = usePathname();
  const { addItem } = useCartStore();

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message in friendly, normal Nepali
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Namaste bro! 🙏 Ma LOKI Nepal ko AI Coach hu.\n\nMasanga normal gaff garna saknu hunchha, bats/shoes ko live rate sodhna saknu hunchha, ya delivery ra offer haru bujhna saknu hunchha. Aaja kasto chaldaichha tapaiko game?",
      timestamp: "Just now",
      badge: "ONLINE",
      quickActions: [
        { label: "👋 K chha bro?", query: "k chha bro" },
        { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
        { label: "💰 Rackets under NPR 2,500", query: "Rackets under NPR 2500" },
        { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
      ],
    },
  ]);

  // Live sync products, store settings, and coupons from DB on mount and when modal opens
  useEffect(() => {
    const syncLiveStore = async () => {
      try {
        const pRes = await fetch("/api/products");
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.success && Array.isArray(pData.products) && pData.products.length > 0) {
            useAdminStore.getState().setProducts(pData.products);
          }
        }
      } catch {}

      try {
        const sRes = await fetch("/api/settings");
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.success && sData.settings) {
            useAdminStore.getState().setStoreSettings(sData.settings);
          }
        }
      } catch {}

      try {
        const cRes = await fetch("/api/admin/coupons");
        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.success && Array.isArray(cData.coupons)) {
            useAdminStore.getState().setCoupons(cData.coupons);
          }
        }
      } catch {}
    };

    syncLiveStore();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, isOpen]);

  // Hide AI agent on checkout, admin, and confirmation screens
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

  // Reset chat conversation
  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "ai",
        text: "Namaste bro! 🙏 Chat fresh भयो। Bat, shoes, delivery ya coupons ko barema janna man chha bhane sodhnus hai!",
        timestamp: "Just now",
        badge: "ONLINE",
        quickActions: [
          { label: "👋 K chha bro?", query: "k chha bro" },
          { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
          { label: "⚡ Dragon 8 Attack", query: "Dragon 8 Pro ko rate kasto chha?" },
          { label: "👟 Court Shoes", query: "Show me court shoes rate" },
          { label: "💰 Under NPR 2,500", query: "Rackets under NPR 2500" },
          { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
        ],
      },
    ]);
  };

  // Process User Query based on Live Admin Rates & Natural Chit-Chat
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
      const liveProducts = useAdminStore.getState().products;
      const liveSettings = useAdminStore.getState().storeSettings;
      const liveCoupons = useAdminStore.getState().coupons;
      const response = generateRateGroundedResponse(query, liveProducts, liveSettings, liveCoupons);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
      playSoftChime();
    }, 60);
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
        className={`fixed right-4 sm:right-6 z-50 flex items-center gap-2.5 ${
          isProductPage ? "bottom-20 sm:bottom-6" : "bottom-6"
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center shadow-[0_12px_36px_-6px_rgba(220,38,38,0.4)] transition-all duration-150 ease-out transform hover:scale-105 active:scale-95 border backdrop-blur-xl ${
            isOpen
              ? "p-3.5 rounded-full bg-neutral-950 text-white border-neutral-800"
              : "pl-2 pr-3.5 sm:pr-4 py-2 rounded-full bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 text-white border-red-500/40 hover:border-red-500/80 ring-2 ring-red-500/20"
          }`}
          aria-label={isOpen ? "Close AI Coach" : "Open LOKI AI Coach"}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              {/* Glowing Badge Avatar with Table Tennis Paddle + Ball Icon */}
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-600/40 flex-shrink-0">
                <TableTennisAIIcon className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-neutral-950" />
                </span>
              </div>

              {/* Text Badge (Coach Name + Subtitle) */}
              <div className="flex flex-col text-left pl-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black tracking-tight text-white group-hover:text-red-400 transition">
                    LOKI Coach
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-red-600 text-white font-extrabold uppercase tracking-wider">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">Ask rates &amp; gear</span>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] max-h-[640px] h-[80vh] bg-slate-50 rounded-[28px] border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden animate-chat-window">
          {/* Header with Dark Red/Charcoal Gradient */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-neutral-950 via-slate-900 to-red-950 text-white flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-red-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-600/40">
                <TableTennisAIIcon className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-neutral-950 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white">LOKI AI Coach</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Rates
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-normal">Kathmandu Store • Always Online</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Fresh Chat"
                aria-label="Fresh Chat"
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                aria-label="Close"
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Rate Prompt Pills Bar */}
          <div className="p-2.5 bg-white border-b border-slate-200/70 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleQuickPrompt("k chha bro")}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200/80 text-[11px] font-medium text-slate-700 whitespace-nowrap transition active:scale-95"
            >
              👋 K chha bro?
            </button>
            <button
              onClick={() => handleQuickPrompt("Dragon 10 ko rate kati ho?")}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200/80 text-[11px] font-medium text-slate-700 whitespace-nowrap transition active:scale-95"
            >
              🏓 Dragon 10 Rate?
            </button>
            <button
              onClick={() => handleQuickPrompt("Rackets under NPR 2500")}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200/80 text-[11px] font-medium text-slate-700 whitespace-nowrap transition active:scale-95"
            >
              💰 Under 2,500?
            </button>
            <button
              onClick={() => handleQuickPrompt("Do you have Butterfly Viscaria bat?")}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200/80 text-[11px] font-medium text-slate-700 whitespace-nowrap transition active:scale-95"
            >
              🦋 Butterfly vs LOKI
            </button>
            <button
              onClick={() => handleQuickPrompt("Delivery charges kati ho?")}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-700 hover:border-red-200 border border-slate-200/80 text-[11px] font-medium text-slate-700 whitespace-nowrap transition active:scale-95"
            >
              🚚 Delivery Fee
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#f8fafc]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col animate-chat-msg ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[84%] p-3.5 rounded-2xl leading-relaxed text-[13px] ${
                    msg.sender === "user"
                      ? "bg-neutral-900 text-white rounded-tr-xs shadow-sm"
                      : "bg-white text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.03)]"
                  }`}
                >
                  {/* Status Badge */}
                  {msg.badge && (
                    <div className="mb-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                          msg.isOutOfStockNotice
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : msg.isNotFoundNotice
                            ? "bg-purple-100 text-purple-800 border border-purple-300"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        <Zap className="w-2.5 h-2.5" />
                        {msg.badge}
                      </span>
                    </div>
                  )}

                  <p className="whitespace-pre-line font-normal">{msg.text}</p>

                  {/* Sleek In-Chat Product Cards */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-100">
                      {msg.recommendedProducts.map((p) => {
                        const isAdded = addedProductId === p.id;
                        const isOut = !p.inStock || p.stockCount <= 0;
                        return (
                          <div
                            key={p.id}
                            className="p-2 rounded-xl bg-slate-50/80 border border-slate-200/90 flex items-center justify-between gap-2.5 hover:border-slate-300 transition"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Link
                                href={`/products/${p.id}`}
                                className="relative w-11 h-11 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1 group"
                                title="View product details"
                              >
                                <Image
                                  src={p.image}
                                  alt={p.name}
                                  width={40}
                                  height={40}
                                  className="object-contain group-hover:scale-105 transition"
                                />
                              </Link>
                              <div className="min-w-0">
                                <Link
                                  href={`/products/${p.id}`}
                                  className="font-bold text-[11px] text-slate-900 truncate hover:text-red-600 block transition"
                                >
                                  {p.name}
                                </Link>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-extrabold text-red-600 text-xs">
                                    NPR {p.price.toLocaleString()}
                                  </span>
                                  {p.originalPrice > p.price && (
                                    <span className="text-[10px] text-slate-400 line-through">
                                      NPR {p.originalPrice.toLocaleString()}
                                    </span>
                                  )}
                                  {isOut ? (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-700 border border-amber-300">
                                      Out of Stock
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-50 text-emerald-600">
                                      {p.stockCount} in stock
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Link
                                href={`/products/${p.id}`}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
                                title="View product page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              {!isOut && (
                                <button
                                  onClick={() => handleAddToCart(p)}
                                  className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-red-600 text-white font-bold text-[10px] flex items-center gap-1 transition shadow-xs active:scale-95"
                                >
                                  {isAdded ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span>Added</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingBag className="w-3 h-3" />
                                      <span>Add</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Interactive Quick Action Pills Under Message */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                      {msg.quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(action.query)}
                          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-red-50 hover:border-red-300 hover:text-red-700 border border-slate-200/80 text-[11px] font-medium text-slate-700 transition flex items-center gap-1 shadow-2xs active:scale-95 text-left"
                        >
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-slate-200/90 w-14 shadow-xs animate-chat-msg">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-chat-dot-1" />
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-chat-dot-2" />
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-chat-dot-3" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sleek Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type in Nepali or English (e.g. kasto xa bro, Dragon 10 ko rate)..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 disabled:opacity-40 text-white transition shadow-md shadow-red-600/30 active:scale-95"
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
// REAL-TIME RATE & NATURAL CONVERSATIONAL NLP ENGINE
// Style: Normal human friendly conversational Nepali/English
// ========================================================
function generateRateGroundedResponse(
  query: string,
  products: Product[],
  settings: ReturnType<typeof useAdminStore.getState>["storeSettings"],
  coupons: ReturnType<typeof useAdminStore.getState>["coupons"]
): ChatMessage {
  const rawLower = query.toLowerCase().trim();
  const clean = rawLower
    .replace(/[\?\,\.\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\\\|\<\>\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const inStockProducts = products.filter((p) => p.inStock && p.stockCount > 0);
  const has = (re: RegExp) => re.test(clean) || re.test(rawLower);

  // 1. "SUNA NA" / ATTENTION
  if (
    has(/^(suna\s*na|sunana|bana\s*na|vanana|bhana\s*na|suna\s*bana|suna|sunnus|bhandinus|vandinus)\b/i) ||
    has(/^(oi|oye|hey\s*bro|oi\s*bro|dai\s*suna|daju\s*suna)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Hajur bro, bhannus na! Ma sunirakheko chhu. K sodhnu thyo? Bat, jutta, delivery ya kunai item ko rate?`,
      timestamp: "Just now",
      badge: "CHATTING",
      quickActions: [
        { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
        { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
      ],
    };
  }

  // 2. GREETINGS & CASUAL "HOW ARE YOU"
  if (
    has(/\b(namaste|namaskar|नमस्ते|नमस्कार)\b/i) ||
    has(/\b(hi|hello|hey|yo|hiya|hola)\b/i) ||
    has(/\bk\s*(chha|cha|xa|xau|chhau|chaldai)\b/i) ||
    has(/\bkasto\s*(chha|cha|xa|xau|chhau)\b/i) ||
    has(/\b(sanchai|sanchai\s*xau|sanchai\s*chhau|sanchai\s*hunuhunchha)\b/i) ||
    has(/\b(halka|khabar)\s*k\s*(chha|cha|xa)\b/i) ||
    has(/\bgood\s*(morning|afternoon|evening)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Sanchai chhu bro! 🙏 Tapaiko kasto chaldai chha? Aaja TT khelna naya bat ya gear khojdai hunuhunchha?`,
      timestamp: "Just now",
      badge: "COACH",
      recommendedProducts: inStockProducts.slice(0, 2),
      quickActions: [
        { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
        { label: "💰 Rackets under NPR 2,500", query: "Rackets under NPR 2500" },
      ],
    };
  }

  // 3. PERSONAL BANTER: "KHANA KHAYAU" / "K GARDAI XAU" / "KATA XAU"
  if (has(/\b(khana\s*(khayau|khayo|khayeu|khanu\s*bhayou|khanu\s*bhayo|khaye))\b/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Haha ma ta bot hu bro, khana ta bijuli matra khanchhu 😄 Tapaile khanu bhayo ni? Aaja TT khelne mood ma ho?`,
      timestamp: "Just now",
      badge: "FUN",
      quickActions: [
        { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
      ],
    };
  }

  if (has(/\b(k\s*gardai\s*(xau|chhau|ho|hunuhunchha|hunuhunxa)|what\s*are\s*you\s*doing)\b/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Kathmandu warehouse ma basera live orders herdai chhu bro! Tapaiko TT game kasto chaldai chha?`,
      timestamp: "Just now",
      badge: "ONLINE",
      quickActions: [
        { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
      ],
    };
  }

  if (has(/\b((kata|kaha)\s*(xau|chhau|basxau|baschhau|ho|hunuhunchha)|ghar\s*kata\s*(ho|cha|xa))\b/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Hamro main showroom ra warehouse Kathmandu ma chha bro! Yatai bata valley bhari 24 hours ma ra bahira express courier bata deliver hunchha. Tapai kata bata ho?`,
      timestamp: "Just now",
      badge: "KTM HUB",
      quickActions: [
        { label: "🚚 Delivery Rates", query: "Delivery charges kati ho?" },
        { label: "💳 Payment Methods", query: "Kasari payment garne?" },
      ],
    };
  }

  // 4. "NEPALI BUJHXAU"
  if (
    has(/\b(nepali\s*(bolxau|bujhxau|aauxa|bolchhau|bujhchhau|aaucha|bolna\s*aauxa))\b/i) ||
    has(/\b(can\s*you\s*speak\s*nepali|nepali\s*language|nepali\s*aunchha)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Majjale bujhchhu ni bro! 🙏 Nepali, English, jasari sajilo lagchha tyasari kura garnus na. K ma help garum?`,
      timestamp: "Just now",
      badge: "BILINGUAL",
      quickActions: [
        { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
      ],
    };
  }

  // 5. IDENTITY: "TIMI MANXE HO KI BOT"
  if (
    has(/\b((manxe|manche|human)\s*(ho\s*ki|ho)?\s*(bot|robot|ai))\b/i) ||
    has(/\b((timi|tapai)\s*(ko\s*hau|ko\s*ho|k\s*hau|k\s*ho))\b/i) ||
    has(/\b(who\s*are\s*you|what\s*are\s*you)\b/i) ||
    has(/\btimro\s*(nam|name)\s*k\s*ho\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Ma LOKI Zone Nepal ko AI advisor hu bro 🤖 — human jastai live rate, stock ra bat suggestions dinchhu. K help garna sakchhu?`,
      timestamp: "Just now",
      badge: "AI COACH",
      quickActions: [
        { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack", query: "Dragon 8 Pro ko rate kasto chha?" },
      ],
    };
  }

  // 6. SHORT AGREEMENT: "THIK XA" / "OK" / "HUSS"
  if (
    has(/^(thik\s*(xa|cha|chha)|ok|okay|huss|la|hunchha|hunxa|sahi\s*ho|bujhe|ekdam\s*ramro|great|perfect|nice)$/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Huss bro! Kunai bat ya gear check garnu pare bhannus hai. Dragon 10 ra Dragon 8 stock ma ready chhan.`,
      timestamp: "Just now",
      badge: "READY",
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
      ],
    };
  }

  // 7. GRATITUDE: "DHANYABAD"
  if (has(/\b(dhanyabad|dhanyabhad|thank\s*you|thanks|thank\s*u|dherai\s*ramro|good\s*job|welldone|dammi)\b/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Swagatam bro! 🙏 Match ramrari khelnus hai. Aru khei sodhnu pare ma yatai chhu! 🏓`,
      timestamp: "Just now",
      badge: "WELCOME",
      quickActions: [
        { label: "🏓 Shop Rackets", query: "Dragon 10 ko rate kati ho?" },
      ],
    };
  }

  // 8. LAUGHS
  if (has(/^(haha|hahaha|hehe|lol|rofl|xd)+$/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Haha match ma jastai yeta pani full positive energy chha! 😄 Aaja kunai bat ya shoes check garne plan chha?`,
      timestamp: "Just now",
      badge: "SMILE",
      quickActions: [
        { label: "🏓 Dragon 10 Carbon", query: "Dragon 10 ko rate kati ho?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
      ],
    };
  }

  // 9. SIGN-OFF: "BYE"
  if (has(/\b(bye|tata|good\s*night|shuva\s*ratri|paxi\s*kura|bholi\s*kura|see\s*you|bhetumla)\b/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Huss bro, Tata! Ramrari khelnus, practice dhuwadhaar garnus hai 🙏🏓`,
      timestamp: "Just now",
      badge: "BYE",
    };
  }

  // 10. SHOWROOM & CONTACT
  if (
    has(/\b(pasal\s*kata|showroom|location|store\s*kata|address|thamel|kathmandu|contact|phone|whatsapp|number|call)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Hamro showroom ra warehouse Kathmandu ma chha bro. Support WhatsApp: +977 9800000000 ho. Online order garda COD ya eSewa bata tirna milchha!`,
      timestamp: "Just now",
      badge: "LOCATION",
      quickActions: [
        { label: "🚚 Delivery Rates", query: "Delivery charges kati ho?" },
        { label: "💳 Payment Methods", query: "Kasari payment garne?" },
      ],
    };
  }

  // 11. AUTHENTICITY / ITTF GUARANTEE
  if (
    has(/\b(genuine|original|nakali|copy|duplicate|fake|ittf|warranty|guarantee|bharosa|authentic)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `100% original ITTF certified ho bro! Hami official LOKI distributor hau, sealed box aauchha ra 7-day replacement guarantee pani chha.`,
      timestamp: "Just now",
      badge: "ITTF GUARANTEE",
      recommendedProducts: inStockProducts.slice(0, 2),
      quickActions: [
        { label: "🏓 View ITTF Rackets", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚪ 3-Star Balls", query: "Tell me about 3 star balls" },
      ],
    };
  }

  // 12. PAYMENT & COD
  if (
    has(/\b(payment|kasari\s*tirne|pay|esewa|khalti|fonepay|qr|cod|cash\s*on\s*delivery|online\s*pay|paisa)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Cash on Delivery (COD) chha bro — saman aayepaxi haat ma paisa tirna milchha. Sathai eSewa, Khalti, ya Fonepay QR bata pani sajilai payment hunchha!`,
      timestamp: "Just now",
      badge: "PAYMENT",
      quickActions: [
        { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
        { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
      ],
    };
  }

  // 13. DELIVERY RATES
  if (
    has(/\b(delivery|shipping|charge|courier|bhada|pokhara|chitwan|butwal|dharan|biratnagar|nepalgunj|bhaktapur|lalitpur|ktm|valley)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Kathmandu Valley bhari **NPR ${settings.deliveryInsideValley}** parcha (24 hours ma aipugcha), valley bahira **NPR ${settings.deliveryOutsideValley}** parcha bro.\n\nTara NPR ${settings.freeShippingThreshold.toLocaleString()} bhanda mathi ko order ma delivery **bilkul FREE** chha!`,
      timestamp: "Just now",
      badge: "DELIVERY",
      quickActions: [
        { label: "🔥 Free Delivery Items", query: "Rackets under NPR 2500" },
        { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
      ],
    };
  }

  // 14. COUPONS
  if (has(/\b(coupon|discount|promo|offer|code|voucher|chhut)\b/i)) {
    const activeCoupons = coupons.filter((c) => c.active);
    if (activeCoupons.length === 0) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Ahile sidhai gear ma factory discount lagisakeko chha bro! NPR ${settings.freeShippingThreshold.toLocaleString()} mathi free delivery pani chha.`,
        timestamp: "Just now",
        badge: "OFFER",
        quickActions: [
          { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
        ],
      };
    }

    const lines = activeCoupons
      .map((c) => `• **${c.code}**: ${c.discountType === "percent" ? `${c.discountValue}% OFF` : `NPR ${c.discountValue} OFF`}`)
      .join("\n");

    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Active coupon codes yo chhan bro:\n${lines}\n\nCheckout garda code halnus, discount thap hunchha!`,
      timestamp: "Just now",
      badge: "COUPONS",
      quickActions: [
        { label: "🏓 Shop Dragon 10", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Shop Dragon 8", query: "Dragon 8 Pro ko rate kasto chha?" },
      ],
    };
  }

  // 15. COMPETITOR BRANDS (Butterfly, DHS, etc.)
  const competitorKeywords = [
    "butterfly",
    "viscaria",
    "timo boll",
    "tenergy",
    "dignics",
    "rozena",
    "primorac",
    "zhang jike",
    "fan zhendong",
    "korbel",
    "dhs",
    "hurricane",
    "skyline",
    "ma long",
    "stiga",
    "clipper",
    "carbonado",
    "cybershape",
    "yasaka",
    "rakza",
    "ma lin",
    "donic",
    "waldner",
    "bluefire",
    "baracuda",
    "tibhar",
    "evolution",
    "k3",
    "mizuno",
    "asics",
    "nittaku",
    "joola",
  ];

  const matchedCompetitor = competitorKeywords.find((k) => rawLower.includes(k));

  if (matchedCompetitor) {
    const dragon10 = products.find((p) => p.id === "loki-dragon-10") || products[0];
    const dragon8 = products.find((p) => p.id === "loki-dragon-8") || products[1];

    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Butterfly / ${matchedCompetitor.toUpperCase()} hamro ma chaina bro, hami Nepal ma official LOKI ITTF ko exclusive store hau.\n\nTara Viscaria / ALC carbon blade jastai pro-level speed ra spin bhayeko hamro **Dragon 10 Carbon (NPR ${dragon10.price.toLocaleString()})** chha — dherai sasto ma tournament level performance dinchha! Tala check garnus na:`,
      timestamp: "Just now",
      badge: "LOKI MATCH",
      isNotFoundNotice: true,
      recommendedProducts: [dragon10, dragon8],
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
      ],
    };
  }

  // 16. ORDER TRACKING
  if (has(/\b(track|tracking|order\s*status|saman\s*kata|kata\s*aipugyo|delivery\s*status|order\s*track)\b/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Tapaile hamro [Order Tracking Page](/order-tracking) ma phone number ya order ID halera live delivery status herna saknu hunchha bro! Valley bhari 24 hours ma deliver hunchha.`,
      timestamp: "Just now",
      badge: "TRACKING",
      quickActions: [
        { label: "🚚 Delivery Rates", query: "Delivery charges kati ho?" },
        { label: "📞 Support WhatsApp", query: "Showroom contact number" },
      ],
    };
  }

  // 17. OUT OF STOCK QUERIES
  if (has(/\b(out\s*of\s*stock|sakiyeko|sold\s*out)\b/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Ahile hamro store ma main items sabai ready in-stock chhan bro! Dragon 10, Dragon 8, Swift shoes sabai warehouse ma ready chha. Kunai item chahiyeko thyo?`,
      timestamp: "Just now",
      badge: "IN STOCK",
      recommendedProducts: inStockProducts.slice(0, 2),
      quickActions: [
        { label: "🏓 Dragon 10 Carbon", query: "Dragon 10 ko rate kati ho?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
      ],
    };
  }

  // 18. BUDGET QUERIES (under 2500, under 2000, etc.)
  const numberMatch =
    query.match(/(?:under|below|less than|sasto|bhitra)\s*(?:npr|rs\.?)?\s*(\d+)/i) ||
    query.match(/(\d+)\s*(?:under|below|bhitra|samma)/i);

  if (numberMatch && numberMatch[1]) {
    const budget = Number(numberMatch[1]);
    const affordable = inStockProducts.filter((p) => p.price <= budget);

    if (affordable.length > 0) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `NPR ${budget.toLocaleString()} bhitra hamra best options yo chhan bro! Sabai ITTF standard ka chhan:`,
        timestamp: "Just now",
        badge: `≤ NPR ${budget.toLocaleString()}`,
        recommendedProducts: affordable.slice(0, 3),
        quickActions: [
          { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
          { label: "🎟️ Active Coupons", query: "Any active coupon codes?" },
        ],
      };
    } else {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `NPR ${budget.toLocaleString()} vitra racket chaina bro, hamro ITTF 3-Star balls NPR 299 ra racket case NPR 499 bata aauchha. Dragon bats NPR 2,199 bata start hunchha!`,
        timestamp: "Just now",
        badge: "BUDGET",
        recommendedProducts: inStockProducts.slice(0, 2),
      };
    }
  }

  // 19. SPECIFIC PRODUCT RATE & DETAILS INQUIRY
  const matchedProduct = products.find((p) => {
    const pName = p.name.toLowerCase();
    const pId = p.id.toLowerCase();

    if (rawLower.includes(pName) || rawLower.includes(pId)) return true;
    if ((rawLower.includes("dragon 10") || rawLower.includes("d10")) && pId.includes("dragon-10")) return true;
    if ((rawLower.includes("dragon 8") || rawLower.includes("d8")) && pId.includes("dragon-8")) return true;
    if ((rawLower.includes("shoe") || rawLower.includes("shoes") || rawLower.includes("jutta") || rawLower.includes("footwear")) && p.category === "Footwear") return true;
    if ((rawLower.includes("jersey") || rawLower.includes("tshirt") || rawLower.includes("t-shirt") || rawLower.includes("aeroflex") || rawLower.includes("luga")) && p.id.includes("jersey")) return true;
    if ((rawLower.includes("short") || rawLower.includes("shorts") || rawLower.includes("kattu")) && p.id.includes("shorts")) return true;
    if ((rawLower.includes("ball") || rawLower.includes("balls") || rawLower.includes("gatti") || rawLower.includes("3-star")) && p.category === "Balls") return true;
    if ((rawLower.includes("case") || rawLower.includes("cover") || rawLower.includes("bag") || rawLower.includes("hardshell")) && p.id.includes("case")) return true;
    if ((rawLower.includes("towel") || rawLower.includes("rumal")) && p.id.includes("towel")) return true;
    if ((rawLower.includes("rubber") || rawLower.includes("rxton") || rawLower.includes("sheet")) && p.id.includes("rxton")) return true;

    return false;
  });

  if (matchedProduct) {
    const p = matchedProduct;
    const isOut = !p.inStock || p.stockCount <= 0;

    if (isOut) {
      const alternatives = inStockProducts.filter((alt) => alt.id !== p.id).slice(0, 2);
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Kshama chahanchhau bro, ${p.name} ahile sakiyeko chha (restock hudaichha). Tara yo alternatives ready chha, hernus na:`,
        timestamp: "Just now",
        badge: "OUT OF STOCK",
        isOutOfStockNotice: true,
        recommendedProducts: alternatives,
        quickActions: [
          { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
          { label: "⚡ Dragon 8 Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
        ],
      };
    }

    const discountNote = p.discountPercent ? ` (mrp NPR ${p.originalPrice.toLocaleString()} ho, ${p.discountPercent}% discount ma chha)` : "";

    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `${p.name} ko rate ahile **NPR ${p.price.toLocaleString()}** parcha bro${discountNote}.\n\nKathmandu warehouse ma ${p.stockCount} units ready stock chha. ${p.subtitle || p.description}\n\nTala bata 1-tap mai cart ma halera checkout garna saknu hunchha!`,
      timestamp: "Just now",
      badge: "LIVE RATE",
      recommendedProducts: [p],
      quickActions: [
        { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
        { label: "🎟️ Active Coupons", query: "Any active coupon codes?" },
      ],
    };
  }

  // 20. GENERAL RACKET / BAT QUERY
  if (has(/\b(racket|bat|blade|blades)\b/i)) {
    const rackets = inStockProducts.filter((p) => p.category === "Rackets");
    const racketLines = rackets
      .slice(0, 4)
      .map((r, i) => `• **${r.name}:** NPR ${r.price.toLocaleString()}`)
      .join("\n");

    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Hamro ma main championship bats yo chhan bro:\n${racketLines}\n\nDragon 10 control ra spin ko lagi ekdam balance chha, Dragon 8 Pro fast topspin smash ko lagi best ho. Tapaiko playstyle kasto chha?`,
      timestamp: "Just now",
      badge: "RACKETS",
      recommendedProducts: rackets.slice(0, 2),
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
      ],
    };
  }

  // 21. EXPLICIT BUY OR PRODUCT SEARCH WITH NO MATCH
  const hasExplicitBuyOrProductSearch = has(
    /\b(paucha|pauxa|kinna|kinne|buy|order|price|rate|cost|kati\s*parcha|kati\s*parxa|khojeko|khojdai|cha\s*ki\s*nai|chha\s*ki\s*nai|xa\s*ki\s*nai)\b/i
  );

  if (hasExplicitBuyOrProductSearch) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Tapai le khojnu bhayeko yo saman hamro store ma bhetiyena bro. Hamro official LOKI championship items yaha chhan, hernus na:`,
      timestamp: "Just now",
      badge: "CATALOG",
      isNotFoundNotice: true,
      recommendedProducts: inStockProducts.slice(0, 2),
      quickActions: [
        { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
        { label: "🚚 Delivery Rates", query: "Delivery charges kati ho?" },
      ],
    };
  }

  // 22. OPEN-ENDED CONVERSATIONAL FALLBACK
  return {
    id: `ai-${Date.now()}`,
    sender: "ai",
    text: `Hajur bro! Ma bujhchhu 😄 Kunai bat, shoes, balls ya rate ko barema sodhnu chha bhane bhandai garnus na. Tapaiko TT practice kasto chaldai chha?`,
    timestamp: "Just now",
    badge: "COACH",
    recommendedProducts: inStockProducts.slice(0, 2),
    quickActions: [
      { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
      { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
      { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
      { label: "💰 Rackets under NPR 2,500", query: "Rackets under NPR 2500" },
    ],
  };
}

export default function LokiAIAgent() {
  return (
    <React.Suspense fallback={null}>
      <LokiAIAgentContent />
    </React.Suspense>
  );
}
