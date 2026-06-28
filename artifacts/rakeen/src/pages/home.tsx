import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShieldCheck, CheckCircle, Clock, Search, Zap, Handshake, Bell, BookOpen, Headset, Lock, Star, ChevronDown, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "framer-motion";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background py-24 md:py-32">
        <div className="container relative z-10 flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-3xl">
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
              ركين <br />
              <span className="text-primary text-5xl md:text-7xl">منصة الوساطة الإلكترونية الموثوقة</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-muted-foreground mx-auto mb-10 leading-relaxed">
              الخيار الأول في المملكة لضمان حقوقك وتعاملاتك. وسطاء معتمدون، أمان تام، وتنفيذ فوري للعمليات. لا تدع مجالاً للاحتيال بعد اليوم.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-14 px-8 text-lg font-bold w-full sm:w-auto shadow-lg hover:shadow-xl transition-all">
                <Link href="/register">ابدأ الآن</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg font-bold w-full sm:w-auto bg-background/50 backdrop-blur">
                <a href="#features">تعرف على المنصة</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary text-primary-foreground border-y border-primary-border/20">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            {[
              { value: "50,000+", label: "مستخدم" },
              { value: "250,000+", label: "معاملة" },
              { value: "99.9%", label: "نجاح" },
              { value: "1000+", label: "وسيط" },
              { value: "ملايين", label: "الريالات" },
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-primary-foreground/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا ركين؟</h2>
            <p className="text-muted-foreground text-lg">بنينا المنصة لتكون الدرع الحصين لكل من يبيع ويشتري عبر الإنترنت.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { icon: ShieldCheck, title: "حماية الأموال", desc: "أموالك في حسابات آمنة" },
              { icon: Handshake, title: "وسطاء معتمدون", desc: "نخبة من الوسطاء الموثوقين" },
              { icon: Search, title: "متابعة لحظية", desc: "تتبع حالة معاملتك دائماً" },
              { icon: BookOpen, title: "نظام نزاعات عادل", desc: "قضاة متخصصون للتحكيم" },
              { icon: Zap, title: "سرعة التنفيذ", desc: "إجراءات تتم في دقائق" },
              { icon: CheckCircle2, title: "واجهة سهلة", desc: "تجربة مستخدم بسيطة" },
              { icon: Bell, title: "إشعارات فورية", desc: "تنبيهات على مدار الساعة" },
              { icon: Clock, title: "سجل كامل", desc: "حفظ تاريخ جميع العمليات" },
              { icon: Headset, title: "دعم فني", desc: "متواجدون دائماً لخدمتك" },
              { icon: Lock, title: "خصوصية وأمان", desc: "بياناتك مشفرة ومحمية" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center text-center p-6 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">كيف تعمل المنصة؟</h2>
          <div className="max-w-4xl mx-auto">
            {[
              { step: 1, title: "إنشاء معاملة", desc: "يقوم المشتري أو البائع بفتح معاملة جديدة وإدخال التفاصيل." },
              { step: 2, title: "اختيار وسيط", desc: "يتم اختيار أحد الوسطاء المعتمدين للإشراف على المعاملة." },
              { step: 3, title: "إيداع القيمة", desc: "يقوم المشتري بتحويل المبلغ لحساب منصة ركين البنكي الآمن." },
              { step: 4, title: "تنفيذ الاتفاق", desc: "يسلم البائع الخدمة أو السلعة ويقوم المشتري بالفحص والقبول." },
              { step: 5, title: "تحويل المبلغ", desc: "بمجرد القبول، تقوم المنصة بتحويل المبلغ لحساب البائع." },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-6 mb-8 relative"
              >
                {i !== 4 && <div className="absolute right-[23px] top-12 bottom-[-32px] w-0.5 bg-border"></div>}
                <div className="w-12 h-12 shrink-0 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl relative z-10 shadow-md">
                  {item.step}
                </div>
                <div className="pt-2 pb-6">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Reviews Section */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">لماذا يثق المستخدمون بركين؟</h2>
            <p className="text-muted-foreground text-lg">بنينا ثقة مستخدمينا عبر سنوات من الشفافية وحفظ الحقوق بدون أي تنازلات.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "خالد", text: "اشتريت حساب فورت نايت وكان الوسيط جداً محترم، الفلوس كانت في أمان لين استلمت الحساب كامل." },
              { name: "سلطان محمد", text: "بعت يوزر انستجرام ثلاثي بمبلغ كبير، وكنت خايف، لكن منصة ركين ضمنت لي حقي، أنصح فيهم بشدة." },
              { name: "ياسر الحربي", text: "أفضل منصة وساطة بالسعودية، الدعم الفني متجاوب وسرعة في تحويل المبالغ بعد اكتمال البيعة." },
            ].map((review, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="p-6 bg-card border rounded-2xl">
                <div className="flex text-yellow-400 mb-4">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-foreground font-medium mb-6 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary font-bold flex items-center justify-center rounded-full">
                    {review.name[0]}
                  </div>
                  <span className="font-bold text-sm">{review.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 bg-muted/30">
        <div className="container max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">الأسئلة الشائعة</h2>
          <Accordion type="single" collapsible className="w-full bg-card rounded-2xl border p-2">
            {[
              { q: "كيف تعمل الوساطة في ركين؟", a: "يقوم المشتري بإيداع المبلغ لدينا، ثم يسلم البائع السلعة/الخدمة، وبعد التأكد نحول المبلغ للبائع." },
              { q: "هل الأموال محفوظة بأمان؟", a: "نعم، جميع الأموال محفوظة في حسابات بنكية موثوقة حتى اكتمال المعاملة بنجاح." },
              { q: "كيف يتم اختيار الوسيط؟", a: "يتم اختيار الوسيط من قبل المنشئ من قائمة الوسطاء المعتمدين والموثقين لدى المنصة." },
              { q: "ماذا يحدث عند وجود نزاع؟", a: "يتدخل فريق التحكيم الخاص بركين لمراجعة الأدلة من الطرفين واتخاذ قرار منصف بناءً عليها." },
              { q: "كم تستغرق المعاملة؟", a: "حسب سرعة تسليم البائع وفحص المشتري، ولكن التحويلات المالية تتم بشكل فوري فور اكتمال الشروط." },
              { q: "هل يمكن إلغاء المعاملة؟", a: "نعم، إذا اتفق الطرفان على الإلغاء قبل تسليم الخدمة، يتم إرجاع المبلغ للمشتري." },
              { q: "هل المنصة آمنة؟", a: "نستخدم أحدث تقنيات التشفير وحماية البيانات لضمان سرية وأمان كافة المعلومات." },
              { q: "هل يمكن التواصل مع الدعم؟", a: "نعم، فريق الدعم الفني متواجد على مدار الساعة عبر التذاكر أو المحادثة المباشرة." },
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b last:border-0">
                <AccordionTrigger className="font-bold text-base hover:text-primary">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary text-primary-foreground text-center relative overflow-hidden">
        <div className="container relative z-10 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">ابدأ أول معاملة بأمان مع ركين</h2>
          <p className="text-xl mb-10 text-primary-foreground/80">انضم إلى آلاف المستخدمين الذين يثقون في ركين لإتمام صفقاتهم براحة بال تامة.</p>
          <Button asChild size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold">
            <Link href="/register">انضم الآن</Link>
          </Button>
        </div>
        <div className="absolute inset-0 bg-black/10"></div>
      </section>
    </div>
  );
}