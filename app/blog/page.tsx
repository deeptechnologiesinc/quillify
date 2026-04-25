import Link from "next/link";
import type { Metadata } from "next";
import { posts } from "@/lib/posts";
import { QuillifyLogo } from "@/components/QuillifyLogo";
import { BookOpen, Clock, ArrowRight, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Quillify Blog — Academic Writing & AI Detection Tips",
  description: "Guides on avoiding AI detection, APA 7 formatting, academic research databases, and writing better essays.",
};

const CATEGORY_COLORS: Record<string, string> = {
  "AI Writing": "bg-indigo-50 text-indigo-700 border-indigo-100",
  "Academic Writing": "bg-violet-50 text-violet-700 border-violet-100",
  "Research": "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <nav className="border-b border-indigo-50 px-4 sm:px-6 h-16 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/"><QuillifyLogo size={30} showByline /></Link>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-gray-500 hover:text-indigo-700 transition-colors">Pricing</Link>
          <Link href="/sign-up" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl cursor-pointer shadow-sm transition-colors">Start free</Link>
        </div>
      </nav>

      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-indigo-50/50 to-white border-b border-indigo-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <BookOpen className="w-3.5 h-3.5" /> The Quillify Blog
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-indigo-950 mb-3" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            Academic Writing Guides
          </h1>
          <p className="text-gray-500 text-lg">Practical tips on AI detection, APA citations, and academic research.</p>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-white border border-indigo-100 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-1 transition-all duration-300 cursor-pointer block">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${CATEGORY_COLORS[post.category] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                  <Tag className="w-3 h-3" />{post.category}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />{post.readTime}
                </div>
              </div>
              <h2 className="text-lg font-bold text-indigo-950 mb-2 leading-snug group-hover:text-indigo-700 transition-colors" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{post.description}</p>
              <div className="flex items-center justify-between">
                <time className="text-xs text-gray-300">{new Date(post.date).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" })}</time>
                <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-indigo-950">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>Try Quillify free</h2>
          <p className="text-indigo-300 mb-6 text-sm">Put these tips into practice — Quillify handles the AI score, humanization, and citations automatically.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold px-8 py-3.5 rounded-xl transition-colors cursor-pointer text-sm">
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-indigo-50 bg-slate-50 py-8 px-4 sm:px-6">
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
