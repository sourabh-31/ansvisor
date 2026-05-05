/**
 * Parses an AI response to extract brand visibility metrics.
 * Mentions and citations are computed locally; sentiment comes from AI.
 */

/**
 * Strip markdown link URLs so only display text remains.
 * "[label](https://example.com/path)" → "label"
 * Also removes bare URLs (https://...) that aren't inside markdown links.
 */
function stripUrls(text) {
  let cleaned = text.replace(/\[([^\]]*)\]\([^)]+\)/g, '$1');
  cleaned = cleaned.replace(/https?:\/\/[^\s)>\]]+/g, '');
  return cleaned;
}

/**
 * Count case-insensitive occurrences of a term in text.
 */
function countOccurrences(text, term) {
  if (!term) return 0;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
  return (text.match(regex) || []).length;
}

/**
 * Count how many times the brand (name or any of its domains) is mentioned
 * in an AI response. URL-stripped to avoid double-counting citations.
 * Used to short-circuit sentiment analysis when the brand isn't mentioned.
 */
export function countBrandMentions(text, brand) {
  const cleanText = stripUrls(text);
  let count = countOccurrences(cleanText, brand.brandName);
  for (const domain of brand.domains) {
    count += countOccurrences(cleanText, domain);
  }
  return count;
}

/**
 * Parse the AI response and compute visibility metrics for a brand.
 * Sentiment must be provided externally (from AI analysis).
 * @param {{ text: string, citations: Array<{ url: string, title: string, startIndex: number, endIndex: number }> }} response
 * @param {{ brandName: string, domains: string[] }} brand
 * @param {'positive'|'neutral'|'negative'} sentiment - AI-analyzed sentiment
 * @param {Array<{ id: string, name: string, domain: string }>} [competitors] - Optional competitor list
 * @returns {{ mentionCount: number, citationCount: number, sentiment: string, visibilityScore: number, competitorMentions: Array }}
 */
export function parseResponse(response, brand, sentiment = 'neutral', competitors = []) {
  const { text, citations } = response;
  const cleanText = stripUrls(text);

  // --- Brand mention count (on URL-stripped text to avoid double-counting) ---
  let mentionCount = countOccurrences(cleanText, brand.brandName);
  for (const domain of brand.domains) {
    mentionCount += countOccurrences(cleanText, domain);
  }

  // --- Brand citation count ---
  let citationCount = 0;
  for (const cite of citations) {
    const url = (cite.url || '').toLowerCase();
    for (const domain of brand.domains) {
      if (url.includes(domain.toLowerCase())) {
        citationCount++;
        break;
      }
    }
  }

  // --- Visibility Score (0-100) ---
  const visibilityScore = computeVisibilityScore({
    mentionCount,
    citationCount,
    totalCitations: citations.length,
    sentiment,
  });

  // --- Competitor mentions (on URL-stripped text) ---
  const competitorMentions = competitors.map((comp) => {
    let compMentions = countOccurrences(cleanText, comp.name);
    if (comp.domain) {
      compMentions += countOccurrences(cleanText, comp.domain);
    }

    let compCitations = 0;
    if (comp.domain) {
      for (const cite of citations) {
        const url = (cite.url || '').toLowerCase();
        if (url.includes(comp.domain.toLowerCase())) {
          compCitations++;
        }
      }
    }

    const compScore = computeVisibilityScore({
      mentionCount: compMentions,
      citationCount: compCitations,
      totalCitations: citations.length,
      sentiment: 'neutral',
    });

    return {
      competitor_id: comp.id,
      name: comp.name,
      domain: comp.domain || '',
      mention_count: compMentions,
      citation_count: compCitations,
      visibility_score: compScore,
    };
  });

  return { mentionCount, citationCount, sentiment, visibilityScore, competitorMentions };
}

/**
 * Compute a 0-100 visibility score based on multiple signals.
 */
function computeVisibilityScore({ mentionCount, citationCount, totalCitations, sentiment }) {
  let score = 0;

  // Mention component (max 40 pts): each mention = 10pts, capped at 4+
  score += Math.min(mentionCount * 10, 40);

  // Citation component (max 30 pts): each citation = 15pts, capped at 2+
  score += Math.min(citationCount * 15, 30);

  // Citation ratio bonus (max 15 pts): brand citations / total citations
  if (totalCitations > 0) {
    score += Math.round((citationCount / totalCitations) * 15);
  }

  // Sentiment bonus (max 15 pts)
  if (sentiment === 'positive') score += 15;
  else if (sentiment === 'neutral' && mentionCount > 0) score += 7;

  return Math.min(score, 100);
}
