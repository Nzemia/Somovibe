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

// B2C Payment - Send money to customer
export async function initiateB2CPayment(
    phone: string,
    amount: number,
    remarks: string = "Withdrawal"
) {
    const token = await getMpesaToken();

    try {
        const response = await axios.post(
            `${MPESA_BASE_URL}/mpesa/b2c/v1/paymentrequest`,
            {
                InitiatorName: process.env.MPESA_INITIATOR_NAME,
                SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
                CommandID: "BusinessPayment", // or "SalaryPayment" or "PromotionPayment"
                Amount: amount,
                PartyA: process.env.MPESA_B2C_SHORTCODE,
                PartyB: phone,
                Remarks: remarks,
                QueueTimeOutURL: `${process.env.MPESA_CALLBACK_URL}/api/mpesa/callback/b2c/timeout`,
                ResultURL: `${process.env.MPESA_CALLBACK_URL}/api/mpesa/callback/b2c/result`,
                Occasion: "Withdrawal",
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ B2C Response:", JSON.stringify(response.data, null, 2));

        return {
            success: true,
            data: response.data,
        };
    } catch (error: any) {
        console.error("❌ B2C Payment Error:", JSON.stringify(error.response?.data, null, 2) || error.message);
        return {
            success: false,
            error: error.response?.data || error.message,
        };
    }
}
