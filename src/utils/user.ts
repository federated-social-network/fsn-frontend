import { getInstanceName } from "../config/instances";

/**
 * Parses a username string which might be a simple username or a full URL.
 * Returns a clean display username and the instance domain (if available).
 * 
 * Example:
 * "Harish1604" -> { username: "Harish1604", instance: null }
 * "https://instance-a.onrender.com/users/Harish1604" -> { username: "Harish1604", instance: "Instance A" }
 */
export const parseUsername = (input: string | undefined | null) => {
    if (!input) return { username: "Unknown", instance: null };

    try {
        // Check if input looks like a URL
        if (input.startsWith("http://") || input.startsWith("https://")) {
            const url = new URL(input);
            // Assume the last segment of the path is the username
            const pathSegments = url.pathname.split("/").filter(Boolean);
            const username = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : "Unknown";

            const friendlyInstance = getInstanceName(url.hostname);

            return {
                username,
                instance: friendlyInstance
            };
        }
    } catch (e) {
        // Fallback if URL parsing fails
        console.warn("Failed to parse username URL:", input);
    }

    // Fallback / Default behavior: treat input as plain username
    return {
        username: input,
        instance: null
    };
};
