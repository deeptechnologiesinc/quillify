import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { posts, getPost } from "@/lib/posts";
import { QuillifyLogo } from "@/components/QuillifyLogo";
import { ArrowLeft, Clock, Tag, ArrowRight } from "lucide-react";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Quillify Blog`,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "AI Writing": "bg-indigo-50 text-indigo-700 border-indigo-100",
  "Academic Writing": "bg-violet-50 text-violet-700 border-violet-100",
  "Research": "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const others = posts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="border-b border-indigo-50 px-4 sm:px-6 h-16 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/"><QuillifyLogo size={30} showByline /></Link>
        <div className="flex items-center gap-4">
          <Link href="/blog" className="text-sm text-gray-500 hover:text-indigo-700 transition-colors">← Blog</Link>
          <Link href="/sign-up" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-colors">Start free</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${CATEGORY_COLORS[post.category] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
              <Tag className="w-3 h-3" />{post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />{post.readTime}
            </span>
            <time className="text-xs text-gray-400">{new Date(post.date).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</time>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-indigo-950 leading-tight mb-4" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            {post.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">{post.description}</p>
        </div>

        <div
          className="prose prose-indigo max-w-none prose-headings:font-bold prose-headings:text-indigo-950 prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-4 prose-li:text-gray-600 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-indigo-950 prose-ul:my-4 prose-ol:my-4"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-14 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
          <p className="text-sm font-bold text-indigo-950 mb-1">Try Quillify free</p>
          <p className="text-sm text-gray-500 mb-4">AI score, humanization, reference finder, and APA 7 export — all in one tool.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer">
            Get started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>

      {others.length > 0 && (
        <section className="border-t border-indigo-50 py-14 px-4 sm:px-6 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-indigo-950 mb-6" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>More articles</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {others.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group bg-white border border-indigo-100 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer block">
                  <p className="text-xs text-indigo-500 font-semibold mb-1.5">{p.category}</p>
                  <h3 className="text-sm font-bold text-indigo-950 leading-snug group-hover:text-indigo-700 transition-colors" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>{p.title}</h3>
                  <p className="flex items-center gap-1 text-xs font-semibold text-indigo-500 mt-3 group-hover:gap-2 transition-all">
                    Read <ArrowRight className="w-3 h-3" />
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-indigo-50 bg-white py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/"><QuillifyLogo size={26} /></Link>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xs text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors">Home</Link>
            <Link href="/pricing" className="text-xs text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors">Pricing</Link>
            <Link href="/blog" className="text-xs text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors">Blog</Link>
          </div>
          <p className="text-xs text-gray-300">&copy; 2025 Quillify · Deep Technologies Inc.</p>
        </div>
      </footer>
    </div>
  );
}
