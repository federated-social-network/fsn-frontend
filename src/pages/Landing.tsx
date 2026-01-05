import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const chooseInstance = (url: string) => {
    localStorage.setItem("INSTANCE_BASE_URL", url);
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-[#1b0b2e] text-white flex flex-col items-center justify-center px-6">
      
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
        Social networking that's not for sale.
      </h1>

      <p className="text-gray-300 max-w-xl text-center mb-10">
        Choose an instance. Each instance is independently managed, with its
        own users, rules, and data.
      </p>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
        
        {/* Instance A */}
        <div className="bg-[#2a1245] rounded-xl p-6 hover:scale-[1.02] transition">
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
        <div className="bg-[#2a1245] rounded-xl p-6 hover:scale-[1.02] transition">
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
  );
}
