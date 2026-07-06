import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { PageHeader, Card, Spinner } from "../components/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, KeyRound, ShieldCheck } from "lucide-react";

const SECRETS = [
  { name: "TELEGRAM_BOT_TOKEN", desc: "Токен бота з @BotFather" },
  { name: "TELEGRAM_WEBHOOK_SECRET", desc: "Будь-який секретний рядок для захисту webhook" },
  { name: "LIQPAY_PUBLIC_KEY", desc: "Public key з кабінету LiqPay" },
  { name: "LIQPAY_PRIVATE_KEY", desc: "Private key з кабінету LiqPay" },
  { name: "CRON_SECRET", desc: "Секрет для планувальника (показаний в інструкції)" },
];

export function Settings() {
  const { session } = useAuth();
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("settings")
      .select("key,value")
      .then(({ data }) => {
        const map: Record<string, any> = {};
        (data ?? []).forEach((r: any) => (map[r.key] = r.value));
        setValues(map);
        setLoading(false);
      });
  }, []);

  function set(key: string, value: any) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function save() {
    setSaving(true);
    const keys = [
      "brand",
      "bot_username",
      "admin_chat_id",
      "welcome_message",
      "access_granted_message",
      "reminder_days_before",
    ];
    const rows = keys.map((k) => ({
      key: k,
      value: k === "reminder_days_before" ? Number(values[k] || 0) : values[k] ?? "",
    }));
    const { error } = await supabase.from("settings").upsert(rows);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Налаштування збережено");
  }

  async function changePassword() {
    if (pwd.length < 6) return toast.error("Пароль мінімум 6 символів");
    setPwdSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setPwdSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Пароль змінено");
    setPwd("");
  }

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Spinner className="w-6 h-6 text-muted-foreground" />
      </div>
    );

  return (
    <div className="max-w-2xl">
      <PageHeader title="Налаштування" subtitle="Тексти бота, планувальник і безпека" />

      <Card className="p-5 space-y-4 mb-6">
        <h2 className="font-semibold">Загальні</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Назва бренду</Label>
            <Input value={values.brand ?? ""} onChange={(e) => set("brand", e.target.value)} />
          </div>
          <div>
            <Label>Username бота (без @)</Label>
            <Input value={values.bot_username ?? ""} onChange={(e) => set("bot_username", e.target.value)} placeholder="HappyEnglishBot" />
          </div>
          <div>
            <Label>Chat ID адміністратора</Label>
            <Input
              value={values.admin_chat_id ?? ""}
              onChange={(e) => set("admin_chat_id", e.target.value)}
              placeholder="напишіть боту /id"
            />
          </div>
          <div>
            <Label>Нагадувати за N днів до кінця</Label>
            <Input
              type="number"
              value={values.reminder_days_before ?? 3}
              onChange={(e) => set("reminder_days_before", e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Привітання (/start)</Label>
          <Textarea rows={2} value={values.welcome_message ?? ""} onChange={(e) => set("welcome_message", e.target.value)} />
        </div>
        <div>
          <Label>Повідомлення при видачі доступу</Label>
          <Textarea
            rows={2}
            value={values.access_granted_message ?? ""}
            onChange={(e) => set("access_granted_message", e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            Зберегти
          </Button>
        </div>
      </Card>

      {/* Secrets checklist */}
      <Card className="p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Секрети Edge Functions</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Додайте у Supabase → Project → Edge Functions → Secrets. Ці ключі не зберігаються в браузері.
        </p>
        <div className="space-y-2">
          {SECRETS.map((s) => (
            <div key={s.name} className="flex items-start gap-3 text-sm">
              <code className="bg-muted px-2 py-0.5 rounded text-xs shrink-0">{s.name}</code>
              <span className="text-muted-foreground text-xs pt-0.5">{s.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Password */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <KeyRound className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold">Зміна пароля</h2>
        </div>
        <div className="text-xs text-muted-foreground mb-2">{session?.user.email}</div>
        <div className="flex gap-2 max-w-sm">
          <Input
            type="password"
            placeholder="Новий пароль"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
          <Button variant="outline" onClick={changePassword} disabled={pwdSaving || pwd.length < 6}>
            {pwdSaving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
            Змінити
          </Button>
        </div>
      </Card>
    </div>
  );
}
