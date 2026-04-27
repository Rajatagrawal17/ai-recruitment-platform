import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import "./HelpChatbot.css";

const getTimeLabel = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const createMessage = (sender, text, actions = []) => ({
  id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  sender,
  text,
  actions,
  time: getTimeLabel(),
});

const buildConversationPayload = (messages = []) =>
  messages
    .filter((msg) => msg && typeof msg.text === "string")
    .slice(-8)
    .map((msg) => ({
      sender: msg.sender,
      text: String(msg.text).slice(0, 1000),
    }));

const getQuickPrompts = (role, isAuthenticated) => {
  if (!isAuthenticated) {
    return [
      "How do I create an account?",
      "Show me open jobs",
      "What can HireAI do?",
      "How does AI match score work?",
    ];
  }

  if (role === "recruiter" || role === "admin") {
    return [
      "How do I post a job?",
      "Show recruiter dashboard",
      "How do I shortlist a candidate?",
      "How to view top matches?",
    ];
  }

  return [
    "Show candidate dashboard",
    "How do I apply to a job?",
    "Where can I track my applications?",
    "How is match score calculated?",
  ];
};

const getBotReply = ({ text, role, isAuthenticated, path }) => {
  const q = text.toLowerCase().trim();

  if (!q) {
    return createMessage("bot", "Type your question and I will help you with navigation, applications, dashboard tasks, and account support.");
  }

  if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
    return createMessage(
      "bot",
      "Hi! I am your HireAI assistant. I can help you with job discovery, applications, recruiter workflows, and account actions."
    );
  }

  if (q.includes("open jobs") || q.includes("jobs") || q.includes("find job") || q.includes("search")) {
    return createMessage(
      "bot",
      "You can explore all active roles from the Jobs section. Use filters and open a role to view details before applying.",
      [{ label: "Open Jobs", path: "/jobs" }]
    );
  }

  if (q.includes("register") || q.includes("signup") || q.includes("create account")) {
    return createMessage(
      "bot",
      "To create an account, go to Register and choose your role: Candidate or Recruiter.",
      [{ label: "Go to Register", path: "/register" }]
    );
  }

  if (q.includes("login") || q.includes("sign in")) {
    return createMessage(
      "bot",
      "Use your email and password on the login page. I will route you to the correct dashboard based on your role.",
      [{ label: "Go to Login", path: "/login" }]
    );
  }

  if (q.includes("apply") || q.includes("application")) {
    if (!isAuthenticated) {
      return createMessage(
        "bot",
        "You need a candidate account to apply. Register or login first, then open a job and click View & Apply.",
        [
          { label: "Login", path: "/login" },
          { label: "Register", path: "/register?role=candidate" },
        ]
      );
    }

    if (role === "candidate") {
      return createMessage(
        "bot",
        "As a candidate, open Jobs, select a role, and submit the application form with your resume and details.",
        [
          { label: "Open Jobs", path: "/jobs" },
          { label: "My Applications", path: "/candidate/dashboard" },
        ]
      );
    }

    return createMessage(
      "bot",
      "Recruiter accounts cannot submit candidate applications. Switch to a candidate account to apply for jobs."
    );
  }

  if (q.includes("dashboard") || q.includes("panel")) {
    if (!isAuthenticated) {
      return createMessage(
        "bot",
        "Login first and I will send you to your role-specific dashboard.",
        [{ label: "Go to Login", path: "/login" }]
      );
    }

    if (role === "candidate") {
      return createMessage(
        "bot",
        "Your candidate dashboard shows application history, statuses, and match scores.",
        [{ label: "Open Candidate Dashboard", path: "/candidate/dashboard" }]
      );
    }

    return createMessage(
      "bot",
      "Your recruiter dashboard lets you post jobs, review ranked candidates, and update statuses.",
      [{ label: "Open Recruiter Dashboard", path: "/dashboard" }]
    );
  }

  if (q.includes("shortlist") || q.includes("accept") || q.includes("reject") || q.includes("status")) {
    return createMessage(
      "bot",
      "Recruiters can update application status from the candidate ranking section under each job.",
      role === "recruiter" || role === "admin"
        ? [{ label: "Go to Dashboard", path: "/dashboard" }]
        : []
    );
  }

  if (q.includes("match") || q.includes("score")) {
    return createMessage(
      "bot",
      "Match score is based on how well candidate skills align with job skills. Higher score means stronger fit for that role."
    );
  }

  if (q.includes("resume") || q.includes("cv")) {
    return createMessage(
      "bot",
      "Upload your latest resume while applying. Recruiters can review candidate details from the dashboard."
    );
  }

  if (q.includes("contact") || q.includes("support") || q.includes("help")) {
    return createMessage(
      "bot",
      "I can guide you through jobs, applications, login, dashboard flows, and role-based access. Ask me anything specific and I will provide direct actions."
    );
  }

  return createMessage(
    "bot",
    `You are currently on ${path}. I can help with navigation, role-specific workflows, applications, and dashboard actions. Try asking: "How do I apply?" or "Show dashboard".`
  );
};

