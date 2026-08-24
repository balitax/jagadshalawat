import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArticleDetailClient } from "./client";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Artikel Tidak Ditemukan — Jagad Shalawat" };
  }

  return {
    title: `${article.title} — Jagad Shalawat`,
    description: article.excerpt || article.title,
  };
}

async function getArticle(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/articles?all=true`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return (data.articles || []).find(
      (a: { slug: string }) => a.slug === slug
    ) || null;
  } catch {
    return null;
  }
}

export default async function ArtikelDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);

  return (
    <>
      <Navbar />
      <main className="flex-1 py-20 sm:py-28">
        {article ? (
          <ArticleDetailClient article={article} />
        ) : (
          <div className="mx-auto max-w-3xl px-5 text-center">
            <p className="font-display text-2xl font-bold text-parchment-2">
              Artikel tidak ditemukan
            </p>
            <Link
              href="/artikel"
              className="mt-4 inline-flex items-center gap-2 text-sm text-gold-2 hover:text-gold"
            >
              ← Kembali ke daftar artikel
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
