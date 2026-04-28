import { useState } from "react";
import { createPortal } from "react-dom";
import { NotificationContext } from "@/hooks/useNotification";
import NotificationPopup from "@/components/NotificacionPopup/NotificationPopup";

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const notify = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {notification &&
        createPortal(<NotificationPopup title={notification} />, document.body)}
    </NotificationContext.Provider>
  );
}
