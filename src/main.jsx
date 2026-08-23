import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import Navbar from "@/components/Navbar";

const Landing = lazy(() => import("./pages/Landing"));
const AuthPage = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Booking = lazy(() => import("./pages/Booking"));
const Contact = lazy(() => import("./pages/Contact"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

function RouteLoading() {
  return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
}

class ToolbarErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.warn("[VlyToolbar]", err.message); }
  render() { return this.state.hasError ? null : this.props.children; }
}

class RootErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, message: "", stack: "" }; }
  static getDerivedStateFromError(error) { return { hasError: true, message: error.message || "Error", stack: error.stack || "" }; }
  componentDidCatch(err) { console.error("[Preview] Root crash:", err); }
  render() {
    if (this.state.hasError) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6"><div className="max-w-lg text-center"><p className="text-sm font-semibold">Runtime error</p><p className="mt-2 text-xs text-muted-foreground break-words">{this.state.message}</p></div></div>;
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => { window.parent.postMessage({ type: "iframe-route-change", path: location.pathname }, "*"); }, [location.pathname]);
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  return null;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary><VlyToolbar /></ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<><Navbar /><Landing /></>} />
              <Route path="/contact" element={<><Navbar /><Contact /></>} />
              <Route path="/portfolio" element={<><Navbar /><Portfolio /></>} />
              <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/booking" element={<RequireAuth><Booking /></RequireAuth>} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="*" element={<><Navbar /><NotFound /></>} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
