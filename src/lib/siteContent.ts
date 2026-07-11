import { useEffect, useState } from "react";
import { supabase } from "../admin/lib/supabase";

// Defaults mirror the DB seed so the site renders instantly and never breaks
// if the network / DB is unavailable.
export const SITE_DEFAULTS = {
  seo: {
    title: "Happy English — готові презентації та ігри для уроків англійської",
    description:
      "Готові інтерактивні презентації, ігри та завдання в Telegram для вчителів англійської. Економте час на підготовку та захопіть учнів. 240+ уроків, рівні A0–A2.",
    keywords: "",
    og_image: "/og-image.png",
  },
  hero: {
    badge: "Для вчителів англійської",
    title_prefix: "Зробіть ваші уроки",
    title_highlight: "незабутніми",
    title_suffix: "для дітей!",
    subtitle:
      "Готові інтерактивні презентації, ігри та завдання в Telegram. Економте час на підготовку та дивуйте своїх учнів щодня! 🚀",
    cta_text: "Детальніше",
    cta_link: "",
    social_proof: "Вже 100+ вчителів з нами",
    rating: "5.0/5",
    materials: "240+ уроків",
  },
  stats: {
    items: [
      { number: "240+", label: "Інтерактивних уроків" },
      { number: "4.9/5", label: "Середній рейтинг" },
      { number: "4", label: "Платформи навчання" },
      { number: "15+", label: "Типів ігор" },
    ] as { number: string; label: string }[],
  },
  contacts: {
    bot_link: "https://t.me/+pPdxjKbjeaMzMzIy",
    telegram: "https://t.me/+380954970102",
    instagram: "https://www.instagram.com/happyenglish2022?igsh=c3d5amc2bjMzZTBk",
    email: "contact@example.com",
    phone: "+380954970102",
    about:
      "Сучасні інструменти для вчителів, які прагнуть зробити навчання цікавим та ефективним. Ми допомагаємо економити час та надихати учнів.",
    copyright: "© 2025 Happy English. Всі права захищені.",
  },
};

export type SiteContentKey = keyof typeof SITE_DEFAULTS;

let cache: Record<string, any> | null = null;
let inflight: Promise<Record<string, any>> | null = null;

function fetchContent(): Promise<Record<string, any>> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = supabase
      .from("site_content")
      .select("key,value")
      .then(({ data }) => {
        const map: Record<string, any> = {};
        (data ?? []).forEach((r: any) => (map[r.key] = r.value));
        cache = map;
        return map;
      })
      .catch(() => ({}) as Record<string, any>);
  }
  return inflight;
}

/** Read a site-content section, merged over its defaults. */
export function useSiteContent<K extends SiteContentKey>(key: K): (typeof SITE_DEFAULTS)[K] {
  const [value, setValue] = useState<any>(SITE_DEFAULTS[key]);
  useEffect(() => {
    let mounted = true;
    fetchContent().then((map) => {
      if (mounted && map[key]) setValue({ ...SITE_DEFAULTS[key], ...map[key] });
    });
    return () => {
      mounted = false;
    };
  }, [key]);
  return value;
}
