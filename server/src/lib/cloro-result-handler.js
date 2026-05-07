/**
 * Centralized handler for a Cloro scraper result.
 *
 * Used by both:
 *  - The polling fallback path in tracking-worker.js
 *  - The /cloro/callback webhook endpoint
 *
 * Given a parsed Cloro AI response and the prompt/brand context, this:
 *   1. Counts brand mentions in the response text
 *   2. Runs sentiment analysis (only if brand was mentioned)
 *   3. Computes visibility metrics + competitor mentions via parseResponse
 *   4. Inserts a `prompt_results` row
 */

import supabaseAdmin from '../config/supabase.js';
import { analyzeSentimentAI } from './ai-tracker.js';
import { parseResponse, countBrandMentions } from './response-parser.js';

/**
 * @param {object} args
 * @param {{ text: string, citations: Array, model: string }} args.aiResponse
 *   Already parsed via parseScraperResponse (cloro-scraper.js)
 * @param {string} args.scraperId           Cloro scraper id (e.g. 'chatgpt-web')
 * @param {string} args.promptId
 * @param {string} args.brandId
 * @param {string|null} args.region
 * @param {{ brandName: string, domains: string[] }} args.brandInfo
 * @param {Array<{ id: string, name: string, domain: string }>} args.competitors
 * @returns {Promise<{ inserted: boolean }>}
 */
export async function handleScraperResult({
  aiResponse,
  scraperId,
  promptId,
  brandId,
  region,
  brandInfo,
  competitors,
}) {
  const mentionCount = countBrandMentions(aiResponse.text, brandInfo);
  const sentimentResult =
    mentionCount > 0
      ? await analyzeSentimentAI(aiResponse.text, brandInfo.brandName)
      : { sentiment: 'neutral', confidence: 0, reason: 'Brand not mentioned' };

  const metrics = parseResponse(
    aiResponse,
    brandInfo,
    sentimentResult.sentiment,
    competitors,
  );

  const { error } = await supabaseAdmin.from('prompt_results').insert({
    prompt_id: promptId,
    brand_id: brandId,
    platform: scraperId,
    response: aiResponse.text,
    citations: aiResponse.citations,
    mention_count: metrics.mentionCount,
    citation_count: metrics.citationCount,
    sentiment: sentimentResult.sentiment,
    visibility_score: metrics.visibilityScore,
    model_used: aiResponse.model,
    region: region ?? null,
    competitor_mentions: metrics.competitorMentions,
  });

  if (error) {
    console.error('[cloro-result] Failed to insert result:', error.message);
    throw error;
  }

  return { inserted: true };
}
