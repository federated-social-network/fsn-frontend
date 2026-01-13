import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const chooseInstance = (url: string) => {
    localStorage.setItem("INSTANCE_BASE_URL", url);
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#0a0e27] via-[#1a0a3a] to-[#0f0520] dark:from-[#0a0e27] dark:via-[#1a0a3a] dark:to-[#0f0520] light:bg-surface text-surface flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* Animated background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/15 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      {/* Complex SVG background with multiple animation layers */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        width="100%"
        height="100vh"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <defs>
          <filter id="glow1" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#00f2ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#7000ff" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff006e" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#ff006e" stopOpacity="1" />
            <stop offset="100%" stopColor="#00f2ff" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id="radGrad1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        <style>{`
          @keyframes flow { 
            0% { stroke-dashoffset: 1000; opacity: 0.3; } 
            50% { opacity: 0.9; } 
            100% { stroke-dashoffset: 0; opacity: 0.2; } 
          }
          @keyframes pulse-dot { 
            0%,100% { transform: scale(1); filter: brightness(1); } 
            50% { transform: scale(1.8); filter: brightness(2); } 
          }
          @keyframes float-slow { 
            0%,100% { transform: translate(0, 0) rotate(0deg); } 
            25% { transform: translate(-30px, 30px) rotate(90deg); }
            50% { transform: translate(-40px, 0) rotate(180deg); }
            75% { transform: translate(-20px, -30px) rotate(270deg); }
          }
          @keyframes orbit {
            0% { transform: rotate(0deg) translateX(150px) rotate(0deg); }
            100% { transform: rotate(360deg) translateX(150px) rotate(-360deg); }
          }
          @keyframes glow-pulse {
            0%, 100% { filter: drop-shadow(0 0 10px #00f2ff) drop-shadow(0 0 20px #7000ff); }
            50% { filter: drop-shadow(0 0 20px #00f2ff) drop-shadow(0 0 40px #7000ff); }
          }
          .line { 
            fill: none; 
            stroke: url(#grad1); 
            stroke-width: 2; 
            stroke-dasharray: 300; 
            animation: flow 12s linear infinite; 
            filter: url(#glow1); 
          }
          .line-alt {
            fill: none;
            stroke: url(#grad2);
            stroke-width: 1.5;
            stroke-dasharray: 250;
            animation: flow 14s linear infinite reverse;
            filter: url(#glow1);
          }
          .node { 
            fill: #00f2ff; 
            filter: url(#glow2); 
            animation: pulse-dot 3s ease-in-out infinite; 
            transform-origin: center; 
          }
          .node-alt {
            fill: #ff006e;
            filter: url(#glow2);
            animation: pulse-dot 4s ease-in-out infinite;
            transform-origin: center;
          }
          .layer { 
            animation: float-slow 20s ease-in-out infinite; 
          }
          .orbit-layer {
            transform-origin: 600px 400px;
            animation: orbit 25s linear infinite;
          }
          .glow-ring {
            animation: glow-pulse 3s ease-in-out infinite;
          }
        `}</style>

        <rect width="100%" height="100%" fill="#0a0e27" opacity="0.8" />

        {/* Main network layer */}
        <g className="layer">
          <path className="line" d="M200,150 L600,400" style={{ animationDelay: '0s' }} />
          <path className="line" d="M1000,100 L600,400" style={{ animationDelay: '2s' }} />
          <path className="line" d="M950,700 L600,400" style={{ animationDelay: '4s' }} />
          <path className="line" d="M250,650 L600,400" style={{ animationDelay: '1s' }} />
          <path className="line" d="M200,150 L250,650" style={{ animationDelay: '3s' }} />
          <path className="line" d="M1000,100 L950,700" style={{ animationDelay: '5s' }} />
          <path className="line-alt" d="M100,400 L200,150" style={{ animationDelay: '0.5s' }} />
          <path className="line-alt" d="M1100,400 L1000,100" style={{ animationDelay: '1.5s' }} />
          <path className="line-alt" d="M600,50 L600,400" style={{ animationDelay: '2.5s' }} />
          <path className="line-alt" d="M600,400 L600,750" style={{ animationDelay: '3.5s' }} />
        </g>

        {/* Orbital elements layer */}
        <g className="orbit-layer">
          <circle className="node" cx="600" cy="250" r="6" style={{ animationDelay: '0s' }} />
          <circle className="node-alt" cx="600" cy="550" r="5" style={{ animationDelay: '0.3s' }} />
        </g>

        {/* Central nodes */}
        <circle className="glow-ring" cx="600" cy="400" r="8" style={{ fill: 'none', stroke: '#00f2ff', strokeWidth: '1.5' }} />
        <circle className="node" cx="600" cy="400" r="6" />

        {/* Surrounding nodes */}
        <circle className="node" cx="200" cy="150" r="4" style={{ animationDelay: '0.2s' }} />
        <circle className="node" cx="1000" cy="100" r="5" style={{ animationDelay: '0.8s' }} />
        <circle className="node-alt" cx="950" cy="700" r="4" style={{ animationDelay: '1.5s' }} />
        <circle className="node" cx="250" cy="650" r="5" style={{ animationDelay: '2.2s' }} />
        <circle className="node-alt" cx="100" cy="400" r="3" style={{ animationDelay: '1.1s' }} />
        <circle className="node" cx="1100" cy="400" r="3" style={{ animationDelay: '3s' }} />
        <circle className="node" cx="600" cy="50" r="4" style={{ animationDelay: '1.6s' }} />
        <circle className="node-alt" cx="600" cy="750" r="4" style={{ animationDelay: '2.4s' }} />

        {/* Connecting lines from central point */}
        <path className="line-alt" d="M600,400 L200,150" style={{ animationDelay: '0.8s' }} />
        <path className="line-alt" d="M600,400 L1000,100" style={{ animationDelay: '1.2s' }} />
        <path className="line" d="M600,400 L950,700" style={{ animationDelay: '1.6s' }} />
        <path className="line" d="M600,400 L250,650" style={{ animationDelay: '0.4s' }} />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">

        <h1 className="text-5xl md:text-6xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse">
          Decentralized. Private. Yours.
        </h1>

        <p className="text-surface-muted max-w-xl text-center mb-16 text-lg leading-relaxed">
          Join an instance, keep control of your data, and follow people across servers.

        </p>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">

          {/* Instance A Card */}
          <div
            onMouseEnter={() => setHoveredCard('a')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => chooseInstance("https://instance-a.onrender.com")}
            className="group relative cursor-pointer h-full"
          >
            {/* Glassmorphism background with gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />

            <div className="relative backdrop-blur-xl bg-white/[0.05] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-500 overflow-hidden group-hover:shadow-2xl group-hover:shadow-cyan-500/50 h-full flex flex-col justify-between">

              {/* Animated gradient background inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${hoveredCard === 'a' ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50 scale-150' : 'bg-cyan-300'}`} />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Instance A</h2>
                </div>

                <p className="text-surface-muted mb-6 text-sm leading-relaxed group-hover:text-surface transition-colors">
                  General community instance for everyone.
                </p>

                <button
                  onClick={() => chooseInstance("https://instance-a.onrender.com")}
                  className="w-full relative overflow-hidden py-3 px-6 rounded-lg font-semibold transition-all duration-500 group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-100 group-hover/btn:opacity-0 transition-opacity duration-500" />
                  <span className="relative flex items-center justify-center gap-2">
                    Join Instance A
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* Hover shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </div>
            </div>
          </div>

          {/* Instance B Card */}
          <div
            onMouseEnter={() => setHoveredCard('b')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => chooseInstance("https://instance-b.onrender.com")}
            className="group relative cursor-pointer h-full"
          >
            {/* Glassmorphism background with gradient border */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />

            <div className="relative backdrop-blur-xl bg-white/[0.05] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-500 overflow-hidden group-hover:shadow-2xl group-hover:shadow-purple-500/50 h-full flex flex-col justify-between">

              {/* Animated gradient background inside card */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${hoveredCard === 'b' ? 'bg-purple-400 shadow-lg shadow-purple-400/50 scale-150' : 'bg-purple-300'}`} />
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Instance B</h2>
                </div>

                <p className="text-surface-muted mb-6 text-sm leading-relaxed group-hover:text-surface transition-colors">
                  Alternate community instance with unique features.
                </p>

                <button
                  onClick={() => chooseInstance("https://instance-b.onrender.com")}
                  className="w-full relative overflow-hidden py-3 px-6 rounded-lg font-semibold transition-all duration-500 group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-100 group-hover/btn:opacity-0 transition-opacity duration-500" />
                  <span className="relative flex items-center justify-center gap-2">
                    Join Instance B
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* Hover shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
