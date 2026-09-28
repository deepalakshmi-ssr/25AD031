const API_BASE_URL = "http://localhost:8080/api/restaurant";

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(API_BASE_URL + endpoint, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong");
        }

        return data;

    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}