import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMenu, FiX } from "react-icons/fi";

const SECTIONS = [
    { id: "acceptance", label: "Acceptance of Terms" },
    { id: "registration", label: "Account Registration" },
    { id: "user-content", label: "User Content" },
    { id: "connections", label: "Connections & Interactions" },
    { id: "federation", label: "Federation" },
    { id: "ai-features", label: "AI Features" },
    { id: "moderation", label: "Content Moderation" },
    { id: "self-hosted", label: "Self-Hosted Instances" },
    { id: "liability", label: "Limitation of Liability" },
    { id: "termination", label: "Termination" },
    { id: "changes", label: "Changes to Terms" },
    { id: "contact", label: "Contact" },
];

export default function TermsOfServicePage() {
    const [activeSection, setActiveSection] = useState("acceptance");
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
                    <h1 className="text-sm sm:text-base font-bold text-gray-900 hidden sm:block">Terms of Service</h1>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors border-none">
                        {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto flex relative">
                {/* Sidebar */}
                <aside className={`fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white border-r border-gray-200/60 overflow-y-auto z-40 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} lg:block`}>
                    <nav className="py-6 px-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Terms of Service</div>
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

                    {/* Header */}
                    <div className="mb-16 scroll-mt-20">
                        <div className="inline-block bg-amber-100 text-amber-700 font-bold px-4 py-1.5 rounded-full text-sm mb-6">Terms of Service</div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Terms of Service</h2>
                        <p className="text-gray-500 text-sm">Last updated: March 2026</p>
                    </div>

                    {/* Acceptance */}
                    <section id="acceptance" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">1</span>
                            Acceptance of Terms
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                By accessing or using HeliiX ("the Platform"), you agree to be bound by these Terms of Service.
                                If you do not agree to these terms, you may not use the Platform. HeliiX is a decentralized,
                                federated social network — these terms apply to your use of any HeliiX instance.
                            </p>
                        </div>
                    </section>

                    {/* Registration */}
                    <section id="registration" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">2</span>
                            Account Registration
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
                                {[
                                    "You must provide a valid username, password, and email address to register",
                                    "Usernames may only contain alphanumeric characters, dashes (-), and underscores (_)",
                                    "You are responsible for maintaining the security of your account credentials",
                                    "You must not create accounts for the purpose of spamming, harassment, or impersonation",
                                    "You must be at least 13 years old to create an account",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* User Content */}
                    <section id="user-content" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">3</span>
                            User Content
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm space-y-4">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                You retain ownership of all content you create on HeliiX (posts, images, profile information).
                                By posting content, you grant HeliiX a non-exclusive license to store, display, and distribute
                                your content as part of the platform's normal operation, including federation to other instances.
                            </p>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
                                <strong>You agree not to post content that:</strong>
                            </div>
                            <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
                                {[
                                    "Is illegal, threatening, abusive, harassing, or defamatory",
                                    "Contains explicit or pornographic material (images are automatically screened)",
                                    "Infringes on intellectual property rights of others",
                                    "Contains malware, spam, or phishing attempts",
                                    "Impersonates another person or entity",
                                    "Violates the privacy of others",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Connections */}
                    <section id="connections" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">4</span>
                            Connections &amp; Interactions
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                HeliiX uses a mutual connection system where both parties must agree to connect. You may send
                                connection requests to other users, and you may accept or ignore incoming requests. You can
                                remove any connection at any time. Connections may be with users on the same instance or with
                                users on remote federated instances.
                            </p>
                        </div>
                    </section>

                    {/* Federation */}
                    <section id="federation" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">5</span>
                            Federation
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm space-y-4">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                HeliiX operates on the ActivityPub protocol, enabling communication with other Fediverse platforms.
                                When you interact with users on remote instances:
                            </p>
                            <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
                                {[
                                    "Your public profile information will be shared with those instances",
                                    "Your public posts will be delivered to your remote followers",
                                    "You are subject to both HeliiX's terms and the terms of the remote instance",
                                    "We cannot control how remote instances handle your data once it is federated",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* AI Features */}
                    <section id="ai-features" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">6</span>
                            AI Features
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm mb-4">
                                HeliiX offers AI-powered post completion and elaboration features. By using these features:
                            </p>
                            <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
                                {[
                                    "Your draft content is sent to a third-party AI service (Groq) for processing",
                                    "You are responsible for reviewing and approving AI-generated content before posting",
                                    "AI-generated content is subject to the same content rules as manually created posts",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Moderation */}
                    <section id="moderation" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">7</span>
                            Content Moderation
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                Images uploaded to HeliiX may be automatically scanned for explicit content using Google Cloud Vision's
                                SafeSearch detection. Content flagged as potentially harmful may be blocked from upload. Instance
                                administrators may additionally moderate content at their discretion.
                            </p>
                        </div>
                    </section>

                    {/* Self-Hosted */}
                    <section id="self-hosted" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">8</span>
                            Self-Hosted Instances
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm mb-4">
                                HeliiX is open source and can be self-hosted. If you run your own instance:
                            </p>
                            <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
                                {[
                                    "You are the data controller for your instance and responsible for compliance with applicable laws",
                                    "You must create your own Terms of Service and Privacy Policy for your users",
                                    "You are responsible for securing your instance and its data",
                                    "You agree not to use HeliiX to build services that harm others",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Liability */}
                    <section id="liability" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">9</span>
                            Limitation of Liability
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                HeliiX is provided "as is" without warranty of any kind. We are not responsible for content
                                posted by users, data loss due to technical issues, actions of remote federated instances, or
                                any damages arising from the use of the Platform. The HeliiX project and its contributors shall
                                not be liable for any indirect, incidental, special, consequential, or punitive damages.
                            </p>
                        </div>
                    </section>

                    {/* Termination */}
                    <section id="termination" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">10</span>
                            Termination
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                Instance administrators reserve the right to suspend or terminate accounts that violate these terms.
                                Users may delete their data and close their account at any time by contacting their instance administrator.
                                Upon termination, we will make reasonable efforts to remove your data, though federated copies on remote
                                servers are outside our control.
                            </p>
                        </div>
                    </section>

                    {/* Changes */}
                    <section id="changes" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">11</span>
                            Changes to Terms
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                We may update these Terms of Service from time to time. Material changes will be communicated through
                                the platform. Your continued use of HeliiX after changes are posted constitutes acceptance of the
                                updated terms.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section id="contact" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">12</span>
                            Contact
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <p className="text-gray-700 leading-relaxed text-sm">
                                For questions about these Terms, contact the administrator of your HeliiX instance. For the official
                                HeliiX project, reach out through the project's GitHub repository.
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
