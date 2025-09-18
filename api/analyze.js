import fetch from "node-fetch";

export const config = { api: { bodyParser: { sizeLimit: "5mb" } } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageBase64 } = req.body;
  if (!imageBase64) {
    return res.status(400).json({ error: "No image provided" });
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) throw new Error("GEMINI_API_KEY not set");

    // Prompt ภาษาไทยสำหรับ Gemini
    const prompt = `
      วิเคราะห์ลายมือจากรูปภาพนี้
      อธิบายรายละเอียดของแต่ละเส้นหลัก:
      **เส้นชีวิต**, **เส้นสมอง**, **เส้นหัวใจ**, **เส้นวาสนา**
      ให้คำแนะนำเชิงบวกละเอียด
      ตอบเป็นภาษาไทยและจัดหัวข้อด้วย ** สำหรับแต่ละเส้น
    `;

    // เรียก Gemini 2.0 API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { text: "\n\nรูปภาพ Base64:" + imageBase64 }
              ]
            }
          ]
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini API Response:", data);

    // ดึงข้อความจาก response
    const resultText = data?.candidates?.[0]?.content || data?.output?.[0]?.content || "ไม่พบผลลัพธ์";

    res.status(200).json({ result: resultText });
  } catch (err) {
    console.error("Error in /api/analyze:", err);
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการวิเคราะห์ ลองตรวจสอบ API Key หรือรูปภาพใหม่",
      details: err.message,
    });
  }
}
