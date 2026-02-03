export const INSTANCES = [
    { name: "Instance A", url: "https://fsn-backend-1094866630955.us-central1.run.app", color: "bg-cyan-100 border-cyan-300" },
    { name: "Instance B", url: "https://instance-b.onrender.com", color: "bg-purple-100 border-purple-300" }
];

export const getInstanceName = (urlObj: string | null) => {
    if (!urlObj) return null;
    const match = INSTANCES.find(i => i.url.includes(urlObj) || urlObj.includes(i.url.replace("https://", "")));
    return match ? match.name : urlObj; // Return friendly name or fallback to raw URL/domain
};
export const getInstanceColor = (urlObj: string | null) => {
    if (!urlObj) return "bg-gray-100 border-gray-300"; // Default
    const match = INSTANCES.find(i => i.url.includes(urlObj) || urlObj.includes(i.url.replace("https://", "")));
    return match ? match.color : "bg-gray-100 border-gray-300";
};
