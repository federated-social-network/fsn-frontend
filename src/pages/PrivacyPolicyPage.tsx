import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMenu, FiX } from "react-icons/fi";

const SECTIONS = [
    { id: "introduction", label: "Introduction" },
    { id: "info-collected", label: "Information We Collect" },
    { id: "how-we-use", label: "How We Use Your Info" },
    { id: "data-sharing", label: "Data Sharing & Federation" },
    { id: "data-security", label: "Data Storage & Security" },
    { id: "third-party", label: "Third-Party Services" },
    { id: "your-rights", label: "Your Rights" },
    { id: "changes", label: "Changes to This Policy" },
    { id: "contact", label: "Contact" },
];

export default function PrivacyPolicyPage() {
    const [activeSection, setActiveSection] = useState("introduction");
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
                    <h1 className="text-sm sm:text-base font-bold text-gray-900 hidden sm:block">Privacy Policy</h1>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors border-none">
                        {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto flex relative">
                {/* Sidebar */}
                <aside className={`fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white border-r border-gray-200/60 overflow-y-auto z-40 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} lg:block`}>
                    <nav className="py-6 px-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Privacy Policy</div>
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

                    {/* Introduction */}
                    <section id="introduction" className="mb-16 scroll-mt-20">
                        <div className="inline-block bg-green-100 text-green-700 font-bold px-4 py-1.5 rounded-full text-sm mb-6">Privacy Policy</div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Privacy Policy</h2>
                        <p className="text-gray-500 text-sm mb-6">Last updated: March 2026</p>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <p className="text-gray-700 leading-relaxed">
                                HeliiX ("we", "our", or "us") is a decentralized, federated social network. This Privacy Policy explains
                                how we collect, use, and protect your information when you use our platform. Because HeliiX is decentralized,
                                each community instance may be operated by different individuals or organizations — this policy covers the
                                official HeliiX platform. If you are using a self-hosted community, the operator of that instance is
                                responsible for their own privacy practices.
                            </p>
                        </div>
                    </section>

                    {/* Information We Collect */}
                    <section id="info-collected" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">1</span>
                            Information We Collect
                        </h2>
                        <div className="space-y-4">
                            {[
                                { title: "Account Information", desc: "When you register, we collect your username, email address, and a hashed version of your password. We use Argon2 hashing — we never store plaintext passwords." },
                                { title: "Profile Data", desc: "You may optionally provide a display name, bio, and avatar image. Profile information is publicly visible to other users." },
                                { title: "Posts & Content", desc: "Any content you create (posts, images) is stored on the server. Public posts may be shared with other federated instances via ActivityPub. Followers-only posts are only distributed to your accepted connections." },
                                { title: "Connection Data", desc: "We store records of your connections (who you follow and who follows you), including connections to users on remote instances." },
                                { title: "Cryptographic Keys", desc: "Each user account has an RSA keypair used for signing federated activities. The public key is shared with other instances; the private key is stored securely and is never shared." },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-4 items-start bg-white rounded-xl border border-gray-200/60 p-5 shadow-sm">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                                    <div>
                                        <div className="font-bold text-gray-900 mb-1">{item.title}</div>
                                        <div className="text-sm text-gray-600 leading-relaxed">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* How We Use Your Information */}
                    <section id="how-we-use" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">2</span>
                            How We Use Your Information
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
                                {[
                                    "To provide and maintain the social network service",
                                    "To authenticate your identity and protect your account",
                                    "To deliver your posts to your connections and the Fediverse",
                                    "To send password reset OTP emails when requested",
                                    "To moderate content (images are checked for explicit content using Google Cloud Vision)",
                                    "To improve post content quality via AI features (only when you explicitly use the feature)",
                                    "To cache timeline data in Redis for performance (cached data expires automatically)",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Data Sharing & Federation */}
                    <section id="data-sharing" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">3</span>
                            Data Sharing &amp; Federation
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm space-y-4">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                As a federated platform, certain data is shared with other servers when you interact with users on remote instances:
                            </p>
                            <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
                                {[
                                    "Your public profile (username, avatar, public key) is discoverable via WebFinger",
                                    "Public posts are delivered to remote followers' instances",
                                    "Follow/unfollow actions are communicated to the relevant remote servers",
                                    "All federated messages are signed with HTTP Signatures for authenticity",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 mt-4">
                                We do not sell, rent, or share your personal data with advertisers or third-party data brokers.
                            </div>
                        </div>
                    </section>

                    {/* Data Storage & Security */}
                    <section id="data-security" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">4</span>
                            Data Storage &amp; Security
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm space-y-4">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                Your data is stored in a PostgreSQL database. Images (avatars and post attachments) are stored in
                                Supabase cloud storage. We employ the following security measures:
                            </p>
                            <div className="space-y-3">
                                {[
                                    "Passwords hashed with Argon2 (industry-standard)",
                                    "JWT tokens with expiration for API authentication",
                                    "RSA-2048 keypairs for signing federated activities",
                                    "SSL/TLS encryption for data in transit",
                                    "Database connections over SSL (sslmode=require)",
                                ].map((item) => (
                                    <div key={item} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                        <span className="text-sm text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Third-Party Services */}
                    <section id="third-party" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">5</span>
                            Third-Party Services
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { name: "Supabase", desc: "Cloud database and file storage" },
                                { name: "Groq", desc: "AI-powered post enhancement (content is sent only when you use the feature)" },
                                { name: "Google Cloud Vision", desc: "Image moderation for safety" },
                                { name: "Gmail API / SMTP", desc: "Sending password reset emails" },
                            ].map((item) => (
                                <div key={item.name} className="bg-white rounded-xl border border-gray-200/60 p-5 shadow-sm">
                                    <div className="font-bold text-gray-900 mb-1">{item.name}</div>
                                    <div className="text-sm text-gray-600">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section id="your-rights" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">6</span>
                            Your Rights
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
                                {[
                                    "You can update your profile information at any time",
                                    "You can delete your posts",
                                    "You can remove connections at any time",
                                    "You can request account deletion by contacting the instance administrator",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Changes */}
                    <section id="changes" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">7</span>
                            Changes to This Policy
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                We may update this Privacy Policy from time to time. We will notify users of any material changes
                                through the platform. Continued use of HeliiX after changes constitutes acceptance of the updated policy.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section id="contact" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">8</span>
                            Contact
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                If you have questions about this Privacy Policy or your data, please contact the administrator of your
                                HeliiX instance. For the official HeliiX platform, reach out through the project's GitHub repository.
                            </p>
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
