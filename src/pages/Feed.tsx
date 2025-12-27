import PostForm from "../components/PostForm";

export default function Feed() {
  const username = localStorage.getItem("username") || "";

  return (
    <div className="w-full max-w-2xl mx-auto py-10 px-4">
      <div className="mb-4 text-sm text-[rgba(255,255,255,0.85)]">
        Welcome <span className="text-[var(--primary)]">{username || 'Guest'}</span>
      </div>

      <h1 className="text-xl font-semibold mb-6">
        Home <span className="text-[var(--primary)]">Timeline</span>
      </h1>

      <PostForm />
    </div>
  );
}
