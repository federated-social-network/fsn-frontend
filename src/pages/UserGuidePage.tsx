import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiMenu, FiX } from "react-icons/fi";

const SECTIONS = [
    { id: "getting-started", label: "Getting Started" },
    { id: "dashboard-feed", label: "Dashboard & Feed" },
    { id: "creating-posts", label: "Creating Posts" },
    { id: "interacting-posts", label: "Interacting with Posts" },
    { id: "user-profile", label: "User Profile" },
    { id: "connections", label: "Connections & Networking" },
    { id: "search-discovery", label: "Search & Discovery" },
    { id: "real-time-chat", label: "Real-Time Chat" },
    { id: "video-voice-calls", label: "Video & Voice Calls" },
    { id: "notifications", label: "Notifications" },
    { id: "federation", label: "Federation" },
    { id: "mobile-experience", label: "Mobile Experience" },
    { id: "account-security", label: "Account Security" },
    { id: "privacy-terms", label: "Privacy & Terms" },
];

export default function UserGuidePage() {
    const [activeSection, setActiveSection] = useState("getting-started");
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
                    <Link to="/documentation" className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors font-bold text-sm border-none">
                        <FiArrowLeft /> Back to Documentation
                    </Link>
                    <h1 className="text-sm sm:text-base font-bold text-gray-900 hidden sm:block">User Guide</h1>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors border-none">
                        {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto flex relative">
                {/* Sidebar */}
                <aside className={`fixed lg:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-64 bg-white border-r border-gray-200/60 overflow-y-auto z-40 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} lg:block`}>
                    <nav className="py-6 px-4">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">User Guide</div>
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

                    {/* Hero */}
                    <div className="mb-12">
                        <div className="inline-block bg-indigo-100 text-indigo-700 font-bold px-4 py-1.5 rounded-full text-sm mb-6">User Guide</div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">HeliiX — User Documentation</h2>
                        <p className="text-lg text-gray-600 leading-relaxed max-w-3xl">
                            <strong>HeliiX</strong> is a federated social networking platform that lets you connect, share, and communicate across multiple independent instances — including Mastodon-compatible servers via ActivityPub.
                        </p>
                    </div>

                    {/* 1. Getting Started */}
                    <section id="getting-started" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">1</span>
                            Getting Started
                        </h2>

                        <div className="space-y-6">
                            {/* Choosing an Instance */}
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Choosing an Instance</h3>
                                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                                    When you first visit HeliiX, you'll land on the <strong>Instance Selection</strong> page. HeliiX is a <strong>federated</strong> platform, meaning there are multiple independent servers (instances) you can join.
                                </p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                        <thead><tr className="bg-gray-50"><th className="text-left px-4 py-2 font-bold text-gray-700 border-b">Instance</th><th className="text-left px-4 py-2 font-bold text-gray-700 border-b">Description</th></tr></thead>
                                        <tbody>
                                            <tr className="border-b border-gray-100"><td className="px-4 py-2 font-medium">Social Community</td><td className="px-4 py-2 text-gray-600">The default HeliiX cloud community</td></tr>
                                            <tr><td className="px-4 py-2 font-medium">Local Dev Backend</td><td className="px-4 py-2 text-gray-600">For local development/testing</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-sm text-gray-600 mt-3">Click on an instance card to select it. Your choice is saved in your browser — you can switch instances later from the dashboard.</p>
                            </div>

                            {/* Registration */}
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Registration</h3>
                                <ol className="space-y-2 text-sm text-gray-700 leading-relaxed list-decimal list-inside">
                                    <li>Click <strong>Sign Up</strong> on the auth page.</li>
                                    <li>Fill in your <strong>Username</strong>, <strong>Email</strong> (optional), and <strong>Password</strong>.</li>
                                    <li>After registering, you'll be prompted with the <strong>Avatar Nudge</strong> — a playful two-step modal encouraging you to upload a profile picture. You can skip this step, but we recommend uploading one!</li>
                                    <li>Once done, you'll be redirected to <strong>Login</strong>.</li>
                                </ol>
                            </div>

                            {/* Logging In */}
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Logging In</h3>
                                <ol className="space-y-2 text-sm text-gray-700 leading-relaxed list-decimal list-inside">
                                    <li>Enter your <strong>Username</strong> and <strong>Password</strong>.</li>
                                    <li>Click <strong>Sign In</strong>.</li>
                                    <li>You'll be taken to the <strong>Dashboard</strong>.</li>
                                </ol>
                            </div>

                            {/* Forgot Password */}
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Forgot Password</h3>
                                <ol className="space-y-2 text-sm text-gray-700 leading-relaxed list-decimal list-inside">
                                    <li>Click <strong>Forgot Password?</strong> on the login page.</li>
                                    <li>Enter your registered <strong>email address</strong>.</li>
                                    <li>You'll receive a <strong>one-time password (OTP)</strong> via email.</li>
                                    <li>Enter the OTP to verify your identity.</li>
                                    <li>Set a <strong>new password</strong> and log in.</li>
                                </ol>
                            </div>
                        </div>
                    </section>

                    {/* 2. Dashboard & Feed */}
                    <section id="dashboard-feed" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">2</span>
                            Dashboard &amp; Feed
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm space-y-5">
                            <p className="text-sm text-gray-700 leading-relaxed">The Dashboard is your home screen. It consists of three sections:</p>

                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-2">Left Sidebar (Desktop)</h3>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /><span><strong>Available Users</strong> — Suggested users to connect with, showing their display name and @username.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /><span><strong>Pending Invites</strong> — Incoming connection requests you can accept.</span></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-2">Center Feed</h3>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /><span><strong>Global Feed</strong> — Posts from all users on the instance.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /><span><strong>Following Feed</strong> — Posts only from users you're connected with.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /><span>Toggle between feeds using the <strong>Global / Following</strong> tabs at the top.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /><span><strong>Pull-to-refresh</strong> or use the refresh button to load new posts.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /><span>A <strong>scroll-to-top</strong> button appears when you scroll down.</span></li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-2">Right Sidebar (Desktop)</h3>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /><span><strong>Notifications Panel</strong> — Shows recent likes, comments, mentions, and connection activity with real-time polling.</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 3. Creating Posts */}
                    <section id="creating-posts" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">3</span>
                            Creating Posts
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">On Desktop</h3>
                                <ol className="space-y-2 text-sm text-gray-700 leading-relaxed list-decimal list-inside">
                                    <li>Click the <strong>"What's on your mind?"</strong> bar at the top of the feed.</li>
                                    <li>A <strong>Post Modal</strong> opens where you can:
                                        <ul className="mt-2 ml-4 space-y-1">
                                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" /><span>Write text content (up to the character limit).</span></li>
                                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" /><span><strong>Attach an image</strong> — click the image icon to upload. Images are automatically checked for inappropriate content.</span></li>
                                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" /><span><strong>Use Voice Dictation</strong> — click the microphone icon to dictate your post using speech-to-text.</span></li>
                                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" /><span><strong>AI Enhance</strong> — click "Enhance" to get an AI-generated improved version of your text.</span></li>
                                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" /><span><strong>AI Elaborate</strong> — click "Elaborate" to expand your content with more detail.</span></li>
                                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" /><span><strong>@Mention users</strong> — type <code className="bg-gray-100 px-1 rounded">@</code> followed by a username to mention someone.</span></li>
                                            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" /><span><strong>Set Visibility</strong> — choose between <strong>Public</strong> or <strong>Connections Only</strong>.</span></li>
                                        </ul>
                                    </li>
                                    <li>Click <strong>Post</strong> to publish.</li>
                                </ol>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">On Mobile</h3>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /><span>Tap the <strong>+</strong> button in the bottom navigation bar.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /><span>The full-screen <strong>Create Post</strong> page opens with the same features as above.</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 4. Interacting with Posts */}
                    <section id="interacting-posts" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">4</span>
                            Interacting with Posts
                        </h2>
                        <div className="space-y-4">
                            {[
                                { title: "Liking", items: ["Click the heart icon on any post to like it. The heart turns red when liked.", "Double-tap on a post image to like it — a heart animation plays.", "Your likes persist across sessions."] },
                                { title: "Commenting", items: ["Click the comment icon to expand the comment section.", "Type your comment and press Enter or click the send button.", "You can delete your own comments by hovering over them and clicking the × button.", "Comment counts update in real-time."] },
                                { title: "Deleting Posts", items: ["On your own posts, a delete option is available.", "A confirmation modal will appear before deletion."] },
                            ].map((group) => (
                                <div key={group.title} className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">{group.title}</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        {group.items.map((item) => (
                                            <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" /><span>{item}</span></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 5. User Profile */}
                    <section id="user-profile" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">5</span>
                            User Profile
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Viewing Profiles</h3>
                                <p className="text-sm text-gray-700 mb-2">Click on any <strong>username</strong> or <strong>avatar</strong> in the feed to visit their profile. Profiles display:</p>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    {["Avatar, display name, and username", "Bio and website", "Post count, Connection count", "A grid/list view of their posts"].map((item) => (
                                        <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" /><span>{item}</span></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Editing Your Profile</h3>
                                <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                                    <li>Navigate to your own profile.</li>
                                    <li>Click the <strong>Edit</strong> (pencil) icon.</li>
                                    <li>You can update: <strong>Display Name</strong> and <strong>Bio</strong>.</li>
                                    <li>Click <strong>Save</strong> to apply changes.</li>
                                </ol>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Uploading/Changing Avatar</h3>
                                <ul className="space-y-1 text-sm text-gray-700">
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" /><span>Click on your avatar on your profile page.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" /><span>Select a new image file. The avatar updates immediately.</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 6. Connections & Networking */}
                    <section id="connections" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">6</span>
                            Connections &amp; Networking
                        </h2>
                        <div className="space-y-4">
                            {[
                                { title: "Sending Connection Requests", items: ["On the Dashboard, click Connect next to a suggested user.", "On a user's profile, click the Connect button.", "On the Search page, click the + icon next to a user."] },
                                { title: "Accepting Invites", items: ["Pending invites appear in the left sidebar on Dashboard (desktop), the Network page (mobile), and the Search page under \"Pending Invites\".", "Click Accept (✓) to approve the request."] },
                                { title: "Removing Connections", items: ["Go to your Profile → Click on connections count.", "Click the remove button next to any connection."] },
                            ].map((group) => (
                                <div key={group.title} className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">{group.title}</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        {group.items.map((item) => (
                                            <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /><span>{item}</span></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 7. Search & Discovery */}
                    <section id="search-discovery" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">7</span>
                            Search &amp; Discovery
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Searching for Users</h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" /><span><strong>Desktop</strong>: Click the search icon in the navbar to open the User Search Modal.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" /><span><strong>Mobile</strong>: Navigate to the Search tab in the bottom navigation.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" /><span>Type a username or display name — results appear as you type (with debouncing).</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" /><span>Results show the user's avatar, display name, @username, and connection status.</span></li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Discover People</h3>
                                <p className="text-sm text-gray-700">The <strong>Network</strong> page (mobile) and <strong>Dashboard sidebar</strong> (desktop) show random suggested users you might want to connect with.</p>
                            </div>
                        </div>
                    </section>

                    {/* 8. Real-Time Chat */}
                    <section id="real-time-chat" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">8</span>
                            Real-Time Chat
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Accessing Chat</h3>
                                <p className="text-sm text-gray-700">Click the Messages icon in the navbar, or navigate to /chat.</p>
                            </div>
                            {[
                                { title: "Starting a Conversation", items: ["In the left panel, your existing conversations are listed with the last message preview and timestamp.", "Click the Connections section header to expand your connection list.", "Click on any connection to start or continue a conversation."] },
                                { title: "Sending Messages", items: ["Type your message in the input bar at the bottom.", "Press Enter or click the Send button.", "Messages appear in real-time via WebSocket."] },
                                { title: "Emoji Support", items: ["Click the smiley face icon to open the emoji picker.", "Select an emoji to insert it into your message."] },
                                { title: "Unread Indicators", items: ["Conversations with unread messages show a blue badge with the unread count.", "Unread conversations have bold text in the sidebar.", "Clicking on a conversation clears its unread status and sends a read receipt."] },
                                { title: "Searching Conversations", items: ["Use the search bar at the top of the chat list to filter conversations by username."] },
                            ].map((group) => (
                                <div key={group.title} className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">{group.title}</h3>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        {group.items.map((item) => (
                                            <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" /><span>{item}</span></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 9. Video & Voice Calls */}
                    <section id="video-voice-calls" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">9</span>
                            Video &amp; Voice Calls
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Starting a Call</h3>
                                <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                                    <li>Open a chat conversation.</li>
                                    <li>In the chat header, click 📹 <strong>Video</strong> icon for a video call or 📞 <strong>Phone</strong> icon for a voice call.</li>
                                    <li>The call state changes to <strong>"Calling..."</strong> while waiting for the other person.</li>
                                </ol>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Receiving a Call</h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" /><span>When someone calls you, an <strong>incoming call overlay</strong> appears showing the caller's name and avatar.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" /><span>You can <strong>Accept</strong> (green button) or <strong>Decline</strong> (red button).</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" /><span>After accepting, a <strong>connecting countdown</strong> plays before the call starts.</span></li>
                                </ul>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">During a Call</h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    {["Mute/Unmute — Toggle your microphone.", "Video On/Off — Toggle your camera (video calls only).", "Call Timer — Shows elapsed call time.", "End Call — Click the red phone button to hang up."].map((item) => (
                                        <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" /><span>{item}</span></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Call Features</h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    {[
                                        "Uses WebRTC for peer-to-peer communication.",
                                        "Includes STUN/TURN servers for NAT traversal.",
                                        "Camera fallback: if the camera is busy, video calls automatically fall back to voice.",
                                        "After ending a call, your camera and microphone are fully released.",
                                        "Resizable Call Panel (Desktop): Drag the edge of the call panel to resize it while chatting.",
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" /><span>{item}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 10. Notifications */}
                    <section id="notifications" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">10</span>
                            Notifications
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Types of Notifications</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                        <thead><tr className="bg-gray-50"><th className="text-left px-4 py-2 font-bold text-gray-700 border-b">Type</th><th className="text-left px-4 py-2 font-bold text-gray-700 border-b">Description</th></tr></thead>
                                        <tbody>
                                            <tr className="border-b border-gray-100"><td className="px-4 py-2">❤️ Like</td><td className="px-4 py-2 text-gray-600">Someone liked your post</td></tr>
                                            <tr className="border-b border-gray-100"><td className="px-4 py-2">💬 Comment</td><td className="px-4 py-2 text-gray-600">Someone commented on your post</td></tr>
                                            <tr className="border-b border-gray-100"><td className="px-4 py-2">👤 Follow / Connection</td><td className="px-4 py-2 text-gray-600">Someone connected with you</td></tr>
                                            <tr><td className="px-4 py-2">📩 Mention</td><td className="px-4 py-2 text-gray-600">Someone mentioned you in a post</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Viewing Notifications</h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /><span><strong>Desktop</strong>: Notifications appear in the right sidebar of the Dashboard.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /><span><strong>Mobile</strong>: Tap the Bell icon in the bottom navigation bar.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /><span>Notifications auto-refresh every <strong>5 seconds</strong>.</span></li>
                                    <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" /><span>Each notification links to the relevant profile.</span></li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 11. Federation */}
                    <section id="federation" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">11</span>
                            Federation
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm space-y-4">
                            <p className="text-sm text-gray-700">HeliiX supports the <strong>ActivityPub</strong> protocol, meaning you can interact with users on other federated platforms like <strong>Mastodon</strong>.</p>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-2">How It Works</h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    {[
                                        "WebFinger Discovery — Remote users can find your profile using @username@yourdomain.com.",
                                        "Following Remote Users — When you follow a remote user, HeliiX sends a Follow activity to their instance.",
                                        "Receiving Remote Posts — Posts from remote users you follow appear in your Following feed.",
                                        "Cross-Instance Interactions — Likes, comments, and follows work across federated instances.",
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 shrink-0" /><span>{item}</span></li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-800 mt-4">
                                Want to create your own community? Visit the <Link to="/docs/create-community" className="font-bold underline border-none">Self-Hosting Guide</Link> for a step-by-step walkthrough.
                            </div>
                        </div>
                    </section>

                    {/* 12. Mobile Experience */}
                    <section id="mobile-experience" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">12</span>
                            Mobile Experience
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Bottom Navigation Bar</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                        <thead><tr className="bg-gray-50"><th className="text-left px-4 py-2 font-bold text-gray-700 border-b">Icon</th><th className="text-left px-4 py-2 font-bold text-gray-700 border-b">Page</th></tr></thead>
                                        <tbody>
                                            <tr className="border-b border-gray-100"><td className="px-4 py-2">🏠 Home</td><td className="px-4 py-2 text-gray-600">Dashboard / Feed</td></tr>
                                            <tr className="border-b border-gray-100"><td className="px-4 py-2">🔗 Network</td><td className="px-4 py-2 text-gray-600">Connections & Invites</td></tr>
                                            <tr className="border-b border-gray-100"><td className="px-4 py-2">➕ Create</td><td className="px-4 py-2 text-gray-600">New Post</td></tr>
                                            <tr className="border-b border-gray-100"><td className="px-4 py-2">🔍 Search</td><td className="px-4 py-2 text-gray-600">Find Users</td></tr>
                                            <tr><td className="px-4 py-2">🔔 Notifications</td><td className="px-4 py-2 text-gray-600">Activity Feed</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">Mobile-Optimized Features</h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    {[
                                        "Swipe left/right between pages for quick navigation.",
                                        "Full-screen post creation with speech-to-text.",
                                        "Touch-friendly chat interface with swipe gestures.",
                                        "Responsive call overlay and controls.",
                                        "Safe area support for devices with notches/home indicators.",
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" /><span>{item}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 13. Account Security */}
                    <section id="account-security" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">13</span>
                            Account Security
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                            <ul className="space-y-3 text-sm text-gray-700">
                                {[
                                    "JWT Authentication — Secure token-based auth with automatic refresh.",
                                    "Password Reset — Email-based OTP verification flow.",
                                    "Session Management — Expired sessions redirect to the login page automatically.",
                                    "Content Moderation — Uploaded images are scanned for inappropriate content before posting.",
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                                        <span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* 14. Privacy & Terms */}
                    <section id="privacy-terms" className="mb-16 scroll-mt-20">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold">14</span>
                            Privacy &amp; Terms
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link to="/privacy" className="border-none block">
                                <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Privacy Policy</h3>
                                    <p className="text-sm text-gray-600">Details how your data is collected, used, and protected.</p>
                                </div>
                            </Link>
                            <Link to="/terms" className="border-none block">
                                <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Terms of Service</h3>
                                    <p className="text-sm text-gray-600">Outlines the rules and guidelines for using the platform.</p>
                                </div>
                            </Link>
                        </div>
                    </section>

                    {/* Keyboard Shortcuts & Browser Reqs */}
                    <section className="mb-16">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">⌨️ Keyboard Shortcuts</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                        <thead><tr className="bg-gray-50"><th className="text-left px-4 py-2 font-bold text-gray-700 border-b">Shortcut</th><th className="text-left px-4 py-2 font-bold text-gray-700 border-b">Action</th></tr></thead>
                                        <tbody>
                                            <tr className="border-b border-gray-100"><td className="px-4 py-2"><code className="bg-gray-100 px-2 py-0.5 rounded text-xs">Enter</code></td><td className="px-4 py-2 text-gray-600">Send message (Chat)</td></tr>
                                            <tr className="border-b border-gray-100"><td className="px-4 py-2"><code className="bg-gray-100 px-2 py-0.5 rounded text-xs">Enter</code></td><td className="px-4 py-2 text-gray-600">Submit comment</td></tr>
                                            <tr><td className="px-4 py-2"><code className="bg-gray-100 px-2 py-0.5 rounded text-xs">@</code> + typing</td><td className="px-4 py-2 text-gray-600">Trigger @mention dropdown</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">🌐 Browser Requirements</h3>
                                <ul className="space-y-2 text-sm text-gray-700">
                                    {[
                                        "Recommended: Chrome, Firefox, Edge (latest versions)",
                                        "Camera/Mic: Required for video/voice calls — grant permissions when prompted",
                                        "WebRTC: Must be enabled for calls to work",
                                        "Cookies/LocalStorage: Required for authentication and instance selection",
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" /><span>{item}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="border-t border-gray-200/60 pt-8 pb-4 text-center">
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} HeliiX. <Link to="/documentation" className="text-gray-600 hover:text-black font-bold border-none">Back to Documentation</Link>
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
