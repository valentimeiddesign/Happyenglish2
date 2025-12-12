import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface PrivacyPolicyProps {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Повернутися на головну
        </Button>

        <div className="bg-card rounded-[var(--radius-card)] border border-border p-8 sm:p-12">
          <h1 className="mb-6 text-foreground">Політика конфіденційності</h1>
          
          <div className="space-y-6 text-foreground">
            <section>
              <h3 className="mb-3">1. Загальні положення</h3>
              <p className="mb-3">
                Ця Політика конфіденційності описує, як HappyEnglish (далі — "Ми", "Наш", "Компанія") збирає, 
                використовує та захищає персональні дані користувачів при використанні нашого Telegram-бота 
                та веб-сайту (далі — "Сервіс").
              </p>
              <p>
                Використовуючи наш Сервіс, ви погоджуєтесь із умовами цієї Політики конфіденційності.
              </p>
            </section>

            <section>
              <h3 className="mb-3">2. Які дані ми збираємо</h3>
              <p className="mb-2">Ми можемо збирати наступну інформацію:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Ім'я та контактна інформація (Telegram username, номер телефону за бажанням)</li>
                <li>Інформація про використання Сервісу та прогрес навчання</li>
                <li>Дані про платежі та транзакції</li>
                <li>Технічні дані (IP-адреса, тип пристрою, браузер)</li>
                <li>Переписка з підтримкою та відгуки</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-3">3. Як ми використовуємо ваші дані</h3>
              <p className="mb-2">Зібрана інформація використовується для:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Надання та покращення наших освітніх послуг</li>
                <li>Персоналізації навчального досвіду</li>
                <li>Обробки платежів та управління підпискою</li>
                <li>Комунікації з користувачами та надання підтримки</li>
                <li>Аналізу використання Сервісу та його вдосконалення</li>
                <li>Відправлення важливих повідомлень про оновлення та зміни</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-3">4. Захист персональних даних</h3>
              <p className="mb-3">
                Ми вживаємо технічні та організаційні заходи для захисту ваших персональних даних від 
                несанкціонованого доступу, втрати, знищення або зміни.
              </p>
              <p>
                Всі платіжні операції обробляються через захищені платіжні системи третіх сторін, 
                які відповідають міжнародним стандартам безпеки.
              </p>
            </section>

            <section>
              <h3 className="mb-3">5. Передача даних третім особам</h3>
              <p className="mb-2">Ми можемо передавати ваші дані наступним категоріям третіх осіб:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Платіжні системи для обробки транзакцій</li>
                <li>Постачальники хмарних послуг для зберігання даних</li>
                <li>Аналітичні сервіси для покращення Сервісу</li>
                <li>Telegram для функціонування бота</li>
              </ul>
              <p className="mt-3">
                Ми не продаємо та не передаємо ваші персональні дані третім особам для маркетингових цілей 
                без вашої згоди.
              </p>
            </section>

            <section>
              <h3 className="mb-3">6. Ваші права</h3>
              <p className="mb-2">Ви маєте право:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Отримати доступ до своїх персональних даних</li>
                <li>Виправити неточні або неповні дані</li>
                <li>Видалити свої персональні дані</li>
                <li>Обмежити обробку даних</li>
                <li>Відкликати згоду на обробку даних</li>
                <li>Отримати копію своїх даних</li>
              </ul>
            </section>

            <section>
              <h3 className="mb-3">7. Cookies та аналітика</h3>
              <p>
                Наш веб-сайт може використовувати cookies та подібні технології для покращення користувацького 
                досвіду та аналізу використання Сервісу. Ви можете налаштувати свій браузер для блокування cookies.
              </p>
            </section>

            <section>
              <h3 className="mb-3">8. Діти</h3>
              <p>
                Наш Сервіс призначений для дітей від 6 років під наглядом батьків або опікунів. 
                Батьки/опікуни несуть відповідальність за надання згоди на обробку персональних даних дитини.
              </p>
            </section>

            <section>
              <h3 className="mb-3">9. Зміни в Політиці конфіденційності</h3>
              <p>
                Ми залишаємо за собою право вносити зміни до цієї Політики конфіденційності. 
                Про суттєві зміни ми повідомимо користувачів через Telegram-бот або email.
              </p>
            </section>

            <section>
              <h3 className="mb-3">10. Контактна інформація</h3>
              <p className="mb-2">
                Якщо у вас є запитання щодо цієї Політики конфіденційності або ви хочете скористатися 
                своїми правами, зв'яжіться з нами:
              </p>
              <p className="mb-1">
                <strong>Telegram:</strong>{" "}
                <a 
                  href="https://t.me/+380954970102" 
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  +380954970102
                </a>
              </p>
            </section>

            <div className="pt-6 border-t border-border">
              <p className="text-muted-foreground caption">
                Остання редакція: Листопад 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}