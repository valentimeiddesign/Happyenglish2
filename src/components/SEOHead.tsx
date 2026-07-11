import { useEffect } from "react";
import { useSiteContent } from "../lib/siteContent";

function setAttr(selector: string, attr: string, value?: string) {
  if (!value) return;
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

/** Applies admin-editable SEO values to the document head at runtime. */
export function SEOHead() {
  const seo = useSiteContent("seo");
  useEffect(() => {
    if (seo.title) document.title = seo.title;
    setAttr('meta[name="description"]', "content", seo.description);
    setAttr('meta[name="keywords"]', "content", seo.keywords);
    setAttr('meta[property="og:title"]', "content", seo.title);
    setAttr('meta[property="og:description"]', "content", seo.description);
    setAttr('meta[name="twitter:title"]', "content", seo.title);
    setAttr('meta[name="twitter:description"]', "content", seo.description);
  }, [seo]);
  return null;
}
