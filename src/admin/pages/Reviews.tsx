import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { Testimonial } from "../lib/types";
import { PageHeader, Card, Spinner, EmptyState } from "../components/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, Upload, Loader2, ImageIcon, Eye, EyeOff } from "lucide-react";

const emptyImage: Partial<Testimonial> = { type: "image", is_published: true, sort_order: 0 };
const emptyText: Partial<Testimonial> = { type: "text", is_published: true, sort_order: 0, rating: 5 };

export function Reviews() {
  const [rows, setRows] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("testimonials").select("*").order("sort_order");
    setRows((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function togglePublish(t: Testimonial) {
    await supabase.from("testimonials").update({ is_published: !t.is_published }).eq("id", t.id);
    load();
  }

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-6 h-6 text-muted-foreground" />
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Відгуки"
        subtitle="Керуйте відгуками, що показуються на сайті"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing({ ...emptyText })}>
              <Plus className="w-4 h-4 mr-1" /> Текст
            </Button>
            <Button onClick={() => setEditing({ ...emptyImage })}>
              <Plus className="w-4 h-4 mr-1" /> Картинка
            </Button>
          </div>
        }
      />

      {rows.length === 0 ? (
        <EmptyState title="Немає відгуків" hint="Додайте перший відгук" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((t) => (
            <Card key={t.id} className="overflow-hidden flex flex-col">
              {t.type === "image" ? (
                <div className="aspect-[3/4] bg-muted overflow-hidden">
                  {t.image_url ? (
                    <img src={t.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 flex-1">
                  {t.rating != null && (
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < (t.rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-muted"}`}
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-sm line-clamp-5">{t.text}</p>
                </div>
              )}

              <div className="p-3 border-t border-border flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">{t.author_name || "—"}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{t.author_role || ""}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    title={t.is_published ? "Опубліковано" : "Приховано"}
                    onClick={() => togglePublish(t)}
                  >
                    {t.is_published ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(t)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <ReviewDialog
          review={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function ReviewDialog({
  review,
  onClose,
  onSaved,
}: {
  review: Partial<Testimonial>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<Partial<Testimonial>>(review);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = !review.id;

  function set<K extends keyof Testimonial>(key: K, value: Testimonial[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `uploads/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("testimonials").upload(path, file, {
      contentType: file.type,
      upsert: true,
    });
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("testimonials").getPublicUrl(path);
    set("image_url", data.publicUrl);
    setUploading(false);
    toast.success("Зображення завантажено");
  }

  async function save() {
    if (form.type === "image" && !form.image_url) {
      toast.error("Завантажте зображення");
      return;
    }
    if (form.type === "text" && !form.text) {
      toast.error("Введіть текст відгуку");
      return;
    }
    setSaving(true);
    const payload: any = {
      type: form.type,
      author_name: form.author_name || null,
      author_role: form.author_role || null,
      avatar_url: form.avatar_url || null,
      image_url: form.type === "image" ? form.image_url || null : null,
      rating: form.type === "text" ? Number(form.rating) || null : null,
      text: form.type === "text" ? form.text || null : null,
      is_published: form.is_published ?? true,
      sort_order: Number(form.sort_order || 0),
    };
    const q = isNew
      ? supabase.from("testimonials").insert(payload)
      : supabase.from("testimonials").update(payload).eq("id", review.id!);
    const { error } = await q;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Збережено");
    onSaved();
  }

  async function remove() {
    if (!confirm("Видалити відгук?")) return;
    setSaving(true);
    const { error } = await supabase.from("testimonials").delete().eq("id", review.id!);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Видалено");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isNew ? "Новий відгук" : "Редагувати відгук"} · {form.type === "image" ? "картинка" : "текст"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {form.type === "image" ? (
            <div>
              <Label>Зображення відгуку</Label>
              <div className="mt-1.5">
                {form.image_url && (
                  <img src={form.image_url} alt="" className="w-full rounded-lg border border-border mb-2 max-h-64 object-contain bg-muted" />
                )}
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
                <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                  {form.image_url ? "Замінити зображення" : "Завантажити зображення"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <Label>Текст відгуку *</Label>
                <Textarea rows={4} value={form.text ?? ""} onChange={(e) => set("text", e.target.value)} />
              </div>
              <div>
                <Label>Оцінка</Label>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} type="button" onClick={() => set("rating", (i + 1) as any)}>
                      <Star className={`w-6 h-6 ${i < (form.rating ?? 0) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/40"}`} />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Ім'я автора</Label>
              <Input value={form.author_name ?? ""} onChange={(e) => set("author_name", e.target.value)} placeholder="Олена" />
            </div>
            <div>
              <Label>Роль / підпис</Label>
              <Input value={form.author_role ?? ""} onChange={(e) => set("author_role", e.target.value)} placeholder="вчителька англійської" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_published ?? true} onCheckedChange={(v) => set("is_published", v)} />
              <Label className="cursor-pointer">Показувати на сайті</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Порядок</Label>
              <Input
                type="number"
                className="w-16"
                value={form.sort_order ?? 0}
                onChange={(e) => set("sort_order", Number(e.target.value) as any)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          {!isNew ? (
            <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={remove}>
              <Trash2 className="w-4 h-4 mr-1" /> Видалити
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button onClick={save} disabled={saving || uploading}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Зберегти
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
