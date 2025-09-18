import fetch from "node-fetch";

export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

    const prompt = `
      จากรูปภาพฝ่ามือนี้ ทำนายดวงชะตาโดยอิงจากศาสตร์ลายมือ
      วิเคราะห์ 4 เส้นหลัก: **เส้นชีวิต**, **เส้นสมอง**, **เส้นหัวใจ**, และ **เส้นวาสนา**
      ตอบเป็นภาษาไทยเท่านั้น
    `;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: prompt }] },
            { role: "user", parts: [{ inlineData: { data: imageBase64, mimeType: "image/png" } }] }
          ]
        })
      }
    );

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "ไม่พบคำตอบ";

    res.json({ result: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาด" });
  }
}
