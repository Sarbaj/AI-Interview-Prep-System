import express from "express";
import { getCodeReview } from "../utils/hf";
const router = express.Router();
const reviewCode = async (req, res) => {
  const { code, language } = req.body;
  try {
    const result = await getCodeReview(code, language);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
router.post("/", reviewCode);
export default router;