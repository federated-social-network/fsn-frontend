/**
 * Represents a social media post.
 */
export interface Post {
  /** The unique identifier of the post. */
  id: string;
  /** The text content of the post. */
  content: string;
  /** The username of the author. */
  author: string;
  /** (Optional) The unique identifier of the author. Preferred over username if available. */
  author_id?: string;
  /** The instance domain where the post originated. */
  origin_instance: string;
  /** Indicates if the post is from a remote instance. */
  is_remote: boolean;
  /** The creation timestamp of the post. */
  created_at?: string | Date;
}
