import axios from "axios";

// Use production URL if MPESA_ENVIRONMENT is "production", otherwise sandbox
const MPESA_BASE_URL =
    process.env.MPESA_ENVIRONMENT === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

export async function getMpesaToken() {
    const auth = Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const res = await axios.get(
        `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
        {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        }
    );

    return res.data.access_token;
}

// Helper to get the correct M-Pesa base URL
export function getMpesaBaseUrl() {
    return MPESA_BASE_URL;
}
