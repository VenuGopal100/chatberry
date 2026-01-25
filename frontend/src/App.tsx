import { Navigate, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center">
        <div className="text-sm text-zinc-400">Checking session...</div>
      </div>
    );
  }
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
