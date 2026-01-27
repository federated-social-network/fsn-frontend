import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const chooseInstance = (url: string) => {
    localStorage.setItem("INSTANCE_BASE_URL", url);
    navigate("/login");
  };

  return (
    <div className="min-h-screen relative bg-white text-black flex flex-col items-center justify-center px-6 overflow-hidden font-['Fredericka_the_Great']">

      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Sketchy SVG Background */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        width="100%"
        height="100vh"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>{`
          @keyframes float { 
            0%, 100% { transform: translate(0, 0); } 
            50% { transform: translate(10px, -10px); } 
          }
          @keyframes scribble {
            0% { stroke-dashoffset: 200; }
            50% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -200; }
          }
          .sketch-line { 
            fill: none; 
            stroke: #000; 
            stroke-width: 2; 
            stroke-dasharray: 10 5; 
            opacity: 0.3;
          }
          .node { 
            animation: float 6s ease-in-out infinite; 
            stroke: #000;
            stroke-width: 2;
          }
          /* Specific Colors */
          .node-red { fill: #ff4d4d; }
          .node-blue { fill: #4d94ff; }
          .node-green { fill: #4dff88; }
          .node-yellow { fill: #ffd11a; }
        `}</style>

        {/* Connecting Lines (Dashed/Sketchy) */}
        <path className="sketch-line" d="M200,150 L600,400" />
        <path className="sketch-line" d="M1000,100 L600,400" />
        <path className="sketch-line" d="M250,650 L600,400" />
        <path className="sketch-line" d="M950,700 L600,400" />

        {/* Nodes (Colored/Sketchy) */}
        {/* Red Nodes */}
        <circle className="node node-red" cx="200" cy="150" r="12" style={{ animationDelay: '0s' }} />
        <circle className="node node-red" cx="900" cy="650" r="8" style={{ animationDelay: '1s' }} />

        {/* Blue Nodes */}
        <circle className="node node-blue" cx="1000" cy="100" r="14" style={{ animationDelay: '0.5s' }} />
        <circle className="node node-blue" cx="300" cy="700" r="10" style={{ animationDelay: '1.5s' }} />

        {/* Green Nodes */}
        <circle className="node node-green" cx="250" cy="650" r="12" style={{ animationDelay: '2s' }} />
        <circle className="node node-green" cx="800" cy="100" r="9" style={{ animationDelay: '0.2s' }} />

        {/* Yellow Nodes */}
        <circle className="node node-yellow" cx="950" cy="700" r="13" style={{ animationDelay: '1.2s' }} />
        <circle className="node node-yellow" cx="150" cy="350" r="10" style={{ animationDelay: '0.8s' }} />

        {/* Center Cluster */}
        <circle className="node node-blue" cx="600" cy="400" r="20" style={{ animationDelay: '0s' }} />
        <circle className="node node-yellow" cx="580" cy="380" r="10" style={{ animationDelay: '1s' }} />
        <circle className="node node-red" cx="620" cy="390" r="8" style={{ animationDelay: '2s' }} />

      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-5xl">

        <h1 className="text-6xl md:text-8xl font-bold text-center mb-4 text-black font-['Cabin_Sketch'] tracking-wider drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]">
          Decentralized. Private. Yours.
        </h1>

        <p className="text-gray-700 max-w-2xl text-center mb-16 text-2xl font-['Fredericka_the_Great'] leading-relaxed transform -rotate-1">
          Join an instance, keep control of your data, and follow people across servers.
        </p>

        <div className="grid md:grid-cols-2 gap-10 w-full">

          {/* Instance A Card */}
          <div
            onClick={() => chooseInstance("https://instance-a.onrender.com")}
            className="group cursor-pointer relative bg-white p-8 transition-transform duration-300 hover:-translate-y-2 hover:rotate-1 flex flex-col justify-between h-80"
            style={{
              border: '3px solid black',
              borderRadius: '2% 96% 2% 98% / 98% 2% 95% 4%', // Rough sketch shape
              boxShadow: '8px 8px 0px rgba(0,0,0,0.8)'
            }}
          >
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-black bg-cyan-300 group-hover:bg-cyan-400 transition-colors" />

            <div>
              <h2 className="text-4xl font-bold mb-4 font-['Cabin_Sketch'] text-cyan-600">Instance A</h2>
              <p className="text-xl text-gray-800 font-['Fredericka_the_Great']">
                General community instance for everyone.
              </p>
            </div>

            <button className="w-full py-3 mt-6 border-2 border-black bg-cyan-100 hover:bg-cyan-200 font-bold text-xl font-['Cabin_Sketch'] transform transition-transform group-hover:scale-105"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              Join Now &rarr;
            </button>
          </div>

          {/* Instance B Card */}
          <div
            onClick={() => chooseInstance("https://instance-b.onrender.com")}
            className="group cursor-pointer relative bg-white p-8 transition-transform duration-300 hover:-translate-y-2 hover:-rotate-1 flex flex-col justify-between h-80"
            style={{
              border: '3px solid black',
              borderRadius: '95% 4% 97% 5% / 4% 97% 3% 98%', // Different rough shape
              boxShadow: '8px 8px 0px rgba(0,0,0,0.8)'
            }}
          >
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-black bg-purple-300 group-hover:bg-purple-400 transition-colors" />

            <div>
              <h2 className="text-4xl font-bold mb-4 font-['Cabin_Sketch'] text-purple-600">Instance B</h2>
              <p className="text-xl text-gray-800 font-['Fredericka_the_Great']">
                Alternate community instance with unique features.
              </p>
            </div>

            <button className="w-full py-3 mt-6 border-2 border-black bg-purple-100 hover:bg-purple-200 font-bold text-xl font-['Cabin_Sketch'] transform transition-transform group-hover:scale-105"
              style={{ borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' }}
            >
              Join Now &rarr;
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
