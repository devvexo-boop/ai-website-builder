import 'dotenv/config';
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import OpenAI from 'openai';
import { z } from 'zod';

const app = express();
const port = Number(process.env.PORT || 3001);

const requestSchema = z.object({
  prompt: z.string().min(10).max(2000),
  projectName: z.string().min(1).max(80).optional(),
  mode: z.enum(['single-page', 'multi-page']).optional()
});

const outputSchema = z.object({
  html: z.string().min(20).max(400000),
  css: z.string().max(400000).default(''),
  js: z.string().max(400000).default(''),
  files: z.record(z.string(), z.string().max(400000)).optional(),
  projectName: z.string().max(120).optional()
});

const blockedPromptPatterns = [
  /ignore\s+previous\s+instructions/i,
  /reveal\s+(system|developer)\s+prompt/i,
  /return\s+(api\s*key|secrets?)/i,
  /call\s+tools?/i,
  /print\s+env/i
];

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const sanitizePrompt = (value) =>
  value
    .replace(/[<>]/g, '')
    .replace(/[`]{3,}/g, '')
    .replace(/\u0000/g, '')
    .trim();

const isUnsafePrompt = (value) => blockedPromptPatterns.some((pattern) => pattern.test(value));

const normalizeFiles = (payload) => {
  const mapped = {
    'index.html': payload.html,
    'styles.css': payload.css,
    'script.js': payload.js
  };

  if (payload.files) {
    for (const [name, content] of Object.entries(payload.files)) {
      const safeName = name.replace(/\.\./g, '').replace(/^\/+/, '');
      if (!safeName || safeName.length > 120) continue;
      mapped[safeName] = content;
    }
  }

  return mapped;
};

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json({ limit: '128kb' }));

app.use(
  '/generate',
  rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Rate limit exceeded. Please retry in a minute.' }
  })
);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'ai-website-builder-api' });
});

app.post('/generate', async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' });
  }

  const parsedRequest = requestSchema.safeParse(req.body);
  if (!parsedRequest.success) {
    return res.status(400).json({ error: 'Invalid request payload.' });
  }

  const sanitizedPrompt = sanitizePrompt(parsedRequest.data.prompt);
  if (isUnsafePrompt(sanitizedPrompt)) {
    return res.status(400).json({ error: 'Prompt rejected by safety filter.' });
  }

  const generationMode = parsedRequest.data.mode || 'single-page';
  const requestedProjectName = parsedRequest.data.projectName?.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      temperature: 0.25,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a senior frontend engineer. Output valid JSON only. Provide production-ready website code. Required keys: html, css, js. Optional: files (object for extra pages/assets), projectName. No markdown, no explanation.'
        },
        {
          role: 'user',
          content: `Mode: ${generationMode}. Project: ${requestedProjectName || 'Untitled'}. Prompt: ${sanitizedPrompt}`
        }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content ?? '{}';
    let decoded;

    try {
      decoded = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: 'AI returned non-JSON output.' });
    }

    const validated = outputSchema.safeParse(decoded);
    if (!validated.success) {
      return res.status(502).json({ error: 'AI output failed schema validation.' });
    }

    const files = normalizeFiles(validated.data);

    return res.json({
      html: validated.data.html,
      css: validated.data.css,
      js: validated.data.js,
      files,
      projectName: validated.data.projectName || requestedProjectName || 'Untitled Project'
    });
  } catch (error) {
    const status = error?.status && Number.isInteger(error.status) ? error.status : 500;
    const message = status >= 500 ? 'Generation service unavailable. Please retry.' : 'Failed to process request.';
    return res.status(status).json({ error: message });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
