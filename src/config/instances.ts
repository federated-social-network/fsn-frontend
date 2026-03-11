/**
 * Configuration for available backend instances.
 */
export const INSTANCES = [
    {
        name: "Social Community",
        url: "https://instance-a-1094866630955.us-central1.run.app",
        color: "bg-cyan-100 border-cyan-300",
        description: "The default HeliiX social community — connect, share, and discover."
    },
    {
        name: "Personal Community",
        url: "https://instance-b-1094866630955.us-central1.run.app",
        color: "bg-rose-100 border-rose-300",
        description: "Your personal space — a private community for close friends and family."
    },
    {
        name: "Local Dev Backend",
        url: "http://localhost:8000",
        color: "bg-yellow-100 border-yellow-300",
        description: "Your local FastAPI test environment."
    }
];

/**
 * Helper to get the friendly name of an instance from its URL.
 * @param {string | null} urlObj - The instance URL or identifier.
 * @returns {string | null} The friendly name or original URL.
 */
export const getInstanceName = (urlObj: string | null) => {
    if (!urlObj) return null;
    const match = INSTANCES.find(i => i.url.includes(urlObj) || urlObj.includes(i.url.replace("https://", "")));
    return match ? match.name : urlObj; // Return friendly name or fallback to raw URL/domain
};

/**
 * Helper to get the color theme class for an instance.
 * @param {string | null} urlObj - The instance URL or identifier.
 * @returns {string} The Tailwind CSS class string for the instance color.
 */
export const getInstanceColor = (urlObj: string | null) => {
    if (!urlObj) return "bg-gray-100 border-gray-300"; // Default
    const match = INSTANCES.find(i => i.url.includes(urlObj) || urlObj.includes(i.url.replace("https://", "")));
    return match ? match.color : "bg-gray-100 border-gray-300";
};
