import { getInstanceName } from "../config/instances";

/**
 * Parses a username string which might be a simple username, a URL, or an ActivityPub handle.
 * Returns a clean display username and the instance domain (if available).
 *
 * @param {string | undefined | null} input - The username string or URL to parse.
 * @returns {{ username: string, instance: string | null }} An object containing the parsed username and instance name.
 */
export const parseUsername = (input: string | undefined | null) => {
    if (!input) return { username: "Unknown", instance: null };

    try {
        // Check if input looks like a URL
        if (input.startsWith("http://") || input.startsWith("https://")) {
            const url = new URL(input);
            // Assume the last segment of the path is the username
            const pathSegments = url.pathname.split("/").filter(Boolean);
            const username = pathSegments.length > 0 ? decodeURIComponent(pathSegments[pathSegments.length - 1]) : "Unknown";

            const friendlyInstance = getInstanceName(url.hostname);

            return {
                username,
                instance: friendlyInstance
            };
        }

        // Check if input looks like ActivityPub format (e.g., @user@mastodon.social or user@pixelfed.social)
        if (input.includes("@")) {
            const parts = input.split("@").filter(Boolean); // removes leading empty string if it starts with @
            if (parts.length >= 2) {
                const username = parts[0];
                const domain = parts[parts.length - 1]; // last part is the domain

                let friendlyInstance = domain;
                if (domain.toLowerCase().includes("mastodon")) {
                    friendlyInstance = "Mastodon";
                } else if (domain.toLowerCase().includes("pixelfed")) {
                    friendlyInstance = "Pixelfed";
                } else {
                    friendlyInstance = getInstanceName(domain) || domain;
                }

                return {
                    username,
                    instance: friendlyInstance
                };
            }
        }

    } catch (e) {
        // Fallback if parsing fails
        console.warn("Failed to parse username:", input);
    }

    // Fallback / Default behavior: treat input as plain username
    return {
        username: input,
        instance: null
    };
};
