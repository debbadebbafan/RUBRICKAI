import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'RubricAI',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    mode: 'deterministic_with_ai_augmentation',
  });
});

// AI-Augmented Q&A Endpoint with Graceful Fallback
app.post('/api/ask-rubric', async (req: Request, res: Response) => {
  const { query, projectSummary, evidenceSnippets, findings } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // If no Gemini API key is configured, client or server falls back immediately
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      augmented: false,
      reason: 'No GEMINI_API_KEY configured. Running on deterministic local analysis engine.',
    });
  }

  try {
    const ai = new GoogleGenAI();
    const prompt = `You are RubricAI, an evidence-grounded review engine for student data science projects.
Core Principle: "No evidence -> no verified claim." Never invent findings that are not directly supported by the project evidence below.

PROJECT SUMMARY:
${projectSummary || 'Student Data Science Project'}

EVIDENCE EXTRACTED FROM PROJECT CODE & DATA:
${(evidenceSnippets || []).slice(0, 8).map((e: any, idx: number) => `[Evidence ${idx + 1}] ${e.title} (${e.location}):\n${e.snippet}`).join('\n\n')}

DETECTIVE FINDINGS:
${(findings || []).slice(0, 6).map((f: any) => `- ${f.title} (${f.confidence}): ${f.whatWeFound}`).join('\n')}

USER QUESTION:
"${query}"

INSTRUCTIONS:
1. Ground your response strictly in the provided evidence. Cite the exact Cell or location when mentioning code.
2. Structure your answer using:
   - WHAT WE FOUND IN YOUR PROJECT (cite exact cell/file)
   - WHY THIS MATTERS FOR DATA SCIENCE RIGOR
   - CONCRETE RECOMMENDED FIX (with short code snippet if relevant)
3. Maintain an encouraging yet rigorous academic advisor tone.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const text = response.text || '';
    return res.json({
      augmented: true,
      answer: text,
      model: 'gemini-2.5-flash',
    });
  } catch (err: any) {
    // Graceful fallback on API error / quota limit / timeout
    return res.json({
      augmented: false,
      reason: `API fallback: ${err?.message || 'Upstream service unavailable'}. Falling back to deterministic engine.`,
    });
  }
});

// Vite Middleware for Dev & Static serving for Production
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`RubricAI server running at http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Server startup error:', err);
});
