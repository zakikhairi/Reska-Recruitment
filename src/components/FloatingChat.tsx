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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user, isAuthenticated } = useAuthStore();

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
      const result = await response.json();
      if (result.success) {
        setConversations(result.conversations || []);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
    setLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/contact?conversationId=${conversationId}`);
      const result = await response.json();
      if (result.success) {
        setMessages(result.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsSubmitting(true);

    try {
      const payload = {
        senderType: "APPLICANT",
        senderName: user.fullName || user.email,
        senderEmail: user.email,
        message: newMessage.trim(),
      };

      let response;
      let result;

      if (activeConversation) {
        // Reply to existing conversation
        response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, conversationId: activeConversation.id }),
        });
      } else {
        // Create new conversation
        response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      result = await response.json();

      if (result.success) {
        setNewMessage("");

        if (!activeConversation && result.data.conversationId) {
          // New conversation created, open it
          setActiveConversation({
            id: result.data.conversationId,
            applicantEmail: user.email,
            applicantName: user.fullName || user.email,
            status: "ACTIVE",
            lastMessageAt: new Date().toISOString(),
            messages: [],
          });
          fetchMessages(result.data.conversationId);
        } else {
          // Refresh messages
          fetchMessages(activeConversation!.id);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }

    setIsSubmitting(false);
  };

  const openConversation = (conv: Conversation) => {
    setActiveConversation(conv);
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

  // Calculate total unread
  const totalUnread = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #FF5E00, #ff7a2f)",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(255, 94, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 25px rgba(255, 94, 0, 0.5)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 94, 0, 0.4)";
          }}
        >
          <MessageCircle className="w-7 h-7" style={{ color: "#fff" }} />
          {totalUnread > 0 && (
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
            }}>
              {totalUnread > 9 ? "9+" : totalUnread}
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
              {/* Conversation List */}
              {!activeConversation && (
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <div style={{ width: "24px", height: "24px", border: "3px solid #eee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "20px", textAlign: "center" }}>
                      <MessageSquare className="w-12 h-12" style={{ color: "#ddd", marginBottom: "12px" }} />
                      <p style={{ fontSize: "13px", color: "#999", margin: 0 }}>Belum ada percakapan</p>
                      <p style={{ fontSize: "12px", color: "#bbb", margin: "4px 0 0" }}>Mulai chat dengan HRD</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => openConversation(conv)}
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          border: "none",
                          borderBottom: "1px solid #f1f5f9",
                          background: "#fff",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div style={{ width: "44px", height: "44px", background: "#FF5E00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ color: "#fff", fontWeight: 700, fontSize: "16px" }}>
                            {conv.applicantName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>{conv.applicantName}</span>
                            <span style={{ fontSize: "11px", color: "#888" }}>{formatTime(conv.lastMessageAt)}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <p style={{ fontSize: "13px", color: "#666", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                              {conv.messages[0]?.message || "Mulai percakapan baru"}
                            </p>
                            {conv.unreadCount && conv.unreadCount > 0 && (
                              <span style={{
                                background: "#ef4444",
                                color: "#fff",
                                fontSize: "10px",
                                fontWeight: 700,
                                padding: "2px 6px",
                                borderRadius: "10px",
                              }}>
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Chat Messages */}
              {activeConversation && (
                <>
                  <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#f8f9fa" }}>
                    {messages.map((msg) => {
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
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
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
                </>
              )}

              {/* New Chat Button (when no active conversation) */}
              {!activeConversation && (
                <form onSubmit={handleSendMessage} style={{ padding: "12px", borderTop: "1px solid #eee", background: "#fff" }}>
                  <div style={{ background: "#f8f9fa", borderRadius: "12px", padding: "12px", marginBottom: "10px" }}>
                    <p style={{ fontSize: "12px", color: "#666", margin: 0, lineHeight: 1.5 }}>
                      👋 Mulai percakapan baru dengan tim HRD
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      placeholder="Ketik pesan..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        border: "2px solid #eee",
                        borderRadius: "20px",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !newMessage.trim()}
                      style={{
                        width: "40px",
                        height: "40px",
                        background: newMessage.trim() ? "linear-gradient(135deg, #FF5E00, #ff7a2f)" : "#ddd",
                        border: "none",
                        borderRadius: "50%",
                        cursor: newMessage.trim() ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Send className="w-4 h-4" style={{ color: "#fff" }} />
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
        input:focus { border-color: #FF5E00 !important; }
      `}</style>
    </>
  );
}
