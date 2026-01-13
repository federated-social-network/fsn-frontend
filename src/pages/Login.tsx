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

    // client-side validation
    const pwdErr = validatePassword(password);
    if (!username.trim()) {
      setErrorMsg("Please enter your username");
      return;
    }
    if (pwdErr) {
      setErrorMsg(pwdErr);
      return;
    }

    try {
      const res = await loginUser(username, password);

      // If the backend returns a token, store it. For now we also store
      // credentials so the app works with simple auth flows described.
      if (res?.status === 200) {
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
        if (res.data?.access_token) {
          localStorage.setItem("access_token", res.data.access_token);
          // store under the AUTH_TOKEN key as well for compatibility with getApi()
          localStorage.setItem("AUTH_TOKEN", res.data.access_token);
        }
        navigate("/dashboard");
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

  const instance = localStorage.getItem("INSTANCE_BASE_URL") || null;

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validatePassword = (p: string) => {
    if (!p || p.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) return "Password must include letters and numbers";
    return null;
  };

  const validateUsername = (u: string) => {
    if (!u || !u.trim()) return "Username is required";
    return null;
  };

  const formIsValid = () => {
    return !validateUsername(username) && !validatePassword(password);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">

      {/* Decorative SVG background (non-interactive) */}
      <div className="fixed inset-0 pointer-events-none -z-10 w-full h-full">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
          <defs>
            <radialGradient id="gA" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00f2ff" stopOpacity={0.7} />
              <stop offset="60%" stopColor="#7c3aed" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#5b21b6" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="gB" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff79c6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#ff4d6d" stopOpacity={0} />
            </radialGradient>
            <filter id="b1" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="36" />
            </filter>
          </defs>


          <rect width="100%" height="100%" fill="#0f0c29" />

          <style>{`
            .orb { transform-origin: center; animation: float 14s ease-in-out infinite; }
            .orb.slow { animation-duration: 20s; }
            .orb.fast { animation-duration: 10s; }
            .node { animation: pulse 4s ease-in-out infinite; }
            .line { stroke-dasharray: 6 6; animation: dash 8s linear infinite; }
            @keyframes float { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,-24px) scale(1.02); } 100% { transform: translate(0,0) scale(1); } }
            @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; transform: scale(1.08); } 100% { opacity: 0.5; } }
            @keyframes dash { to { stroke-dashoffset: 1000; } }
          `}</style>

          {/* big colorful orbs */}
          <circle className="orb slow" cx="10%" cy="18%" r="260" fill="url(#gA)" filter="url(#b1)" opacity="0.9" />
          <circle className="orb" cx="88%" cy="12%" r="320" fill="url(#gB)" filter="url(#b1)" opacity="0.85" />
          <circle className="orb fast" cx="50%" cy="88%" r="300" fill="#6d28d9" filter="url(#b1)" opacity="0.55" />
          <circle className="orb" cx="80%" cy="80%" r="220" fill="#ec4899" filter="url(#b1)" opacity="0.45" />

          {/* network nodes */}
          <g className="nodes" fill="none" stroke="#c084fc" strokeWidth={1} opacity={0.9}>
            <circle className="node" cx="30%" cy="40%" r="6" fill="#a78bfa" />
            <circle className="node" cx="70%" cy="28%" r="8" fill="#f472b6" />
            <circle className="node" cx="50%" cy="82%" r="5" fill="#a78bfa" />
            <circle className="node" cx="22%" cy="70%" r="4" fill="#fb7185" />
            <circle className="node" cx="85%" cy="55%" r="6" fill="#60a5fa" />
            <line className="line" x1="30%" y1="40%" x2="70%" y2="28%" stroke="#a78bfa" />
            <line className="line" x1="70%" y1="28%" x2="50%" y2="82%" stroke="#f472b6" />
            <line className="line" x1="50%" y1="82%" x2="30%" y2="40%" stroke="#60a5fa" />
          </g>
        </svg>
      </div>

      <div className="w-full max-w-md sm:max-w-lg p-8 rounded-2xl shadow-xl border border-[var(--muted-border)] bg-[var(--bg-muted)] backdrop-blur-md relative z-10">
      {instance && (
        <div className="text-xs text-surface-subtle text-center mb-3">
          Signing in to: <span className="font-mono">{instance}</span>
        </div>
      )}
      <header className="mb-6 text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-[rgba(10,167,198,0.12)] flex items-center justify-center text-primary-500 font-bold">
          FS
        </div>
        <h1 className="text-2xl font-semibold mt-3">Federated Social</h1>
        <p className="text-sm text-surface-subtle">
          Decentralized. Private. Yours.
          
          
        </p>
      </header>

      <form onSubmit={handleLogin}>
        <label className="block text-sm mb-1">Username</label>
        <input
          className={`w-full bg-[var(--bg-muted)] rounded-lg px-4 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] ${usernameError ? 'border-red-500' : 'border-[var(--muted-border)]'}`}
          value={username}
          onChange={(e) => { setUsername(e.target.value); setUsernameError(validateUsername(e.target.value)); setErrorMsg(''); }}
          aria-invalid={!!usernameError}
        />
        {usernameError && <p className="text-xs text-red-400 mb-2">{usernameError}</p>}

        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          className={`w-full bg-[var(--bg-muted)] rounded-lg px-4 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)] ${passwordError ? 'border-red-500' : 'border-[var(--muted-border)]'}`}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setPasswordError(validatePassword(e.target.value)); setErrorMsg(''); }}
          aria-invalid={!!passwordError}
        />
        {passwordError && <p className="text-xs text-red-400 mb-2">{passwordError}</p>}

        {errorMsg && <p className="text-sm text-red-400 mb-2 text-center">{errorMsg}</p>}

        <button
          type="submit"
          disabled={!formIsValid()}
          className={`w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-600 text-white rounded-lg py-2 font-medium shadow-lg transform transition duration-200 ${!formIsValid() ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
        >
          Sign in
        </button>
      </form>

      <p className="text-sm text-surface-subtle mt-4 text-center">
        New here?{" "}
        <Link to="/register" className="text-[var(--primary)] hover:underline">
          Create an account
        </Link>
      </p>
      </div>
    </div>
  );
}
