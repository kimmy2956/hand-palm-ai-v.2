import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY is missing" });

  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: "ต้องส่ง imageBase64" });

  // 🔮 Prompt ที่ใช้บอก AI
  const prompt = `
คุณคือหมอดูลายมือ ให้คุณวิเคราะห์จากรูปภาพฝ่ามือ (ไม่ต้องอธิบายเรื่องการถ่ายรูป)
ให้ตีความเส้นลายมือออกมาเป็น:

- เส้นชีวิต
- เส้นสมอง
- เส้นหัวใจ
- เส้นวาสนา

ตอบเป็นภาษาไทย กระชับ แต่ชัดเจน
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // หรือ gpt-4o, gpt-3.5-turbo
        messages: [
          { role: "system", content: "คุณคือผู้เชี่ยวชาญการทำนายลายมือ" },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const resultText = data.choices[0].message.content;
    res.json({ result: resultText });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดจาก OpenAI API" });
  }
});

export default router;
