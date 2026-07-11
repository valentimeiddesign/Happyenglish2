import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Check, ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { useSiteContent } from "../lib/siteContent";
import imgImage2 from "figma:asset/629332bcc754948a8d2ccd2001257db6bbbad5b7.png";
import imgImage3 from "figma:asset/b40017218bb8a3d271e26850ab873d8509abe267.png";
import imgImage4 from "figma:asset/73c5e1a9a73aaee34212259fc3bc258407c5e479.png";
import imgImage5 from "figma:asset/d9313d2dec81b11f933c7042a6500087f3a347a1.png";
import imgImage6 from "figma:asset/2db1a39091084c9b73f097e12f589d7befc0eff4.png";
import imgImage7 from "figma:asset/49b7aa1644ddbefa49b370c487c1889185429b0a.png";
import imgImage8 from "figma:asset/1b1fc254c3a7d222d78063a1cd4a8462a6259831.png";
import imgImage9 from "figma:asset/c2a6a6e4ceec99e09f61abd313f4ec4016427761.png";
import imgImage10 from "figma:asset/0376a1703d8d2f7c9fe98edb363570ed929b2897.png";
import imgImage11 from "figma:asset/cdf448f7ac3add6f6e8d28c12347078f2757d422.png";
import imgImage12 from "figma:asset/76d3e31378ecb5d563b278270e4521fe20088016.png";
import imgImage13 from "figma:asset/01c9a4644aeb20a238434fe8e861a7098ae3a670.png";
import imgImage14 from "figma:asset/17139f011dba92fe958548f566a89f626d98e37f.png";
import imgImage15 from "figma:asset/dea9c47098e383e79a14d3d924049c147d57c65e.png";
import imgImage16 from "figma:asset/1b5d70bc4344406a0ff34d9e7fcba09ef34996c2.png";
import imgImage17 from "figma:asset/20c9f435535f3118606d330e341eab8dcd687f31.png";
import imgImage18 from "figma:asset/bbd23425b26a92ca35a72246ad76fae1edc8ead9.png";
import imgImage19 from "figma:asset/f8dc64e609027770734ef51d7266d514a0e1e3e7.png";
import imgImage20 from "figma:asset/a65bfd50c115af5038c30ec51c75fd48f8f8e040.png";
import imgImage21 from "figma:asset/8ae8d404075da30d5a30f4fbe037570afaeb1b3e.png";
import imgImage22 from "figma:asset/a1ee7560f07ba2dad56a20c644cb518c1f3fb707.png";

export function Features() {
  const contacts = useSiteContent("contacts");
  const presentationSlides = [
    imgImage2, imgImage3, imgImage4, imgImage5, imgImage6, imgImage7,
    imgImage8, imgImage9, imgImage10, imgImage11, imgImage12, imgImage13,
    imgImage14, imgImage15, imgImage16, imgImage17, imgImage18, imgImage19,
    imgImage20, imgImage21, imgImage22
  ];

  const benefits = [
    { title: "Різні рівні (A0-A2)", description: "Уроки адаптовані для дітей 3-4, 5-7 років та підлітків." },
    { title: "Ігровий формат", description: "Залучення через популярні платформи: Wordwall, Bamboozle." },
    { title: "Економія часу", description: "Більше не потрібно ночами готувати презентації." },
    { title: "Щоденні оновлення", description: "Нові матеріали з'являються у вашому телефоні регулярно." }
  ];

  return (
    <section className="py-20 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Content (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                Все необхідне для <span className="text-primary">сучасного уроку</span> в одному місці
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Ми створюємо яскраві, професійні презентації в Canva, які захоплюють увагу дітей з першого слайду.
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((item, idx) => (
                <div key={idx} className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Check className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <a href={contacts.bot_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center font-bold text-primary hover:text-primary/80 transition-colors">
              Спробувати безкоштовно <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>

          {/* Right Carousel Content (7 cols) */}
          <div className="lg:col-span-7 relative">
             {/* Decorative blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-secondary/5 blur-3xl rounded-full -z-10"></div>

            <div className="relative bg-white rounded-[2rem] p-4 shadow-2xl border-4 border-white">
              <Carousel className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                  {presentationSlides.map((slide, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 relative group cursor-pointer">
                        <img
                          src={slide}
                          alt={`Презентація ${index + 1}`}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                        />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="bg-white/90 backdrop-blur text-gray-900 px-6 py-3 rounded-full font-bold shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                              Переглянути
                            </span>
                         </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-4 mt-6">
                    <CarouselPrevious className="static transform-none bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700" />
                    <CarouselNext className="static transform-none bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700" />
                </div>
              </Carousel>
              
              <div className="mt-6 text-center border-t border-gray-100 pt-6">
                 <a
                  href="https://www.canva.com/design/DAGaqJv8Bkw/wSB22iv2h3S7AbMScxvshw/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Приклад реальної презентації в Canva
                </a>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
