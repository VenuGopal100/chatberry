import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow">
        <h2 className="text-2xl font-semibold">Login</h2>
        <p className="text-sm text-zinc-400 mt-1">Access your chat history.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            try {
              await login(email, password);
              navigate("/chat");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <div>
            <label className="text-sm text-zinc-300">Email</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-emerald-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="text-sm text-zinc-300">Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 outline-none focus:border-emerald-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-3 py-2 font-medium"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-zinc-400 mt-4">
          No account?{" "}
          <Link to="/signup" className="text-emerald-400 hover:underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
}
