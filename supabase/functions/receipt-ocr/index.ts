import { withSupabase } from "npm:@supabase/server";

const allowedOrigins = new Set([
  "https://alston-chen02.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:4173",
]);
const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && allowedOrigins.has(origin) ? origin : "https://alston-chen02.github.io",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
});
const respond = (body: unknown, status = 200, origin: string | null = null) =>
  Response.json(body, { status, headers: cors(origin) });
const encode = (value: unknown) => btoa(JSON.stringify(value)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

type GoogleKey = { client_email: string; private_key: string; project_id: string };
type Entity = {
  type?: string;
  mentionText?: string;
  confidence?: number;
  normalizedValue?: {
    text?: string;
    moneyValue?: { currencyCode?: string; units?: string; nanos?: number };
    dateValue?: { year?: number; month?: number; day?: number };
  };
};

async function googleAccessToken(key: GoogleKey) {
  const now = Math.floor(Date.now() / 1000);
  const claim = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const pem = key.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const bytes = Uint8Array.from(atob(pem), char => char.charCodeAt(0));
  const privateKey = await crypto.subtle.importKey(
    "pkcs8", bytes, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"],
  );
  const signature = new Uint8Array(await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5", privateKey, new TextEncoder().encode(claim),
  ));
  const signed = `${claim}.${btoa(String.fromCharCode(...signature))
    .replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "")}`;
  const token = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signed,
    }),
  });
  if (!token.ok) throw new Error("Google 身分驗證失敗");
  const result = await token.json();
  if (typeof result.access_token !== "string") throw new Error("Google 未回傳存取權杖");
  return result.access_token as string;
}

function find(entities: Entity[], type: string) {
  return entities.filter(entity => entity.type === type)
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0];
}

const handle = withSupabase({ auth: "user" }, async (request, context) => {
  const reply = (body: unknown, status = 200) => respond(body, status, request.headers.get("origin"));
  if (request.method !== "POST") return reply({ error: "不支援此方法" }, 405);
  const userId = context.jwtClaims?.sub;
  if (!userId) return reply({ error: "請先登入" }, 401);
  const { data: member, error: memberError } = await context.supabase
    .from("trip_members").select("user_id").eq("user_id", userId).eq("active", true).maybeSingle();
  if (memberError || !member) return reply({ error: "非旅程成員，無法辨識收據" }, 403);
  if (Number(request.headers.get("content-length") || 0) > 4_200_000) {
    return reply({ error: "圖片超過 3 MB" }, 413);
  }

  let payload: { content?: unknown; mimeType?: unknown };
  try { payload = await request.json(); }
  catch { return reply({ error: "圖片資料格式錯誤" }, 400); }
  const { content, mimeType } = payload;
  if (typeof content !== "string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(content)
      || content.length > 4_000_000 || (mimeType !== "image/jpeg" && mimeType !== "image/png")) {
    return reply({ error: "請選擇 3 MB 以下的 JPG 或 PNG 圖片" }, 400);
  }

  const secret = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!secret) return reply({ error: "收據辨識尚未完成伺服器設定" }, 503);
  try {
    const key = JSON.parse(secret) as GoogleKey;
    if (key.project_id !== "project-04326e30-dccb-453b-bc7"
      || key.client_email !== "tokyo-travel-receipt-ocr@project-04326e30-dccb-453b-bc7.iam.gserviceaccount.com"
      || !key.private_key) throw new Error("Google 金鑰設定不符");
    const accessToken = await googleAccessToken(key);
    const endpoint = "https://asia-southeast1-documentai.googleapis.com/v1/projects/project-04326e30-dccb-453b-bc7/locations/asia-southeast1/processors/ec98c5bbfeb7c8b2:process";
    const result = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ rawDocument: { content, mimeType }, fieldMask: "entities", imagelessMode: true }),
    });
    if (!result.ok) throw new Error(`Google 辨識服務回應 ${result.status}`);
    const output = await result.json();
    const entities: Entity[] = output.document?.entities || [];
    const total = find(entities, "total_amount");
    const money = total?.normalizedValue?.moneyValue;
    const numericAmount = money
      ? Number(money.units || 0) + Number(money.nanos || 0) / 1e9 : null;
    const receiptDate = find(entities, "receipt_date");
    const parsedDate = receiptDate?.normalizedValue?.dateValue;
    const isoDate = parsedDate?.year && parsedDate.month && parsedDate.day
      ? `${parsedDate.year}-${String(parsedDate.month).padStart(2, "0")}-${String(parsedDate.day).padStart(2, "0")}`
      : receiptDate?.normalizedValue?.text || "";
    return reply({
      merchant: find(entities, "supplier_name")?.mentionText || "",
      amount: numericAmount && numericAmount > 0
        ? String(Math.round(numericAmount * 100) / 100)
        : total?.normalizedValue?.text || total?.mentionText || "",
      currency: money?.currencyCode || find(entities, "currency")?.normalizedValue?.text
        || find(entities, "currency")?.mentionText || "",
      date: /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : "",
    });
  } catch (error) {
    console.error("Receipt OCR failed:", error instanceof Error ? error.message : "unknown error");
    return reply({ error: "收據辨識失敗，請改用手動輸入或稍後重試" }, 502);
  }
});

export default {
  fetch: (request: Request) => request.method === "OPTIONS"
    ? new Response(null, { status: 204, headers: cors(request.headers.get("origin")) }) : handle(request),
};
