import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { NotificationContext } from "@/hooks/useNotification";
import NotificationPopup from "@/components/NotificacionPopup/NotificationPopup";

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const timeoutRef = useRef(null);

  const notify = (message) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setNotification(message);
    timeoutRef.current = setTimeout(() => {
      setNotification(null);
      timeoutRef.current = null;
    }, 5000);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {notification &&
        createPortal(<NotificationPopup title={notification} />, document.body)}
    </NotificationContext.Provider>
  );
}
