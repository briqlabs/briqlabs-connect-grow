import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = [
  { q: "Kya mera WhatsApp number ban ho sakta hai?", a: "Nahi. Hum WhatsApp Business ka official process use karte hain — number safe rehta hai." },
  { q: "Setup mein kitna time lagega?", a: "10 minute. QR scan karo, business info daalo, AI bot activate karo — done." },
  { q: "Hindi ya regional language support hai?", a: "Haan. Hindi, English, Hinglish — sab kuch. Customer jis language mein likhe, agent samjhta hai." },
  { q: "Free trial mein kya milta hai?", a: "14 din ke liye full Pro features — bina credit card. Cancel kabhi bhi kar sakte ho." },
  { q: "GST invoice milti hai?", a: "Haan. Har payment ka proper GST invoice email pe milta hai." },
  { q: "Data privacy ka kya?", a: "Aapka data encrypted hai aur sirf aapke agent ke liye use hota hai. Kabhi share nahi kiya jaata." },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-muted/20">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">FAQs</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">Common sawal, simple jawab</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-3">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`q-${i}`} className="rounded-xl border border-border bg-card px-5">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
