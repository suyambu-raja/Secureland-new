/**
 * SecureLand Django Backend API Client.
 * All API calls to the Django REST Framework backend.
 */

const API_BASE = import.meta.env.VITE_DJANGO_API_URL || "http://127.0.0.1:8000/api";

// =============================================
// Helper: Make API request
// =============================================
async function apiRequest(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any,
    token?: string
): Promise<any> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || `API Error: ${res.status}`);
    }

    return data;
}

// =============================================
// Health Check
// =============================================
export const checkHealth = () => apiRequest("/health/");

// =============================================
// Auth — User Management
// =============================================
export const registerUser = (name: string, phone: string, password: string) =>
    apiRequest("/auth/register/", "POST", { name, phone, password });

export const loginUser = (phone: string, password: string) =>
    apiRequest("/auth/login/", "POST", { phone, password });

export const getUserProfile = (phone: string, token?: string) =>
    apiRequest(`/auth/profile/${phone}/`, "GET", undefined, token);

// =============================================
// Digital Twin
// =============================================
export const registerDigitalTwin = (twinData: {
    landId: string;
    ownerName: string;
    mobile: string;
    state: string;
    location: string;
    area: number;
    coordinates: { lat: number; lng: number }[];
}, token?: string) =>
    apiRequest("/twin/register/", "POST", {
        ...twinData,
        polygon: twinData.coordinates,
    }, token);

export const getDigitalTwin = (landId: string) =>
    apiRequest(`/twin/${landId}/`);

export const getUserTwins = (phone: string) =>
    apiRequest(`/twins/${phone}/`);

// =============================================
// Blockchain
// =============================================
export const verifyOnBlockchain = (landId: string) =>
    apiRequest(`/blockchain/verify/${landId}/`);

export const getBlockchain = () =>
    apiRequest("/blockchain/chain/");

export const validateBlockchain = () =>
    apiRequest("/blockchain/validate/");
