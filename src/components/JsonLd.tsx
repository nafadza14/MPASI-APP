/** Data terstruktur schema.org untuk Google & mesin AI (ChatGPT, Perplexity, Gemini, Claude). */
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
