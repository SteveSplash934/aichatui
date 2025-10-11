export const buildApiUrl = (url) => {
    if (typeof url !== "string") return "";

    // Match protocol (http:// or https://)
    const match = url.match(/^(https?:\/\/)/i);
    const protocol = match ? match[1] : "";

    // Remove the protocol part temporarily
    const rest = url.replace(/^https?:\/\//i, "");

    // Normalize slashes in the rest of the URL
    const cleanedPath = rest.replace(/\/{2,}/g, "/").replace(/\/+$/, "");

    // Recombine and return
    return protocol + cleanedPath;
};
