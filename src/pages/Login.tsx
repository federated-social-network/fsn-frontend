import { useState } from "react";
import { loginUser } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrorMsg("");

    try {
      const res = await loginUser(username, password);

      // ✅ BACKEND RETURNS access_token
      if (res?.data?.access_token) {
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("username", username);
        navigate("/feed");
      } else {
        setErrorMsg("Invalid login response");
      }
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.detail || "Invalid username or password"
      );
    }
    console.log(localStorage.getItem("access_token"));
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl shadow-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)]">
      <header className="mb-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-[rgba(10,167,198,0.12)] flex items-center justify-center text-primary-500 font-bold">
          FS
        </div>
        <h1 className="text-2xl font-semibold mt-3">Federated Social</h1>
        <p className="text-sm text-[rgba(255,255,255,0.6)]">
          Decentralized. Private. Yours.
          
          
        </p>
      </header>

      <form onSubmit={handleLogin}>
        <label className="block text-sm mb-1">Username</label>
        <input
          className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)]"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errorMsg && (
          <p className="text-sm text-red-400 mb-2 text-center">
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-[var(--primary)] hover:bg-[var(--primary-600)] transition rounded-lg py-2 font-medium text-white"
        >
          Sign in
        </button>
      </form>

      <p className="text-sm text-[rgba(255,255,255,0.6)] mt-4 text-center">
        New here?{" "}
        <Link to="/register" className="text-[var(--primary)] hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
