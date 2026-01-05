export interface Post {
  id: string;
  content: string;
  author: string;
  // optional numeric or string id for the author (preferred)
  author_id?: string;
  origin_instance: string;
  is_remote: boolean;
}
