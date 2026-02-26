import axios from "axios";

// Use production URL if MPESA_ENVIRONMENT is "production", otherwise sandbox
const MPESA_BASE_URL =
    process.env.MPESA_ENVIRONMENT === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

export async function getMpesaToken() {
    const key    = process.env.MPESA_CONSUMER_KEY    ?? "";
    const secret = process.env.MPESA_CONSUMER_SECRET ?? "";

    console.log("[MPESA] ── Token Generation ──────────────────────────────");
    console.log("[MPESA] Environment  :", process.env.MPESA_ENVIRONMENT);
    console.log("[MPESA] Base URL     :", MPESA_BASE_URL);
    console.log("[MPESA] Consumer Key :", key   ? `${key.slice(0,8)}…(${key.length} chars)`    : "❌ MISSING");
    console.log("[MPESA] Consumer Sec :", secret ? `${secret.slice(0,8)}…(${secret.length} chars)` : "❌ MISSING");

    const auth = Buffer.from(`${key}:${secret}`).toString("base64");
    const tokenUrl = `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`;

    try {
        const res = await axios.get(tokenUrl, {
            headers: { Authorization: `Basic ${auth}` },
        });
        const token: string = res.data.access_token ?? "";
        console.log("[MPESA] Token OK     :", token ? `${token.slice(0,12)}…(${token.length} chars)` : "❌ EMPTY");
        return token;
    } catch (err: any) {
        console.error("[MPESA] Token FAILED :", err.response?.status, err.response?.data ?? err.message);
        throw err;
    }
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

    const b2cShortcode      = process.env.MPESA_B2C_SHORTCODE       ?? "";
    const initiatorName     = process.env.MPESA_INITIATOR_NAME       ?? "";
    const securityCred      = process.env.MPESA_SECURITY_CREDENTIAL  ?? "";
    const callbackBase      = process.env.MPESA_CALLBACK_URL         ?? "";
    const resultURL         = `${callbackBase}/api/mpesa/callback/b2c/result`;
    const queueTimeoutURL   = `${callbackBase}/api/mpesa/callback/b2c/timeout`;

    console.log("[MPESA] ── B2C Payload ───────────────────────────────────");
    console.log("[MPESA] B2C Endpoint      :", `${MPESA_BASE_URL}/mpesa/b2c/v1/paymentrequest`);
    console.log("[MPESA] InitiatorName     :", initiatorName     || "❌ MISSING");
    console.log("[MPESA] SecurityCredential:", securityCred      ? `${securityCred.slice(0,16)}…(${securityCred.length} chars)` : "❌ MISSING");
    console.log("[MPESA] PartyA (shortcode):", b2cShortcode      || "❌ MISSING");
    console.log("[MPESA] PartyB (phone)    :", phone);
    console.log("[MPESA] Amount            :", amount);
    console.log("[MPESA] ResultURL         :", resultURL         || "❌ MISSING");
    console.log("[MPESA] QueueTimeoutURL   :", queueTimeoutURL   || "❌ MISSING");
    console.log("[MPESA] Token (first 12)  :", token ? `${token.slice(0,12)}…` : "❌ EMPTY");
    console.log("[MPESA] ─────────────────────────────────────────────────");

    try {
        const response = await axios.post(
            `${MPESA_BASE_URL}/mpesa/b2c/v1/paymentrequest`,
            {
                InitiatorName:      initiatorName,
                SecurityCredential: securityCred,
                CommandID:          "BusinessPayment",
                Amount:             amount,
                PartyA:             b2cShortcode,
                PartyB:             phone,
                Remarks:            remarks,
                QueueTimeOutURL:    queueTimeoutURL,
                ResultURL:          resultURL,
                Occasion:           "Withdrawal",
            },
            {
                headers: {
                    Authorization:  `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("[MPESA] B2C SUCCESS:", response.data);
        return { success: true, data: response.data };
    } catch (error: any) {
        const errData = error.response?.data ?? error.message;
        console.error("[MPESA] B2C ERROR — HTTP", error.response?.status ?? "N/A");
        console.error("[MPESA] B2C ERROR body  :", JSON.stringify(errData, null, 2));
        return { success: false, error: errData };
    }
}
