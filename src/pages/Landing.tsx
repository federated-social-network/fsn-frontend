import { useNavigate } from "react-router-dom";
import { INSTANCES } from "../config/instances";
import SketchCard from "../components/SketchCard";

export default function Landing() {
  const navigate = useNavigate();

  const chooseInstance = (url: string) => {
    localStorage.setItem("INSTANCE_BASE_URL", url);
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen relative bg-white text-black flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden font-hand">

      {/* Grid Background - Hidden on mobile */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 hidden sm:block"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Travel & Federated Network SVG Background - Hidden on mobile for cleaner look */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
        width="100%"
        height="100vh"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>{`
            @keyframes float { 
              0%, 100% { transform: translate(0, 0) rotate(0deg); } 
              50% { transform: translate(4px, -5px) rotate(-1deg); } 
            }
            @keyframes sway { 
              0%, 100% { transform: rotateZ(-1deg) translateY(0); } 
              50% { transform: rotateZ(1deg) translateY(-3px); } 
            }
            @keyframes bounce { 
              0%, 100% { transform: translateY(0) rotate(0deg); } 
              50% { transform: translateY(-8px) rotate(0.5deg); } 
            }
            
            .travel-item { animation: float 7s ease-in-out infinite; }
            .luggage { animation: sway 8s ease-in-out infinite; }
            .plane { animation: bounce 6s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* Airplane - Top Right (with subtle animation) */}
        <g className="plane" style={{ animationDelay: '0s' }}>
          {/* Fuselage */}
          <ellipse cx="1050" cy="100" rx="35" ry="12" fill="#FF6B6B" stroke="#000" strokeWidth="1.5" opacity="0.85" />
          {/* Wings */}
          <polygon points="1020,100 1080,100 1085,95 1015,95" fill="#FF8C8C" stroke="#000" strokeWidth="1" opacity="0.8" />
          {/* Tail */}
          <polygon points="1015,100 1010,95 1010,105" fill="#FF4444" stroke="#000" strokeWidth="1" opacity="0.8" />
          {/* Window */}
          <circle cx="1050" cy="100" r="3" fill="#87CEEB" opacity="0.9" />
        </g>

        {/* Travel Card 1 - Beach/Luggage - Top Left */}
        <g className="travel-item" style={{ animationDelay: '0.5s' }}>
          {/* Pin */}
          <circle cx="120" cy="100" r="7" fill="#FF6B6B" stroke="#000" strokeWidth="1" />
          <circle cx="120" cy="10344s0" r="5" fill="#FF8C8C" opacity="0.9" />

          {/* Luggage */}
          <rect x="90" y="120" width="60" height="45" rx="4" fill="#FFB347" stroke="#000" strokeWidth="1.5" opacity="0.85" />
          <rect x="95" y="125" width="50" height="35" fill="#FFC857" opacity="0.7" />
          {/* Handle */}
          <path d="M 100 120 Q 120 105 140 120" stroke="#000" strokeWidth="2" fill="none" />
          {/* Wheels */}
          <circle cx="100" cy="158" r="3" fill="#000" />
          <circle cx="140" cy="158" r="3" fill="#000" />
        </g>

        {/* Travel Card 2 - Mountain/Binoculars - Bottom Right */}
        <g className="luggage" style={{ animationDelay: '1.5s' }}>
          {/* Pin */}
          <circle cx="1080" cy="650" r="7" fill="#4CAF50" stroke="#000" strokeWidth="1" />
          <circle cx="1080" cy="650" r="5" fill="#66BB6A" opacity="0.9" />

          {/* Mountain backdrop card */}
          <rect x="1000" y="670" width="160" height="100" rx="3" fill="#E8F5E9" stroke="#000" strokeWidth="1.5" opacity="0.85" />

          {/* Simple mountain */}
          <polygon points="1040,700 1080,670 1120,700" fill="#90EE90" stroke="#000" strokeWidth="1" opacity="0.8" />
          <polygon points="1060,700 1080,685 1100,700" fill="#228B22" stroke="#000" strokeWidth="0.5" opacity="0.7" />

          {/* Binoculars icon */}
          <circle cx="1020" cy="730" r="5" fill="none" stroke="#333" strokeWidth="2" />
          <circle cx="1140" cy="730" r="5" fill="none" stroke="#333" strokeWidth="2" />
          <line x1="1025" y1="730" x2="1135" y2="730" stroke="#333" strokeWidth="2" />
        </g>

        {/* Travel Card 3 - Camera - Bottom Left */}
        <g className="travel-item" style={{ animationDelay: '2s' }}>
          {/* Pin */}
          <circle cx="150" cy="720" r="7" fill="#4169E1" stroke="#000" strokeWidth="1" />
          <circle cx="150" cy="720" r="5" fill="#6495ED" opacity="0.9" />

          {/* Camera body */}
          <rect x="110" y="680" width="80" height="60" rx="4" fill="#333" stroke="#000" strokeWidth="1.5" opacity="0.85" />
          {/* Lens */}
          <circle cx="150" cy="705" r="18" fill="#87CEEB" stroke="#000" strokeWidth="1.5" opacity="0.8" />
          <circle cx="150" cy="705" r="12" fill="#B0E0E6" opacity="0.6" />
          {/* Flash */}
          <rect x="125" y="682" width="8" height="8" fill="#FFD700" stroke="#000" strokeWidth="0.5" />
        </g>

        {/* Sticky Note 1 - Top Right Side (minimal) */}
        <g style={{ animationDelay: '2.5s' }} className="travel-item">
          {/* Pin */}
          <circle cx="1000" cy="250" r="6" fill="#FF1493" stroke="#000" strokeWidth="1" />

          {/* Sticky note */}
          <rect x="970" y="260" width="60" height="50" fill="#FFFF99" stroke="#000" strokeWidth="1" opacity="0.9" style={{ transform: 'rotate(-8deg)', transformOrigin: '1100px 250px' }} />
          <text x="1000" y="292" fontSize="10" fontFamily="cursive" fill="#333" textAnchor="middle" fontWeight="bold">Share</text>
          <text x="1000" y="307" fontSize="9" fontFamily="cursive" fill="#666" textAnchor="middle">globally</text>
        </g>

        {/* Passport/Map icon - Middle Right */}
        <g className="luggage" style={{ animationDelay: '0.8s' }}>
          {/* Pin */}
          <circle cx="1130" cy="400" r="7" fill="#FF9800" stroke="#000" strokeWidth="1" />
          <circle cx="1130" cy="400" r="5" fill="#FFB74D" opacity="0.9" />

          {/* Passport/Map */}
          <rect x="1100" y="420" width="60" height="80" rx="2" fill="#C41C3B" stroke="#000" strokeWidth="1.5" opacity="0.85" />
          <rect x="1105" y="425" width="50" height="70" fill="#E53935" opacity="0.9" />
          <text x="1130" y="455" fontSize="12" fontFamily="serif" fill="#fff" textAnchor="middle" fontWeight="bold">✓</text>
          <text x="1130" y="485" fontSize="8" fontFamily="serif" fill="#fff" textAnchor="middle">TRAVEL</text>
        </g>

        {/* Sticky Note 2 - Left Side (minimal) */}
        <g style={{ animationDelay: '1.2s' }} className="travel-item">
          {/* Pin */}
          <circle cx="80" cy="480" r="6" fill="#00CED1" stroke="#000" strokeWidth="1" />

          {/* Sticky note */}
          <rect x="50" y="500" width="60" height="50" fill="#B0E0E6" stroke="#000" strokeWidth="1" opacity="0.9" style={{ transform: 'rotate(5deg)', transformOrigin: '80px 480px' }} />
          <text x="80" y="522" fontSize="10" fontFamily="cursive" fill="#003366" textAnchor="middle" fontWeight="bold">Connect</text>
          <text x="80" y="537" fontSize="9" fontFamily="cursive" fill="#004d7a" textAnchor="middle">anywhere</text>
        </g>

        {/* Compass - Center Left */}
        <g className="plane" style={{ animationDelay: '1s' }}>
          {/* Outer circle */}
          <circle cx="180" cy="300" r="25" fill="none" stroke="#000" strokeWidth="2" opacity="0.7" />
          {/* Inner circle */}
          <circle cx="180" cy="300" r="20" fill="#FFF8DC" stroke="#000" strokeWidth="1" opacity="0.8" />
          {/* N marker */}
          <text x="180" y="285" fontSize="14" fontFamily="serif" fill="#000" textAnchor="middle" fontWeight="bold">N</text>
          {/* Cardinal points */}
          <text x="200" y="303" fontSize="10" fontFamily="serif" fill="#999" textAnchor="middle">E</text>
          <text x="180" y="320" fontSize="10" fontFamily="serif" fill="#999" textAnchor="middle">S</text>
          <text x="160" y="303" fontSize="10" fontFamily="serif" fill="#999" textAnchor="middle">W</text>
          {/* Needle */}
          <line x1="180" y1="300" x2="180" y2="280" stroke="#FF6B6B" strokeWidth="2" />
        </g>

      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl py-8 sm:py-0">

        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-center mb-4 text-black font-sketch tracking-wider drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)] leading-tight">
          Decentralized. Private. Yours.
        </h1>

        <p className="text-gray-700 max-w-2xl text-center mb-8 sm:mb-12 md:mb-16 text-lg sm:text-xl md:text-2xl font-hand leading-relaxed sm:transform sm:-rotate-1 px-2">
          Join an instance, keep control of your data, and follow people across servers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 w-full px-4">

          {INSTANCES.map((inst, index) => (
            <div onClick={() => chooseInstance(inst.url)} key={index} className="h-full">
              <SketchCard
                variant="paper"
                className={`h-full flex flex-col justify-between cursor-pointer transition-transform hover:-translate-y-2 active:scale-[0.98] ${inst.color} border-2 border-black`}
              >
                <div className="p-6 sm:p-8 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl sm:text-3xl font-bold font-sketch">{inst.name}</h2>
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-black ${inst.name.includes('A') ? 'bg-cyan-400' : 'bg-purple-400'}`} />
                  </div>

                  <p className="text-base sm:text-lg text-gray-800 font-hand flex-grow">
                    {inst.description}
                  </p>

                  <button className="w-full py-2.5 sm:py-3 mt-6 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors font-bold text-lg font-sketch rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-0 hover:translate-x-[2px] hover:translate-y-[2px]">
                    Join Now &rarr;
                  </button>
                </div>
              </SketchCard>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

