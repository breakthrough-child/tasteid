import OpenAI from 'openai';

// Provider-agnostic: any OpenAI-compatible endpoint (Gemini, Groq, OpenAI, ...).
export const llmEnabled = () => !!process.env.LLM_API_KEY;
export const llmModel = () => process.env.LLM_MODEL || 'gemini-3.5-flash';
export const llm = () => new OpenAI({ apiKey: process.env.LLM_API_KEY || 'unset', baseURL: process.env.LLM_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/', timeout: 40000, maxRetries: 1 });
