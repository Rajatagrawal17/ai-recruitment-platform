import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";

/* ─── helpers ─────────────────────────────────────────────── */
const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const mkMsg = (sender, text, actions = []) => ({
  id: uid(),
  sender,
  text,
  actions,
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
});

const SESSION_KEY = "hireai_chat_v2";

const loadSession = () => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (_) {}
  return null;
};

const saveSession = (msgs) => {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(msgs.slice(-40)));
  } catch (_) {}
};

const QUICK_ACTIONS = [
  { icon: "✍️", label: "Write a cover letter" },
  { icon: "📊", label: "How is my match score calculated?" },
  { icon: "🔍", label: "Help me find remote jobs" },
  { icon: "📄", label: "Tips to improve my resume" },
];

const INITIAL_MSG = mkMsg(
  "bot",
  "Hi there! 👋 I'm **HireAI Assistant** — your smart career companion. I can help you write cover letters, find the right jobs, improve your resume, and guide you through the platform.",
  []
);

/* ─── local fallback replies ───────────────────────────────── */
const localReply = ({ text }) => {
  const q = text.toLowerCase();
  if (q.includes("cover letter"))
    return "Sure! To write a strong cover letter, start with a compelling hook about why you're excited about the role, highlight 2–3 key achievements that match the job requirements, and close with a clear call to action. Want me to draft one for a specific role?";
  if (q.includes("match score") || q.includes("score"))
    return "Your **match score** is calculated by comparing your skills, experience, and profile keywords against the job requirements. A higher score means you're a stronger fit. Complete your profile for the best results! 🎯";
  if (q.includes("remote") || q.includes("work from home"))
    return "You can filter for remote jobs in the **Jobs** section — just toggle the Remote filter on the left panel. I'll help you find roles that fit your skills!";
  if (q.includes("resume") || q.includes("cv"))
    return "For a standout resume: use strong action verbs, quantify your achievements (e.g., 'Increased sales by 30%'), keep it to 1–2 pages, and tailor it for each job. Upload your latest resume in your **Profile** for AI-powered feedback!";
  if (q.includes("apply") || q.includes("application"))
    return "To apply for a job, browse the **Explore** tab, click a role you like, and hit the **Apply** button. Your profile info auto-fills the form. Track all applications in the **Applied** tab!";
  return "I'm here to help with your job search, applications, resume tips, and navigating the platform. Feel free to ask me anything! 💡";
};

/* ─── typing text effect ───────────────────────────────────── */
const useTypewriter = (text, enabled) => {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  useEffect(() => {
    if (!enabled) { setDisplayed(text); return; }
    setDisplayed("");
    let i = 0;
    const step = () => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i < text.length) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, enabled]);
  return displayed;
};

/* ─── markdown-lite renderer ───────────────────────────────── */
const renderText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

/* ─── single message bubble ────────────────────────────────── */
const MessageBubble = ({ msg, isLatestBot, navigate }) => {
  const isBot = msg.sender === "bot";
  const textToShow = useTypewriter(msg.text, isBot && isLatestBot);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isBot ? "flex-start" : "flex-end",
        gap: "6px",
        marginBottom: "4px",
      }}
    >
      {isBot && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", flexShrink: 0,
          }}>✨</div>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
            HireAI
          </span>
        </div>
      )}

      <div style={{
        maxWidth: "85%",
        padding: "10px 14px",
        borderRadius: isBot ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
        background: isBot
          ? "rgba(255,255,255,0.07)"
          : "linear-gradient(135deg, #6366f1, #8b5cf6)",
        backdropFilter: isBot ? "blur(10px)" : "none",
        border: isBot ? "1px solid rgba(255,255,255,0.1)" : "none",
        color: "#fff",
        fontSize: "13.5px",
        lineHeight: 1.6,
        wordBreak: "break-word",
        boxShadow: isBot ? "none" : "0 4px 15px rgba(99,102,241,0.35)",
      }}>
        {renderText(textToShow)}
      </div>

      {/* action buttons */}
      {msg.actions?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "85%" }}>
          {msg.actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                if (action.path) navigate(action.path);
              }}
              style={{
                padding: "5px 12px",
                borderRadius: "20px",
                border: "1px solid rgba(99,102,241,0.5)",
                background: "rgba(99,102,241,0.12)",
                color: "#a5b4fc",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(99,102,241,0.25)";
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(99,102,241,0.12)";
                e.target.style.color = "#a5b4fc";
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", marginTop: "2px" }}>
        {msg.time}
      </span>
    </motion.div>
  );
};

