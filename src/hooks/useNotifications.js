import { useCallback, useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, where, writeBatch } from "firebase/firestore";
import { firebaseDb } from "../firebase";
import { useAuth } from "../context/AuthContext";

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return undefined;
    }

    const notificationRef = collection(firebaseDb, "notificationStates");
    const notificationQuery = query(
      notificationRef,
      where("userId", "==", user.id),
      where("read", "==", false),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      notificationQuery,
      (snapshot) => {
        const items = snapshot.docs.map((snap) => ({
          id: snap.id,
          ...snap.data(),
        }));
        setNotifications(items);
        setLoading(false);
      },
      (err) => {
        console.error("Error al escuchar notificaciones:", err);
        setError(err);
        setNotifications([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  const clearNotifications = useCallback(async () => {
    if (!user?.id || notifications.length === 0) return;

    try {
      const batch = writeBatch(firebaseDb);
      notifications.forEach((note) => {
        batch.delete(doc(firebaseDb, "notificationStates", note.id));
      });
      await batch.commit();
    } catch (err) {
      console.error("Error al limpiar notificaciones:", err);
      setError(err);
    }
  }, [notifications, user?.id]);

  return {
    notifications,
    loading,
    error,
    clearNotifications,
  };
}
