import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/hooks/use-language";

const copy = {
  hinglish: {
    eyebrow: "FAQs",
    title: "Common sawal, simple jawab",
    faq: [
      ["Kya mera WhatsApp number ban ho sakta hai?", "Nahi. Hum WhatsApp Business ka official process use karte hain — number safe rehta hai."],
      ["Setup mein kitna time lagega?", "10 minute. Business info daalo, AI bot banao aur test karo, phir WhatsApp QR scan karke live jao."],
      ["Hindi ya regional language support hai?", "Haan. Hindi, English, Hinglish — sab kuch. Customer jis language mein likhe, agent samjhta hai."],
      ["Free trial mein kya milta hai?", "14 din ke liye full Pro features — bina credit card. Cancel kabhi bhi kar sakte ho."],
      ["Data privacy ka kya?", "Aapka data encrypted hai aur sirf aapke agent ke liye use hota hai. Kabhi share nahi kiya jaata."],
    ],
  },
  en: {
    eyebrow: "FAQs",
    title: "Common questions, simple answers",
    faq: [
      ["Can my WhatsApp number get banned?", "No. We use the official WhatsApp Business linking flow, so your number stays safe."],
      ["How long does setup take?", "About 10 minutes. Add business info, create and test the AI bot, then scan the WhatsApp QR to go live."],
      ["Do you support Hindi or regional language conversations?", "Yes. Hindi, English, and Hinglish are supported. The agent understands the language your customer uses."],
      ["What is included in the free trial?", "You get full Pro features for 14 days with no credit card required. You can cancel anytime."],
      ["What about data privacy?", "Your data is encrypted and used only for your agent. We do not share it."],
    ],
  },
  hi: {
    eyebrow: "सवाल-जवाब",
    title: "आम सवाल, आसान जवाब",
    faq: [
      ["क्या मेरा WhatsApp नंबर ban हो सकता है?", "नहीं. हम official WhatsApp Business linking flow इस्तेमाल करते हैं, इसलिए आपका नंबर safe रहता है."],
      ["Setup में कितना time लगेगा?", "लगभग 10 मिनट. Business info डालें, AI bot बनाकर test करें, फिर WhatsApp QR scan करके live जाएँ."],
      ["क्या Hindi या regional language support है?", "हाँ. Hindi, English और Hinglish support है. Customer जिस language में लिखे, agent समझता है."],
      ["Free trial में क्या मिलता है?", "14 दिन के लिए full Pro features मिलते हैं, बिना credit card. कभी भी cancel कर सकते हैं."],
      ["Data privacy का क्या?", "आपका data encrypted है और सिर्फ आपके agent के लिए use होता है. हम इसे share नहीं करते."],
    ],
  },
};

export default function FAQSection() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <section id="faq" className="py-20 md:py-28 bg-muted/20">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">{t.eyebrow}</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">{t.title}</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {t.faq.map(([q, a], i) => (
            <AccordionItem key={i} value={`q-${i}`} className="rounded-xl border border-border bg-card px-5">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
