const DATAFORSEO_API_URL =
  'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live';

function getAuthHeader() {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    throw new Error(
      'DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD must be set in environment variables',
    );
  }

  return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');
}

/**
 * Fetch Google Ads search volume for a list of keywords via DataForSEO.
 * @param {string[]} keywords - Up to 1000 keywords
 * @param {{ locationCode?: number, languageCode?: string }} options
 * @returns {Promise<Record<string, number>>} Map of keyword → monthly search volume
 */
export async function getSearchVolumes(keywords, options = {}) {
  const body = [
    {
      keywords,
      ...(options.locationCode && { location_code: options.locationCode }),
      ...(options.languageCode && { language_code: options.languageCode }),
    },
  ];

  const response = await fetch(DATAFORSEO_API_URL, {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `DataForSEO API error (${response.status}): ${response.statusText}`,
    );
  }

  const data = await response.json();

  if (data.status_code !== 20000) {
    throw new Error(
      `DataForSEO error: ${data.status_message || 'Unknown error'}`,
    );
  }

  const task = data.tasks?.[0];
  if (!task || task.status_code !== 20000) {
    throw new Error(
      `DataForSEO task error: ${task?.status_message || 'No task returned'}`,
    );
  }

  const volumes = {};
  for (const item of task.result || []) {
    volumes[item.keyword] = item.search_volume ?? 0;
  }

  return volumes;
}
