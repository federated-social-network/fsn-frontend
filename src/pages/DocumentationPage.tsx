import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMenu, FiX, FiBook, FiCode, FiServer, FiUsers, FiShield, FiGlobe } from "react-icons/fi";

const SECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "what-is-heliix", label: "What is HeliiX?" },
    { id: "features", label: "Key Features" },
    { id: "guides", label: "Guides" },
    { id: "get-started", label: "Get Started" },
];

export default function DocumentationPage() {
    const [activeSection, setActiveSection] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                }
            },
            { rootMargin: "-80px 0px -70% 0px", threshold: 0.1 }
        );
        SECTIONS.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] text-gray-900">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
                    <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors font-bold text-sm border-none">
                        <FiArrowLeft /> Back to HeliiX
                    </Link>
                    <h1 className="text-sm sm:text-base font-bold text-gray-900 hidden sm:block">Documentation</h1>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors border-none">
                        {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto flex relative">
                {/* Sidebar */}
                <aside className={`fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white border-r border-gray-200/60 overflow-y-auto z-40 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} lg:block`}>
                    <nav className="py-6 px-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Documentation</div>
                        <ul className="space-y-0.5">
                            {SECTIONS.map((s) => (
                                <li key={s.id}>
                                    <button onClick={() => scrollTo(s.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all border-none ${activeSection === s.id ? "bg-black text-white shadow-sm" : "text-gray-600 hover:text-black hover:bg-gray-100"}`}>
                                        {s.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>

                {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

                {/* Main Content */}
                <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-10 lg:ml-0">

                    {/* Overview */}
                    <section id="overview" className="mb-16 scroll-mt-20">
                        <div className="inline-block bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm mb-6">Documentation</div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">HeliiX Documentation</h2>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mb-6">
                            Everything you need to know about using, deploying, and contributing to the HeliiX federated social network.
                        </p>

                        {/* Quick Links */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { icon: FiBook, title: "Getting Started", desc: "New to HeliiX? Learn the basics — creating an account, making posts, and connecting with others.", color: "bg-blue-50 text-blue-600" },
                                { icon: FiServer, title: "Self-Hosting Guide", desc: "Deploy your own HeliiX community instance with our comprehensive setup guide.", color: "bg-purple-50 text-purple-600", link: "/docs/create-community" },
                                { icon: FiCode, title: "API Reference", desc: "Complete reference for all REST and ActivityPub endpoints, with examples.", color: "bg-green-50 text-green-600", link: "/docs/create-community#api" },
                                { icon: FiUsers, title: "Connections & Social", desc: "Learn about the connection system, following users, and managing your network.", color: "bg-amber-50 text-amber-600" },
                                { icon: FiShield, title: "Security & Privacy", desc: "Our approach to data security, encryption, and user privacy protections.", color: "bg-red-50 text-red-600", link: "/privacy" },
                                { icon: FiGlobe, title: "Federation", desc: "How HeliiX connects with Mastodon, PixelFed, and other Fediverse platforms.", color: "bg-cyan-50 text-cyan-600", link: "/docs/create-community#federation" },
                            ].map((item) => {
                                const content = (
                                    <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
                                        <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <item.icon className="text-xl" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                                    </div>
                                );
                                return item.link ? <Link key={item.title} to={item.link} className="border-none">{content}</Link> : <div key={item.title}>{content}</div>;
                            })}
                        </div>
                    </section>

                    {/* What is HeliiX */}
                    <section id="what-is-heliix" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">1</span>
                            What is HeliiX?
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-8 shadow-sm space-y-4 text-gray-700 leading-relaxed">
                            <p>
                                <strong>HeliiX</strong> is a decentralized, federated social network built for communities. Unlike centralized
                                platforms, HeliiX lets anyone run their own independent server (instance) while still being connected to a
                                larger network of communities through the <strong>ActivityPub</strong> protocol.
                            </p>
                            <p>
                                Each community controls its own data, rules, and moderation policies. Users can follow and interact with people
                                on other communities seamlessly — just like email works across different providers.
                            </p>
                            <p>
                                The platform is <strong>open source</strong>, built with FastAPI (Python) on the backend and React + Vite on
                                the frontend. It includes features like AI-powered post enhancement, image moderation, real-time feeds, and
                                full ActivityPub federation support.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                            {[
                                { label: "Backend", value: "FastAPI (Python 3.11)" },
                                { label: "Database", value: "PostgreSQL + SQLAlchemy" },
                                { label: "Frontend", value: "React + Vite + Tailwind" },
                            ].map((item) => (
                                <div key={item.label} className="bg-white rounded-xl border border-gray-200/60 p-4 shadow-sm">
                                    <div className="text-xs font-bold text-gray-400 uppercase mb-1">{item.label}</div>
                                    <div className="font-bold text-gray-900">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Key Features */}
                    <section id="features" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">2</span>
                            Key Features
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                "User registration with RSA keypair generation",
                                "JWT-based authentication with token expiry",
                                "Create posts with text and image attachments",
                                "Public and followers-only post visibility",
                                "AI-powered post completion and elaboration",
                                "Image moderation via Google Cloud Vision",
                                "User connections with request/accept flow",
                                "Follow remote Fediverse users (Mastodon, etc.)",
                                "ActivityPub inbox/outbox with HTTP Signatures",
                                "Password reset with OTP via email",
                                "Redis-cached timeline for performance",
                                "Docker deployment support",
                            ].map((feature) => (
                                <div key={feature} className="flex items-start gap-3 bg-white rounded-lg border border-gray-200/60 p-3 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                    <span className="text-sm text-gray-700">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Guides */}
                    <section id="guides" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">3</span>
                            Guides
                        </h2>
                        <div className="space-y-4">
                            {[
                                { title: "Self-Hosting Guide", desc: "Complete step-by-step instructions to deploy your own HeliiX community instance, from installation to federation.", link: "/docs/create-community" },
                                { title: "Privacy Policy", desc: "Our approach to data collection, storage, and sharing — including federation-specific details.", link: "/privacy" },
                                { title: "Terms of Service", desc: "The rules governing usage of the HeliiX platform, content policies, and self-hosted instance responsibilities.", link: "/terms" },
                            ].map((item) => (
                                <Link key={item.title} to={item.link} className="border-none block">
                                    <div className="flex gap-4 items-start bg-white rounded-xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
                                        <div>
                                            <div className="font-bold text-gray-900 mb-1">{item.title}</div>
                                            <div className="text-sm text-gray-600">{item.desc}</div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Get Started */}
                    <section id="get-started" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">4</span>
                            Get Started
                        </h2>
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200/60 p-10 text-center">
                            <h3 className="text-2xl font-extrabold mb-3">Ready to create your own community?</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Follow our step-by-step guide to deploy and configure your own HeliiX instance.
                            </p>
                            <Link
                                to="/docs/create-community"
                                className="inline-flex items-center gap-2 bg-black text-white font-bold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors border-none shadow-sm"
                            >
                                Self-Hosting Guide →
                            </Link>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="border-t border-gray-200/60 pt-8 pb-4 text-center">
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} HeliiX. <Link to="/" className="text-gray-600 hover:text-black font-bold border-none">Back to home</Link>
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
