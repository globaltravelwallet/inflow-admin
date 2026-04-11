"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/axios";

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  url: string | null,
  params?: Record<string, unknown>
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!!url);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const paramsKey = params ? JSON.stringify(params) : "";

  const fetchData = useCallback(async () => {
    if (!url) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<T>(url, {
        params,
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setData(response.data);
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "CanceledError") return;
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (err as { response: { data: { message: string } } }).response.data
              .message
          : "Failed to fetch data";
      if (!controller.signal.aborted) {
        setError(message);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, paramsKey]);

  useEffect(() => {
    fetchData();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
