import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

const ToastCtx = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((type, message) => {
    const id = nextId++;
    setToasts((t) => [...t.slice(-3), { id, type, message }]);
    setTimeout(() => remove(id), 5000);
  }, [remove]);
  const api = { success: (m) => push("success", m), error: (m) => push("error", m) };
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{t.message}</span>
            <button aria-label="Dismiss" onClick={() => remove(t.id)}><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
