import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { SITE_DEFAULTS } from "../../lib/siteContent";
import { PageHeader, Card, Spinner } from "../components/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Search, Sparkles, BarChart3, Phone } from "lucide-react";

export function Content() {
  const [seo, setSeo] = useState<any>(SITE_DEFAULTS.seo);
  const [hero, setHero] = useState<any>(SITE_DEFAULTS.hero);
  const [stats, setStats] = useState<any>(SITE_DEFAULTS.stats);
  const [contacts, setContacts] = useState<any>(SITE_DEFAULTS.contacts);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("site_content")
      .select("key,value")
      .then(({ data }) => {
        const map: Record<string, any> = {};
        (data ?? []).forEach((r: any) => (map[r.key] = r.value));
        if (map.seo) setSeo({ ...SITE_DEFAULTS.seo, ...map.seo });
        if (map.hero) setHero({ ...SITE_DEFAULTS.hero, ...map.hero });
        if (map.stats) setStats({ ...SITE_DEFAULTS.stats, ...map.stats });
        if (map.contacts) setContacts({ ...SITE_DEFAULTS.contacts, ...map.contacts });
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    const rows = [
      { key: "seo", value: seo },
      { key: "hero", value: hero },
      { key: "stats", value: stats },
      { key: "contacts", value: contacts },
    ];
    const { error } = await supabase.from("site_content").upsert(rows);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Контент збережено. Оновіть сайт, щоб побачити зміни.");
  }

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-6 h-6 text-muted-foreground" />
      </div>
    );

  const items: { number: string; label: string }[] = stats.items ?? [];

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Контент сайту"
        subtitle="Тексти головної сторінки, SEO та контакти"
        actions={
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            Зберегти все
          </Button>
        }
      />

      {/* SEO */}
      <Card className="p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">SEO (пошук, соцмережі)</h2>
        </div>
        <div className="space-y-3">
          <div>
            <Label>Title (заголовок вкладки/Google)</Label>
            <Input value={seo.title ?? ""} onChange={(e) => setSeo({ ...seo, title: e.target.value })} />
          </div>
          <div>
            <Label>Description (опис у пошуку)</Label>
            <Textarea rows={2} value={seo.description ?? ""} onChange={(e) => setSeo({ ...seo, description: e.target.value })} />
          </div>
          <div>
            <Label>Keywords (ключові слова через кому)</Label>
            <Input value={seo.keywords ?? ""} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} />
          </div>
        </div>
      </Card>

      {/* Hero */}
      <Card className="p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Головний банер (Hero)</h2>
        </div>
        <div className="space-y-3">
          <div>
            <Label>Плашка зверху</Label>
            <Input value={hero.badge ?? ""} onChange={(e) => setHero({ ...hero, badge: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Заголовок — початок</Label>
              <Input value={hero.title_prefix ?? ""} onChange={(e) => setHero({ ...hero, title_prefix: e.target.value })} />
            </div>
            <div>
              <Label>Виділене слово</Label>
              <Input value={hero.title_highlight ?? ""} onChange={(e) => setHero({ ...hero, title_highlight: e.target.value })} />
            </div>
            <div>
              <Label>Заголовок — кінець</Label>
              <Input value={hero.title_suffix ?? ""} onChange={(e) => setHero({ ...hero, title_suffix: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Підзаголовок</Label>
            <Textarea rows={2} value={hero.subtitle ?? ""} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Текст кнопки</Label>
              <Input value={hero.cta_text ?? ""} onChange={(e) => setHero({ ...hero, cta_text: e.target.value })} />
            </div>
            <div>
              <Label>Посилання кнопки (порожньо = бот)</Label>
              <Input value={hero.cta_link ?? ""} onChange={(e) => setHero({ ...hero, cta_link: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Соц. доказ</Label>
              <Input value={hero.social_proof ?? ""} onChange={(e) => setHero({ ...hero, social_proof: e.target.value })} />
            </div>
            <div>
              <Label>Рейтинг</Label>
              <Input value={hero.rating ?? ""} onChange={(e) => setHero({ ...hero, rating: e.target.value })} />
            </div>
            <div>
              <Label>Матеріали</Label>
              <Input value={hero.materials ?? ""} onChange={(e) => setHero({ ...hero, materials: e.target.value })} />
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <Card className="p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Статистика (4 показники)</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map((it, i) => (
            <div key={i} className="flex gap-2">
              <Input
                className="w-24"
                value={it.number}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...it, number: e.target.value };
                  setStats({ ...stats, items: next });
                }}
              />
              <Input
                value={it.label}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...it, label: e.target.value };
                  setStats({ ...stats, items: next });
                }}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Contacts */}
      <Card className="p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Phone className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Контакти та посилання</h2>
        </div>
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Посилання на бота (кнопки CTA)</Label>
              <Input value={contacts.bot_link ?? ""} onChange={(e) => setContacts({ ...contacts, bot_link: e.target.value })} />
            </div>
            <div>
              <Label>Telegram</Label>
              <Input value={contacts.telegram ?? ""} onChange={(e) => setContacts({ ...contacts, telegram: e.target.value })} />
            </div>
            <div>
              <Label>Instagram</Label>
              <Input value={contacts.instagram ?? ""} onChange={(e) => setContacts({ ...contacts, instagram: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={contacts.email ?? ""} onChange={(e) => setContacts({ ...contacts, email: e.target.value })} />
            </div>
            <div>
              <Label>Телефон</Label>
              <Input value={contacts.phone ?? ""} onChange={(e) => setContacts({ ...contacts, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Про нас (у футері)</Label>
            <Textarea rows={2} value={contacts.about ?? ""} onChange={(e) => setContacts({ ...contacts, about: e.target.value })} />
          </div>
          <div>
            <Label>Копірайт</Label>
            <Input value={contacts.copyright ?? ""} onChange={(e) => setContacts({ ...contacts, copyright: e.target.value })} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end pb-8">
        <Button onClick={save} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
          Зберегти все
        </Button>
      </div>
    </div>
  );
}
