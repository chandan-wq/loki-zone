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
  Smile,
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
      text: "Namaste bro! 🙏 Ma LOKI Zone Nepal ko official AI Coach & Rate Advisor hu.\n\nTapaile masanga normal kura garna saknu hunchha (Nepali / English ma), store ko live bat rates sodhna saknu hunchha, ya delivery ra discounts janna saknu hunchha!\n\nAaja kasto chaldaichha tapaiko table tennis game?",
      timestamp: "Just now",
      badge: "LIVE ADVISOR",
      quickActions: [
        { label: "👋 K chha bro?", query: "k chha bro" },
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
        { label: "💰 Rackets under NPR 2,500", query: "Rackets under NPR 2500" },
        { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
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
        text: "Namaste bro! 🙏 Chat reset भयो। Normal kura garna ya kunai bat, shoes, delivery ko barema janna man chha bhane bhandai garnus hai!",
        timestamp: "Just now",
        badge: "LIVE ADVISOR",
        quickActions: [
          { label: "👋 K chha bro?", query: "k chha bro" },
          { label: "🏓 Dragon 10 Rate", query: "What is the rate of Dragon 10?" },
          { label: "⚡ Dragon 8 Attack", query: "Tell me about Dragon 8 Pro rate" },
          { label: "👟 Court Shoes", query: "Show me court shoes rate and details" },
          { label: "💰 Under NPR 2,500", query: "Rackets under NPR 2500" },
          { label: "🚚 Delivery Charges", query: "What are the delivery charges?" },
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
      const response = generateRateGroundedResponse(query, products, storeSettings, coupons);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
      playSoftChime();
    }, 380);
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
            <span>Chat &amp; Ask Rates</span>
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
                  <h3 className="font-black text-sm tracking-tight text-white">LOKI AI Advisor</h3>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LIVE SYNC
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Talk normally or ask live store rates</p>
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
              onClick={() => handleQuickPrompt("k chha bro")}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-700 whitespace-nowrap transition"
            >
              👋 K chha bro?
            </button>
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
                placeholder="Talk normally in Nepali or English (e.g. kasto xa bro, Dragon 10 ko rate, bat under 2500)..."
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
// REAL-TIME RATE & NATURAL CONVERSATIONAL NLP ENGINE
// ========================================================
function generateRateGroundedResponse(
  query: string,
  products: Product[],
  settings: ReturnType<typeof useAdminStore.getState>["storeSettings"],
  coupons: ReturnType<typeof useAdminStore.getState>["coupons"]
): ChatMessage {
  const rawLower = query.toLowerCase().trim();
  // Strip special characters for fuzzy matching
  const clean = rawLower
    .replace(/[\?\,\.\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\\\|\<\>\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Helper: Find in-stock items
  const inStockProducts = products.filter((p) => p.inStock && p.stockCount > 0);

  // Helper matching functions
  const has = (re: RegExp) => re.test(clean) || re.test(rawLower);

  // --------------------------------------------------------
  // 1. "SUNA NA" / "SUNANA" / "BANA NA" / ATTENTION OPENERS
  // (e.g. "suna na bro", "sunana", "bana na dai", "oi bro")
  // --------------------------------------------------------
  if (
    has(/^(suna\s*na|sunana|bana\s*na|vanana|bhana\s*na|suna\s*bana|suna|sunnus|bhandinus|vandinus)\b/i) ||
    has(/^(oi|oye|hey\s*bro|oi\s*bro|dai\s*suna|daju\s*suna)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Hajur bro! 🙏 Bhandai garnus, ma dhyan diyera sunirakheko chhu.\n\nTapaiko table tennis game ko barema, kunai specific bat (Dragon 10, Dragon 8), court shoes, delivery, ya discount coupons ko barema k sodhnu thyo?`,
      timestamp: "Just now",
      badge: "LISTENING",
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
        { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
        { label: "🎟️ Active Coupons", query: "Any active coupon codes?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 2. GREETINGS & CASUAL "HOW ARE YOU" (Supports 'x' and 'ch' spellings!)
  // (e.g. "k chha bro", "k xa", "kasto xa", "sanchai", "hello", "namaste")
  // --------------------------------------------------------
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
      text: `Namaste bro! 🙏 Ekdam majja chha yeta, table tennis ko nayanaya ITTF bats ra competition balls pack gari raheko chhu!\n\nTapaiko kasto chaldai chha? Aaja TT khelne mood ma ho ki naya equipment explore garne sochnu bhayeko chha?\n\n🏓 **Tapaiko game kasto chha?** Attacking topspin rallies khelnu hunchha ki controlled defense?`,
      timestamp: "Just now",
      badge: "FRIENDLY COACH",
      recommendedProducts: inStockProducts.slice(0, 2),
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
        { label: "💰 Rackets under NPR 2,500", query: "Rackets under NPR 2500" },
        { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 3. CASUAL PERSONAL BANTER: "KHANA KHAYAU" / "K GARDAI XAU" / "KATA XAU"
  // --------------------------------------------------------
  if (has(/\b(khana\s*(khayau|khayo|khayeu|khanu\s*bhayou|khanu\s*bhayo|khaye))\b/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Haha ma ta AI assistant hu bro! Khana ta bijuli ra data matra khanchhu 😄⚡\n\nTara tapailai best table tennis equipment, factory rates, ra fast delivery dilauna ma 24/7 ready chhu! Tapaile chai khana khanu bhayo ni? TT practice kasto hudai chha aaja?`,
      timestamp: "Just now",
      badge: "CASUAL CHIT-CHAT",
      quickActions: [
        { label: "🏓 Check Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Check Dragon 8 Attack", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
      ],
    };
  }

  if (has(/\b(k\s*gardai\s*(xau|chhau|ho|hunuhunchha|hunuhunxa)|what\s*are\s*you\s*doing)\b/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Kathmandu central warehouse ma basera live table tennis orders ra Dragon series blades ko inventory herdai chhu bro! 📦🏓\n\nTapaiko aaja TT practice bhayo ki nai? Naya bat, rubber sheet ya shoes khojirahanu bhayeko chha?`,
      timestamp: "Just now",
      badge: "STORE DESK",
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
        { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
      ],
    };
  }

  if (has(/\b((kata|kaha)\s*(xau|chhau|basxau|baschhau|ho|hunuhunchha)|ghar\s*kata\s*(ho|cha|xa))\b/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Hamro main showroom ra distribution center Kathmandu, Nepal ma chha bro! 📍\n\nYatai bata Kathmandu Valley bhari 24 hours ma ra Pokhara, Chitwan, Butwal, Biratnagar, Dharan samet sabai 77 districts ma express courier deliver garchhau.\n\nTapai kata bata bolirahanu bhayeko chha? Tapaiko city ma deliver garna milchha!`,
      timestamp: "Just now",
      badge: "KATHMANDU HUB",
      quickActions: [
        { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
        { label: "💳 Payment Methods", query: "Kasari payment garne?" },
        { label: "🏓 Best Rackets", query: "Dragon 10 ko rate kati ho?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 4. "NEPALI BUJHXAU" / "NEPALI BOLNA AAUXA" (Language Check)
  // --------------------------------------------------------
  if (
    has(/\b(nepali\s*(bolxau|bujhxau|aauxa|bolchhau|bujhchhau|aaucha|bolna\s*aauxa))\b/i) ||
    has(/\b(can\s*you\s*speak\s*nepali|nepali\s*language|nepali\s*aunchha)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Ekdam majjale bujhchhu ni bro! 🙏\n\nNepali, English, ya Romanized Nepali (jasari tapailai sajilo lagchha) tyasari nai kura garna saknu hunchha.\n\nTable tennis bats, rubbers, balls, jutta, rates, delivery — tapailai k kura ma help chahiyeko chha?`,
      timestamp: "Just now",
      badge: "BILINGUAL READY",
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
      ],
    };
  }

  // --------------------------------------------------------
  // 5. "TIMI MANXE HO KI BOT?" / "TIMI KO HAU?" / BOT IDENTITY
  // --------------------------------------------------------
  if (
    has(/\b((manxe|manche|human)\s*(ho\s*ki|ho)?\s*(bot|robot|ai))\b/i) ||
    has(/\b((timi|tapai)\s*(ko\s*hau|ko\s*ho|k\s*hau|k\s*ho))\b/i) ||
    has(/\b(who\s*are\s*you|what\s*are\s*you)\b/i) ||
    has(/\btimro\s*(nam|name)\s*k\s*ho\b/i) ||
    has(/\b(k\s*help|k\s*garna|k\s*garchhau|k\s*garchau)\s*(sakxau|sakchhau|milxa|milchha)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Ma LOKI Zone Nepal ko official AI Table Tennis Advisor hu 🤖🏓 — Coach jastai friendly ra genuine!\n\nStore admin le Supabase ma products ko rate, stock ya discounts update garna saath malai real-time thaha hunchha. Ma tapailai:\n• Real-time equipment rates & MRP\n• Playstyle recommendations (Attacking loop vs Defensive control)\n• Warehouse stock availability\n• Valley & Outside Valley delivery charges\n• Active discount coupons\n\nsabai kura ma 1-second mai accurate help dinchhu! Tapaiko kasto requirement chha?`,
      timestamp: "Just now",
      badge: "AI ADVISOR",
      quickActions: [
        { label: "🏓 Check Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Check Dragon 8 Attack", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "💰 Rackets under NPR 2,500", query: "Rackets under NPR 2500" },
      ],
    };
  }

  // --------------------------------------------------------
  // 6. SHORT AGREEMENTS: "THIK XA" / "OK" / "HUSS" / "LA"
  // --------------------------------------------------------
  if (
    has(/^(thik\s*(xa|cha|chha)|ok|okay|huss|la|hunchha|hunxa|sahi\s*ho|bujhe|ekdam\s*ramro|great|perfect|nice)$/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Huss bro! Kunai pani bela gear upgrade garna man bhaye ya query bhaye bhandai garnus hai.\n\nAttacking offensive loop ko lagi **LOKI Dragon 10 Carbon** (NPR 2,499) ra **Dragon 8 Pro** (NPR 2,199) ahile warehouse ma ready in-stock chhan. Tapailai kunai item check garnu parla?`,
      timestamp: "Just now",
      badge: "COACH READY",
      recommendedProducts: inStockProducts.slice(0, 2),
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
      ],
    };
  }

  // --------------------------------------------------------
  // 7. GRATITUDE: "DHANYABAD" / "THANK YOU" / "DAMMI"
  // --------------------------------------------------------
  if (has(/\b(dhanyabad|dhanyabhad|thank\s*you|thanks|thank\s*u|dherai\s*ramro|good\s*job|welldone|dammi)\b/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Swagatam bro! 🙏 Tapailai help garna pauda ekdam khusi lagyo.\n\nTable tennis court ma aggressive topspin smashes handai garnus! Aru khei sodhnu pare malai bhannu hola hai — enjoy your game! 🏓🔥`,
      timestamp: "Just now",
      badge: "ALWAYS WELCOME",
      quickActions: [
        { label: "🏓 Shop Rackets", query: "Dragon 10 ko rate kati ho?" },
        { label: "🚚 Check Delivery Rates", query: "Delivery charges kati ho?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 8. LAUGHS: "HAHA" / "LOL" / "HEHE"
  // --------------------------------------------------------
  if (has(/^(haha|hahaha|hehe|lol|rofl|xd)+$/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Haha table tennis court ma jastai yeta pani full positive vibe chha! 😄\n\nTapai match ma fast offensive attack khelna ruchaunu hunchha ki smooth placement & defense? Aaja kunai gear check garne plan chha?`,
      timestamp: "Just now",
      badge: "POSITIVE VIBES",
      quickActions: [
        { label: "🏓 Dragon 10 Carbon", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack", query: "Dragon 8 Pro ko rate kasto chha?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 9. SIGN-OFF: "BYE" / "GOOD NIGHT" / "PAXI KURA GARUMLA"
  // --------------------------------------------------------
  if (has(/\b(bye|tata|good\s*night|shuva\s*ratri|paxi\s*kura|bholi\s*kura|see\s*you|bhetumla)\b/i)) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `Huss sathi! Shuva ratri / Tata! 🙏\n\nRamrari khelnus, practice dhuwadhaar garnus. Kunai pani bela ITTF approved pro-gear chahida LOKI Zone Nepal ma samjhinu hola! 🏓`,
      timestamp: "Just now",
      badge: "GOODBYE",
      quickActions: [
        { label: "🏓 Explore Catalog", query: "What products do you have?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 10. CATALOG OVERVIEW: "K K PAUCHA" / "WHAT PRODUCTS"
  // --------------------------------------------------------
  if (
    has(/\bk\s*k\s*(paucha|pauxa|bechxau|bechchau|rakheko|chha|cha|xa)\b/i) ||
    has(/\b(what\s*do\s*you\s*sell|what\s*products|all\s*products|catalog|collection)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🏓 **Hamro LOKI Zone Nepal Official Catalog:**\n\n1. **Championship Rackets:** LOKI Dragon 10 Carbon (NPR 2,499) ra Dragon 8 Pro (NPR 2,199)\n2. **Pro Footwear:** LOKI Swift Court Shoes (NPR 3,499) with anti-slip gum sole\n3. **Tournament Rubbers:** LOKI RXTON 3 High-Tension Sticky Rubber (NPR 1,499)\n4. **Official Match Balls:** LOKI 3-Star ITTF 40+ Competition Balls (Pack of 6, NPR 299)\n5. **Accessories & Apparel:** Hard-Shell Case (NPR 499), Aeroflex Jersey (NPR 1,799), Pro Shorts (NPR 1,199)\n\nSabai items ready-to-ship stock ma chhan! Tapai kun category explore garna chahanu hunchha?`,
      timestamp: "Just now",
      badge: "STORE CATALOG",
      recommendedProducts: inStockProducts.slice(0, 3),
      quickActions: [
        { label: "🏓 Dragon 10 Carbon", query: "Dragon 10 ko rate kati ho?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
        { label: "⚪ 3-Star Balls", query: "Tell me about 3 star balls" },
        { label: "🚚 Delivery Rates", query: "Delivery charges kati ho?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 11. SHOWROOM / LOCATION & STORE CONTACT
  // --------------------------------------------------------
  if (
    has(/\b(pasal\s*kata|showroom|location|store\s*kata|address|thamel|kathmandu|contact|phone|whatsapp|number|call)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `📍 **LOKI Zone Nepal Showroom & Fulfillment Hub:**\n• **Showroom & Central Warehouse:** Kathmandu, Nepal\n• **Direct Support & WhatsApp:** +977 9800000000 (Open 9:00 AM – 8:00 PM daily)\n• **Nationwide Courier:** Kathmandu Valley bhari same-day/next-day dispatch, ra Pokhara, Chitwan, Butwal, Biratnagar, Dharan, Nepalgunj samet sabai 77 districts ma express delivery garinchha!\n\nTapaile online 1-click mai order garna saknu hunchha, payment **Cash on Delivery (COD)**, **eSewa**, **Khalti**, ya **Fonepay QR** bata sajilai garna milchha!`,
      timestamp: "Just now",
      badge: "STORE LOCATION",
      quickActions: [
        { label: "🚚 Check Delivery Rates", query: "Delivery charges kati ho?" },
        { label: "💳 Payment Methods", query: "Kasari payment garne?" },
        { label: "🏓 Check Dragon 10", query: "Dragon 10 ko rate kati ho?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 12. AUTHENTICITY, ITTF GUARANTEE & WARRANTY
  // --------------------------------------------------------
  if (
    has(/\b(genuine|original|nakali|copy|duplicate|fake|ittf|warranty|guarantee|bharosa|authentic)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🛡️ **100% Genuine ITTF Certified Guarantee:**\n\nHami LOKI Sports (ITTF Approved Manufacturer) ko Nepal ma official authorized partner hau.\n\n• **Factory Sealed Packaging:** Sabai rackets ra rubbers brand-new factory sealed packaging ma aauchhan.\n• **ITTF Approved Rubber:** Official international tournament regulations compliant.\n• **7-Day Hassle-Free Replacement:** Manufacturing defect bhetiyeमा 7 din bhitra immediate replacement guarantee.\n• **Quality Inspected:** Dispatch agadi pratyek blade ra gear physical inspection pass hunchha.\n\nNishchinta bhayera tapai aafno game upgrade garna saknu hunchha!`,
      timestamp: "Just now",
      badge: "ITTF CERTIFIED",
      recommendedProducts: inStockProducts.filter((p) => p.category === "Rackets" || p.category === "Balls").slice(0, 2),
      quickActions: [
        { label: "🏓 View ITTF Rackets", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚪ 3-Star ITTF Balls", query: "Tell me about 3 star balls" },
        { label: "🎟️ Check Active Coupons", query: "Any active coupon codes?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 13. PAYMENT METHODS & CASH ON DELIVERY (COD)
  // --------------------------------------------------------
  if (
    has(/\b(payment|kasari\s*tirne|pay|esewa|khalti|fonepay|qr|cod|cash\s*on\s*delivery|online\s*pay|paisa)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `💳 **Multiple Flexible Payment Options Available:**\n\n1. **Cash on Delivery (COD):** Samaan tapai ko doorstep ma aayepaxi haat ma check garera paisa tirna milchha (Kathmandu Valley & major hub cities).\n2. **eSewa & Khalti:** Instant wallet transfer directly checkout ma.\n3. **Fonepay QR:** Kunai pani Nepali Mobile Banking app bata 1-scan instant payment.\n\nKunai pani extra hidden charges chaina! Order garepaxi SMS / WhatsApp ma live courier tracking details aauchha.`,
      timestamp: "Just now",
      badge: "PAYMENT SUPPORT",
      quickActions: [
        { label: "🚚 Check Delivery Rates", query: "Delivery charges kati ho?" },
        { label: "🏓 Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "🎟️ Active Coupons", query: "Any active coupon codes?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 14. DELIVERY RATES & FREE SHIPPING THRESHOLD
  // --------------------------------------------------------
  if (
    has(/\b(delivery|shipping|charge|courier|bhada|pokhara|chitwan|butwal|dharan|biratnagar|nepalgunj|bhaktapur|lalitpur|ktm|valley)\b/i)
  ) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🚚 **Official Store Delivery Rates (Ground-Checked):**\n\n• **Inside Kathmandu Valley (KTM, Lalitpur, Bhaktapur):** NPR ${settings.deliveryInsideValley} (Within 24 Hours)\n• **Outside Valley (Pokhara, Chitwan, Butwal, Biratnagar, etc.):** NPR ${settings.deliveryOutsideValley} (2-3 Business Days)\n• 🔥 **FREE DELIVERY OFFER:** NPR ${settings.freeShippingThreshold.toLocaleString()} bhanda mathi ko kunai pani order ma delivery **bilkul FREE** hunchha!\n\nAll parcels are insured and dispatched through reliable courier partners with real-time tracking.`,
      timestamp: "Just now",
      badge: "DELIVERY RATES",
      quickActions: [
        { label: "🔥 Free Delivery Gear", query: "Show me products above 2000 for free delivery" },
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "🎟️ Active Coupons", query: "Any active coupon codes?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 15. ACTIVE COUPONS & PROMO CODES
  // --------------------------------------------------------
  if (has(/\b(coupon|discount|promo|offer|code|voucher|chhut)\b/i)) {
    const activeCoupons = coupons.filter((c) => c.active);
    if (activeCoupons.length === 0) {
      return {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `Currently, direct factory discounts (15% – 25% OFF) are already applied directly on our gear prices! Plus, tapai le **NPR ${settings.freeShippingThreshold.toLocaleString()}** bhanda mathi cart banaye ma **FREE Shipping** paunu hunchha.`,
        timestamp: "Just now",
        badge: "DISCOUNTS APPLIED",
        quickActions: [
          { label: "🏓 View Best Sellers", query: "Dragon 10 ko rate kati ho?" },
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
        { label: "🏓 Shop Dragon 10", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Shop Dragon 8 Pro", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "👟 View Court Shoes", query: "Show me court shoes rate" },
      ],
    };
  }

  // --------------------------------------------------------
  // 16. COMPETITOR BRANDS / EXTERNAL GEAR DETECTION
  // (Butterfly, Viscaria, Timo Boll, DHS, Hurricane, Stiga, Yasaka, Donic, Mizuno, Asics)
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

  const matchedCompetitor = competitorKeywords.find((k) => rawLower.includes(k));

  if (matchedCompetitor) {
    let competitorCategory: "blade" | "rubber" | "shoes" | "general" = "general";
    if (
      rawLower.includes("viscaria") ||
      rawLower.includes("timo boll") ||
      rawLower.includes("blade") ||
      rawLower.includes("bat") ||
      rawLower.includes("racket") ||
      rawLower.includes("clipper") ||
      rawLower.includes("carbonado") ||
      rawLower.includes("cybershape") ||
      rawLower.includes("primorac") ||
      rawLower.includes("zhang jike") ||
      rawLower.includes("ma long")
    ) {
      competitorCategory = "blade";
    } else if (
      rawLower.includes("tenergy") ||
      rawLower.includes("dignics") ||
      rawLower.includes("hurricane") ||
      rawLower.includes("rakza") ||
      rawLower.includes("rubber") ||
      rawLower.includes("sheet") ||
      rawLower.includes("bluefire") ||
      rawLower.includes("evolution")
    ) {
      competitorCategory = "rubber";
    } else if (rawLower.includes("shoe") || rawLower.includes("mizuno") || rawLower.includes("asics")) {
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
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "🎟️ View Active Coupons", query: "Any active coupon codes?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 17. OUT OF STOCK SPECIFIC QUERIES
  // --------------------------------------------------------
  if (has(/\b(out\s*of\s*stock|sakiyeko|sold\s*out)\b/i)) {
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
          { label: "🏓 Dragon 10 Carbon", query: "Dragon 10 ko rate kati ho?" },
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
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 18. BUDGET / PRICE RANGE INQUIRY (e.g. under 2500, under 2000, 3000 bhitra, sasto bat)
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
          { label: "🚚 Check Delivery Rates", query: "Delivery charges kati ho?" },
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
          { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
          { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
        ],
      };
    }
  }

  // --------------------------------------------------------
  // 19. SPECIFIC PRODUCT RATE & DETAILS INQUIRY
  // Match products dynamically from useAdminStore (synced with DB)
  // Handles: In-Stock vs Out-Of-Stock dynamically!
  // --------------------------------------------------------
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

    // SCENARIO 19A: PRODUCT IS OUT OF STOCK
    if (isOut) {
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
          { label: "🏓 Check Dragon 10 Rate", query: "Dragon 10 ko rate kati ho?" },
          { label: "⚡ Check Dragon 8 Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
          { label: "🚚 Check Delivery Charges", query: "Delivery charges kati ho?" },
        ],
      };
    }

    // SCENARIO 19B: PRODUCT IS IN STOCK - GIVE EXACT REAL-TIME RATES & SPECS!
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
        { label: "🚚 Delivery Rates", query: "Delivery charges kati ho?" },
        { label: "🎟️ Any Active Coupons?", query: "Any active coupon codes?" },
        { label: "🏓 Compare with Other Blades", query: "Dragon 10 vs Dragon 8 comparison" },
      ],
    };
  }

  // --------------------------------------------------------
  // 20. GENERAL RACKET / BAT / BLADE COMPARISON & ADVICE
  // --------------------------------------------------------
  if (has(/\b(racket|bat|blade|blades)\b/i)) {
    const rackets = inStockProducts.filter((p) => p.category === "Rackets");
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🏆 **Official LOKI Championship Racket Rates (Live Admin Rates):**\n\n1. **LOKI Dragon 10 Pro:** NPR 2,499 (5-Ply Alpine Wood + Carbon Micro-Mesh, 92 Control, 88 Spin, All-Round Offensive)\n2. **LOKI Dragon 8 Pro:** NPR 2,199 (7-Ply Hybrid Wood, 85 Control, 91 Spin, 89 Speed, Explosive Loop Drives)\n\nBoth blades come pre-assembled with factory-sealed sticky ITTF competition rubber sheets.\n\n❓ **Tapaiko playstyle kasto chha?**\n• Balance, accurate control, ra spin chahinchha bhane **Dragon 10** perfect ho!\n• Heavy fast offensive topspin smash chahinchha bhane **Dragon 8** choose garnus!`,
      timestamp: "Just now",
      badge: "RACKET COMPARISON",
      recommendedProducts: rackets.length > 0 ? rackets : inStockProducts.slice(0, 2),
      quickActions: [
        { label: "🏓 Select Dragon 10 (NPR 2,499)", query: "Dragon 10 ko rate kati ho?" },
        { label: "⚡ Select Dragon 8 (NPR 2,199)", query: "Dragon 8 Pro ko rate kasto chha?" },
        { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 21. EXPLICIT PRODUCT SEARCH THAT RETURNED NO MATCH
  // CRITICAL: ONLY triggers if user explicitly asked for a product or price!
  // (Prevents casual sentences like "kasto xa bro" or "bato ma chu" from triggering not found!)
  // --------------------------------------------------------
  const hasExplicitBuyOrProductSearch = has(
    /\b(paucha|pauxa|kinna|kinne|buy|order|price|rate|cost|kati\s*parcha|kati\s*parxa|khojeko|khojdai|cha\s*ki\s*nai|chha\s*ki\s*nai|xa\s*ki\s*nai)\b/i
  );

  if (hasExplicitBuyOrProductSearch) {
    return {
      id: `ai-${Date.now()}`,
      sender: "ai",
      text: `🔍 **Item Not Found in Store Catalog:**\n\nTapai le khojnu bhayeko saman hamro official LOKI catalog ma bhetiyena (Not Found). Hamro store Nepal ma **Official LOKI (ITTF Approved)** brand ko exclusive authorized partner ho.\n\n⭐ **Tara tapailai chahine ustai high-performance gear yaha available chha:**\n• **Championship Rackets:** LOKI Dragon 10 Carbon (NPR 2,499) & Dragon 8 (NPR 2,199)\n• **Pro Court Shoes:** LOKI Swift Court Shoes (NPR 3,499) with anti-slip gum sole\n• **Match Essentials:** LOKI RXTON 3 Rubber (NPR 1,499) & 3-Star ITTF Balls (NPR 299)\n\nTala hamra top-rated available items check garnus:`,
      timestamp: "Just now",
      badge: "NOT FOUND - STORE FAVORITES",
      isNotFoundNotice: true,
      recommendedProducts: inStockProducts.slice(0, 2),
      quickActions: [
        { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
        { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
        { label: "🚚 Delivery Rates", query: "Delivery charges kati ho?" },
        { label: "🎟️ Any Active Coupons?", query: "Any active coupon codes?" },
      ],
    };
  }

  // --------------------------------------------------------
  // 22. OPEN-ENDED CONVERSATIONAL FALLBACK (NEVER ACCUSES USER OF FAILED SEARCH!)
  // Warm, human coach response that keeps the user engaged!
  // --------------------------------------------------------
  return {
    id: `ai-${Date.now()}`,
    sender: "ai",
    text: `Hajur bro! Ma bujhchhu 😄 Ma LOKI Zone Nepal ko AI Table Tennis Advisor hu.\n\nTapaile masanga normal guff garna saknu hunchha, table tennis equipment choose garna tips magna saknu hunchha, ya Kathmandu showroom bata live rates & delivery charges sodhna saknu hunchha!\n\n🏓 **Tapaiko table tennis journey kasto chaldai chha?** Regular khelnu hunchha ki naya start garne sochirahanu bhayeko chha?`,
    timestamp: "Just now",
    badge: "COACH ADVISOR",
    recommendedProducts: inStockProducts.slice(0, 2),
    quickActions: [
      { label: "🏓 Dragon 10 Carbon Rate", query: "Dragon 10 ko rate kati ho?" },
      { label: "⚡ Dragon 8 Attack Rate", query: "Dragon 8 Pro ko rate kasto chha?" },
      { label: "👟 Swift Court Shoes", query: "Show me court shoes rate" },
      { label: "💰 Rackets under NPR 2,500", query: "Rackets under NPR 2500" },
      { label: "🚚 Delivery Charges", query: "Delivery charges kati ho?" },
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
