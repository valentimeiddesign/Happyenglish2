import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Send, Book, ArrowRight, Check } from "lucide-react";
import imgGoGetter1 from "figma:asset/e561dd757e33cb72fbe965a42129ed3d19fd3cfc.png";
import imgGoGetter2 from "figma:asset/56e77a3b339a4a016f253ec4065f1634c3184c46.png";
import imgGoGetter3 from "figma:asset/7f5c8f901f861de705ce49e1cb0375f7f09e0563.png";
import imgMindsA2 from "figma:asset/5c1cc67880730c149df98f560b5030a5e9c43dcb.png";

export function Catalog() {
  const courses = [
    {
      title: "Go Getter 1",
      age: "7-10 років",
      lessons: 45,
      description: "Базовий рівень для молодших школярів. Яскраві герої та цікаві історії.",
      emoji: "📘",
      level: "A1",
      image: imgGoGetter1,
      telegramLink: "https://www.privat24.ua/rd/send_qr/liqpay_static_qr/payment_2748372941.2ad3a7668b74413c8ac7fbde30b89ba15925249514454540b71e6ce00b1e95c2",
      price: 1200
    },
    {
      title: "Go Getter 2",
      age: "8-11 років",
      lessons: 48,
      description: "Продовження курсу для поглиблення знань. Більше граматики та лексики.",
      emoji: "📗",
      level: "A1+",
      image: imgGoGetter2,
      telegramLink: "https://www.privat24.ua/rd/send_qr/liqpay_static_qr/qr_f16798af16494eb7b49baa65a673a3b5",
      price: 1200
    },
    {
      title: "Go Getter 3",
      age: "9-12 років",
      lessons: 50,
      description: "Просунутий рівень для впевненого володіння. Готуємось до середньої школи.",
      emoji: "📕",
      level: "A2",
      image: imgGoGetter3,
      telegramLink: "https://www.privat24.ua/rd/send_qr/liqpay_static_qr/qr_d4acec19e536429aa22dc68fb01f531e",
      price: 1200
    },
    {
      title: "4Minds A2",
      age: "10-14 років",
      lessons: 52,
      description: "Комплексний курс для підлітків. Сучасні теми та актуальна лексика.",
      emoji: "📙",
      level: "A2",
      image: imgMindsA2,
      telegramLink: "https://www.privat24.ua/rd/send_qr/liqpay_static_qr/qr_d4acec19e536429aa22dc68fb01f531e",
      price: 1200
    },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
           <div>
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-secondary/10 rounded-full">
                 <Book className="w-4 h-4 text-secondary" />
                 <span className="text-xs font-bold text-secondary uppercase tracking-wide">Окремі курси</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Підручники та <span className="text-primary underline decoration-wavy decoration-primary/30 underline-offset-4">канали</span>
              </h2>
           </div>
           <p className="text-muted-foreground max-w-md text-right hidden md:block">
             Оберіть конкретний підручник та отримайте доступ лише до потрібних матеріалів в окремому Telegram каналі.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-border hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[var(--radius-card)] flex flex-col bg-card"
            >
              {/* Image Area */}
              <div className="aspect-[4/3] bg-muted relative overflow-hidden p-6 flex items-center justify-center">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-3/4 h-auto object-contain transform group-hover:scale-110 transition-transform duration-500 drop-shadow-xl relative z-10"
                />
                <div className="absolute top-4 right-4 bg-card/90 backdrop-blur px-2 py-1 rounded-[var(--radius)] text-xs font-bold shadow-sm z-20 text-foreground">
                  {course.level}
                </div>
                
                {/* Decorative circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full opacity-50 blur-2xl"></div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-card-foreground">Презентації до {course.title}</h3>
                  <span className="text-2xl">{course.emoji}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                   <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-none">
                      {course.age}
                   </Badge>
                   <span className="text-xs text-muted-foreground">•</span>
                   <span className="text-xs font-medium text-muted-foreground">{course.lessons} уроків</span>
                </div>

                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow">{course.description}</p>
                
                <div className="mt-auto pt-4 border-t border-border">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Вартість підписки</p>
                      <p className="text-2xl font-bold text-foreground">1200₴ <span className="text-sm font-normal text-muted-foreground">одноразово</span></p>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-[var(--radius-button)]"
                    asChild
                  >
                    <a href={course.telegramLink} target="_blank" rel="noopener noreferrer">
                      Підписатися <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
