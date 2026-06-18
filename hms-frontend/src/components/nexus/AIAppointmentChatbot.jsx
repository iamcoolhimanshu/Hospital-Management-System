import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  IconButton,
  Paper,
  Typography,
  TextField,
  Chip,
  Avatar,
  CircularProgress,
  Button,
  Zoom,
  Slide,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useLocation } from "react-router-dom";
import axios from "axios";
import environment from "../../config/environment";
import { useTheme } from "../../hooks/useTheme";

const G = {
  accent: "#16a064",
  accentDark: "#0d6b45",
  accentLight: "#bbf7d0",
  accentSoft: "#f0fdf4",
  border: "#e2e8f0",
  muted: "#64748b",
  headerBg: "linear-gradient(135deg, #0d6b45 0%, #16a064 45%, #22c77a 80%)",
};

export default function AIAppointmentChatbot() {
  const { isDark } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isHospitalRoute = location.pathname.startsWith("/hospital");
// Maintain unique session ID in sessionStorage
  const [sessionId] = useState(() => {
    let id = sessionStorage.getItem("hms_chat_session_id");
    if (!id) {
      id = "session_" + Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem("hms_chat_session_id", id);
    }
    return id;
  });

  const messagesEndRef = useRef(null);

  // Load chat history from backend on mount
  useEffect(() => {
    axios
      .get(`${environment.backendUrl}/api/ai/history/${sessionId}`)
      .then((r) => {
        const history = r.data || [];
        if (history.length === 0) {
          // Add default welcome message if history is empty
          setMessages([
            {
              sender: "bot",
              reply: "Hello! I am your HMS AI Assistant. How can I help you today? You can describe symptoms, ask for doctor availability, book/cancel/reschedule appointments, or ask about hospital timings.",
              action: "GENERAL_QUERY",
              data: {},
            },
          ]);
        } else {
          // Map DB history model to frontend message structure
          const mapped = history.map((h) => {
            const isUser = h.action === "USER_MESSAGE";
            return {
              sender: isUser ? "user" : "bot",
              reply: h.reply,
              action: h.action,
              data: h.data || {},
            };
          });
          setMessages(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err);
      });
  }, [sessionId]);

  // Scroll to bottom when messages or open state change
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [messages, open, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    // If sent from text input, clear it
    if (!textToSend) setInput("");

    // 1. Add user message locally
    setMessages((prev) => [...prev, { sender: "user", reply: text }]);
    setLoading(true);

    try {
      // 2. Call backend AI chat API
      const r = await axios.post(`${environment.backendUrl}/api/ai/chat`, {
        message: text,
        sessionId: sessionId,
      });

      // 3. Add bot reply locally
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          reply: r.data.reply,
          action: r.data.action,
          data: r.data.data || {},
        },
      ]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          reply: "I'm having trouble connecting to the service. Please try again in a few moments.",
          action: "GENERAL_QUERY",
          data: {},
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (msg) => {
    handleSend(msg);
  };

  const handleSlotClick = (slotTime, docName, dateStr) => {
    // Automatically trigger booking flow by sending chat request
    const bookMsg = `Book slot ${slotTime} on ${dateStr} with ${docName}`;
    handleSend(bookMsg);
  };

  const suggestedChips = [
    "Book Appointment",
    "Available Doctors",
    "I have fever",
    "Reschedule Appointment",
    "Hospital Timings",
  ];

  return (
    <Box sx={{ position: "fixed", bottom: 24, right: isHospitalRoute ? 140 : 24, zIndex: 9999 }}>
      {/* Floating Action Button */}
      <Zoom in={!open}>
        <IconButton
          onClick={() => setOpen(true)}
          sx={{
            background: G.headerBg,
            color: "#fff",
            width: 56,
            height: 56,
            boxShadow: "0px 4px 20px rgba(22, 160, 100, 0.4)",
            "&:hover": {
              background: G.accentDark,
              transform: "scale(1.08)",
            },
            transition: "all 0.2s ease",
            animation: "pulse 2.5s infinite alternate",
            "@keyframes pulse": {
              "0%": { boxShadow: "0 0 0 0 rgba(22, 160, 100, 0.4)" },
              "100%": { boxShadow: "0 0 0 12px rgba(22, 160, 100, 0)" },
            },
          }}
        >
          <ChatIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Zoom>

      {/* Chat Window */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: { xs: "calc(100vw - 32px)", sm: 400 },
            height: { xs: "75vh", sm: 550 },
            maxHeight: 600,
            borderRadius: 3,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: isDark
              ? "0px 10px 40px rgba(0,0,0,0.6)"
              : "0px 10px 40px rgba(0,0,0,0.15)",
            background: isDark ? "#1E293B" : "#fff",
            border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: G.headerBg,
              color: "#fff",
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.25)",
                  color: "#fff",
                  width: 40,
                  height: 40,
                }}
              >
                <SmartToyIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  HMS Assistant
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  Active Care Agent · Online
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages List Area */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: isDark ? "#0F172A" : "#f8fafc",
              "&::-webkit-scrollbar": { width: 5 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: isDark ? "#334155" : "#cbd5e1",
                borderRadius: 3,
              },
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.sender === "user";
              return (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                    maxWidth: "90%",
                    alignSelf: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      flexDirection: isUser ? "row-reverse" : "row",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: isUser
                          ? "#3b82f6"
                          : "rgba(22, 160, 100, 0.15)",
                        color: isUser ? "#fff" : G.accent,
                        fontSize: 14,
                      }}
                    >
                      {isUser ? <AccountCircleIcon /> : <SmartToyIcon sx={{ fontSize: 18 }} />}
                    </Avatar>

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: isUser
                          ? "18px 18px 0px 18px"
                          : "18px 18px 18px 0px",
                        bgcolor: isUser
                          ? "#3b82f6"
                          : isDark
                          ? "#1E293B"
                          : "#fff",
                        color: isUser ? "#fff" : isDark ? "#F1F5F9" : "#1E293B",
                        boxShadow: isDark
                          ? "0 2px 8px rgba(0,0,0,0.4)"
                          : "0 2px 8px rgba(0,0,0,0.06)",
                        fontSize: "0.92rem",
                        lineHeight: 1.4,
                      }}
                    >
                      {m.reply}
                    </Box>
                  </Box>

                  {/* Render Custom Action Cards */}
                  {!isUser && m.action === "CHECK_SLOTS" && m.data?.slots && (
                    <Box
                      sx={{
                        mt: 1.5,
                        ml: 4,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isDark ? "#1E293B" : "#fff",
                        border: `1px solid ${isDark ? "#334155" : G.border}`,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        maxWidth: 320,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <CalendarTodayIcon sx={{ color: G.accent, fontSize: 18 }} />
                        <Typography variant="subtitle2" fontWeight={700}>
                          {m.data.doctorName}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                        Specialization: {m.data.specialization} <br />
                        Date: {m.data.date}
                      </Typography>

                      <Typography variant="caption" fontWeight={600} display="block" mb={1}>
                        Available Slots:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                        {m.data.slots.length === 0 ? (
                          <Typography variant="caption" color="error">
                            No slots available. Try another day.
                          </Typography>
                        ) : (
                          m.data.slots.map((sTime) => (
                            <Chip
                              key={sTime}
                              label={sTime}
                              onClick={() =>
                                handleSlotClick(
                                  sTime,
                                  m.data.doctorName,
                                  m.data.date
                                )
                              }
                              variant="outlined"
                              size="small"
                              sx={{
                                color: G.accent,
                                borderColor: G.accent,
                                fontWeight: 600,
                                cursor: "pointer",
                                "&:hover": {
                                  bgcolor: G.accentSoft,
                                  color: G.accentDark,
                                },
                              }}
                            />
                          ))
                        )}
                      </Box>
                    </Box>
                  )}

                  {!isUser && m.action === "BOOK_APPOINTMENT" && m.data?.appointmentNumber && (
                    <Box
                      sx={{
                        mt: 1.5,
                        ml: 4,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isDark ? "rgba(22, 160, 100, 0.15)" : G.accentSoft,
                        border: `1px solid ${isDark ? "rgba(22, 160, 100, 0.3)" : G.accentLight}`,
                        display: "flex",
                        gap: 1.5,
                        maxWidth: 320,
                      }}
                    >
                      <CheckCircleIcon sx={{ color: G.accent, mt: 0.2 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color={isDark ? "#4ade80" : G.accentDark}>
                          Booking Confirmed!
                        </Typography>
                        <Box sx={{ mt: 0.5, fontSize: "0.8rem", color: isDark ? "#cbd5e1" : "#475569" }}>
                          <div><strong>Ref:</strong> {m.data.appointmentNumber}</div>
                          <div><strong>Doctor:</strong> {m.data.doctorName}</div>
                          <div><strong>Date:</strong> {m.data.date}</div>
                          <div><strong>Time:</strong> {m.data.startTime}</div>
                          <div><strong>Status:</strong> {m.data.status}</div>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {!isUser && m.action === "CANCEL_APPOINTMENT" && m.data?.appointmentNumber && (
                    <Box
                      sx={{
                        mt: 1.5,
                        ml: 4,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isDark ? "rgba(239, 68, 68, 0.15)" : "#fef2f2",
                        border: `1px solid ${isDark ? "rgba(239, 68, 68, 0.3)" : "#fecaca"}`,
                        display: "flex",
                        gap: 1.5,
                        maxWidth: 320,
                      }}
                    >
                      <CancelIcon sx={{ color: "#ef4444", mt: 0.2 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color={isDark ? "#f87171" : "#b91c1c"}>
                          Appointment Cancelled
                        </Typography>
                        <Box sx={{ mt: 0.5, fontSize: "0.8rem", color: isDark ? "#cbd5e1" : "#475569" }}>
                          <div><strong>Ref:</strong> {m.data.appointmentNumber}</div>
                          <div><strong>Status:</strong> CANCELLED</div>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {!isUser && m.action === "RESCHEDULE_APPOINTMENT" && m.data?.appointmentNumber && (
                    <Box
                      sx={{
                        mt: 1.5,
                        ml: 4,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: isDark ? "rgba(59, 130, 246, 0.15)" : "#eff6ff",
                        border: `1px solid ${isDark ? "rgba(59, 130, 246, 0.3)" : "#bfdbfe"}`,
                        display: "flex",
                        gap: 1.5,
                        maxWidth: 320,
                      }}
                    >
                      <CheckCircleIcon sx={{ color: "#3b82f6", mt: 0.2 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color={isDark ? "#60a5fa" : "#1d4ed8"}>
                          Rescheduled Successfully!
                        </Typography>
                        <Box sx={{ mt: 0.5, fontSize: "0.8rem", color: isDark ? "#cbd5e1" : "#475569" }}>
                          <div><strong>New Ref:</strong> {m.data.appointmentNumber}</div>
                          {m.data.oldAppointmentNumber && (
                            <div><strong>Old Ref:</strong> {m.data.oldAppointmentNumber} (Cancelled)</div>
                          )}
                          <div><strong>New Date:</strong> {m.data.date}</div>
                          <div><strong>New Time:</strong> {m.data.startTime}</div>
                          <div><strong>Status:</strong> {m.data.status}</div>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}

            {/* Bouncing Typing Indicator */}
            {loading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: "rgba(22, 160, 100, 0.15)",
                    color: G.accent,
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 18 }} />
                </Avatar>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "18px 18px 18px 0px",
                    bgcolor: isDark ? "#1E293B" : "#fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: G.accent,
                      animation: "bounce 1.4s infinite ease-in-out both",
                      "@keyframes bounce": {
                        "0%, 80%, 100%": { transform: "scale(0)" },
                        "40%": { transform: "scale(1)" },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: G.accent,
                      animation: "bounce 1.4s infinite ease-in-out both 0.2s",
                    }}
                  />
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: G.accent,
                      animation: "bounce 1.4s infinite ease-in-out both 0.4s",
                    }}
                  />
                </Box>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Quick Suggestions Chips Area */}
          <Box
            sx={{
              p: 1.2,
              display: "flex",
              gap: 0.8,
              overflowX: "auto",
              bgcolor: isDark ? "#1E293B" : "#f1f5f9",
              borderTop: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
              "&::-webkit-scrollbar": { height: 4 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: isDark ? "#475569" : "#cbd5e1",
                borderRadius: 2,
              },
            }}
          >
            {suggestedChips.map((chipText) => (
              <Chip
                key={chipText}
                label={chipText}
                onClick={() => handleChipClick(chipText)}
                size="small"
                sx={{
                  bgcolor: isDark ? "#334155" : "#fff",
                  color: isDark ? "#E2E8F0" : G.accentDark,
                  border: isDark ? "1px solid #475569" : `1px solid ${G.border}`,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: G.accentSoft,
                    borderColor: G.accent,
                    color: G.accentDark,
                  },
                }}
              />
            ))}
          </Box>

          {/* Input Box Area */}
          <Box
            sx={{
              p: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: isDark ? "#1E293B" : "#fff",
              borderTop: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  bgcolor: isDark ? "#0F172A" : "#f8fafc",
                  "& fieldset": {
                    borderColor: isDark ? "#334155" : "#cbd5e1",
                  },
                  "&:hover fieldset": {
                    borderColor: G.accent,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: G.accent,
                  },
                },
                "& .MuiInputBase-input": {
                  fontSize: "0.92rem",
                  color: isDark ? "#F8FAFC" : "#1E293B",
                },
              }}
            />
            <IconButton
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              sx={{
                bgcolor: G.accent,
                color: "#fff",
                "&:hover": {
                  bgcolor: G.accentDark,
                },
                "&.Mui-disabled": {
                  bgcolor: isDark ? "#334155" : "#e2e8f0",
                  color: isDark ? "#475569" : "#cbd5e1",
                },
                borderRadius: 2.5,
                p: 1,
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
}
