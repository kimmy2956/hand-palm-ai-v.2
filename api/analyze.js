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

    // Prompt สำหรับ Gemini
    const prompt = `
      วิเคราะห์ลายมือจากรูปภาพนี้
      อธิบายรายละเอียดของแต่ละเส้นหลัก: 
      **เส้นชีวิต**, **เส้นสมอง**, **เส้นหัวใจ**, **เส้นวาสนา**
      ให้คำแนะนำเชิงบวกละเอียดและชัดเจน
      ตอบเป็นภาษาไทยและจัดหัวข้อด้วย ** สำหรับแต่ละเส้น
    `;

    // เรียก Google Gemini API
    const response = await fetch(
      "https://generativeai.googleapis.com/v1beta2/models/gemini-1.5-flash-latest:generateText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          image: { data: imageBase64, mimeType: "image/png" },
        }),
      }
    );

    // แปลง response เป็น JSON
    const data = await response.json();
    console.log("Gemini API Response:", data); // เพิ่ม log เพื่อตรวจสอบ

    // ตรวจสอบ output
    if (!data.output || !data.output[0] || !data.output[0].content) {
      return res.status(200).json({ result: "ไม่พบผลลัพธ์จาก Gemini API" });
    }

    res.status(200).json({ result: data.output[0].content });
  } catch (err) {
    console.error("Error in /api/analyze:", err);

    // แจ้งรายละเอียด error กลับ frontend (ไม่เปิดเผย API Key)
    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการวิเคราะห์ ลองตรวจสอบ API Key หรือรูปภาพใหม่",
      details: err.message,
    });
  }
}
