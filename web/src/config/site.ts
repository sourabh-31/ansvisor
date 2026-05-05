export const siteConfig = {
  name: "Ansvisor",
  description:
    "Monitor, analyze, and optimize your brand's visibility in AI-powered search engines like ChatGPT, Perplexity, Gemini, and more.",
  url: "https://ansvisor.com",
  ogImage: "https://ansvisor.com/og.jpg",
  links: {
    github: "https://github.com/your-org/ansvisor",
    docs: "https://docs.ansvisor.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;
