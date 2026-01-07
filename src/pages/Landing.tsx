import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const chooseInstance = (url: string) => {
    localStorage.setItem("INSTANCE_BASE_URL", url);
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen relative bg-[#050505] text-white flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* Animated SVG background (decorative) */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        width="100%"
        height="100vh"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#00f2ff" stopOpacity="1" />
            <stop offset="100%" stopColor="#7000ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <style>{`@keyframes flow { 0% { stroke-dashoffset: 1000; opacity: 0; } 50% { opacity: 0.8; } 100% { stroke-dashoffset: 0; opacity: 0; } }\n          @keyframes pulse-dot { 0%,100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.5); filter: brightness(1.5); } }\n          @keyframes float-slow { 0%,100% { transform: translate(0, 0); } 50% { transform: translate(-20px, 20px); } }\n          .line { fill: none; stroke: url(#grad1); stroke-width: 1.5; stroke-dasharray: 200; animation: flow 8s linear infinite; filter: url(#glow); }\n          .node { fill: #ff00c8; filter: url(#glow); animation: pulse-dot 3s ease-in-out infinite; transform-origin: center; }\n          .layer { animation: float-slow 15s ease-in-out infinite; }\n        `}</style>

        <rect width="100%" height="100%" fill="#050505" />

        <g className="layer">
          <path className="line" d="M100,100 L400,250" style={{ animationDelay: '0s' }} />
          <path className="line" d="M700,50 L400,250" style={{ animationDelay: '2s' }} />
          <path className="line" d="M650,450 L400,250" style={{ animationDelay: '4s' }} />
          <path className="line" d="M150,400 L400,250" style={{ animationDelay: '1s' }} />
          <path className="line" d="M100,100 L150,400" style={{ animationDelay: '3s' }} />
          <path className="line" d="M700,50 L650,450" style={{ animationDelay: '5s' }} />
          <path className="line" d="M50,250 L100,100" style={{ animationDelay: '6s' }} />
          <path className="line" d="M750,250 L700,50" style={{ animationDelay: '0.5s' }} />

          <circle className="node" cx="400" cy="250" r="5" style={{ fill: '#00f2ff' }} />
          <circle className="node" cx="100" cy="100" r="3" style={{ animationDelay: '0.2s' }} />
          <circle className="node" cx="700" cy="50" r="4" style={{ animationDelay: '0.8s' }} />
          <circle className="node" cx="650" cy="450" r="3" style={{ animationDelay: '1.5s' }} />
          <circle className="node" cx="150" cy="400" r="4" style={{ animationDelay: '2.2s' }} />
          <circle className="node" cx="50" cy="250" r="2" style={{ animationDelay: '1.1s' }} />
          <circle className="node" cx="750" cy="250" r="2" style={{ animationDelay: '3s' }} />
        </g>
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center w-full">
      
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
        Social networking that's not for sale.
      </h1>

      <p className="text-gray-300 max-w-xl text-center mb-10">
        Choose an instance. Each instance is independently managed, with its
        own users, rules, and data.
      </p>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
        
        {/* Instance A */}
          <div onClick={() => chooseInstance("https://instance-a.onrender.com")} className="bg-[rgba(42,18,69,0.6)] backdrop-blur-sm rounded-xl p-6 hover:scale-[1.02] transition cursor-pointer ring-1 ring-white/5">
          <h2 className="text-xl font-semibold mb-2">Instance A</h2>
          <p className="text-gray-400 mb-4">
            General community instance.
          </p>
          <button
            onClick={() =>
              chooseInstance("https://instance-a.onrender.com")
            }
            className="w-full bg-indigo-500 hover:bg-indigo-600 py-2 rounded-lg"
          >
            Join Instance A
          </button>
        </div>

        {/* Instance B */}
          <div onClick={() => chooseInstance("https://instance-b.onrender.com")} className="bg-[rgba(42,18,69,0.6)] backdrop-blur-sm rounded-xl p-6 hover:scale-[1.02] transition cursor-pointer ring-1 ring-white/5">
          <h2 className="text-xl font-semibold mb-2">Instance B</h2>
          <p className="text-gray-400 mb-4">
            Alternate community instance.
          </p>
          <button
            onClick={() =>
              chooseInstance("https://instance-b.onrender.com")
            }
            className="w-full bg-indigo-500 hover:bg-indigo-600 py-2 rounded-lg"
          >
            Join Instance B
          </button>
        </div>
        </div> 

      </div>
    </div>
  );
}
