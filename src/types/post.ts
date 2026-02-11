/**
 * Represents a social media post in the frontend.
 */
export interface Post {
  /** Unique identifier for the post */
  id: string;
  /** Text content of the post */
  content: string;
  /** Username of the post author */
  author: string;
  /** Optional numeric or string id for the author (preferred) */
  author_id?: string;
  /** The instance where the post was created */
  origin_instance: string;
  /** Flag indicating if the post is from a remote instance */
  is_remote: boolean;
  /** Timestamp when the post was created */
  created_at?: string | Date;
}