/* ─── typing indicator ─────────────────────────────────────── */
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 0" }}
  >
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "12px",
    }}>✨</div>
    <div style={{
      padding: "10px 14px",
      borderRadius: "4px 16px 16px 16px",
      background: "rgba(255,255,255,0.07)",
      border: "1px solid rgba(255,255,255,0.1)",
      display: "flex", gap: "4px", alignItems: "center",
    }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "rgba(165,180,252,0.8)",
            display: "inline-block",
          }}
        />
      ))}
    </div>
  </motion.div>
);

/* ─── main component ───────────────────────────────────────── */
const AIHelpWidget = () => {
  const { role, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [messages, setMessages] = useState(() => loadSession() ?? [INITIAL_MSG]);
  const [latestBotId, setLatestBotId] = useState(INITIAL_MSG.id);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

  // hide on auth pages
  const hiddenPaths = ["/login", "/register"];
  if (hiddenPaths.includes(location.pathname)) return null;

  // auto-scroll
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen, scrollToBottom]);

  // focus input when opened
  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // scroll to bottom on visual viewport resize (keyboard open)
  useEffect(() => {
    if (isOpen && window.visualViewport) {
      window.visualViewport.addEventListener("resize", scrollToBottom);
      return () => {
        window.visualViewport?.removeEventListener("resize", scrollToBottom);
      };
    }
  }, [isOpen, scrollToBottom]);

  // persist session
  useEffect(() => {
    saveSession(messages);
  }, [messages]);

  const sendMessage = useCallback(async (text) => {
    const userMsg = mkMsg("user", text);
    let currentMsgs;
    setMessages((prev) => {
      currentMsgs = [...prev, userMsg];
      return currentMsgs;
    });
    setInput("");
    setIsTyping(true);

    try {
      const payload = {
        message: text,
        role,
        isAuthenticated,
        path: location.pathname,
        conversation: (currentMsgs ?? [])
          .slice(-8)
          .map((m) => ({ sender: m.sender, text: m.text?.slice(0, 1000) })),
      };

      const response = await API.post("/ai/help-chat", payload);
      const data = response?.data?.data;

      if (!data || typeof data.reply !== "string") throw new Error("bad response");

      const actions = (data.actions ?? [])
        .filter((a) => a?.label && a?.path)
        .slice(0, 3);

      const botMsg = mkMsg("bot", data.reply, actions);
      setMessages((prev) => [...prev, botMsg]);
      setLatestBotId(botMsg.id);
    } catch (_) {
      // local fallback
      await new Promise((r) => setTimeout(r, 400));
      const botMsg = mkMsg("bot", localReply({ text }));
      setMessages((prev) => [...prev, botMsg]);
      setLatestBotId(botMsg.id);
    } finally {
      setIsTyping(false);
      if (!isOpen) setUnread((n) => n + 1);
    }
  }, [role, isAuthenticated, location.pathname, isOpen]);

  const handleSend = () => {
    const val = input.trim();
    if (!val || isTyping) return;
    sendMessage(val);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (label) => {
    sendMessage(label);
  };

  const clearChat = () => {
    const fresh = [mkMsg("bot", "Conversation cleared! How can I help you today? 😊")];
    setMessages(fresh);
    setLatestBotId(fresh[0].id);
    sessionStorage.removeItem(SESSION_KEY);
  };

  /* drawer animation variants */
  const drawerVariants = isDesktop
    ? {
        hidden: { x: "100%", opacity: 0 },
        visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 32 } },
        exit: { x: "100%", opacity: 0, transition: { duration: 0.22, ease: "easeIn" } },
      }
    : {
        hidden: { y: "100%", opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 32 } },
        exit: { y: "100%", opacity: 0, transition: { duration: 0.22, ease: "easeIn" } },
      };

  return (
    <>
      {/* ── chat drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* overlay (mobile only) */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(2px)",
                zIndex: 1099,
                display: isDesktop ? "none" : "block",
              }}
            />

            <motion.div
              key="drawer"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              drag={isDesktop ? false : "y"}
              dragConstraints={isDesktop ? undefined : { top: 0 }}
              dragElastic={isDesktop ? undefined : 0.2}
              onDragEnd={isDesktop ? undefined : (event, info) => {
                if (info.velocity.y > 500 || info.offset.y > 200) {
                  setIsOpen(false);
                }
              }}
              style={{
                position: "fixed",
                zIndex: 1100,
                ...(isDesktop
                  ? { right: 24, bottom: 90, width: 380, height: 520, borderRadius: 20 }
                  : { left: 0, right: 0, bottom: 0, height: "85dvh", borderRadius: "20px 20px 0 0", paddingBottom: "env(safe-area-inset-bottom)" }),
                background: "rgba(15,15,26,0.92)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 -4px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.15)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* header */}
              <div style={{
                padding: "16px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px",
                    boxShadow: "0 0 16px rgba(99,102,241,0.5)",
                  }}>✨</div>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px", lineHeight: 1.2 }}>
                      HireAI Assistant ✨
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>
                      AI-powered career guide
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={clearChat}
                    title="Clear chat"
                    style={{
                      width: 30, height: 30, borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.5)",
                      cursor: "pointer", fontSize: "13px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    }}
                  >🗑️</button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close"
                    style={{
                      width: 30, height: 30, borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.5)",
                      cursor: "pointer", fontSize: "16px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239,68,68,0.2)";
                      e.currentTarget.style.color = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    }}
                  >✕</button>
                </div>
              </div>

              {/* messages area */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 16px 8px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(99,102,241,0.3) transparent",
              }}>
                {/* quick action chips — first open only */}
                {messages.length <= 1 && (
                  <div style={{ marginBottom: "6px" }}>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginBottom: "8px", textAlign: "center" }}>
                      Quick actions
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
                      {QUICK_ACTIONS.map((qa) => (
                        <motion.button
                          key={qa.label}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleQuickAction(qa.label)}
                          style={{
                            padding: "7px 13px",
                            borderRadius: "20px",
                            border: "1px solid rgba(99,102,241,0.4)",
                            background: "rgba(99,102,241,0.1)",
                            color: "#c4b5fd",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "background 0.2s",
                          }}
                        >
                          <span>{qa.icon}</span>
                          <span>{qa.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isLatestBot={msg.id === latestBotId && msg.sender === "bot"}
                    navigate={navigate}
                  />
                ))}

                <AnimatePresence>
                  {isTyping && <TypingIndicator key="typing" />}
                </AnimatePresence>

                <div ref={bottomRef} />
              </div>

              {/* input area */}
              <div style={{
                padding: "12px 14px",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                display: "flex",
                gap: "10px",
                alignItems: "flex-end",
                flexShrink: 0,
                position: "sticky",
                bottom: 0,
                background: "rgba(15,15,26,0.98)",
                paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask me anything..."
                  rows={1}
                  style={{
                    flex: 1,
                    resize: "none",
                    padding: "10px 14px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.06)",
                    color: "#fff",
                    fontSize: "13.5px",
                    lineHeight: 1.5,
                    outline: "none",
                    maxHeight: "100px",
                    overflowY: "auto",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
                />
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  style={{
                    width: 42, height: 42,
                    borderRadius: "50%",
                    border: "none",
                    background: input.trim() && !isTyping
                      ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                      : "rgba(255,255,255,0.08)",
                    color: input.trim() && !isTyping ? "#fff" : "rgba(255,255,255,0.3)",
                    cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.2s",
                    boxShadow: input.trim() && !isTyping ? "0 4px 15px rgba(99,102,241,0.4)" : "none",
                  }}
                  aria-label="Send message"
                >
                  ➤
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── floating action button ── */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Open AI Assistant"
        style={{
          position: "fixed",
          bottom: isDesktop ? 28 : "calc(80px + 16px + env(safe-area-inset-bottom))",
          right: isDesktop ? 24 : 16,
          width: 56, height: 56,
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff",
          fontSize: "20px",
          cursor: "pointer",
          zIndex: 1050,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 24px rgba(99,102,241,0.55)",
        }}
      >
        {/* pulse ring */}
        {!isOpen && (
          <span style={{
            position: "absolute", inset: -4,
            borderRadius: "50%",
            border: "2px solid rgba(99,102,241,0.6)",
            animation: "ai-pulse-ring 2s ease-out infinite",
            pointerEvents: "none",
          }} />
        )}
        {isOpen ? "✕" : "✨"}
        {/* unread badge */}
        {!isOpen && unread > 0 && (
          <span style={{
            position: "absolute", top: -3, right: -3,
            background: "#ef4444",
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            minWidth: 18, height: 18,
            borderRadius: "9px",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #0f0f1a",
            padding: "0 4px",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </motion.button>

      {/* ── keyframes injected inline ── */}
      <style>{`
        @keyframes ai-pulse-ring {
          0%   { transform: scale(1); opacity: 0.8; }
          70%  { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default AIHelpWidget;
