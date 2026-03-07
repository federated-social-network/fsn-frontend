import { Link, useLocation } from "react-router-dom";
import { FiHome, FiPlusSquare, FiUser, FiMessageSquare, FiSearch } from "react-icons/fi";
import { useState, useEffect } from "react";

export default function MobileNavbar() {
    const location = useLocation();
    const username = localStorage.getItem("username") || "";

    const isActive = (path: string) => {
        if (path === `/profile/${username}` && location.pathname.startsWith("/profile/")) {
            return true;
        }
        return location.pathname === path;
    };

    // Listen for custom event to hide bottom nav in active chat
    const [hideNav, setHideNav] = useState(false);

    useEffect(() => {
        const handleHide = () => setHideNav(true);
        const handleShow = () => setHideNav(false);

        window.addEventListener("chat:open", handleHide);
        window.addEventListener("chat:close", handleShow);

        return () => {
            window.removeEventListener("chat:open", handleHide);
            window.removeEventListener("chat:close", handleShow);
        };
    }, []);

    if (hideNav) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom pb-env(safe-area-inset-bottom)">
            <div className="flex justify-around items-center h-14 sm:h-16 px-2">
                {/* Home */}
                <Link
                    to="/dashboard"
                    className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive("/dashboard") ? "text-[var(--primary)]" : "text-gray-500 hover:text-black"}`}
                >
                    <FiHome className={`text-2xl ${isActive("/dashboard") ? "fill-current" : ""}`} />
                    <span className="text-[10px] mt-0.5 font-hand">Feed</span>
                </Link>

                {/* Chat */}
                <Link
                    to="/chat"
                    className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive("/chat") ? "text-[var(--primary)]" : "text-gray-500 hover:text-black"}`}
                >
                    <FiMessageSquare className={`text-2xl ${isActive("/chat") ? "fill-current" : ""}`} />
                    <span className="text-[10px] mt-0.5 font-hand">Chat</span>
                </Link>

                {/* Create Post */}
                <Link
                    to="/create"
                    className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive("/create") ? "text-[var(--primary)]" : "text-gray-500 hover:text-black"}`}
                >
                    <div className="bg-[var(--pastel-yellow)] text-black border-2 border-black rounded-lg p-1.5 hover:scale-105 active:scale-95 transition-transform shadow-sm">
                        <FiPlusSquare className="text-xl" />
                    </div>
                </Link>

                {/* Search */}
                <Link
                    to="/search"
                    className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive("/search") ? "text-[var(--primary)]" : "text-gray-500 hover:text-black"}`}
                >
                    <FiSearch className={`text-2xl ${isActive("/search") ? "fill-current" : ""}`} />
                    <span className="text-[10px] mt-0.5 font-hand">Search</span>
                </Link>

                {/* Profile */}
                <Link
                    to={`/profile/${username}`}
                    className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive(`/profile/${username}`) ? "text-[var(--primary)]" : "text-gray-500 hover:text-black"}`}
                >
                    <FiUser className={`text-2xl ${isActive(`/profile/${username}`) ? "fill-current" : ""}`} />
                    <span className="text-[10px] mt-0.5 font-hand">Profile</span>
                </Link>
            </div>
        </div>
    );
}
