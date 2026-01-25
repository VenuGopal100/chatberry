import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center px-4">
      <div className="text-center">
        <div className="text-5xl font-bold">404</div>
        <div className="text-zinc-400 mt-2">Page not found</div>
        <Link to="/" className="inline-block mt-6 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700">
          Go Home
        </Link>
      </div>
    </div>
  );
}
