import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TWITTER_API_BASE = "https://api.twitter.com/2";

/**
 * Fetch Twitter followers for a given user ID
 * @param {string} userId - The Twitter User ID
 * @param {string} bearerToken - The Twitter API Bearer Token
 * @param {number} maxResults - (Optional) The number of followers to retrieve (default: 10)
 * @returns {Promise<Object>} Followers data from Twitter API
 */
export async function fetchTwitterFollowers(userId: string) {
  try {
    const response = await fetch(
      `/api/fetch-twitter-followers?userId=${userId}`
    );
    console.log("🚀 ~ fetchTwitterFollowers ~ response:", response);

    if (!response.ok) {
      throw new Error("Failed to fetch followers");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
