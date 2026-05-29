import { useEffect, useState } from "react";
import { listenCollection } from "../services/firebase/db";

export default function useCollection(name, limit = 10) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = listenCollection(name, (items) => {
      setData(items);
      setLoading(false);
    }, limit);

    return () => unsub();
  }, [name]);

  return { data, loading };
}