import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { tokenManager } from '@/lib/api/client';
import { toast } from 'sonner';

/**
 * Real-time event types matching backend RealtimeEventType enum
 */
export enum RealtimeEventType {
  CONNECTED = 'connected',
  HEARTBEAT = 'heartbeat',
  DASHBOARD_UPDATED = 'dashboard.updated',
  CAMPAIGN_UPDATED = 'campaign.updated',
  CAMPAIGN_PROGRESS = 'campaign.progress',
  QUEUE_UPDATED = 'queue.updated',
  ASSIGNMENT_STATUS_CHANGED = 'assignment.status_changed',
  REVIEW_SUBMITTED = 'review.submitted',
  REVIEW_VALIDATED = 'review.validated',
  NOTIFICATION = 'notification',
  ADMIN_ALERT = 'admin.alert',
}

export interface RealtimeEvent {
  type: RealtimeEventType | string;
  payload: any;
  timestamp: string;
}

export type RealtimeEventHandler = (event: RealtimeEvent) => void;

interface UseRealtimeUpdatesOptions {
  /**
   * Whether to automatically show toast notifications for notification events
   */
  showNotifications?: boolean;
  /**
   * Custom event handlers for specific event types
   */
  onEvent?: {
    [key in RealtimeEventType]?: RealtimeEventHandler;
  };
  /**
   * Callback when connection status changes
   */
  onConnectionChange?: (connected: boolean) => void;
  /**
   * Whether the hook should be enabled
   */
  enabled?: boolean;
}

/**
 * Hook for subscribing to real-time updates via Server-Sent Events (SSE)
 *
 * This hook connects to the backend SSE endpoint and dispatches events
 * to registered handlers. It handles:
 * - Automatic reconnection on disconnect
 * - Authentication token management
 * - Connection status tracking
 * - Toast notifications for notification events
 *
 * @example
 * ```tsx
 * const { isConnected } = useRealtimeUpdates({
 *   showNotifications: true,
 *   onEvent: {
 *     [RealtimeEventType.CAMPAIGN_UPDATED]: (event) => {
 *       // Refetch campaign data
 *       queryClient.invalidateQueries(['campaign', event.payload.campaignId]);
 *     },
 *   },
 * });
 * ```
 */
export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
  const { showNotifications = true, onEvent, onConnectionChange, enabled = true } = options;
  const { user } = useAuth();
  const token = tokenManager.getToken();
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  // Handle incoming events
  const handleEvent = useCallback(
    (event: RealtimeEvent) => {
      // Handle connection event
      if (event.type === RealtimeEventType.CONNECTED) {
        setIsConnected(true);
        onConnectionChange?.(true);
        reconnectAttempts.current = 0;
        return;
      }

      // Ignore heartbeat events
      if (event.type === RealtimeEventType.HEARTBEAT) {
        return;
      }

      // Show toast for notification events
      if (showNotifications && event.type === RealtimeEventType.NOTIFICATION) {
        const { title, message, type } = event.payload;
        switch (type) {
          case 'success':
            toast.success(title, { description: message });
            break;
          case 'error':
            toast.error(title, { description: message });
            break;
          case 'warning':
            toast.warning(title, { description: message });
            break;
          default:
            toast.info(title, { description: message });
        }
      }

      // Show toast for admin alerts
      if (showNotifications && event.type === RealtimeEventType.ADMIN_ALERT) {
        const { title, message, severity } = event.payload;
        switch (severity) {
          case 'error':
            toast.error(title, { description: message });
            break;
          case 'warning':
            toast.warning(title, { description: message });
            break;
          default:
            toast.info(title, { description: message });
        }
      }

      // Call custom event handler if registered
      const handler = onEvent?.[event.type as RealtimeEventType];
      if (handler) {
        handler(event);
      }
    },
    [showNotifications, onEvent, onConnectionChange],
  );

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    if (!enabled || !token) {
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const sseUrl = `${apiUrl}/api/v1/realtime/events`;

    // Note: EventSource doesn't support custom headers, so we use a different approach
    // We'll use fetch with ReadableStream for SSE with auth
    const fetchSSE = async () => {
      try {
        const response = await fetch(sseUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
          },
        });

        if (!response.ok) {
          throw new Error(`SSE connection failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get response reader');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        const processChunk = async () => {
          try {
            const { done, value } = await reader.read();
            if (done) {
              setIsConnected(false);
              onConnectionChange?.(false);
              scheduleReconnect();
              return;
            }

            buffer += decoder.decode(value, { stream: true });

            // Process complete messages (SSE messages are separated by double newlines)
            const messages = buffer.split('\n\n');
            buffer = messages.pop() || ''; // Keep incomplete message in buffer

            for (const message of messages) {
              if (message.startsWith('data: ')) {
                try {
                  const data = JSON.parse(message.slice(6));
                  handleEvent(data);
                } catch (parseError) {
                  console.error('Failed to parse SSE message:', parseError);
                }
              }
            }

            // Continue reading
            processChunk();
          } catch (error) {
            console.error('SSE read error:', error);
            setIsConnected(false);
            onConnectionChange?.(false);
            scheduleReconnect();
          }
        };

        processChunk();
      } catch (error) {
        console.error('SSE connection error:', error);
        setIsConnected(false);
        onConnectionChange?.(false);
        scheduleReconnect();
      }
    };

    fetchSSE();
  }, [enabled, token, handleEvent, onConnectionChange]);

  // Schedule reconnection with exponential backoff
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current++;

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  // Connect when enabled and authenticated
  useEffect(() => {
    if (enabled && user && token) {
      connect();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enabled, user, token, connect]);

  // Manual disconnect function
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
    onConnectionChange?.(false);
  }, [onConnectionChange]);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    connect();
  }, [connect]);

  return {
    isConnected,
    disconnect,
    reconnect,
  };
}

/**
 * Hook for using real-time updates with automatic query invalidation
 *
 * This is a convenience hook that combines useRealtimeUpdates with
 * TanStack Query invalidation for common use cases.
 */
export function useRealtimeQueryInvalidation() {
  const { useQueryClient } = require('@tanstack/react-query');
  const queryClient = useQueryClient();

  return useRealtimeUpdates({
    showNotifications: true,
    onEvent: {
      [RealtimeEventType.DASHBOARD_UPDATED]: () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      },
      [RealtimeEventType.CAMPAIGN_UPDATED]: (event) => {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        if (event.payload.campaignId) {
          queryClient.invalidateQueries({ queryKey: ['campaign', event.payload.campaignId] });
        }
      },
      [RealtimeEventType.CAMPAIGN_PROGRESS]: (event) => {
        if (event.payload.campaignId) {
          queryClient.invalidateQueries({ queryKey: ['campaign', event.payload.campaignId] });
        }
      },
      [RealtimeEventType.QUEUE_UPDATED]: (event) => {
        queryClient.invalidateQueries({ queryKey: ['queue'] });
        queryClient.invalidateQueries({ queryKey: ['assignments'] });
      },
      [RealtimeEventType.ASSIGNMENT_STATUS_CHANGED]: () => {
        queryClient.invalidateQueries({ queryKey: ['assignments'] });
        queryClient.invalidateQueries({ queryKey: ['reader-dashboard'] });
      },
      [RealtimeEventType.REVIEW_SUBMITTED]: () => {
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      },
      [RealtimeEventType.REVIEW_VALIDATED]: () => {
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      },
    },
  });
}
