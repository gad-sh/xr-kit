// The index for agents (https://llmstxt.org): every page, linked as Markdown.
import { llmsTxt } from '#lib/server/docs.ts';

export const prerender = true;
export const trailingSlash = 'never';

export const GET = () => new Response(llmsTxt(), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
