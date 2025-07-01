import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import axios from 'axios';
import dotenv from 'dotenv';
import DbConnection from './DB/Db.js';
import router from './routes/UserRouter.js';
dotenv.config();
const app = express();
app.use(express.json())
app.use(cors());
app.use(bodyParser.json());
app.use(cors({
       origin: 'http://localhost:5173', 
       methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
       credentials: true
   }));
DbConnection()
app.get('/',(req,res)=>{
  res.send("hi")
})
app.use('/bin',router)
app.post('/api/questions', async (req, res) => {
  const { role, topics } = req.body;

  const prompt = `Generate 10 technical interview questions with deep theory answers ,answer should long  and also code example,  use emojis on answers  and  for the role of ${role}. Topics: ${topics.join(', ')}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.AIKEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );

    const output = response.data.candidates[0].content.parts[0].text;

    const blocks = output.split(/\d+\.\s/).filter(Boolean);
    const parsed = blocks.map((block) => {
      const [qAndA, ...codePart] = block.split("Code:");
      const [questionLine, ...answerLines] = qAndA.trim().split("\n");
      return {
        text: questionLine.trim(),
        answer: answerLines.join("\n").trim(),
        code: codePart.join("Code:").trim().replace(/```[\s\S]*?```/g, (m) =>
          m.replace(/```[a-z]*\n?/, "").replace(/```$/, "")
        ),
      };
    });

    res.json({ questions: parsed });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

app.listen(5050, () => console.log('Server running on port 5050'));
