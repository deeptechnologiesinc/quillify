export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
};

export const posts: Post[] = [
  {
    slug: "avoid-ai-detection",
    title: "How to Avoid AI Detection in Academic Writing (2025 Guide)",
    description: "Learn the 7 patterns AI detectors flag most often and how to fix them to make your writing sound naturally human.",
    date: "2025-04-20",
    readTime: "6 min read",
    category: "AI Writing",
    content: `
<p>AI detection tools are getting better every month. Turnitin, GPTZero, Originality.ai — they all flag the same core patterns. The good news? Once you understand what they're looking for, fixing it is straightforward.</p>

<h2>What AI detectors actually measure</h2>
<p>These tools don't magically "know" if a human wrote something. They measure statistical patterns. Specifically:</p>
<ul>
<li><strong>Perplexity</strong> — how predictable each word choice is. AI tends to pick the most statistically likely next word. Humans don't.</li>
<li><strong>Burstiness</strong> — human writing has bursts of long and short sentences. AI produces uniform length.</li>
<li><strong>Vocabulary distribution</strong> — AI overuses certain words ("delve", "paramount", "multifaceted", "aforementioned").</li>
</ul>

<h2>The 7 patterns that get flagged</h2>

<h3>1. Uniform sentence length</h3>
<p>Read your draft out loud. If every sentence takes roughly the same breath to say, that's AI. Real writing mixes a punchy two-word sentence with a longer one that builds an idea slowly and carefully, like this one.</p>

<h3>2. Forbidden vocabulary</h3>
<p>Words and phrases that AI loves and humans almost never use: <em>delve into, intricate, multifaceted, paramount, leverage, utilize, aforementioned, comprehensive, nuanced, pivotal, foster</em>. Search your document for these and replace every instance.</p>

<h3>3. No personal hedging</h3>
<p>Humans are uncertain. We say "I think", "it seems like", "from what I've read", "arguably". AI states facts with robotic confidence. Adding hedges instantly lowers your detection score.</p>

<h3>4. Perfect transitions</h3>
<p>AI loves "Furthermore,", "Moreover,", "In conclusion,". Real writers use "And honestly,", "Here's the thing:", "Which brings me to...".</p>

<h3>5. No contractions</h3>
<p>"It is" → "It's". "They are" → "They're". Simple. AI avoids contractions; humans use them constantly.</p>

<h3>6. Passive voice overuse</h3>
<p>"The experiment was conducted by researchers" vs "Researchers ran the experiment." Active voice reads more natural and scores better.</p>

<h3>7. No personal anecdotes or opinions</h3>
<p>Even in academic writing, a brief "In my experience with this data..." or "I find this argument persuasive because..." signals human authorship.</p>

<h2>The fastest fix</h2>
<p>Tools like <a href="/app">Quillify</a> apply all seven of these fixes automatically. Paste your text, get an AI detection score with a breakdown of exactly which patterns are flagging, then hit Humanize. The balanced mode runs a two-pass Claude rewrite that typically reduces scores from 80%+ down to under 15%.</p>

<h2>How long does it take?</h2>
<p>Manual editing for a 1,000-word essay takes 30–60 minutes if you're thorough. Quillify does it in under 30 seconds. Either way, always read the output — AI humanizers occasionally change meaning slightly, so a final pass is worth it.</p>

<h2>Does humanizing count as plagiarism?</h2>
<p>This is the important question. Humanizing your own AI-assisted draft is different from submitting someone else's work. Most university policies focus on the ideas being your own. Always check your institution's specific guidelines.</p>
    `.trim(),
  },
  {
    slug: "apa-7-citation-guide",
    title: "APA 7th Edition: The Complete Student Citation Guide",
    description: "Everything you need to format in-text citations and reference lists correctly in APA 7 — with examples for every source type.",
    date: "2025-04-15",
    readTime: "8 min read",
    category: "Academic Writing",
    content: `
<p>APA 7th edition is the standard in psychology, education, business, and most social sciences. If you've ever stared at a citation wondering whether the comma goes before or after the year, this guide is for you.</p>

<h2>The basics: what changed in APA 7</h2>
<p>The 7th edition (2020) made several changes from APA 6:</p>
<ul>
<li>Running heads are no longer required for student papers</li>
<li>Up to 20 authors can now be listed (was 6)</li>
<li>DOIs are formatted as hyperlinks: https://doi.org/10.xxxx</li>
<li>"Retrieved from" is only required when the URL might change</li>
<li>The publisher location is no longer needed for books</li>
</ul>

<h2>In-text citations</h2>
<p>In-text citations in APA follow the author-date format:</p>
<ul>
<li><strong>One author:</strong> (Smith, 2022)</li>
<li><strong>Two authors:</strong> (Smith &amp; Jones, 2022)</li>
<li><strong>Three or more:</strong> (Smith et al., 2022)</li>
<li><strong>Direct quote:</strong> (Smith, 2022, p. 45)</li>
<li><strong>Paraphrase:</strong> Smith (2022) argued that...</li>
</ul>

<h2>Reference list format</h2>
<p>The reference list appears at the end of your paper, alphabetically sorted by author last name. Double-spaced, hanging indent.</p>

<h3>Journal article</h3>
<p>Author, A. A., &amp; Author, B. B. (Year). Title of article. <em>Journal Title, Volume</em>(Issue), page–page. https://doi.org/xxxxx</p>

<h3>Book</h3>
<p>Author, A. A. (Year). <em>Title of work: Capital letter also for subtitle</em>. Publisher.</p>

<h3>Book chapter (edited volume)</h3>
<p>Author, A. A. (Year). Title of chapter. In E. E. Editor (Ed.), <em>Title of book</em> (pp. xx–xx). Publisher.</p>

<h3>Website</h3>
<p>Author, A. A. (Year, Month Day). <em>Title of page</em>. Site Name. URL</p>

<h2>Common mistakes</h2>
<ol>
<li><strong>Capitalisation</strong>: Only the first word of article/chapter titles gets capitalised (sentence case), but journal names use title case.</li>
<li><strong>Italics</strong>: Journal name and volume number are italicised. Issue number is not.</li>
<li><strong>Et al.</strong>: Use et al. for 3+ authors in citations, but list all up to 20 in the reference list.</li>
<li><strong>doi vs URL</strong>: Always prefer doi when available.</li>
</ol>

<h2>Automate it</h2>
<p><a href="/app">Quillify's APA 7 formatter</a> handles all of this automatically. Paste your text, click "Make APA 7 Compliant", and it fixes your in-text citations, formats your reference list, and downloads a properly formatted .docx file. The reference finder also locates open-access papers and inserts correctly-formatted APA citations at the relevant sentences.</p>
    `.trim(),
  },
  {
    slug: "free-academic-databases",
    title: "5 Free Academic Research Databases Every Student Should Bookmark",
    description: "Tired of hitting paywalls? These five databases give you access to millions of peer-reviewed papers for free.",
    date: "2025-04-10",
    readTime: "5 min read",
    category: "Research",
    content: `
<p>The most common research mistake students make is typing their question into Google. Here are five databases that will find you better sources — and they're completely free.</p>

<h2>1. Semantic Scholar</h2>
<p>Built by the Allen Institute for AI, Semantic Scholar uses AI to surface the most relevant papers for your query — not just keyword matches. It indexes over 200 million papers and shows citation counts, related work, and direct links to PDF versions when available.</p>
<p><strong>Best for:</strong> Finding papers by topic, checking what cites what, discovering influential works in a field.</p>
<p><strong>Pro tip:</strong> Use the "Highly Influential Citations" filter to find papers that changed their field.</p>

<h2>2. OpenAlex</h2>
<p>OpenAlex is the successor to Microsoft Academic and indexes over 250 million scholarly works. It's completely open, API-accessible, and includes metadata like author affiliations, funding sources, and open access status.</p>
<p><strong>Best for:</strong> Comprehensive literature reviews, finding all papers by a specific author, identifying research trends.</p>

<h2>3. arXiv</h2>
<p>arXiv hosts preprints — papers before they've been peer-reviewed — primarily in physics, math, computer science, economics, and quantitative biology. Most major AI/ML papers appear on arXiv before anywhere else.</p>
<p><strong>Best for:</strong> Cutting-edge research, especially in STEM. Don't cite arXiv preprints as final publications — note that they're preprints.</p>

<h2>4. CORE</h2>
<p>CORE aggregates open access research from repositories around the world. Over 200 million open-access papers, downloadable as PDFs. If a paper has a legal free version somewhere, CORE has probably indexed it.</p>
<p><strong>Best for:</strong> Getting the full text of papers you've found through other databases.</p>

<h2>5. Unpaywall</h2>
<p>Technically a browser extension, not a database — but an essential tool. Unpaywall sits in your browser and automatically finds legal free versions of papers you're trying to read. It checks institutional repositories, author pages, and PubMed Central.</p>
<p><strong>Best for:</strong> Bypassing paywalls on papers you've already found.</p>

<h2>The smarter way to find references</h2>
<p>Searching these manually takes time. <a href="/app">Quillify's reference finder</a> searches Semantic Scholar, OpenAlex, and arXiv simultaneously for papers that support your specific claims. Paste your text, click Find References, and it returns ranked results with a relevance score. Click any paper to auto-insert an APA 7 citation into your document.</p>
    `.trim(),
  },
  {
    slug: "why-writing-sounds-ai",
    title: "Why Does My Writing Sound Like AI? 8 Patterns Explained",
    description: "Even when you write yourself, certain habits make your text score high on AI detectors. Here's what to watch for.",
    date: "2025-04-05",
    readTime: "5 min read",
    category: "AI Writing",
    content: `
<p>You wrote it yourself, but Turnitin flagged it. Frustrating. The truth is, AI writing tools have trained us to write like AI — and even purely human writing can trigger detectors if you've absorbed certain patterns.</p>

<h2>You've been reading too much AI output</h2>
<p>If you use ChatGPT to summarize readings or generate outlines, its vocabulary seeps into your own writing. You start naturally reaching for "delve", "encompass", and "multifaceted". These words aren't wrong — they're just statistically associated with AI generation.</p>

<h2>The 8 patterns detectors flag</h2>

<h3>1. "Delve into"</h3>
<p>This phrase appears in AI writing at roughly 10x the rate of human academic writing. Just say "explore", "examine", or "look at". Better yet: just start the sentence.</p>

<h3>2. Em-dash overuse</h3>
<p>AI loves em-dashes — like this — to add parenthetical information. Human writers use them occasionally. If you have more than one em-dash per 200 words, it's suspicious.</p>

<h3>3. Lists of exactly three</h3>
<p>AI constantly structures points in threes: "This approach is efficient, scalable, and cost-effective." Real writers are messier. Sometimes you have two points, sometimes five.</p>

<h3>4. "It is important to note that..."</h3>
<p>This and similar throat-clearing phrases ("it should be noted", "it is worth mentioning") are AI filler. Delete them and just make the point directly.</p>

<h3>5. Starting conclusions with "In conclusion"</h3>
<p>Every AI essay ends with "In conclusion," or "To summarize,". Use something more specific: "The picture that emerges from this analysis is..." or just start your closing argument.</p>

<h3>6. Over-citing consensus</h3>
<p>AI tends to cite well-known foundational papers for basic facts. "Studies show that humans need sleep (Smith, 1985)." You don't need a citation for common knowledge.</p>

<h3>7. Hedging everything equally</h3>
<p>Human writers hedge important claims more than minor ones. AI applies the same level of hedging to everything, creating a flat tone that reads as unnatural.</p>

<h3>8. Perfect paragraph structure</h3>
<p>AI essays have perfect five-sentence paragraphs with topic sentence, three supporting points, and a wrap-up. Real writing has one-sentence paragraphs. And paragraphs that end mid-thought before picking up in the next one.</p>

<h2>What to do about it</h2>
<p>The fix is partly conscious editing — scanning for these patterns before submission. <a href="/app">Quillify's AI detection analyser</a> highlights exactly which patterns appear in your text and gives you a score. The humanizer then rewrites with intentional variety, contractions, hedging, and vocabulary that avoids the known AI trigger words.</p>
    `.trim(),
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
