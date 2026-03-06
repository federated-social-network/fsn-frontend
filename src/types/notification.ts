/**
 * Represents a user involved in a notification (actor or recipient).
 */
export interface NotificationUser {
    id: string;
    display_name: string;
    avatar_url: string | null;
    username: string;
}

/**
 * Represents a notification from the backend.
 */
export interface Notification {
    /** Unique notification ID. */
    id: string;
    /** Notification type: "like", "comment", "connection_request", "connection_accepted". */
    type: string;
    /** The ID of the related object (post, connection, etc.). */
    object_id: string;
    /** When the notification was created. */
    created_at: string;
    /** Whether the recipient has read this notification. */
    is_read: boolean;
    /** The user who performed the action. */
    actor: NotificationUser;
    /** The user who receives the notification. */
    recipient: NotificationUser;
}
