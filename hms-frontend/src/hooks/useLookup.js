import { useState, useEffect } from "react";
import API from "../api/api";

export function useLookup(configs = []) {
  const [data, setData] = useState({});

  useEffect(() => {
    if (!configs || configs.length === 0) return;
    configs.forEach(({ code, endpoint }) => {
      if (!endpoint) return;
      API.get(endpoint)
        .then((r) => {
          setData((prev) => ({ ...prev, [code]: r.data || [] }));
        })
        .catch(() => {
          setData((prev) => ({ ...prev, [code]: [] }));
        });
    });
  }, []);

  const getValues = (code) => data[code] || [];

  return { getValues };
}
