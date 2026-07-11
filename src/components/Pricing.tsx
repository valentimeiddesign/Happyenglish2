import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Check, Sparkles, Zap } from "lucide-react";
import { supabase } from "../admin/lib/supabase";

type Plan = { title: string; subtitle: string | null; price: number; payment_link: string | null };

const DEFAULT_MONTHLY: Plan = { title: "Місячна підписка", subtitle: "Спробуйте всі переваги", price: 300, payment_link: "https://www.privat24.ua/rd/send_qr/liqpay_static_qr/qr_15823fec544b47419d97209a529c56d6" };
const DEFAULT_QUARTER: Plan = { title: "3 Місяці", subtitle: "Максимальна вигода -35%", price: 585, payment_link: "https://www.privat24.ua/rd/send_qr/liqpay_static_qr/qr_6f9f0d914662488f928f3bd3952ed11e" };

export function Pricing() {
  const [monthly, setMonthly] = useState<Plan>(DEFAULT_MONTHLY);
  const [quarter, setQuarter] = useState<Plan>(DEFAULT_QUARTER);

  useEffect(() => {
    supabase
      .from("products")
      .select("title,subtitle,price,payment_link,billing_period")
      .eq("type", "subscription")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data, error }) => {
        if (error || !data) return;
        const m = data.find((p: any) => p.billing_period === "monthly");
        const q = data.find((p: any) => p.billing_period !== "monthly");
        if (m) setMonthly(m as Plan);
        if (q) setQuarter(q as Plan);
      });
  }, []);

  const monthlyPrice = monthly.price;
  const threeMonthsPrice = quarter.price;
  const savings = monthlyPrice * 3 - threeMonthsPrice;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Інвестуйте в <span className="text-secondary">якісний контент</span></h2>
          <p className="text-xl text-gray-500">
            Оберіть зручний тариф та отримайте миттєвий доступ до всієї бази матеріалів. Ціна чашки кави за цілий місяць готових уроків! ☕
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Standard Plan */}
          <Card className="p-8 rounded-3xl border-2 border-gray-100 shadow-xl bg-white hover:border-gray-200 transition-colors relative z-0">
             <div className="mb-8">
               <h3 className="text-xl font-bold text-gray-900 mb-2">{monthly.title}</h3>
               <p className="text-gray-500 text-sm">{monthly.subtitle ?? "Спробуйте всі переваги"}</p>
             </div>

             <div className="mb-8 flex items-baseline">
               <span className="text-5xl font-bold text-gray-900">{monthlyPrice}₴</span>
               <span className="text-gray-400 ml-2">/міс</span>
             </div>

             <Button className="w-full mb-8 bg-gray-900 text-white hover:bg-gray-800 h-12 rounded-xl font-bold shadow-lg" asChild>
                <a href={monthly.payment_link ?? "#"} target="_blank" rel="noopener noreferrer">Обрати тариф</a>
             </Button>

             <div className="space-y-4">
               <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Що включено:</p>
               <ul className="space-y-3">
                 {["Доступ до 240+ уроків", "Нові матеріали щотижня", "Підтримка в Telegram"].map((feature, i) => (
                   <li key={i} className="flex gap-3 text-gray-600 text-sm">
                     <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                     {feature}
                   </li>
                 ))}
               </ul>
             </div>
          </Card>

          {/* Premium Plan */}
          <Card className="p-8 rounded-3xl border-4 border-primary shadow-2xl bg-white relative z-10 transform md:-translate-y-4">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
               <Sparkles className="w-4 h-4" /> Хіт продажів
             </div>

             <div className="mb-8">
               <h3 className="text-xl font-bold text-gray-900 mb-2">{quarter.title}</h3>
               <p className="text-primary font-medium text-sm">{quarter.subtitle ?? "Максимальна вигода -35%"}</p>
             </div>

             <div className="mb-8 flex items-baseline">
               <span className="text-6xl font-bold text-primary">{threeMonthsPrice}₴</span>
               <span className="text-gray-400 ml-2">/3 міс</span>
             </div>

             <Button className="w-full mb-8 bg-primary text-white hover:bg-primary/90 h-14 rounded-xl font-bold text-lg shadow-primary/30 shadow-xl" asChild>
                <a href={quarter.payment_link ?? "#"} target="_blank" rel="noopener noreferrer">Заощадити зараз</a>
             </Button>

             <div className="space-y-4">
               <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Все з місячного, плюс:</p>
               <ul className="space-y-3">
                 {[
                   `Економія ${savings}₴`,
                   "Пріоритетна підтримка",
                   "Гарантія фіксації ціни",
                   "Бонусні ігри"
                 ].map((feature, i) => (
                   <li key={i} className="flex gap-3 text-gray-700 font-medium text-sm">
                     <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                     </div>
                     {feature}
                   </li>
                 ))}
               </ul>
             </div>
          </Card>
        </div>

        <div className="mt-16 flex flex-col md:flex-row justify-center gap-8 text-center md:text-left">
           <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Миттєвий доступ</h4>
                <p className="text-sm text-gray-500">Відразу після оплати</p>
              </div>
           </div>
           <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
           <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Безпечна оплата</h4>
                <p className="text-sm text-gray-500">Офіційний рахунок ФОП</p>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
