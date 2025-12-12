import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Sparkles, BookOpen, Star, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import heroImage from "figma:asset/266ffbc1717072c96976d9c00af435b6a6786808.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary pt-20 pb-24 lg:pt-32 lg:pb-40">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 hidden lg:block">
        <svg width="404" height="384" fill="none" viewBox="0 0 404 384" aria-hidden="true" className="opacity-10">
          <defs>
            <pattern id="de316486-4a29-4312-bdfc-fbce2132a2c1" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="4" height="4" fill="currentColor" className="text-white" />
            </pattern>
          </defs>
          <rect width="404" height="384" fill="url(#de316486-4a29-4312-bdfc-fbce2132a2c1)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column: Content */}
          <div className="flex flex-col items-start text-left z-10">
            <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-secondary-foreground text-sm font-medium tracking-wide">Для вчителів англійської</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Зробіть ваші уроки <span className="text-primary bg-white px-2 rounded-[var(--radius-button)] box-decoration-clone">незабутніми</span> для дітей!
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-lg leading-relaxed">
              Готові інтерактивні презентації, ігри та завдання в Telegram. Економте час на підготовку та дивуйте своїх учнів щодня! 🚀
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">

              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-2 border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg backdrop-blur-sm"
              >
                Детальніше
              </Button>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-white/80 text-sm font-medium">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-secondary bg-white/20 backdrop-blur flex items-center justify-center overflow-hidden">
                     <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i * 123}`} alt="Avatar" className="w-full h-full" />
                  </div>
                ))}
              </div>
              <p>Вже 100+ вчителів з нами</p>
            </div>
          </div>

          {/* Right Column: Visuals */}
          <div className="relative lg:h-auto flex justify-center lg:justify-end">
            {/* Main Image Card */}
            <div className="relative w-full max-w-md lg:max-w-full z-10">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white/20 rotate-3 transition-transform hover:rotate-0 duration-500 ease-out">
                <ImageWithFallback
                  src={heroImage}
                  alt="Дитина навчається англійської"
                  className="w-full h-auto object-cover bg-white"
                />
              </div>
              
              {/* Floating Card 1 */}
              <div className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl transform -rotate-6 animate-bounce duration-[3000ms]">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <Star className="w-6 h-6 text-red-500 fill-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Рейтинг</p>
                    <p className="text-lg font-bold text-gray-900">5.0/5</p>
                  </div>
                </div>
              </div>

               {/* Floating Card 2 */}
               <div className="absolute -bottom-8 -right-8 bg-white p-4 rounded-2xl shadow-xl transform rotate-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <BookOpen className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Матеріали</p>
                    <p className="text-lg font-bold text-gray-900">240+ уроків</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/10 blur-3xl rounded-full pointer-events-none -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
