import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ShieldCheck, CheckCircle, Clock, Search, Zap, Handshake,
  Bell, BookOpen, Headset, Lock, Star, CheckCircle2, ArrowLeft
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function Home() {
  return (
    <div className="flex flex-col w-full">

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-28 md:py-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold text-sm px-4 py-2 rounded-full mb-6 border border-primary/20">
            <ShieldCheck className="w-4 h-4" />
            منصة الوساطة الإلكترونية الأولى في المملكة
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            تعامل بثقة مع{" "}
            <span className="text-primary">ركين</span>
          </motion.h1>

          <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
            الخيار الأول في المملكة لضمان حقوقك وتعاملاتك. وسطاء معتمدون، أمان تام، وتنفيذ فوري.
          </motion.p>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="h-14 px-10 text-lg font-bold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
              <Link href="/register">ابدأ الآن مجاناً</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg font-bold w-full sm:w-auto">
              <a href="#how">كيف تعمل؟</a>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
            className="flex flex-wrap items-center justify-center gap-6 mt-14 text-muted-foreground text-sm">
            {["تشفير بنكي SSL", "وسطاء موثقون رسمياً", "حماية كاملة للأموال"].map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                {b}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-14 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {[
              { value: "50,000+", label: "مستخدم" },
              { value: "250,000+", label: "معاملة" },
              { value: "99.9%", label: "نجاح" },
              { value: "1000+", label: "وسيط" },
              { value: "ملايين", label: "الريالات" },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}>
                <div className="text-3xl md:text-4xl font-extrabold mb-1">{stat.value}</div>
                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-28 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">لماذا ركين؟</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              بنينا المنصة لتكون الدرع الحصين لكل من يبيع أو يشتري عبر الإنترنت.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {[
              { icon: ShieldCheck,  title: "حماية الأموال",    desc: "أموالك في حسابات آمنة" },
              { icon: Handshake,    title: "وسطاء معتمدون",   desc: "نخبة من الوسطاء الموثوقين" },
              { icon: Search,       title: "متابعة لحظية",    desc: "تتبع حالة معاملتك دائماً" },
              { icon: BookOpen,     title: "نظام نزاعات عادل",desc: "قضاة متخصصون للتحكيم" },
              { icon: Zap,          title: "سرعة التنفيذ",    desc: "إجراءات تتم في دقائق" },
              { icon: CheckCircle2, title: "واجهة سهلة",      desc: "تجربة مستخدم بسيطة" },
              { icon: Bell,         title: "إشعارات فورية",   desc: "تنبيهات على مدار الساعة" },
              { icon: Clock,        title: "سجل كامل",        desc: "حفظ تاريخ جميع العمليات" },
              { icon: Headset,      title: "دعم فني",         desc: "متواجدون دائماً لخدمتك" },
              { icon: Lock,         title: "خصوصية وأمان",    desc: "بياناتك مشفرة ومحمية" },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="flex flex-col items-center text-center p-5 bg-card border rounded-2xl hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="p-3 bg-primary/10 rounded-xl mb-3">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-sm md:text-base mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how" className="py-28 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-16">كيف تعمل المنصة؟</h2>
          <div className="flex flex-col gap-0">
            {[
              { step: 1, title: "إنشاء معاملة",   desc: "يقوم المشتري أو البائع بفتح معاملة جديدة وإدخال التفاصيل." },
              { step: 2, title: "اختيار وسيط",    desc: "يتم اختيار أحد الوسطاء المعتمدين للإشراف على المعاملة." },
              { step: 3, title: "إيداع القيمة",   desc: "يقوم المشتري بتحويل المبلغ لحساب منصة ركين البنكي الآمن." },
              { step: 4, title: "تنفيذ الاتفاق",  desc: "يسلم البائع الخدمة أو السلعة ويقوم المشتري بالفحص والقبول." },
              { step: 5, title: "تحويل المبلغ",   desc: "بمجرد القبول، تقوم المنصة بتحويل المبلغ فوراً لحساب البائع." },
            ].map((item, i, arr) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="flex gap-6 relative">
                {/* connector line */}
                {i < arr.length - 1 && (
                  <div className="absolute right-[23px] top-12 bottom-0 w-0.5 bg-border z-0" />
                )}
                <div className="w-12 h-12 shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-extrabold text-lg z-10 shadow">
                  {item.step}
                </div>
                <div className="pb-10">
                  <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Reviews ─── */}
      <section className="py-28 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">ماذا يقول مستخدمونا؟</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              بنينا ثقة مستخدمينا عبر سنوات من الشفافية وحفظ الحقوق.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "خالد",          text: "اشتريت حساب فورت نايت وكان الوسيط محترم جداً، الفلوس كانت في أمان لين استلمت الحساب كامل." },
              { name: "سلطان محمد",    text: "بعت يوزر انستجرام ثلاثي بمبلغ كبير وكنت خايف، لكن ركين ضمنت لي حقي بالكامل. أنصح فيهم بشدة." },
              { name: "ياسر الحربي",   text: "أفضل منصة وساطة بالسعودية، الدعم الفني متجاوب وسرعة في التحويل بعد اكتمال البيعة." },
            ].map((r, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                className="p-6 bg-card border rounded-2xl flex flex-col gap-4">
                <div className="flex text-yellow-400 gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-foreground leading-relaxed flex-1">"{r.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t">
                  <div className="w-9 h-9 bg-primary/10 text-primary font-bold flex items-center justify-center rounded-full text-sm shrink-0">
                    {r.name[0]}
                  </div>
                  <span className="font-bold text-sm">{r.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-28 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12">الأسئلة الشائعة</h2>
          <Accordion type="single" collapsible className="w-full bg-card rounded-2xl border overflow-hidden divide-y">
            {[
              { q: "كيف تعمل الوساطة في ركين؟",   a: "يقوم المشتري بإيداع المبلغ لدينا، ثم يسلم البائع السلعة أو الخدمة، وبعد التأكد نحول المبلغ للبائع." },
              { q: "هل الأموال محفوظة بأمان؟",     a: "نعم، جميع الأموال محفوظة في حسابات بنكية موثوقة حتى اكتمال المعاملة بنجاح." },
              { q: "كيف يتم اختيار الوسيط؟",       a: "يتم اختيار الوسيط من قائمة الوسطاء المعتمدين والموثقين لدى المنصة." },
              { q: "ماذا يحدث عند وجود نزاع؟",     a: "يتدخل فريق التحكيم في ركين لمراجعة الأدلة من الطرفين واتخاذ قرار منصف." },
              { q: "كم تستغرق المعاملة؟",           a: "حسب سرعة تسليم البائع وفحص المشتري، لكن التحويلات المالية تتم فورياً بعد اكتمال الشروط." },
              { q: "هل يمكن إلغاء المعاملة؟",      a: "نعم، إذا اتفق الطرفان قبل تسليم الخدمة يتم إرجاع المبلغ للمشتري." },
              { q: "هل يمكن التواصل مع الدعم؟",    a: "فريق الدعم متواجد على مدار الساعة عبر التذاكر أو المحادثة المباشرة." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-0">
                <AccordionTrigger className="font-bold text-base hover:text-primary px-6 py-4">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed px-6 pb-4">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-28 bg-primary text-primary-foreground text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold mb-6">
            ابدأ أول معاملة بأمان مع ركين
          </motion.h2>
          <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            className="text-xl mb-10 text-primary-foreground/80 max-w-xl mx-auto">
            انضم إلى آلاف المستخدمين الذين يثقون في ركين لإتمام صفقاتهم براحة بال تامة.
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}>
            <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold">
              <Link href="/register">
                انضم الآن مجاناً
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
