import { MessageCircle, Mail, Send, Instagram, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { useSiteContent } from "../lib/siteContent";

interface FooterProps {
  onNavigate?: (page: 'privacy' | 'terms') => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const contacts = useSiteContent("contacts");
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 border-b border-gray-800 pb-16">
          
          {/* Brand / About (5 cols) */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-xl">🇬🇧</span>
              <span className="text-2xl font-bold">Happy<span className="text-primary">English</span></span>
            </div>
            <p className="text-gray-400 leading-relaxed mb-8 max-w-sm">
              {contacts.about}
            </p>
            <div className="flex gap-4">
              {contacts.instagram && <SocialLink href={contacts.instagram} icon={<Instagram className="w-5 h-5" />} label="Instagram" />}
              {contacts.telegram && <SocialLink href={contacts.telegram} icon={<Send className="w-5 h-5" />} label="Telegram" />}
              {contacts.email && <SocialLink href={`mailto:${contacts.email}`} icon={<Mail className="w-5 h-5" />} label="Email" />}
            </div>
          </div>

          {/* Links (3 cols) */}
          <div className="md:col-span-3">
            <h3 className="font-bold text-lg mb-6">Навігація</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Головна</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Каталог</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Відгуки</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Ціни</a></li>
              <li>
                <button 
                  onClick={() => onNavigate?.('privacy')} 
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Політика конфіденційності
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate?.('terms')} 
                  className="text-gray-400 hover:text-white transition-colors text-left"
                >
                  Публічна оферта
                </button>
              </li>
            </ul>
          </div>

          {/* CTA (4 cols) */}
          <div className="md:col-span-4">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="font-bold text-lg mb-2">Готові почати?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Отримайте доступ до 240+ уроків прямо зараз через наш зручний Telegram бот.
              </p>
              <Button className="w-full bg-primary text-white hover:bg-primary/90 font-bold h-12 rounded-xl" asChild>
                <a href={contacts.bot_link} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Запустити Бот
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>{contacts.copyright}</p>
          <div className="flex items-center gap-1">
            <span>Зроблено з</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>для вчителів</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300"
      aria-label={label}
    >
      {icon}
    </a>
  );
}