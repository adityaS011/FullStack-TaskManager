"use client";

import { useEffect, useRef } from "react";

import { api } from "@/lib/api";
import { TaskRealtimeEvent } from "@/types/task";

const maxReconnectDelay = 10000;

export function useTaskRealtime(
  token: string | null,
  onTaskEvent: (event: TaskRealtimeEvent) => void,
) {
  const callbackRef = useRef(onTaskEvent);

  useEffect(() => {
    callbackRef.current = onTaskEvent;
  }, [onTaskEvent]);

  useEffect(() => {
    if (!token || typeof window === "undefined") return;

    const wsToken = token;
    let closed = false;
    let reconnectTimer: number | undefined;
    let retries = 0;
    let socket: WebSocket | null = null;

    function connect() {
      socket = new WebSocket(api.taskEventsURL(wsToken));

      socket.onopen = () => {
        retries = 0;
      };

      socket.onmessage = (message) => {
        const event = parseTaskEvent(message.data);
        if (event) callbackRef.current(event);
      };

      socket.onerror = () => socket?.close();
      socket.onclose = () => {
        if (closed) return;
        const delay = Math.min(1000 * 2 ** retries, maxReconnectDelay);
        retries += 1;
        reconnectTimer = window.setTimeout(connect, delay);
      };
    }

    connect();

    return () => {
      closed = true;
      window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [token]);
}

function parseTaskEvent(data: string) {
  try {
    const event = JSON.parse(data) as TaskRealtimeEvent;
    return event.type.startsWith("task.") ? event : null;
  } catch {
    return null;
  }
}
