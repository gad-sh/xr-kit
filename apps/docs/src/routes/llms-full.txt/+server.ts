// Every page as Markdown, in one file, for agents to read in one go.
import { llmsFullTxt } from '#lib/server/docs.ts';

export const prerender = true;
export const trailingSlash = 'never';

export const GET = () => new Response(llmsFullTxt(), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
