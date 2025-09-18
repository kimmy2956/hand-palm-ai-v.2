
import fetch from "node-fetch";
export const config = { api: { bodyParser: { sizeLimit: '5mb' } } };
export default async function handler(req, res) {
  res.json({ result: "ทดสอบเรียบร้อย" });
}
