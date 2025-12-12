import image7 from "figma:asset/8bb0a9e2e68520b2335701cc5422e99ffec076c6.png";
import image8 from "figma:asset/b7b1c95c65886a8a64b1e3d149e3387fe2ae20a0.png";
import image9 from "figma:asset/82e1443c2d876a74b786d1efc2b698f4b8db74ac.png";
import image10 from "figma:asset/d6922200618e9e0f388d8630d98d5c6f77fa07cd.png";
import image11 from "figma:asset/9515cbdbd6526bfd9c8f4168f740a962e70b9302.png";
import image12 from "figma:asset/5a167a66574d43e846cdd819d32d950b97c7a7a9.png";
import image13 from "figma:asset/424cba1da7213a71416f28286d6b6369396d2e24.png";
import image14 from "figma:asset/89171e40a0cf13097d7ae1aa4ce33071dfd6f308.png";
import image15 from "figma:asset/7038b2631e48ea457f46902ddaacb699f38c7027.png";
import image16 from "figma:asset/eae5cf680be357be86802e247aa1cb2f3019c16d.png";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Quote, ZoomIn, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle } from "./ui/dialog";
import Autoplay from "embla-carousel-autoplay";
import React from "react";

export function Testimonials() {
  const testimonials = [
    { image: image7, alt: "Відгук вчителя 1" },
    { image: image8, alt: "Відгук ��чителя 2" },
    { image: image9, alt: "Відгук вчителя 3" },
    { image: image10, alt: "Відгук вчителя 4" },
    { image: image11, alt: "Відгук вчителя 5" },
    { image: image12, alt: "Відгук вчителя 6" },
    { image: image13, alt: "Відгук вчителя 7" },
    { image: image14, alt: "Відгук вчителя 8" },
    { image: image15, alt: "Відгук вчителя 9" },
    { image: image16, alt: "Відгук вчителя 10" },
  ];

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 max-w-[1400px]">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6 rotate-3">
            <Quote className="w-8 h-8 text-secondary fill-secondary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Колеги вже <span className="text-secondary">в захваті</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Приєднуйтесь до спільноти вчителів, які зробили свої уроки яскравішими та цікавішими.
            Натисніть на відгук, щоб прочитати повністю! 👇
          </p>
        </div>

        <Carousel
          opts={{
            align: "center",
            loop: true,
            dragFree: true,
          }}
          plugins={[plugin.current]}
          className="w-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="-ml-8 py-10">
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="pl-8 basis-auto">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative h-[300px] sm:h-[400px] md:h-[500px] group cursor-zoom-in transition-all duration-500 hover:z-10">
                      {/* Card Container: Constrained on mobile, auto width on desktop */}
                      <div className="h-full w-auto inline-block relative rounded-[var(--radius-card)] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-4 border-white transition-all duration-300 hover:scale-110 hover:-rotate-2 rotate-1 bg-white max-w-[80vw] sm:max-w-none">
                         <img
                          src={testimonial.image}
                          alt={testimonial.alt}
                          className="h-full w-auto object-contain"
                        />
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                           <div className="bg-white/20 backdrop-blur-md p-3 rounded-full mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                             <ZoomIn className="w-6 h-6 text-white" />
                           </div>
                           <span className="text-white font-bold text-sm bg-black/50 px-4 py-1.5 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                             Читати
                           </span>
                        </div>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-transparent border-none shadow-none flex flex-col items-center justify-center outline-none z-[9999]">
                    <DialogTitle className="sr-only">Детальний перегляд відгуку</DialogTitle>
                    <div className="relative w-auto h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
                      <img
                        src={testimonial.image}
                        alt={testimonial.alt}
                        className="h-full w-auto object-contain rounded-lg shadow-2xl max-h-[85vh]"
                      />
                      <DialogClose className="absolute top-4 right-4 md:-right-12 md:top-0 rounded-full bg-white/10 hover:bg-white/20 p-3 text-white transition-colors backdrop-blur-sm">
                        <X className="w-6 h-6" />
                        <span className="sr-only">Закрити</span>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="bg-card border-border hover:bg-muted -left-4 w-12 h-12 text-foreground shadow-lg" />
            <CarouselNext className="bg-card border-border hover:bg-muted -right-4 w-12 h-12 text-foreground shadow-lg" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
