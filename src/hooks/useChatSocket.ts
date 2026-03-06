import { useEffect, useRef, useState, useCallback } from "react";
import { getChatWebSocketUrl } from "../api/api";

export interface ChatMessage {
    sender_id: string;
    content: string;
}

/**
 * Manages a persistent WebSocket connection to the chat endpoint.
 * Messages sent before the socket is OPEN are queued and flushed on connect.
 *
 * @param myUserId - The current user's ID. Pass null to skip connecting.
 */
export function useChatSocket(myUserId: string | null) {
    const wsRef = useRef<WebSocket | null>(null);
    const pendingQueue = useRef<string[]>([]); // buffered messages waiting for onopen
    const [lastMessage, setLastMessage] = useState<ChatMessage | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!myUserId) return;

        let ws: WebSocket;
        try {
            ws = new WebSocket(getChatWebSocketUrl(myUserId));
        } catch (e) {
            console.error("[useChatSocket] Failed to create WebSocket:", e);
            return;
        }

        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            // Flush any messages that were queued before the socket opened
            while (pendingQueue.current.length > 0) {
                const payload = pendingQueue.current.shift()!;
                try {
                    ws.send(payload);
                } catch (err) {
                    console.error("[useChatSocket] Failed to flush queued message:", err);
                }
            }
        };

        ws.onmessage = (event) => {
            try {
                const data: ChatMessage = JSON.parse(event.data);
                setLastMessage(data);
            } catch {
                // ignore malformed frames
            }
        };

        ws.onerror = (err) => {
            console.error("[useChatSocket] WebSocket error:", err);
        };

        ws.onclose = () => {
            setConnected(false);
        };

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [myUserId]);

    /**
     * Send a chat message to a receiver.
     * If the socket isn't OPEN yet, the message is queued and sent once connected.
     */
    const sendMessage = useCallback((receiverId: string, content: string) => {
        const payload = JSON.stringify({ receiver_id: receiverId, content });
        const ws = wsRef.current;

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(payload);
        } else {
            // Queue it — will be flushed in onopen
            console.warn("[useChatSocket] Socket not ready, queuing message.");
            pendingQueue.current.push(payload);
        }
    }, []);

    return { sendMessage, lastMessage, connected };
}
