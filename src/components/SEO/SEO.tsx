import type { Metadata } from "next";
import { DEFAULT_SEO } from "@/constants/seo";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
}

/**
 * Generate metadata for a page.
 * Use this in your page files with `export const metadata = generateMetadata({ ... })`
 * or with `export async function generateMetadata() { return generateSEO({ ... }) }`
 *
 * @example
 * // Static metadata
 * export const metadata = generateSEO({
 *   title: "About Us",
 *   description: "Learn more about our company",
 * });
 *
 * @example
 * // Dynamic metadata
 * export async function generateMetadata({ params }) {
 *   const post = await getPost(params.id);
 *   return generateSEO({
 *     title: post.title,
 *     description: post.excerpt,
 *   });
 * }
 */
export function generateSEO({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = "website",
  noIndex = false,
}: SEOProps = {}): Metadata {
  const seoTitle = title || DEFAULT_SEO.title;
  const seoDescription = description || DEFAULT_SEO.description;
  const seoKeywords = keywords || DEFAULT_SEO.keywords;
  const seoCanonical = canonical
    ? `${DEFAULT_SEO.url}${canonical}`
    : DEFAULT_SEO.url;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    alternates: {
      canonical: seoCanonical,
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: ogType,
      url: seoCanonical,
      siteName: DEFAULT_SEO.siteName,
      locale: DEFAULT_SEO.locale,
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      site: DEFAULT_SEO.twitterHandle,
      ...(ogImage && { images: [ogImage] }),
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}
