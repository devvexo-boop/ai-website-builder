import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import OpenAI from 'openai';
import { z } from 'zod';

const app = express();
const port = process.env.PORT || 3001;

const promptSchema = z.object({
  prompt: z.string().min(10).max(2000)
});

const aiResponseSchema = z.object({
  html: z.string().min(20).max(400000),
  css: z.string().min(10).max(400000),
  js: z.string().min(0).max(400000)
});

const blockedPatterns = [
  /ignore previous instructions/i,
  /reveal system prompt/i,
  /return api key/i,
  /tool call/i
];

const cleanPrompt = (input) => input.replace(/[<>]/g, '').trim();

const detectPromptInjection = (input) => blockedPatterns.some((pattern) => pattern.test(input));

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '128kb' }));

app.use(
  '/generate',
  rateLimit({
    windowMs: 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Rate limit exceeded. Try again soon.' }
  })
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/generate', async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY.' });
  }

  try {
    const parsed = promptSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Prompt must be 10-2000 characters.' });
    }

    const sanitizedPrompt = cleanPrompt(parsed.data.prompt);
    if (detectPromptInjection(sanitizedPrompt)) {
      return res.status(400).json({ error: 'Unsafe prompt detected.' });
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are an expert web developer. Generate complete production-ready website code. Return only strict JSON with keys html, css, js and no explanation.'
        },
        {
          role: 'user',
          content: `Create website code from this request: ${sanitizedPrompt}`
        }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content || '{}';
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: 'Invalid AI response format.' });
    }

    const validated = aiResponseSchema.safeParse(payload);
    if (!validated.success) {
      return res.status(502).json({ error: 'AI response missing required files.' });
    }

    return res.json(validated.data);
  } catch (error) {
    const status = error?.status || 500;
    const safeMessage = status >= 500 ? 'Generation service unavailable.' : 'Request failed.';
    return res.status(status).json({ error: safeMessage });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
