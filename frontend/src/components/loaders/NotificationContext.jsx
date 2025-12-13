// NotificationContext.js
import { createContext, useContext, useCallback, useMemo, useState, useEffect } from "react";
import { createPortal } from 'react-dom';
import './notif.css'
import { subscribe, notify as busNotify } from './notifyBus';

const NotifyContext = createContext();

export const useNotify = () => useContext(NotifyContext);

function NotificationsPortal() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsub = subscribe((payload) => {
      const id = Date.now() + Math.random();
      const m = { id, ...payload };
      setMessages((prev) => [...prev, m]);
      setTimeout(() => {
        setMessages((prev) => prev.filter((x) => x.id !== id));
      }, payload.duration || 5000);
    });

    return unsub;
  }, []);

  return createPortal(
    <div className="notifications">
      {messages.map((m) => (
        <div key={m.id} className={`toast ${m.type}`}>
          {m.text}
        </div>
      ))}
    </div>,
    document.body
  );
}

export function NotifyProvider({ children }) {
  const notify = useCallback((type, text, duration = 5000) => {
    busNotify(type, text, duration);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotifyContext.Provider value={value}>
      {children}
      <NotificationsPortal />
    </NotifyContext.Provider>
  );
}
