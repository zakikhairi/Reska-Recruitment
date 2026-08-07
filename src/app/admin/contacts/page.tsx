"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Clock, CheckCircle, RefreshCw, User, Search, X } from "lucide-react";

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

export default function AdminContactsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, closed: 0 });
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [statusFilter]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      // Poll for new messages every 3 seconds
      const interval = setInterval(() => {
        fetchMessages(activeConversation.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const url = statusFilter === "all" ? "/api/admin/contacts" : `/api/admin/contacts?status=${statusFilter}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setConversations(result.conversations || []);
        setStats(result.stats || { total: 0, active: 0, closed: 0 });
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
    setLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/admin/contacts?conversationId=${conversationId}`);
      const result = await response.json();
      if (result.success) {
        setMessages(result.messages);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          senderName: "Tim HRD",
          senderEmail: "hrd@kai.co.id",
          message: newMessage.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNewMessage("");
        fetchMessages(activeConversation.id);
      }
    } catch (err) {
      console.error("Error sending reply:", err);
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
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes}m lalu`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}j lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) =>
    conv.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "20px 32px" }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#00205B", marginBottom: "4px" }}>Live Chat Pelamar</h1>
            <p style={{ fontSize: "14px", color: "#666" }}>Balas pesan dari pelamar secara langsung</p>
          </div>
          <button
            onClick={fetchConversations}
            style={{ padding: "10px", background: "#f1f5f9", border: "none", borderRadius: "10px", cursor: "pointer" }}
          >
            <RefreshCw className="w-5 h-5" style={{ color: "#64748b" }} />
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px 32px" }}>
        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <button
            onClick={() => setStatusFilter("all")}
            style={{
              padding: "20px",
              background: statusFilter === "all" ? "#00205B" : "#fff",
              border: "none",
              borderRadius: "14px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <MessageCircle className="w-6 h-6" style={{ color: statusFilter === "all" ? "#fff" : "#FF5E00" }} />
              <span style={{ fontSize: "24px", fontWeight: 800, color: statusFilter === "all" ? "#fff" : "#111" }}>{stats.total}</span>
            </div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: statusFilter === "all" ? "rgba(255,255,255,0.8)" : "#666" }}>Semua</span>
          </button>

          <button
            onClick={() => setStatusFilter("ACTIVE")}
            style={{
              padding: "20px",
              background: statusFilter === "ACTIVE" ? "#00205B" : "#fff",
              border: "none",
              borderRadius: "14px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <Clock className="w-6 h-6" style={{ color: statusFilter === "ACTIVE" ? "#fff" : "#f59e0b" }} />
              <span style={{ fontSize: "24px", fontWeight: 800, color: statusFilter === "ACTIVE" ? "#fff" : "#111" }}>{stats.active}</span>
            </div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: statusFilter === "ACTIVE" ? "rgba(255,255,255,0.8)" : "#666" }}>Aktif</span>
          </button>

          <button
            onClick={() => setStatusFilter("CLOSED")}
            style={{
              padding: "20px",
              background: statusFilter === "CLOSED" ? "#00205B" : "#fff",
              border: "none",
              borderRadius: "14px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <CheckCircle className="w-6 h-6" style={{ color: statusFilter === "CLOSED" ? "#fff" : "#16a34a" }} />
              <span style={{ fontSize: "24px", fontWeight: 800, color: statusFilter === "CLOSED" ? "#fff" : "#111" }}>{stats.closed}</span>
            </div>
            <span style={{ fontSize: "14px", fontWeight: 600, color: statusFilter === "CLOSED" ? "rgba(255,255,255,0.8)" : "#666" }}>Selesai</span>
          </button>
        </div>

        {/* Chat Layout */}
        <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", height: "calc(100vh - 280px)", display: "flex", overflow: "hidden" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
              <div style={{ width: "40px", height: "40px", border: "4px solid #eee", borderTopColor: "#FF5E00", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            <>
              {/* Conversation List */}
              <div style={{
                width: activeConversation ? "350px" : "100%",
                borderRight: activeConversation ? "1px solid #eee" : "none",
                display: "flex",
                flexDirection: "column",
                transition: "width 0.3s ease",
              }}>
                {/* Search */}
                <div style={{ padding: "16px", borderBottom: "1px solid #eee" }}>
                  <div style={{ position: "relative" }}>
                    <Search className="w-4 h-4" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                    <input
                      type="text"
                      placeholder="Cari pelamar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 12px 10px 36px",
                        border: "2px solid #eee",
                        borderRadius: "10px",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* List */}
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {filteredConversations.length === 0 ? (
                    <div style={{ padding: "60px 20px", textAlign: "center" }}>
                      <MessageCircle className="w-12 h-12" style={{ color: "#ccc", margin: "0 auto 16px" }} />
                      <p style={{ color: "#666" }}>Tidak ada percakapan</p>
                    </div>
                  ) : (
                    filteredConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => openConversation(conv)}
                        style={{
                          width: "100%",
                          padding: "16px",
                          border: "none",
                          borderBottom: "1px solid #f1f5f9",
                          background: activeConversation?.id === conv.id ? "#f8f9fa" : "#fff",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div style={{ width: "48px", height: "48px", background: "#FF5E00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ color: "#fff", fontWeight: 700, fontSize: "16px" }}>
                            {conv.applicantName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "#111" }}>{conv.applicantName}</span>
                            <span style={{ fontSize: "11px", color: "#888" }}>{formatTime(conv.lastMessageAt)}</span>
                          </div>
                          <p style={{ fontSize: "13px", color: "#666", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {conv.messages[0]?.message || "Mulai percakapan baru"}
                          </p>
                        </div>
                        {conv.unreadCount && conv.unreadCount > 0 && (
                          <span style={{
                            background: "#ef4444",
                            color: "#fff",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "4px 8px",
                            borderRadius: "10px",
                            minWidth: "20px",
                            textAlign: "center",
                          }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Panel */}
              {activeConversation && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Chat Header */}
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "44px", height: "44px", background: "#FF5E00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User className="w-5 h-5" style={{ color: "#fff" }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111", margin: 0 }}>{activeConversation.applicantName}</h3>
                        <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>{activeConversation.applicantEmail}</p>
                      </div>
                    </div>
                    <button
                      onClick={closeConversation}
                      style={{
                        padding: "8px",
                        background: "#f1f5f9",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <X className="w-5 h-5" style={{ color: "#64748b" }} />
                    </button>
                  </div>

                  {/* Messages */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#f8f9fa" }}>
                    {messages.map((msg) => {
                      const isMe = msg.senderType === "HR_ADMIN";
                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: "flex",
                            justifyContent: isMe ? "flex-end" : "flex-start",
                            marginBottom: "16px",
                          }}
                        >
                          <div style={{
                            maxWidth: "70%",
                            display: "flex",
                            flexDirection: isMe ? "row-reverse" : "row",
                            alignItems: "flex-end",
                            gap: "10px",
                          }}>
                            {!isMe && (
                              <div style={{ width: "32px", height: "32px", background: "#FF5E00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <User className="w-4 h-4" style={{ color: "#fff" }} />
                              </div>
                            )}
                            <div>
                              <div style={{
                                background: isMe ? "linear-gradient(135deg, #00205B, #003380)" : "#fff",
                                color: isMe ? "#fff" : "#333",
                                padding: "12px 16px",
                                borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                              }}>
                                <p style={{ fontSize: "14px", margin: 0, lineHeight: 1.5 }}>{msg.message}</p>
                              </div>
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                marginTop: "6px",
                                justifyContent: isMe ? "flex-end" : "flex-start",
                              }}>
                                <span style={{ fontSize: "11px", color: "#999" }}>{formatTime(msg.createdAt)}</span>
                                {isMe && (
                                  <CheckCircle className="w-3 h-3" style={{ color: "#16a34a" }} />
                                )}
                              </div>
                            </div>
                            {isMe && (
                              <div style={{ width: "32px", height: "32px", background: "#00205B", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: "11px", color: "#fff", fontWeight: 700 }}>HR</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendReply} style={{ padding: "16px", borderTop: "1px solid #eee", background: "#fff" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                      <input
                        type="text"
                        placeholder="Ketik balasan..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "14px 18px",
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
                          width: "48px",
                          height: "48px",
                          background: newMessage.trim() ? "#16a34a" : "#ddd",
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
                          <div style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                        ) : (
                          <Send className="w-5 h-5" style={{ color: "#fff" }} />
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Empty State */}
              {!activeConversation && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, padding: "40px", textAlign: "center" }}>
                  <div>
                    <MessageCircle className="w-16 h-16" style={{ color: "#ddd", margin: "0 auto 16px" }} />
                    <p style={{ color: "#888", fontSize: "14px" }}>Pilih percakapan untuk memulai chat</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #FF5E00 !important; }
      `}</style>
    </div>
  );
}
