import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="text-lg font-semibold">Groq Chat</div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <div className="text-sm text-zinc-400">Hi, {user?.name}</div>
              <button
                onClick={async () => {
                  await logout();
                  navigate("/login");
                }}
                className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm"
              >
                Logout
              </button>
              <Link
                to="/chat"
                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm"
              >
                Go to Chat
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm">
                Login
              </Link>
              <Link to="/signup" className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">ChatGPT-like MERN Chatbot (Groq)</h1>
        <p className="mt-4 text-zinc-400 max-w-2xl">
          Clean UI, HTTP-only cookie auth, and persistent chat history per user.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            to={isLoggedIn ? "/chat" : "/login"}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500"
          >
            Start chatting
          </Link>
        </div>
      </div>
    </div>
  );
}
