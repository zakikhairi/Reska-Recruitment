"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2, Maximize2, CheckCircle, MessageSquare, Clock, User, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: string;
  senderName: string;
  senderEmail: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  applicantEmail: string;
  applicantName: string;
  status: string;
  lastMessageAt: string;
  messages: ChatMessage[];
  unreadCount?: number;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasNewNotificationRef = useRef(false);

  const { user, isAuthenticated } = useAuthStore();

  // Poll for conversations every 3 seconds (even when chat is closed) to show unread notification
  useEffect(() => {
    if (!user?.email) return;

    // Fetch immediately on mount
    fetchConversations();

    const interval = setInterval(() => {
      console.log("[CHAT] Polling for new messages...");
      fetchConversations();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [user?.email]);

  // Fetch conversations when chat opens
  useEffect(() => {
    if (isOpen && user?.email) {
      fetchConversations();
    }
  }, [isOpen, user?.email]);

  // Poll for new messages every 3 seconds when conversation is active
  useEffect(() => {
    if (!activeConversation) return;

    const interval = setInterval(() => {
      fetchMessages(activeConversation.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [messages]);

  const fetchConversations = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/contact?email=${encodeURIComponent(user.email)}`);

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        console.error("[CHAT] Fetch conversations failed with status:", response.status);
        setLoading(false);
        return;
      }

      const result = await response.json();

      if (result.success) {
        const newConversations = result.conversations || [];
        console.log("[CHAT] Fetched conversations:", newConversations.map(c => ({ id: c.id, unread: c.unreadCount })));
        setConversations(newConversations);

        // Auto-open conversation if there's only one
        if (newConversations.length === 1 && !activeConversation) {
          console.log("[CHAT] Auto-opening single conversation");
          openConversation(newConversations[0]);
        }
      } else {
        console.error("[CHAT] API returned error:", result.error);
      }
    } catch (err) {
      console.error("[CHAT] Error fetching conversations:", err);
    }
    setLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/contact?conversationId=${conversationId}`);

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        console.error("[CHAT] Fetch messages failed with status:", response.status);
        return;
      }

      const result = await response.json();
      if (result.success) {
        console.log("[CHAT] Fetched messages:", result.messages.length);
        setMessages(result.messages);
      } else {
        console.error("[CHAT] API returned error:", result.error);
      }
    } catch (err) {
      console.error("[CHAT] Error fetching messages:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("[CHAT] handleSendMessage called");
    console.log("[CHAT] user:", user);
    console.log("[CHAT] newMessage:", newMessage);
    console.log("[CHAT] isAuthenticated:", isAuthenticated);

    if (!newMessage.trim()) {
      console.log("[CHAT] Blocked: empty message");
      return;
    }

    if (!user) {
      console.log("[CHAT] Blocked: no user");
      setError("Silakan login terlebih dahulu");
      return;
    }

    if (!user.email) {
      console.log("[CHAT] Blocked: no user email");
      setError("Data email tidak ditemukan");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        senderType: "APPLICANT",
        senderName: user.fullName || user.email,
        senderEmail: user.email,
        message: newMessage.trim(),
      };

      console.log("[CHAT] Payload:", payload);

      let response;
      let result;

      if (activeConversation) {
        // Reply to existing conversation
        console.log("[CHAT] Sending reply to conversation:", activeConversation.id);
        response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, conversationId: activeConversation.id }),
        });
      } else {
        // Create new conversation (API will merge if exists)
        console.log("[CHAT] Creating new conversation");
        response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      console.log("[CHAT] Response status:", response.status);
      result = await response.json();
      console.log("[CHAT] Send result:", result);

      if (result.success) {
        setNewMessage("");

        if (!activeConversation && result.data?.conversationId) {
          // New conversation created, open it
          console.log("[CHAT] New conversation created:", result.data.conversationId);
          setActiveConversation({
            id: result.data.conversationId,
            applicantEmail: user.email,
            applicantName: user.fullName || user.email,
            status: "ACTIVE",
            lastMessageAt: new Date().toISOString(),
            messages: [],
          });
          fetchMessages(result.data.conversationId);
        } else if (activeConversation) {
          // Refresh messages
          console.log("[CHAT] Refreshing messages for:", activeConversation.id);
          fetchMessages(activeConversation.id);
        }
      } else {
        console.log("[CHAT] Error:", result.error);
        setError(result.error || "Gagal mengirim pesan");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Terjadi kesalahan saat mengirim pesan");
    }

    setIsSubmitting(false);
  };

  const openConversation = (conv: Conversation) => {
    console.log("[CHAT] Opening conversation:", conv.id);
    setActiveConversation(conv);
    setHasNewNotification(false);
    hasNewNotificationRef.current = false;
    fetchMessages(conv.id);
  };

  const closeConversation = () => {
    setActiveConversation(null);
    setMessages([]);
    fetchConversations();
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes}m lalu`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}j lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  // Calculate total unread - DEDUPLICATED to show only ONE notification
  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  // Single notification state (not per-conversation)
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const prevUnreadRef = useRef(0);
  const originalTitle = useRef("");

  useEffect(() => {
    // Store original title on first render
    if (!originalTitle.current && typeof document !== "undefined") {
      originalTitle.current = document.title;
    }

    console.log("[CHAT] Unread check - current:", totalUnread, "prev:", prevUnreadRef.current);

    // Trigger notification when there are unread messages
    if (totalUnread > 0) {
      // Only trigger animation on new unread (when prev was 0)
      if (prevUnreadRef.current === 0) {
        console.log("[CHAT] NEW MESSAGE! Showing notification");
        hasNewNotificationRef.current = true;
        setHasNewNotification(true);

        // Change browser tab title to show notification
        if (typeof document !== "undefined") {
          document.title = `💬 Pesan baru - KAI Recruitment`;
        }
      }
    }

    prevUnreadRef.current = totalUnread;
  }, [totalUnread]);

  // Reset notification when user opens chat
  useEffect(() => {
    if (isOpen && totalUnread > 0) {
      console.log("[CHAT] Chat opened, resetting notification");
      setHasNewNotification(false);
      hasNewNotificationRef.current = false;
      if (typeof document !== "undefined") {
        document.title = originalTitle.current;
      }
    }
  }, [isOpen, totalUnread]);

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => {
            console.log("[CHAT] Opening chat...");
            setIsOpen(true);
          }}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "60px",
            height: "60px",
            background: hasNewNotification
              ? "linear-gradient(135deg, #16a34a, #22c55e)"
              : "linear-gradient(135deg, #FF5E00, #ff7a2f)",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            boxShadow: hasNewNotification
              ? "0 4px 20px rgba(22, 163, 74, 0.6), 0 0 0 0 rgba(22, 163, 74, 0.7)"
              : "0 4px 20px rgba(255, 94, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            transition: "transform 0.2s, box-shadow 0.2s, background 0.3s",
            animation: hasNewNotification ? "pulse-ring 1.5s ease-out infinite" : "none",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = hasNewNotification
              ? "0 6px 25px rgba(22, 163, 74, 0.7)"
              : "0 6px 25px rgba(255, 94, 0, 0.5)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = hasNewNotification
              ? "0 4px 20px rgba(22, 163, 74, 0.6)"
              : "0 4px 20px rgba(255, 94, 0, 0.4)";
          }}
        >
          <MessageCircle className="w-7 h-7" style={{ color: "#fff" }} />
          {(hasNewNotification || totalUnread > 0) && (
            <span style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "#ef4444",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: "10px",
              minWidth: "18px",
              textAlign: "center",
              animation: "bounce 0.5s ease",
            }}>
              {totalUnread > 0 ? (totalUnread > 9 ? "9+" : totalUnread) : "1"}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: isMinimized ? "60px" : "380px",
            height: isMinimized ? "60px" : "550px",
            background: "#fff",
            borderRadius: isMinimized ? "50%" : "20px",
            boxShadow: "0 10px 50px rgba(0, 0, 0, 0.2)",
            overflow: "hidden",
            zIndex: 1000,
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #00205B, #003380)",
              padding: isMinimized ? 0 : "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: isMinimized ? "center" : "space-between",
              height: isMinimized ? "100%" : "auto",
              cursor: "pointer",
              flexShrink: 0,
            }}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <Maximize2 className="w-6 h-6" style={{ color: "#fff" }} />
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {activeConversation && (
                    <button
                      onClick={(e) => { e.stopPropagation(); closeConversation(); }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <ArrowLeft className="w-5 h-5" style={{ color: "#fff" }} />
                    </button>
                  )}
                  <div style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MessageCircle className="w-5 h-5" style={{ color: "#fff" }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: 0 }}>
                      {activeConversation ? "Percakapan" : "Live Chat HRD"}
                    </h3>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", margin: 0 }}>
                      {activeConversation ? activeConversation.applicantName : "Tim HRD siap membantu"}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Minimize2 className="w-5 h-5" style={{ color: "#fff" }} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); setActiveConversation(null); }}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <X className="w-5 h-5" style={{ color: "#fff" }} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Content */}
          {!isMinimized && (
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#f8f9fa" }}>
                {loading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <div style={{ width: "24px", height: "24px", border: "3px solid #eee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "20px", textAlign: "center" }}>
                    <MessageSquare className="w-12 h-12" style={{ color: "#ddd", marginBottom: "12px" }} />
                    <p style={{ fontSize: "13px", color: "#999", margin: 0 }}>Belum ada pesan</p>
                    <p style={{ fontSize: "12px", color: "#bbb", margin: "4px 0 0" }}>Ketik pesan untuk memulai chat dengan HRD</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderType === "APPLICANT";
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex",
                          justifyContent: isMe ? "flex-end" : "flex-start",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{
                          maxWidth: "75%",
                          display: "flex",
                          flexDirection: isMe ? "row-reverse" : "row",
                          alignItems: "flex-end",
                          gap: "8px",
                        }}>
                          {!isMe && (
                            <div style={{ width: "28px", height: "28px", background: "#00205B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: "10px", color: "#fff", fontWeight: 700 }}>HR</span>
                            </div>
                          )}
                          <div>
                            <div style={{
                              background: isMe ? "linear-gradient(135deg, #FF5E00, #ff7a2f)" : "#fff",
                              color: isMe ? "#fff" : "#333",
                              padding: "10px 14px",
                              borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            }}>
                              <p style={{ fontSize: "13px", margin: 0, lineHeight: 1.5 }}>{msg.message}</p>
                            </div>
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "4px",
                              justifyContent: isMe ? "flex-end" : "flex-start",
                            }}>
                              <span style={{ fontSize: "10px", color: "#999" }}>{formatTime(msg.createdAt)}</span>
                              {isMe && (
                                <span style={{ fontSize: "10px", color: "#888" }}>
                                  {msg.isRead ? <CheckCircle className="w-3 h-3" style={{ color: "#16a34a" }} /> : <Clock className="w-3 h-3" />}
                                </span>
                              )}
                            </div>
                          </div>
                          {isMe && (
                            <div style={{ width: "28px", height: "28px", background: "#FF5E00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <User className="w-3 h-3" style={{ color: "#fff" }} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              {error && (
                <div style={{ padding: "8px 12px", background: "#fee2e2", borderBottom: "1px solid #fecaca" }}>
                  <p style={{ fontSize: "12px", color: "#dc2626", margin: 0 }}>❌ {error}</p>
                </div>
              )}
              {!isAuthenticated || !user?.email ? (
                <div style={{ padding: "12px", borderTop: "1px solid #eee", background: "#fff", textAlign: "center" }}>
                  <p style={{ fontSize: "13px", color: "#dc2626", margin: "0 0 8px" }}>⚠️ Silakan login terlebih dahulu</p>
                  <a href="/auth/login" style={{ fontSize: "12px", color: "#FF5E00", textDecoration: "underline" }}>Login di sini</a>
                </div>
              ) : (
                <form onSubmit={handleSendMessage} style={{ padding: "12px", borderTop: "1px solid #eee", background: "#fff" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Ketik pesan..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        border: "2px solid #eee",
                        borderRadius: "24px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !newMessage.trim()}
                      style={{
                        width: "44px",
                        height: "44px",
                        background: newMessage.trim() ? "linear-gradient(135deg, #FF5E00, #ff7a2f)" : "#ddd",
                        border: "none",
                        borderRadius: "50%",
                        cursor: newMessage.trim() ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      {isSubmitting ? (
                        <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                      ) : (
                        <Send className="w-5 h-5" style={{ color: "#fff" }} />
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 4px 20px rgba(22, 163, 74, 0.6), 0 0 0 0 rgba(22, 163, 74, 0.7); }
          70% { box-shadow: 0 4px 20px rgba(22, 163, 74, 0.6), 0 0 0 15px rgba(22, 163, 74, 0); }
          100% { box-shadow: 0 4px 20px rgba(22, 163, 74, 0.6), 0 0 0 0 rgba(22, 163, 74, 0); }
        }
        input:focus { border-color: #FF5E00 !important; }
      `}</style>
    </>
  );
}
