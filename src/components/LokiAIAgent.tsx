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
  ShieldCheck,
  HelpCircle,
  AlertCircle,
  Phone,
  Zap,
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

// Gentle audio notification chime (Web Audio API, no external audio file required)
function playSoftChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(784, ctx.currentTime); // G5
    osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.1); // D6
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.23);
  } catch {
    // Autoplay policy or unsupported audio context
  }
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

  // Initial welcome message with engaging prompt pills
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "ai",
      text: "Namaste! 🙏 Ma LOKI Zone Nepal ko official AI Equipment & Rate Advisor hu.\n\nMa store admin le add/update gareko live equipment rates, warehouse stock, delivery charges, ra playstyle suggestions dinchhu. Tapaiko table tennis journey ma kasto equipment khojirahanu bhayeko chha?",
      timestamp: "Just now",
      badge: "LIVE SYNC",
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "What is the rate of Dragon 10?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Tell me about Dragon 8 Pro rate" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate and details" },
        { label: "💰 Rackets under NPR 2,500", query: "Rackets under NPR 2500" },
        { label: "🚚 Delivery Charges", query: "What are the delivery charges?" },
        { label: "🎟️ Any Active Coupons?", query: "Any active coupon codes?" },
      ],
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

  // Reset chat conversation
  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "ai",
        text: "Namaste! 🙏 Welcome back. Conversation reset भयो। Tapaiko table tennis game ko lagi kasto equipment ya rate janna chahanu hunchha?",
        timestamp: "Just now",
        badge: "LIVE SYNC",
        quickActions: [
          { label: "🏓 Dragon 10 Carbon Rate", query: "What is the rate of Dragon 10?" },
          { label: "⚡ Dragon 8 Attack Rate", query: "Tell me about Dragon 8 Pro rate" },
          { label: "👟 Swift Court Shoes", query: "Show me court shoes rate and details" },
          { label: "💰 Rackets under NPR 2,500", query: "Rackets under NPR 2500" },
          { label: "🚚 Delivery Charges", query: "What are the delivery charges?" },
          { label: "🎟️ Any Active Coupons?", query: "Any active coupon codes?" },
        ],
      },
    ]);
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
      playSoftChime();
    }, 400);
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
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-right-4 duration-300 transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ask AI Rates &amp; Gear</span>
          </button>
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
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[440px] max-h-[660px] h-[82vh] bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
                <p className="text-[10px] text-slate-400 font-medium">Official ITTF Rates &amp; Warehouse Stock</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart Conversation"
                aria-label="Restart Conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                aria-label="Close"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Rate Prompt Pills Bar */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleQuickPrompt("What is the rate of Dragon 10?")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition"
            >
              🏓 Dragon 10 Rate?
            </button>
            <button
              onClick={() => handleQuickPrompt("Rackets under NPR 2500")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition"
            >
              💰 Under 2,500?
            </button>
            <button
              onClick={() => handleQuickPrompt("Do you have Butterfly Viscaria bat?")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition"
            >
              🦋 Butterfly vs LOKI?
            </button>
            <button
              onClick={() => handleQuickPrompt("What are the delivery charges?")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition"
            >
              🚚 Delivery Rates?
            </button>
            <button
              onClick={() => handleQuickPrompt("Any active coupon codes?")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition"
            >
              🎟️ Coupons?
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
                  className={`max-w-[90%] sm:max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-slate-900 text-white rounded-br-none shadow-sm"
                      : "bg-white text-slate-800 rounded-bl-none border border-slate-200/90 shadow-xs"
                  }`}
                >
                  {/* Optional Status / Intent Badge */}
                  {msg.badge && (
                    <div className="mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider ${
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

                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Interactive Recommended Products Cards */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                      {msg.recommendedProducts.map((p) => {
                        const isAdded = addedProductId === p.id;
                        const isOut = !p.inStock || p.stockCount <= 0;
                        return (
                          <div
                            key={p.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
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
                                  <span className="font-black text-red-600 text-xs">
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
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-red-600 text-white font-bold text-[10px] flex items-center gap-1 transition shadow-xs active:scale-95"
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
                          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-red-50 hover:border-red-300 hover:text-red-700 border border-slate-200/80 text-[11px] font-semibold text-slate-700 transition flex items-center gap-1 shadow-xs active:scale-95 text-left"
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
                placeholder="Ask in Nepali or English (e.g. Dragon 10 ko rate, delivery fee, bat under 2500)..."
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
// REAL-TIME RATE & NLP GROUNDING ENGINE
// ========================================================
function generateRateGroundedResponse(
  query: string,
  products: Product[],
  settings: ReturnType<typeof useAdminStore.getState>["storeSettings"],
  coupons: ReturnType<typeof useAdminStore.getState>["coupons"]
): ChatMessage {
  const lower = query.toLowerCase().trim();

  // Helper: Find in-stock items
  const inStockProducts = products.filter((p) => p.inStock && p.stockCount > 0);

  // --------------------------------------------------------
  // 1. CASUAL GREETINGS & NORMAL CONVERSATION (Nepali / English)
  // --------------------------------------------------------
  const isGreeting =
    /^(hi|hello|hey|hiya|yo|namaste|namaskar|hola|greetings)/i.test(lower) ||
    lower.includes("k chha") ||
    lower.includes("k cha") ||
    lower.includes("kasto chha") ||
    lower.includes("kasto cha") ||
    lower.includes("sanchai") ||
    lower.includes("sanchai chhau") ||
    lower.includes("k gardai") ||
    lower.includes("timi ko hau") ||
    lower.includes("who are you") ||
    lower.includes("what are you") ||
    lower.includes("what can you do") ||
    lower.includes("k garna sakchhau") ||
    lower.includes("dai") ||
    lower.includes("bro") ||
    lower.includes("daju") ||
    lower.includes("bhai") ||
    lower.includes("namaste") ||
    lower.includes("namaskar") ||
    lower.includes("नमस्ते") ||
    lower.includes("नमस्कार");

  // Check if it's purely social/introductory without asking for a specific item
  const hasSpecificProductQuery =
    lower.includes("dragon") ||
    lower.includes("shoe") ||
    lower.includes("jutta") ||
    lower.includes("jersey") ||
    lower.includes("racket") ||
    lower.includes("bat") ||
    lower.includes("ball") ||
    lower.includes("rubber") ||
    lower.includes("case") ||
    lower.includes("price") ||
    lower.includes("rate") ||
    lower.includes("kati") ||
    lower.includes("paucha") ||
    lower.includes("butterfly") ||
    lower.includes("delivery") ||
    lower.includes("coupon");

  if (isGreeting && !hasSpecificProductQuery) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Namaste sathi! 🙏 Everything is going great here in the table tennis arena!\n\nMa LOKI Zone Nepal ko official AI Equipment & Rate Advisor hu. Tapaiko table tennis journey lai next-level championship ma puryauna ma store admin le add/update gareko **real-time live rates**, warehouse stock availability, ra playstyle recommendations provide garchhu.\n\n🏓 **Tapaiko game style kasto chha?**\n• Attacking topspin rallies & smashes khelnu hunchha?\n• Ki defensive controlled placement & counter-blocking?\n\nTapaiko requirement bhannus, ma exact matching bat ra live price recommend garchhu!`,
      timestamp: "Just now",
      badge: "COACH ADVISOR",
      recommendedProducts: inStockProducts.slice(0, 2),
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "What is the rate of Dragon 10?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Tell me about Dragon 8 Pro rate" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate and details" },
        { label: "💰 Rackets under NPR 2,500", query: "Rackets under NPR 2500" },
        { label: "🚚 Delivery Charges", query: "What are the delivery charges?" },
        { label: "🎟️ Any Active Coupons?", query: "Any active coupon codes?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 2. SHOWROOM / LOCATION & STORE CONTACT INQUIRY
  // --------------------------------------------------------
  if (
    lower.includes("pasal kata") ||
    lower.includes("showroom") ||
    lower.includes("location") ||
    lower.includes("store kata") ||
    lower.includes("kaha chha") ||
    lower.includes("kaha cha") ||
    lower.includes("kata chha") ||
    lower.includes("kata cha") ||
    lower.includes("address") ||
    lower.includes("thamel") ||
    lower.includes("contact") ||
    lower.includes("phone") ||
    lower.includes("whatsapp") ||
    lower.includes("number") ||
    lower.includes("call")
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `📍 **LOKI Zone Nepal Showroom & Fulfillment Hub:**\n• **Showroom & Central Warehouse:** Kathmandu, Nepal\n• **Direct Support & WhatsApp:** +977 9800000000 (Open 9:00 AM – 8:00 PM daily)\n• **Nationwide Courier:** Kathmandu Valley bhari same-day/next-day dispatch, ra Pokhara, Chitwan, Butwal, Biratnagar, Dharan, Nepalgunj samet sabai 77 districts ma express delivery garinchha!\n\nTapaile online 1-click mai order garna saknu hunchha, payment **Cash on Delivery (COD)**, **eSewa**, **Khalti**, ya **Fonepay QR** bata sajilai garna milchha!`,
      timestamp: "Just now",
      badge: "STORE LOCATION",
      quickActions: [
        { label: "🚚 Check Delivery Rates", query: "What are the delivery charges?" },
        { label: "💳 Payment Methods", query: "Kasari payment garne?" },
        { label: "🏓 Check Dragon 10", query: "What is the rate of Dragon 10?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 3. AUTHENTICITY, ITTF GUARANTEE & WARRANTY
  // --------------------------------------------------------
  if (
    lower.includes("genuine") ||
    lower.includes("original") ||
    lower.includes("nakali") ||
    lower.includes("copy") ||
    lower.includes("fake") ||
    lower.includes("ittf") ||
    lower.includes("warranty") ||
    lower.includes("guarantee") ||
    lower.includes("bharosa") ||
    lower.includes("authentic")
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🛡️ **100% Genuine ITTF Certified Guarantee:**\n\nHami LOKI Sports (ITTF Approved Manufacturer) ko Nepal ma official authorized partner hau.\n\n• **Factory Sealed Packaging:** Sabai rackets ra rubbers brand-new factory sealed packaging ma aauchhan.\n• **ITTF Approved Rubber:** Official international tournament regulations compliant.\n• **7-Day Hassle-Free Replacement:** Manufacturing defect bhetiyeमा 7 din bhitra immediate replacement guarantee.\n• **Quality Inspected:** Dispatch agadi pratyek blade ra gear physical inspection pass hunchha.\n\nNishchinta bhayera tapai aafno game upgrade garna saknu hunchha!`,
      timestamp: "Just now",
      badge: "ITTF CERTIFIED",
      recommendedProducts: inStockProducts.filter((p) => p.category === "Rackets" || p.category === "Balls").slice(0, 2),
      quickActions: [
        { label: "🏓 View ITTF Rackets", query: "What is the rate of Dragon 10?" },
        { label: "⚪ 3-Star ITTF Balls", query: "Tell me about 3 star balls" },
        { label: "🎟️ Check Active Coupons", query: "Any active coupon codes?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 4. PAYMENT METHODS & CASH ON DELIVERY (COD)
  // --------------------------------------------------------
  if (
    lower.includes("payment") ||
    lower.includes("kasari tirne") ||
    lower.includes("pay") ||
    lower.includes("esewa") ||
    lower.includes("khalti") ||
    lower.includes("fonepay") ||
    lower.includes("qr") ||
    lower.includes("cod") ||
    lower.includes("cash on delivery") ||
    lower.includes("online pay") ||
    lower.includes("paisa")
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `💳 **Multiple Flexible Payment Options Available:**\n\n1. **Cash on Delivery (COD):** Samaan tapai ko doorstep ma aayepaxi haat ma check garera paisa tirna milchha (Kathmandu Valley & major hub cities).\n2. **eSewa & Khalti:** Instant wallet transfer directly checkout ma.\n3. **Fonepay QR:** Kunai pani Nepali Mobile Banking app bata 1-scan instant payment.\n\nKunai pani extra hidden charges chaina! Order garepaxi SMS / WhatsApp ma live courier tracking details aauchha.`,
      timestamp: "Just now",
      badge: "PAYMENT SUPPORT",
      quickActions: [
        { label: "🚚 Check Delivery Rates", query: "What are the delivery charges?" },
        { label: "🏓 Dragon 10 Rate", query: "What is the rate of Dragon 10?" },
        { label: "🎟️ Active Coupons", query: "Any active coupon codes?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 5. DELIVERY RATES & FREE SHIPPING THRESHOLD
  // --------------------------------------------------------
  if (
    lower.includes("delivery") ||
    lower.includes("shipping") ||
    lower.includes("charge") ||
    lower.includes("courier") ||
    lower.includes("bhada") ||
    lower.includes("pokhara") ||
    lower.includes("chitwan") ||
    lower.includes("butwal") ||
    lower.includes("dharan") ||
    lower.includes("biratnagar") ||
    lower.includes("nepalgunj") ||
    lower.includes("bhaktapur") ||
    lower.includes("lalitpur") ||
    lower.includes("ktm") ||
    lower.includes("valley")
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🚚 **Official Store Delivery Rates (Ground-Checked):**\n\n• **Inside Kathmandu Valley (KTM, Lalitpur, Bhaktapur):** NPR ${settings.deliveryInsideValley} (Within 24 Hours)\n• **Outside Valley (Pokhara, Chitwan, Butwal, Biratnagar, etc.):** NPR ${settings.deliveryOutsideValley} (2-3 Business Days)\n• 🔥 **FREE DELIVERY OFFER:** NPR ${settings.freeShippingThreshold.toLocaleString()} bhanda mathi ko kunai pani order ma delivery **bilkul FREE** hunchha!\n\nAll parcels are insured and dispatched through reliable courier partners with real-time tracking.`,
      timestamp: "Just now",
      badge: "DELIVERY RATES",
      quickActions: [
        { label: "🔥 Free Delivery Gear", query: "Show me products above 2000 for free delivery" },
        { label: "🏓 Dragon 10 Carbon Rate", query: "What is the rate of Dragon 10?" },
        { label: "🎟️ Active Coupons", query: "Any active coupon codes?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 6. ACTIVE COUPONS & PROMO CODES
  // --------------------------------------------------------
  if (
    lower.includes("coupon") ||
    lower.includes("discount") ||
    lower.includes("promo") ||
    lower.includes("offer") ||
    lower.includes("code") ||
    lower.includes("voucher") ||
    lower.includes("chhut")
  ) {
    const activeCoupons = coupons.filter((c) => c.active);
    if (activeCoupons.length === 0) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Currently, direct factory discounts (15% – 25% OFF) are already applied directly on our gear prices! Plus, tapai le **NPR ${settings.freeShippingThreshold.toLocaleString()}** bhanda mathi cart banaye ma **FREE Shipping** paunu hunchha.`,
        timestamp: "Just now",
        badge: "DISCOUNTS APPLIED",
        quickActions: [
          { label: "🏓 View Best Sellers", query: "What is the rate of Dragon 10?" },
          { label: "👟 Court Shoes", query: "Show me court shoes rate" },
        ],
      };
    }

    const couponLines = activeCoupons
      .map(
        (c) =>
          `• 🎟️ **${c.code}**: ${
            c.discountType === "percent" ? `${c.discountValue}% OFF` : `NPR ${c.discountValue} FLAT OFF`
          } (Min spend: NPR ${c.minSpend.toLocaleString()})`
      )
      .join("\n");

    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🎟️ **Active Promotional Coupons Available Right Now:**\n\n${couponLines}\n\n💡 **How to Apply:** Checkout garda 'Coupon Code' box ma yo code enter garnus, discount turuntai apply hunchha! Tapaile aaja kun gear line sochnu bhayeko chha?`,
      timestamp: "Just now",
      badge: "ACTIVE COUPONS",
      quickActions: [
        { label: "🏓 Shop Dragon 10", query: "What is the rate of Dragon 10?" },
        { label: "⚡ Shop Dragon 8 Pro", query: "Tell me about Dragon 8 Pro rate" },
        { label: "👟 View Court Shoes", query: "Show me court shoes rate" },
      ],
    };
  }

  // --------------------------------------------------------
  // 7. COMPETITOR BRANDS / EXTERNAL GEAR DETECTION (Butterfly, Viscaria, Timo Boll, DHS, Stiga, Yasaka, Donic, Mizuno, Asics)
  // Requirement: "yedi tesle out of sodhyo bhane tesle not found pani dela ra tyo jastai aaru product haru dekhaulan hai"
  // --------------------------------------------------------
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

  const matchedCompetitor = competitorKeywords.find((k) => lower.includes(k));

  if (matchedCompetitor) {
    let competitorCategory: "blade" | "rubber" | "shoes" | "general" = "general";
    if (
      lower.includes("viscaria") ||
      lower.includes("timo boll") ||
      lower.includes("blade") ||
      lower.includes("bat") ||
      lower.includes("racket") ||
      lower.includes("clipper") ||
      lower.includes("carbonado") ||
      lower.includes("cybershape") ||
      lower.includes("primorac") ||
      lower.includes("zhang jike") ||
      lower.includes("ma long")
    ) {
      competitorCategory = "blade";
    } else if (
      lower.includes("tenergy") ||
      lower.includes("dignics") ||
      lower.includes("hurricane") ||
      lower.includes("rakza") ||
      lower.includes("rubber") ||
      lower.includes("sheet") ||
      lower.includes("bluefire") ||
      lower.includes("evolution")
    ) {
      competitorCategory = "rubber";
    } else if (lower.includes("shoe") || lower.includes("mizuno") || lower.includes("asics")) {
      competitorCategory = "shoes";
    }

    const dragon10 = products.find((p) => p.id === "loki-dragon-10") || products[0];
    const dragon8 = products.find((p) => p.id === "loki-dragon-8") || products[1];
    const rxton3 = products.find((p) => p.id === "loki-rxton-3");
    const shoes = products.find((p) => p.category === "Footwear");

    let recs: Product[] = [];
    let customNote = "";

    if (competitorCategory === "blade") {
      recs = [dragon10, dragon8].filter(Boolean) as Product[];
      customNote = `Viscaria / Timo Boll ALC (Carbon offensive blade) Nepal ma NPR 22,000–30,000+ parcha, tara hamro **LOKI Dragon 10 Carbon Racket** (NPR ${dragon10.price.toLocaleString()}) le 5-ply wood + carbon micro-mesh grid sanga 92 Control ra 88 Spin ko pro-level performance matra NPR ${dragon10.price.toLocaleString()} ma dincha!`;
    } else if (competitorCategory === "rubber") {
      recs = [rxton3 || dragon10].filter(Boolean) as Product[];
      customNote = `DHS Hurricane 3 / Tenergy jastai explosive topspin arc ra high-friction tacky grip ko lagi hamro **LOKI RXTON 3 Rubber** (NPR ${rxton3?.price.toLocaleString() || "1,499"}) ITTF certified direct alternative ho!`;
    } else if (competitorCategory === "shoes") {
      recs = [shoes || dragon10].filter(Boolean) as Product[];
      customNote = `Mizuno / Asics court shoes jastai anti-slip gum rubber grip ra quick lateral footwork cushioning ko lagi hamro **LOKI Swift Court Shoes** (NPR ${shoes?.price.toLocaleString() || "3,499"}) specifically designed chha!`;
    } else {
      recs = inStockProducts.slice(0, 2);
      customNote = `Hamro LOKI ITTF approved championship gear pro-level specs sanga factory-direct affordable price ma available chha.`;
    }

    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🔍 **Catalog Status: Not Found in LOKI Catalog**\n\nTapai le sodhnu bhayeko **"${matchedCompetitor.toUpperCase()}"** hamro official store catalog ma available chhaina (Not Found). Hamro store Nepal ma **Official LOKI (ITTF Approved Manufacturer)** brand ko exclusive authorized partner ho.\n\n⭐ **Tara nishchinta hunus! Tyo sanga ustai pro-level specs bhayeko hamro official LOKI gear available chha:**\n${customNote}\n\nTala diyeko matching gear check garnus — 1-click mai cart ma halera checkout garna saknu hunchha!`,
      timestamp: "Just now",
      badge: "NOT IN STORE - BEST LOKI MATCH",
      isNotFoundNotice: true,
      recommendedProducts: recs,
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "What is the rate of Dragon 10?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Tell me about Dragon 8 Pro rate" },
        { label: "🎟️ View Active Coupons", query: "Any active coupon codes?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 8. OUT OF STOCK SPECIFIC QUERIES
  // (e.g., "what is out of stock", "sakiyeko k k chha")
  // --------------------------------------------------------
  if (lower.includes("out of stock") || lower.includes("sakiyeko") || lower.includes("sold out")) {
    const outOfStockList = products.filter((p) => !p.inStock || p.stockCount <= 0);

    if (outOfStockList.length === 0) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `🎉 Good news! Right now, all our official LOKI equipment in our Kathmandu warehouse is **100% IN STOCK** and ready for same-day dispatch!\n\nTapai kun item lina chahanu hunchha?`,
        timestamp: "Just now",
        badge: "ALL IN STOCK",
        recommendedProducts: inStockProducts.slice(0, 3),
        quickActions: [
          { label: "🏓 Dragon 10 Carbon", query: "What is the rate of Dragon 10?" },
          { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
          { label: "💰 Rackets under NPR 2,500", query: "Rackets under NPR 2500" },
        ],
      };
    }

    const outNames = outOfStockList.map((p) => `• ${p.name} (Restocking soon)`).join("\n");
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `⚠️ **Current Out of Stock Items:**\n${outNames}\n\nYo items new shipment bata warehouse ma aaudai chha. Tara tapailai game roknu pardaina! Ahile **Ready In-Stock** raheka best-seller alternatives yaha chhan:`,
      timestamp: "Just now",
      badge: "OUT OF STOCK NOTICE",
      isOutOfStockNotice: true,
      recommendedProducts: inStockProducts.slice(0, 2),
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "What is the rate of Dragon 10?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Tell me about Dragon 8 Pro rate" },
      ],
    };
  }

  // --------------------------------------------------------
  // 9. BUDGET / PRICE RANGE INQUIRY (e.g. under 2500, under 2000, 3000 bhitra, sasto bat)
  // --------------------------------------------------------
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
        text: `💰 **Found ${affordable.length} Official Gear Options under NPR ${budget.toLocaleString()}:**\n\nHamro store rates anusar tapai ko budget vitra ready-to-ship gear yaha chhan. Sabai items 100% ITTF standard ka chhan:\n\n💡 **Tip:** NPR ${settings.freeShippingThreshold.toLocaleString()} mathi ko cart banaye ma delivery **bilkul FREE** hunchha!`,
        timestamp: "Just now",
        badge: `BUDGET MATCH (≤ NPR ${budget.toLocaleString()})`,
        recommendedProducts: affordable.slice(0, 3),
        quickActions: [
          { label: "🚚 Check Delivery Rates", query: "What are the delivery charges?" },
          { label: "🎟️ Any Active Coupons?", query: "Any active coupon codes?" },
          { label: "🏓 Compare Blades", query: "Dragon 10 vs Dragon 8 comparison" },
        ],
      };
    } else {
      const cheapest = [...inStockProducts].sort((a, b) => a.price - b.price).slice(0, 2);
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `NPR ${budget.toLocaleString()} vitra kunai items bhetiyena, tara hamro most affordable official competition gear starts at **NPR 299** for LOKI 3-Star ITTF Balls and **NPR 499** for the Hard-Shell Racket Case.\n\nSabai bhanda popular championship rackets **NPR 2,199** (Dragon 8 Pro) ra **NPR 2,499** (Dragon 10 Carbon) bata start hunchha!`,
        timestamp: "Just now",
        badge: "AFFORDABLE GEAR",
        recommendedProducts: cheapest,
        quickActions: [
          { label: "🏓 Dragon 10 Carbon Rate", query: "What is the rate of Dragon 10?" },
          { label: "⚡ Dragon 8 Attack Rate", query: "Tell me about Dragon 8 Pro rate" },
        ],
      };
    }
  }

  // --------------------------------------------------------
  // 10. SPECIFIC PRODUCT RATE & DETAILS INQUIRY
  // Match products dynamically from useAdminStore (which syncs with DB)
  // Handles: In-Stock vs Out-Of-Stock dynamically!
  // --------------------------------------------------------
  const matchedProduct = products.find((p) => {
    const pName = p.name.toLowerCase();
    const pId = p.id.toLowerCase();

    if (lower.includes(pName) || lower.includes(pId)) return true;
    if ((lower.includes("dragon 10") || lower.includes("d10")) && pId.includes("dragon-10")) return true;
    if ((lower.includes("dragon 8") || lower.includes("d8")) && pId.includes("dragon-8")) return true;
    if ((lower.includes("shoe") || lower.includes("shoes") || lower.includes("jutta") || lower.includes("footwear")) && p.category === "Footwear") return true;
    if ((lower.includes("jersey") || lower.includes("tshirt") || lower.includes("t-shirt") || lower.includes("aeroflex") || lower.includes("luga")) && p.id.includes("jersey")) return true;
    if ((lower.includes("short") || lower.includes("shorts") || lower.includes("kattu")) && p.id.includes("shorts")) return true;
    if ((lower.includes("ball") || lower.includes("balls") || lower.includes("gatti") || lower.includes("3-star")) && p.category === "Balls") return true;
    if ((lower.includes("case") || lower.includes("cover") || lower.includes("bag") || lower.includes("hardshell")) && p.id.includes("case")) return true;
    if ((lower.includes("towel") || lower.includes("rumal")) && p.id.includes("towel")) return true;
    if ((lower.includes("rubber") || lower.includes("rxton") || lower.includes("sheet")) && p.id.includes("rxton")) return true;

    return false;
  });

  if (matchedProduct) {
    const p = matchedProduct;
    const isOut = !p.inStock || p.stockCount <= 0;

    // SCENARIO 10A: PRODUCT IS OUT OF STOCK
    // Requirement: "yedi tesle out of sodhyo bhane tesle not found pani dela ra tyo jastai aaru product haru dekhaulan hai"
    if (isOut) {
      // Find similar in-stock products
      const alternatives = inStockProducts.filter((alt) => alt.id !== p.id).slice(0, 2);

      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `⚠️ **Product Temporarily Out of Stock:**\n\nKshama chahanchhau! Tapai le khojnu bhayeko **${p.name}** ahile warehouse ma sakiyeko chha (new batch shipment aaudai chha).\n\n• Last Retail Rate: NPR ${p.price.toLocaleString()}\n• Current Status: **Out of Stock (Restocking Soon)**\n\n⭐ **Tara tapailai khelna roknu pardaina! Ustai pro-level specs bhayeko hamro Ready In-Stock alternatives yaha chhan:**\n\nTala ko recommended items check garnus — 1-click mai cart ma halera order garna saknu hunchha!`,
        timestamp: "Just now",
        badge: "OUT OF STOCK - ALTERNATIVES BELOW",
        isOutOfStockNotice: true,
        recommendedProducts: alternatives,
        quickActions: [
          { label: "🏓 Check Dragon 10 Rate", query: "What is the rate of Dragon 10?" },
          { label: "⚡ Check Dragon 8 Rate", query: "Tell me about Dragon 8 Pro rate" },
          { label: "🚚 Check Delivery Charges", query: "What are the delivery charges?" },
        ],
      };
    }

    // SCENARIO 10B: PRODUCT IS IN STOCK - GIVE EXACT REAL-TIME RATES & SPECS!
    const discountText = p.discountPercent ? ` (${p.discountPercent}% OFF applied!)` : "";
    let specsLine = "";
    if (p.specs) {
      const parts = [];
      if (p.specs.bladeType) parts.push(`• **Blade Composition:** ${p.specs.bladeType}`);
      if (p.specs.rubber) parts.push(`• **Rubber Surface:** ${p.specs.rubber}`);
      if (p.specs.control) parts.push(`• **Control:** ${p.specs.control}/100 | **Spin:** ${p.specs.spin}/100 | **Speed:** ${p.specs.speed}/100`);
      if (p.specs.playingStyle) parts.push(`• **Recommended Style:** ${p.specs.playingStyle}`);
      specsLine = parts.length > 0 ? `\n\n📊 **Performance Specifications:**\n${parts.join("\n")}` : "";
    }

    // Engagement Coach Tip
    let coachTip = "";
    if (p.category === "Rackets") {
      coachTip = `\n\n💡 **Coach Advice:** Racket ko rubber sheet lai dust ra moisture bata bachauna euta **Hard-Shell Case** (NPR 499) ra competition balls sangai lida best protection ra longevity hunchha!`;
    } else if (p.category === "Footwear") {
      coachTip = `\n\n💡 **Footwork Tip:** LOKI Swift Court Shoes ko non-marking gum sole le indoor wooden ra synthetic court ma 100% anti-slip traction dinchha.`;
    }

    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🏓 **Live Verified Rate for ${p.name}:**\n\n• **Current Live Rate:** **NPR ${p.price.toLocaleString()}**${discountText}\n• **Original MRP:** NPR ${p.originalPrice.toLocaleString()}\n• **Stock Status:** **${p.stockCount} units available** in Kathmandu warehouse (Ready for fast dispatch)\n• **Category:** ${p.category} | Official ITTF Standard\n\n${p.description}${specsLine}${coachTip}\n\n👉 *Tapaile tala ko 'Add' button bata 1-tap mai cart ma halera checkout garna saknu hunchha!*`,
      timestamp: "Just now",
      badge: "LIVE RATE SYNC",
      recommendedProducts: [p],
      quickActions: [
        { label: "🚚 Delivery Rates", query: "What are the delivery charges?" },
        { label: "🎟️ Any Active Coupons?", query: "Any active coupon codes?" },
        { label: "🏓 Compare with Other Blades", query: "Dragon 10 vs Dragon 8 comparison" },
      ],
    };
  }

  // --------------------------------------------------------
  // 11. GENERAL RACKET / BAT / BLADE COMPARISON
  // --------------------------------------------------------
  if (lower.includes("racket") || lower.includes("bat") || lower.includes("blade")) {
    const rackets = inStockProducts.filter((p) => p.category === "Rackets");
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🏆 **Official LOKI Championship Racket Rates (Live Admin Rates):**\n\n1. **LOKI Dragon 10 Pro:** NPR 2,499 (5-Ply Alpine Wood + Carbon Micro-Mesh, 92 Control, 88 Spin, All-Round Offensive)\n2. **LOKI Dragon 8 Pro:** NPR 2,199 (7-Ply Hybrid Wood, 85 Control, 91 Spin, 89 Speed, Explosive Loop Drives)\n\nBoth blades come pre-assembled with factory-sealed sticky ITTF competition rubber sheets.\n\n❓ **Tapaiko playstyle kasto chha?**\n• Balance, accurate control, ra spin chahinchha bhane **Dragon 10** perfect ho!\n• Heavy fast offensive topspin smash chahinchha bhane **Dragon 8** choose garnus!`,
      timestamp: "Just now",
      badge: "RACKET COMPARISON",
      recommendedProducts: rackets.length > 0 ? rackets : inStockProducts.slice(0, 2),
      quickActions: [
        { label: "🏓 Select Dragon 10 (NPR 2,499)", query: "What is the rate of Dragon 10?" },
        { label: "⚡ Select Dragon 8 (NPR 2,199)", query: "Tell me about Dragon 8 Pro rate" },
        { label: "🚚 Delivery Charges", query: "What are the delivery charges?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 12. GENERAL UNKNOWN PRODUCT SEARCH (NOT FOUND IN CATALOG)
  // Requirement: "ra yedi tesle out of sodhyo bhane tesle not found pani dela ra tyo jastai aaru product haru dekhaulan hai"
  // --------------------------------------------------------
  // Check if query looks like a specific product search that was not matched
  const looksLikeSearch =
    lower.length > 3 &&
    !lower.includes("hello") &&
    !lower.includes("hi") &&
    !lower.includes("good") &&
    !lower.includes("help");

  if (looksLikeSearch) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🔍 **Item Not Found in Store Catalog:**\n\nTapai le khojnu bhayeko **"${query}"** hamro official catalog ma bhetiyena (Not Found). Hamro store Nepal ma **Official LOKI (ITTF Approved)** brand ko exclusive authorized partner ho.\n\n⭐ **Tara tapailai chahine ustai high-performance gear yaha available chha:**\n• **Championship Rackets:** LOKI Dragon 10 Carbon (NPR 2,499) & Dragon 8 (NPR 2,199)\n• **Pro Court Shoes:** LOKI Swift Court Shoes (NPR 3,499) with anti-slip gum sole\n• **Match Essentials:** LOKI RXTON 3 Rubber (NPR 1,499) & 3-Star ITTF Balls (NPR 299)\n\nTala hamra top-rated available items check garnus:`,
      timestamp: "Just now",
      badge: "NOT FOUND - STORE FAVORITES",
      isNotFoundNotice: true,
      recommendedProducts: inStockProducts.slice(0, 2),
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "What is the rate of Dragon 10?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
        { label: "🚚 Delivery Rates", query: "What are the delivery charges?" },
        { label: "🎟️ Any Active Coupons?", query: "Any active coupon codes?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 13. DEFAULT INTELLIGENT HELPER & ENGAGEMENT HOOK
  // --------------------------------------------------------
  return {
    id: `ai-${Date.now()}`,
    sender: "ai",
    text: `Ma LOKI Zone Nepal ko live store rates sanga dynamically synchronized chhu. Tapaile malai sodhna saknu hunchha:\n\n• *"Dragon 10 ko rate kati ho?"*\n• *"Rackets under NPR 2,500"* \n• *"Butterfly Viscaria pauchha ki nai?"*\n• *"Kathmandu / Pokhara delivery charge kati ho?"*\n• *"Active coupon codes k k chhan?"*\n\nTapai kun gear explore garna chahanu hunchha?`,
    timestamp: "Just now",
    badge: "COACH ADVISOR",
    recommendedProducts: inStockProducts.slice(0, 2),
    quickActions: [
      { label: "🏓 Dragon 10 Carbon Rate", query: "What is the rate of Dragon 10?" },
      { label: "⚡ Dragon 8 Attack Rate", query: "Tell me about Dragon 8 Pro rate" },
      { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
      { label: "🚚 Delivery Charges", query: "What are the delivery charges?" },
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
