import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUser } from "../api/api";

export default function Profile() {
  const { identifier } = useParams<{ identifier: string }>();
  const username = identifier; // keep legacy variable name for display fallbacks
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!identifier) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getUser(identifier!);
        if (!mounted) return;
        setUser(res.data);
      } catch (err: any) {
        console.error("Failed to load user", err);
        const serverBody = err?.response?.data;
        const serverMsg = serverBody && typeof serverBody === "object" ? JSON.stringify(serverBody) : serverBody || err?.message;
        setError(serverMsg || "User not found");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [username]);

  if (!username) {
    return (
      <div className="p-6">No username specified. Go back <Link to="/dashboard">Home</Link>.</div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg p-6">
          {loading && <div className="text-sm text-[rgba(255,255,255,0.7)]">Loading profile…</div>}
          {error && <div className="text-sm text-red-400">Error: {String(error)}</div>}

          {!loading && !error && user && (
            <div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[rgba(10,167,198,0.12)] flex items-center justify-center text-[var(--primary)] font-bold">{(user.username || username)[0]?.toUpperCase() || 'U'}</div>
                <div>
                  <div className="text-2xl font-semibold">{user.display_name || user.username || username}</div>
                  <div className="text-sm text-[rgba(255,255,255,0.7)]">@{user.username || username} • {user.instance || user.origin_instance || 'local'}</div>
                </div>
              </div>

              {user.bio && <p className="mt-4 text-[rgba(255,255,255,0.9)]">{user.bio}</p>}

              <div className="mt-4 text-sm text-[rgba(255,255,255,0.7)]">
                Joined: {user.created_at || user.joined || 'unknown'}
              </div>
            </div>
          )}

          {!loading && !error && !user && (
            <div className="text-sm">No profile information available.</div>
          )}

        </div>
      </div>
    </div>
  );
}
