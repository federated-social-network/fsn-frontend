import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

const NAVIGATION_ORDER = [
    "/dashboard",
    "/chat",
    "/create",
    "/search",
    "/profile" // We'll handle exact matching for profile
];

interface SwipeNavigationProps {
    children: React.ReactNode;
}

export default function SwipeNavigation({ children }: SwipeNavigationProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const username = localStorage.getItem("username") || "";

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchStart.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStart.current) return;

            const touchEnd = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY
            };

            const dx = touchEnd.x - touchStart.current.x;
            const dy = touchEnd.y - touchStart.current.y;

            // Don't swipe navigate if we are inside a chat (sub-interaction)
            if (document.body.classList.contains('chat-open')) return;

            // Ensure it's mostly a horizontal swipe
            if (Math.abs(dx) > Math.abs(dy) * 1.5 && Math.abs(dx) > 70) {
                // dx < 0 means swipe left (finger moved from right to left) -> Next page
                // dx > 0 means swipe right (finger moved from left to right) -> Previous page

                const currentPath = location.pathname;
                let currentIndex = NAVIGATION_ORDER.findIndex(path => currentPath.startsWith(path));

                // Handle exact profile match if needed, though startsWith(/profile) usually works
                if (currentIndex === -1) return;

                if (dx < -70) {
                    // Swipe Left -> Next
                    if (currentIndex < NAVIGATION_ORDER.length - 1) {
                        let nextPath = NAVIGATION_ORDER[currentIndex + 1];
                        if (nextPath === "/profile") nextPath = `/profile/${username}`;
                        navigate(nextPath);
                    }
                } else if (dx > 70) {
                    // Swipe Right -> Previous
                    if (currentIndex > 0) {
                        let prevPath = NAVIGATION_ORDER[currentIndex - 1];
                        if (prevPath === "/profile") prevPath = `/profile/${username}`;
                        navigate(prevPath);
                    }
                }
            }

            touchStart.current = null;
        };

        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [location.pathname, navigate, username]);

    return <>{children}</>;
}
