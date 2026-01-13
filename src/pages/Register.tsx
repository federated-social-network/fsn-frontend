import { useState } from "react";
import { registerUser } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const instance = localStorage.getItem("INSTANCE_BASE_URL") || null;

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateUsername = (u: string) => {
    if (!u || !u.trim()) return "Username is required";
    return null;
  };

  const validateEmail = (e: string) => {
    if (!e || !e.trim()) return "Email is required";
    // simple email regex
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(e)) return "Enter a valid email address";
    return null;
  };

  const validatePassword = (p: string) => {
    if (!p || p.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) return "Password must include letters and numbers";
    return null;
  };

  const formIsValid = () => {
    return !validateUsername(username) && !validateEmail(email) && !validatePassword(password);
  };

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    // client-side validations
    const uErr = validateUsername(username);
    const emErr = validateEmail(email);
    const pErr = validatePassword(password);
    setUsernameError(uErr);
    setEmailError(emErr);
    setPasswordError(pErr);
    if (uErr || emErr || pErr) {
      setErrorMsg(uErr || emErr || pErr || "Please fix the errors above");
      return;
    }

    try {
      const res = await registerUser(username, password, email);

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
    <div className="min-h-screen relative flex items-center justify-center px-4 py-8 overflow-hidden">

      {/* Decorative SVG background (non-interactive) */}
      <div className="fixed inset-0 pointer-events-none -z-10 w-full h-full">
        <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
          <defs>
            <radialGradient id="gA" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity={0.7} />
              <stop offset="60%" stopColor="#8b5cf6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#581c87" stopOpacity={0} />
            </radialGradient>
            <radialGradient id="gB" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
            </radialGradient>
            <filter id="b1" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="36" />
            </filter>
          </defs>

          <rect width="100%" height="100%" fill="#0f0c29" />

          <style>{`
            .orb { transform-origin: center; animation: float 16s ease-in-out infinite; }
            .orb.delay { animation-duration: 20s; }
            .orb.fast { animation-duration: 12s; }
            .node { animation: pulse 4.2s ease-in-out infinite; }
            .line { stroke-dasharray: 6 6; animation: dash 9s linear infinite; }
            @keyframes float { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(18px,-22px) scale(1.02); } 100% { transform: translate(0,0) scale(1); } }
            @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; transform: scale(1.08); } 100% { opacity: 0.5; } }
            @keyframes dash { to { stroke-dashoffset: 1000; } }
          `}</style>

          <circle className="orb delay" cx="12%" cy="20%" r="260" fill="url(#gA)" filter="url(#b1)" opacity="0.95" />
          <circle className="orb fast" cx="86%" cy="14%" r="320" fill="url(#gB)" filter="url(#b1)" opacity="0.9" />
          <circle className="orb" cx="52%" cy="86%" r="300" fill="#7c3aed" filter="url(#b1)" opacity="0.55" />
          <circle className="orb" cx="78%" cy="78%" r="220" fill="#fb7185" filter="url(#b1)" opacity="0.45" />

          <g className="nodes" fill="none" stroke="#c084fc" strokeWidth={1} opacity={0.95}>
            <circle className="node" cx="28%" cy="38%" r="7" fill="#a78bfa" />
            <circle className="node" cx="72%" cy="24%" r="9" fill="#f472b6" />
            <circle className="node" cx="48%" cy="80%" r="6" fill="#7dd3fc" />
            <circle className="node" cx="20%" cy="68%" r="5" fill="#fb7185" />
            <circle className="node" cx="84%" cy="52%" r="6" fill="#60a5fa" />
            <line className="line" x1="28%" y1="38%" x2="72%" y2="24%" stroke="#a78bfa" />
            <line className="line" x1="72%" y1="24%" x2="48%" y2="80%" stroke="#f472b6" />
            <line className="line" x1="48%" y1="80%" x2="28%" y2="38%" stroke="#60a5fa" />
          </g>
        </svg>
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl border border-[var(--muted-border)] bg-[var(--bg-muted)] backdrop-blur-md relative z-10">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold">Create an account</h1>
        <p className="text-sm text-surface-subtle">
          Join your instance of Federated Social
        </p>
        {instance && (
          <p className="text-xs text-surface-subtle mt-2">
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
          className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-4 py-2 mb-1 focus:outline-none"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setUsernameError(validateUsername(e.target.value));
          }}
          required
        />
        {usernameError && (
          <p className="text-xs text-red-400 mb-2">{usernameError}</p>
        )}

        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-4 py-2 mb-1 focus:outline-none"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(validateEmail(e.target.value));
          }}
          required
        />
        {emailError && (
          <p className="text-xs text-red-400 mb-2">{emailError}</p>
        )}

        <label className="block text-sm mb-1">Password</label>
        <input
          className="w-full bg-[var(--bg-muted)] border border-[var(--muted-border)] rounded-lg px-4 py-2 mb-1 focus:outline-none"
          type="password"
          placeholder="Choose a password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(validatePassword(e.target.value));
          }}
          required
        />
        {passwordError && (
          <p className="text-xs text-red-400 mb-2">{passwordError}</p>
        )}

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
          disabled={!formIsValid()}
          className={`w-full mt-4 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-cyan-400 hover:to-blue-600 text-white rounded-lg py-2 font-medium shadow-lg transform transition duration-200 ${!formIsValid() ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
        >
          Register
        </button>
      </form>

      <p className="text-sm text-surface-subtle mt-4 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-[var(--primary)] hover:underline">
          Sign in
        </Link>
      </p>
      </div>
    </div>
  );
}
