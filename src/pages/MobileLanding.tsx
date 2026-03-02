import { useNavigate } from "react-router-dom";
import { INSTANCES } from "../config/instances";
import { motion } from "framer-motion";
import { FiGlobe, FiCode, FiShield, FiShare2, FiArrowRight } from "react-icons/fi";

export default function MobileLanding() {
    const navigate = useNavigate();

    const chooseInstance = (url: string) => {
        localStorage.setItem("INSTANCE_BASE_URL", url);
        navigate("/auth/login");
    };

    const features = [
        { icon: FiGlobe, title: "Decentralized", desc: "No single company owns your data. Each server is independent." },
        { icon: FiCode, title: "Open Source", desc: "Built on transparent code. You have the right to inspect." },
        { icon: FiShield, title: "Not for Sale", desc: "No algorithms manipulating your feed, no ads tracking you." },
        { icon: FiShare2, title: "Interoperable", desc: "Follow anyone on the Fediverse." }
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-10">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="HeliiX" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-xl tracking-tight text-gray-900">HeliiX</span>
                </div>
            </header>

            {/* Hero Section */}
            <section className="px-6 pt-16 pb-12 flex flex-col items-center text-center bg-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-block bg-blue-50 text-blue-600 font-medium px-4 py-1.5 rounded-full text-sm mb-6">
                        Welcome to the Fediverse
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight text-gray-900">
                        Decentralized. <br /> Private. <br /> <span className="text-blue-600">Yours.</span>
                    </h1>

                    <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-sm mx-auto">
                        Join a server, keep control of your data, and connect with people across the entire network.
                    </p>
                </motion.div>
            </section>

            {/* Instances / Servers */}
            <section className="px-6 py-12">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Server</h2>
                    <p className="text-gray-500 text-sm">Select a community to join and start connecting.</p>
                </div>

                <div className="flex flex-col gap-4">
                    {INSTANCES.map((inst, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => chooseInstance(inst.url)}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                        >
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-xl font-bold text-gray-900">{inst.name}</h3>
                                <div className={`w-3 h-3 rounded-full ${inst.name.includes('A') ? 'bg-cyan-500' : 'bg-purple-500'}`} />
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed mb-2">
                                {inst.description}
                            </p>
                            <div className="flex items-center text-blue-600 font-semibold text-sm">
                                Join {inst.name} <FiArrowRight strokeWidth={2.5} className="ml-1.5" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features Simple List */}
            <section className="px-6 py-12 bg-white mt-4 border-y border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">Why HeliiX?</h2>

                <div className="grid grid-cols-1 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <feature.icon className="text-xl text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                                <p className="text-gray-600 text-base leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer minimal */}
            <footer className="px-6 pt-12 pb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-6 opacity-60">
                    <img src="/logo.png" alt="HeliiX Logo" className="w-6 h-6 object-contain grayscale" />
                    <span className="font-bold text-gray-500 tracking-wide text-lg">HeliiX</span>
                </div>
                <p className="text-gray-400 text-xs font-mono">
                    © {new Date().getFullYear()} HeliiX Project.
                </p>
            </footer>
        </div>
    );
}
