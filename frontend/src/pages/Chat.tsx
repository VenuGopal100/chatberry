import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  createConversation,
  deleteAllChats,
  deleteConversation,
  getConversation,
  listConversations,
  sendMessage,
  uploadConversationFile,
  type ConversationSummary,
  type ChatItem
} from "../helpers/api-functions";
import { useAuth } from "../context/AuthContext";
import MarkdownMessage from "../components/MarkdownMessage";
import { Paperclip, Volume2, VolumeX } from "lucide-react";

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:120ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:240ms]" />
    </span>
  );
}

function speak(text: string) {
  if (!("speechSynthesis" in window)) {
    toast.error("Text-to-speech not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1;
  utter.pitch = 1;
  utter.lang = "en-US";
  window.speechSynthesis.speak(utter);
}

export default function Chat() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ file state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [attachedFileText, setAttachedFileText] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  // ✅ voice state
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const activeTitle = useMemo(
    () => conversations.find((c) => c.id === activeId)?.title || "Chat",
    [conversations, activeId]
  );

  async function refreshConversations(selectId?: string) {
    const data = await listConversations();
    setConversations(data.conversations || []);
    if (selectId) setActiveId(selectId);
  }

  async function loadConversation(conversationId: string) {
    try {
      setLoading(true);
      setActiveId(conversationId);
      const data = await getConversation(conversationId);
      setMessages(data.conversation.messages || []);
      // reset file attachment when switching chats
      setAttachedFileName(null);
      setAttachedFileText(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load conversation");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const data = await listConversations();
        setConversations(data.conversations || []);

        if (!data.conversations || data.conversations.length === 0) {
          const created = await createConversation();
          await refreshConversations(created.conversation.id);
          await loadConversation(created.conversation.id);
        } else {
          await loadConversation(data.conversations[0].id);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to initialize chat");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleNewChat() {
    try {
      const created = await createConversation();
      await refreshConversations(created.conversation.id);
      setMessages([]);
      setActiveId(created.conversation.id);
      setAttachedFileName(null);
      setAttachedFileText(null);
      toast.success("New chat created");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create chat");
    }
  }

  async function handlePickFile(file: File) {
    if (!activeId) return toast.error("Open a chat first");

    setUploadingFile(true);
    setAttachedFileName(file.name);
    setAttachedFileText(null);

    try {
      const data = await uploadConversationFile(activeId, file);
      // limit stored text size in client to avoid huge payloads
      const trimmed = (data.fileText || "").trim();
      setAttachedFileText(trimmed.slice(0, 12000));
      toast.success(`File loaded: ${data.fileName}`);
    } catch (err: any) {
      setAttachedFileName(null);
      setAttachedFileText(null);
      toast.error(err?.response?.data?.message || "Failed to read file");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSend() {
    if (!activeId) return;
    if (!message.trim() || loading) return;

    const optimisticUser: ChatItem = {
      role: "user",
      content: message.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticUser]);
    const toSend = message.trim();
    setMessage("");
    setLoading(true);

    try {
      const data = await sendMessage(activeId, toSend, attachedFileText || undefined);
      setMessages(data.conversation.messages || []);
      await refreshConversations(activeId);

      // ✅ If voice enabled, speak last assistant message
      if (voiceEnabled) {
        const last = [...(data.conversation.messages || [])].reverse().find((m) => m.role === "assistant");
        if (last?.content) speak(last.content);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex">
      {/* Sidebar */}
      <div className="w-72 border-r border-zinc-800 bg-zinc-950 hidden sm:flex flex-col">
        <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="font-semibold">Chats</div>
          <button
            onClick={handleNewChat}
            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm"
          >
            New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => loadConversation(c.id)}
              className={[
                "w-full text-left px-3 py-2 rounded-xl border text-sm",
                c.id === activeId
                  ? "bg-zinc-900 border-zinc-700"
                  : "bg-transparent border-transparent hover:bg-zinc-900/60 hover:border-zinc-800"
              ].join(" ")}
              title={c.title}
            >
              <div className="truncate">{c.title}</div>
              <div className="text-xs text-zinc-500 mt-1">{new Date(c.updatedAt).toLocaleString()}</div>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-zinc-800 space-y-2">
          <div className="text-xs text-zinc-400 truncate">Logged in: {user?.email}</div>

          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            className="w-full px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm flex items-center justify-center gap-2"
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            Voice answers: {voiceEnabled ? "ON" : "OFF"}
          </button>

          <button
            onClick={async () => {
              try {
                await deleteAllChats();
                toast.success("Cleared all chats");
                setConversations([]);
                setMessages([]);
                setActiveId(null);
                await handleNewChat();
              } catch (err: any) {
                toast.error(err?.response?.data?.message || "Failed to clear chats");
              }
            }}
            className="w-full px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm"
          >
            Clear all
          </button>

          {activeId && (
            <button
              onClick={async () => {
                try {
                  await deleteConversation(activeId);
                  toast.success("Deleted chat");
                  const data = await listConversations();
                  setConversations(data.conversations || []);
                  if (data.conversations?.length) {
                    await loadConversation(data.conversations[0].id);
                  } else {
                    await handleNewChat();
                  }
                } catch (err: any) {
                  toast.error(err?.response?.data?.message || "Failed to delete chat");
                }
              }}
              className="w-full px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm"
            >
              Delete current
            </button>
          )}

          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="w-full px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm"
          >
            Logout
          </button>

          <Link to="/" className="block text-center text-xs text-zinc-500 hover:underline">
            Home
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur flex items-center justify-between px-4">
          <div className="font-semibold truncate">{activeTitle}</div>

          {/* File controls (top right) */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePickFile(f);
              }}
              accept=".txt,.md,.csv,.json,.docx"

            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!activeId || uploadingFile}
              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm flex items-center gap-2 disabled:opacity-60"
              title="Attach a file"
            >
              <Paperclip size={16} />
              {uploadingFile ? "Reading..." : "Attach"}
            </button>
          </div>
        </div>

        {/* Attachment banner */}
        {(attachedFileName || attachedFileText) && (
          <div className="border-b border-zinc-800 bg-zinc-900/40 px-4 py-2 text-sm text-zinc-300">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
              <div className="truncate">
                <span className="text-zinc-400">Attached:</span>{" "}
                <span className="font-medium">{attachedFileName}</span>{" "}
                {attachedFileText ? (
                  <span className="text-zinc-500">({attachedFileText.length} chars)</span>
                ) : (
                  <span className="text-zinc-500">(no text extracted)</span>
                )}
              </div>
              <button
                onClick={() => {
                  setAttachedFileName(null);
                  setAttachedFileText(null);
                  toast.success("Attachment removed");
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            {messages.map((m, idx) => {
              const isUser = m.role === "user";
              return (
                <div key={idx} className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={[
                      "max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed border",
                      isUser
                        ? "bg-emerald-600/15 border-emerald-500/30"
                        : "bg-zinc-900 border-zinc-800"
                    ].join(" ")}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap break-words">{m.content}</div>
                    ) : (
                      <div className="space-y-2">
                        <MarkdownMessage content={m.content} />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => speak(m.content)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs"
                            title="Read aloud"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Volume2 size={14} /> Speak
                            </span>
                          </button>
                          <button
                            onClick={() => window.speechSynthesis.cancel()}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs"
                            title="Stop speaking"
                          >
                            Stop
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="w-full flex justify-start">
                <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm border bg-zinc-900 border-zinc-800">
                  <div className="text-zinc-400 flex items-center gap-2">
                    Assistant typing <TypingDots />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800 bg-zinc-950/80 backdrop-blur">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={attachedFileText ? "Ask about the attached file..." : "Message Groq assistant..."}
                className="flex-1 min-h-[44px] max-h-36 resize-none rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 outline-none focus:border-emerald-600"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !message.trim() || !activeId}
                className="h-11 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 font-medium"
              >
                Send
              </button>
            </div>

            <div className="text-xs text-zinc-500 mt-2">
              Enter to send, Shift+Enter new line. Attach .pdf/.docx/.txt etc to ask questions from it.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
