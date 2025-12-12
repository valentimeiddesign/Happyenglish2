import { BookOpen, Star, Monitor, Trophy } from "lucide-react";
import { Card } from "./ui/card";
import imgCanva from "figma:asset/b526d5d3648fbc7bea8cb5ce15a93bdbeaee7551.png";
import imgGenially from "figma:asset/8dce48570a01e444f0c3c1b309197e54f00ef7e2.png";
import imgWordwall from "figma:asset/f7ed3a69f6985c7c2274a4ec7dab8ae30d6d440f.png";
import imgBaamboozle from "figma:asset/34f5dcef6cf8259d4a3fc29018f60ce82fbeb0cf.png";

export function Statistics() {
  const stats = [
    {
      icon: BookOpen,
      number: "240+",
      label: "Інтерактивних уроків",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Star,
      number: "4.9/5",
      label: "Середній рейтинг",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Monitor,
      number: "4",
      label: "Платформи навчання",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Trophy,
      number: "15+",
      label: "Типів ігор",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  const platforms = [
    { name: "Canva", img: imgCanva, color: "border-blue-200 bg-blue-50" },
    { name: "Genially", img: imgGenially, color: "border-pink-200 bg-pink-50" },
    { name: "Wordwall", img: imgWordwall, color: "border-blue-200 bg-blue-50" },
    { name: "Baamboozle", img: imgBaamboozle, color: "border-yellow-200 bg-yellow-50" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="border-none shadow-none bg-gray-50 p-6 flex flex-col items-center text-center hover:bg-gray-100 transition-colors rounded-3xl">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${stat.color}`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
              <div className="text-sm font-medium text-gray-500">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Platforms Section */}
        <div className="text-center">
           <div className="inline-block mb-3 px-4 py-1 bg-gray-100 rounded-full">
            <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Інтеграції</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-10">
            Працюємо з вашими улюбленими <span className="text-primary">платформами</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {platforms.map((platform, index) => (
              <div 
                key={index} 
                className={`group p-8 rounded-3xl border-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg flex flex-col items-center justify-center aspect-square ${platform.color}`}
              >
                <div className="h-20 flex items-center justify-center mb-4 transform transition-transform group-hover:scale-110">
                  <img src={platform.img} alt={platform.name} className="max-h-full max-w-full object-contain" />
                </div>
                <p className="font-bold text-gray-700">{platform.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