const HelpChatbot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState(() => [
    createMessage(
      "bot",
      "Welcome to HireAI Assistant. I can guide candidates and recruiters step-by-step.",
      [
        { label: "Open Jobs", path: "/jobs" },
        { label: "How to Apply", path: "/apply" },
      ]
    ),
  ]);

  const bottomRef = useRef(null);

  const quickPrompts = useMemo(
    () => getQuickPrompts(role, isAuthenticated),
    [role, isAuthenticated]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setUnreadCount(0);
  }, [isOpen]);

  const pushBotReply = async (text, conversationSnapshot) => {
    setIsTyping(true);

    const currentConversation = Array.isArray(conversationSnapshot)
      ? conversationSnapshot
      : messages;

    const payload = {
      message: text,
      role,
      isAuthenticated,
      path: location.pathname,
      conversation: buildConversationPayload(currentConversation),
    };

    try {
      const response = await API.post("/ai/help-chat", payload);
      const data = response?.data?.data;

      if (!data || typeof data.reply !== "string") {
        throw new Error("Invalid help-chat response");
      }

      const actions = Array.isArray(data.actions)
        ? data.actions
            .filter((item) => item && typeof item === "object")
            .map((item) => ({ label: item.label, path: item.path }))
            .filter((item) => typeof item.label === "string" && typeof item.path === "string")
            .slice(0, 3)
        : [];

      const followUps = Array.isArray(data.followUps)
        ? data.followUps
            .filter((item) => typeof item === "string" && item.trim())
            .slice(0, 3)
            .map((prompt) => ({ label: prompt, prompt }))
        : [];

      const reply = createMessage("bot", data.reply, [...actions, ...followUps]);
      setMessages((prev) => [...prev, reply]);
    } catch (error) {
      // Local deterministic fallback
      window.setTimeout(() => {
        const reply = getBotReply({
          text,
          role,
          isAuthenticated,
          path: location.pathname,
        });
        setMessages((prev) => [...prev, reply]);
      }, 350);
    } finally {
      setIsTyping(false);

      if (!isOpen) {
        setUnreadCount((count) => count + 1);
      }
    }
  };

  const handleSend = () => {
    const value = input.trim();
    if (!value) {
      return;
    }

    setMessages((prev) => {
      const nextMessages = [...prev, createMessage("user", value)];
      pushBotReply(value, nextMessages);
      return nextMessages;
    });
    setInput("");
  };

  const handleQuickPrompt = (prompt) => {
    setMessages((prev) => {
      const nextMessages = [...prev, createMessage("user", prompt)];
      pushBotReply(prompt, nextMessages);
      return nextMessages;
    });
  };

  const handleAction = (action) => {
    if (!action || typeof action !== "object") {
      return;
    }

    if (typeof action.prompt === "string" && action.prompt.trim()) {
      handleQuickPrompt(action.prompt);
      return;
    }

    if (typeof action.path === "string" && action.path.trim()) {
      navigate(action.path);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const clearConversation = () => {
    setMessages([
      createMessage(
        "bot",
        "Conversation cleared. Ask me anything about roles, jobs, applications, or dashboard actions."
      ),
    ]);
  };

  return (
    <div className="help-chatbot-shell" aria-live="polite">
      {isOpen && (
        <section className="help-chatbot-panel">
          <header className="help-chatbot-header">
            <div>
              <h3>HireAI Assistant</h3>
              <p>{isAuthenticated ? `Role: ${role || "user"}` : "Guest mode"}</p>
            </div>
            <div className="help-chatbot-controls">
              <button type="button" onClick={clearConversation} title="Clear chat">
                Clear
              </button>
              <button type="button" onClick={() => setIsOpen(false)} title="Close chat">
                Close
              </button>
            </div>
          </header>

          <div className="help-chatbot-prompts">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleQuickPrompt(prompt)}
                className="prompt-chip"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="help-chatbot-messages">
            {messages.map((msg) => (
              <article
                key={msg.id}
                className={`message ${msg.sender === "bot" ? "bot" : "user"}`}
              >
                <p>{msg.text}</p>
                {msg.actions?.length > 0 && (
                  <div className="message-actions">
                    {msg.actions.map((action) => (
                      <button
                        key={`${msg.id}_${action.path || action.prompt || action.label}`}
                        type="button"
                        onClick={() => handleAction(action)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                <span>{msg.time}</span>
              </article>
            ))}

            {isTyping && (
              <article className="message bot typing">
                <div className="typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </article>
            )}

            <div ref={bottomRef} />
          </div>

          <footer className="help-chatbot-input">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about jobs, dashboards, applications, or support..."
              rows={2}
            />
            <button type="button" onClick={handleSend}>
              Send
            </button>
          </footer>
        </section>
      )}

      <button
        type="button"
        className={`help-chatbot-fab ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Open AI help assistant"
      >
        <span>AI</span>
        <small>Help</small>
        {unreadCount > 0 && <em>{unreadCount}</em>}
      </button>
    </div>
  );
};

export default HelpChatbot;
