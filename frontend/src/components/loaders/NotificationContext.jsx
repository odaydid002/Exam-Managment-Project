// NotificationContext.js
import { createContext, useContext, useState } from "react";
import './notif.css'

const NotifyContext = createContext();

export const useNotify = () => useContext(NotifyContext);

export function NotifyProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const notify = (type, text, duration = 5000) => {
    const id = Date.now();
    setMessages((prev) => [...prev, { id, type, text }]);

    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, duration);
  };

  return (
    <NotifyContext.Provider value={{ notify }}>
      {children}
      <div className="notifications">
        {messages.map((m) => (
          <div key={m.id} className={`toast ${m.type}`}>
            {m.text}
          </div>
        ))}
      </div>
    </NotifyContext.Provider>
  );
}
