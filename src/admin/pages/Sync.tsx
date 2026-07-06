import { useEffect, useState } from "react";
import { supabase, adminAction } from "../lib/supabase";
import { EventRow } from "../lib/types";
import { dateTime } from "../lib/format";
import { TELEGRAM_WEBHOOK_URL, LIQPAY_WEBHOOK_URL } from "../lib/config";
import { PageHeader, Card, Spinner, EmptyState } from "../components/bits";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Bot,
  Webhook,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-muted rounded-lg px-3 py-2 overflow-x-auto whitespace-nowrap">
          {value}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success("Скопійовано");
          }}
        >
          <Copy className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function Sync() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [botInfo, setBotInfo] = useState<any>(null);
  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [settingHook, setSettingHook] = useState(false);

  async function loadEvents() {
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setEvents((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => {
    loadEvents();
    check();
  }, []);

  async function check() {
    setChecking(true);
    try {
      const [bot, hook] = await Promise.all([adminAction("bot_info"), adminAction("webhook_info")]);
      setBotInfo(bot);
      setWebhookInfo(hook);
    } catch (e: any) {
      toast.error(e.message);
    }
    setChecking(false);
  }

  async function setWebhook() {
    setSettingHook(true);
    try {
      const r: any = await adminAction("set_webhook");
      if (r?.result?.ok) toast.success("Webhook встановлено");
      else toast.error(r?.result?.description ?? "Помилка встановлення webhook");
      await check();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSettingHook(false);
  }

  const botOk = botInfo?.ok;
  const hookOk = webhookInfo?.ok && webhookInfo?.result?.url;

  return (
    <div>
      <PageHeader
        title="Синхронізація з Telegram"
        subtitle="Стан бота, webhook та журнал подій"
        actions={
          <Button variant="outline" onClick={check} disabled={checking}>
            {checking ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            Перевірити
          </Button>
        }
      />

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Bot status */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Бот</h2>
          </div>
          {botInfo == null ? (
            <p className="text-sm text-muted-foreground">Перевірка...</p>
          ) : botOk ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              @{botInfo.result.username} — підключено
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm text-destructive">
              <XCircle className="w-4 h-4 mt-0.5" />
              <div>
                {botInfo.description || "Токен бота не налаштований"}
                <div className="text-xs text-muted-foreground mt-1">
                  Додайте секрет <code className="bg-muted px-1 rounded">TELEGRAM_BOT_TOKEN</code> у налаштуваннях Edge Functions.
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Webhook status */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Webhook</h2>
            </div>
            <Button size="sm" onClick={setWebhook} disabled={settingHook}>
              {settingHook ? <Loader2 className="w-4 h-4 animate-spin" /> : "Встановити"}
            </Button>
          </div>
          {webhookInfo == null ? (
            <p className="text-sm text-muted-foreground">Перевірка...</p>
          ) : hookOk ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="w-4 h-4" /> Активний
              </div>
              {webhookInfo.result.pending_update_count > 0 && (
                <div className="text-xs text-amber-600">
                  У черзі: {webhookInfo.result.pending_update_count}
                </div>
              )}
              {webhookInfo.result.last_error_message && (
                <div className="text-xs text-destructive">
                  Остання помилка: {webhookInfo.result.last_error_message}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertTriangle className="w-4 h-4" /> Не встановлено — натисніть «Встановити»
            </div>
          )}
        </Card>
      </div>

      {/* URLs */}
      <Card className="p-5 mb-6 space-y-3">
        <h2 className="font-semibold mb-1">Адреси для інтеграцій</h2>
        <CopyRow label="Telegram webhook (для setWebhook)" value={TELEGRAM_WEBHOOK_URL} />
        <CopyRow label="LiqPay server_url (вкажіть у кабінеті LiqPay)" value={LIQPAY_WEBHOOK_URL} />
      </Card>

      {/* Events */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold">Журнал подій</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="w-5 h-5 text-muted-foreground" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState title="Немає подій" />
        ) : (
          <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
            {events.map((e) => (
              <div key={e.id} className="px-5 py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-sm font-medium">{e.type}</span>
                  {e.payload && Object.keys(e.payload).length > 0 && (
                    <span className="text-xs text-muted-foreground ml-2 truncate">
                      {JSON.stringify(e.payload).slice(0, 80)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{dateTime(e.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
