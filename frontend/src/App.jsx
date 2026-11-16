import { Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { ToastProvider } from "./hooks/useToast.jsx";
import { TOOLS } from "./tools.js";
import Home from "./pages/Home.jsx";
import Tools from "./pages/Tools.jsx";
import About from "./pages/About.jsx";
import Feedback from "./pages/Feedback.jsx";
import { Privacy, Terms } from "./pages/Legal.jsx";
import NotFound from "./pages/NotFound.jsx";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 50);
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <ScrollManager />
      <div className="bg-orbs" aria-hidden="true" />
      <Navbar />
      <main>
        <Suspense fallback={<div className="center" style={{ padding: 120 }}><span className="spinner" /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools" element={<Tools />} />
            {TOOLS.map((t) => <Route key={t.id} path={t.path} element={<t.component />} />)}
            <Route path="/about" element={<About />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </ToastProvider>
  );
}
