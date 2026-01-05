import { useState } from "react";
import { registerUser } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const instance = localStorage.getItem("INSTANCE_BASE_URL") || null;

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await registerUser(username, password);

      if (res.data?.message) {
        setSuccessMsg(res.data.message);

        // smooth UX: redirect to login after showing message
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      } else {
        setErrorMsg("Registration failed: unexpected response from server");
      }
    } catch (err: any) {
      // show raw server response when available to help debugging
      const serverBody = err?.response?.data;
      const serverMsg =
        (serverBody && typeof serverBody === "object")
          ? JSON.stringify(serverBody)
          : serverBody || err?.message;

      setErrorMsg(serverMsg || "User already exists or server error");
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl shadow-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)]">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="text-sm text-[rgba(255,255,255,0.6)]">
          Join your instance of Federated Social
        </p>
        {instance && (
          <p className="text-xs text-[rgba(255,255,255,0.6)] mt-2">
            Registering on: <span className="font-mono">{instance}</span>{" "}
            <button
              onClick={() => navigate("/")}
              className="underline ml-2 text-[var(--primary)]"
            >
              change
            </button>
          </p>
        )}
      </header>

      <form onSubmit={handleRegister}>
        <label className="block text-sm mb-1">Username</label>
        <input
          className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-4 py-2 mb-3 focus:outline-none"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="block text-sm mb-1">Password</label>
        <input
          className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-4 py-2 mb-4 focus:outline-none"
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* SUCCESS MESSAGE */}
        {successMsg && (
          <p className="text-sm text-green-400 mb-2 text-center">
            {successMsg}
          </p>
        )}

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <p className="text-sm text-red-400 mb-2 text-center">
            {errorMsg}
          </p>
        )}

        <button
            type="submit"
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-600)] text-white rounded-lg py-2 font-medium"
>
  Register
</button>
      </form>

      <p className="text-sm text-[rgba(255,255,255,0.6)] mt-4 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-[var(--primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
