import { useGetMe, useListTransactions, useGetTransactionStats } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CreditCard, Users, Shield, PlusCircle } from "lucide-react";

export default function Dashboard() {
  const { data: user, isLoading: isUserLoading } = useGetMe({ query: { retry: false } });
  const { data: transactions, isLoading } = useListTransactions({ query: { enabled: !!user } });
  const { data: stats } = useGetTransactionStats({ query: { enabled: !!user } });
  const [, setLocation] = useLocation();

  if (isUserLoading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!user) {
    setLocation("/login");
    return null;
  }

  const userTransactions = transactions || [];
  const activeCount = userTransactions.filter(t => t.status === "active").length;
  const completedCount = userTransactions.filter(t => t.status === "completed" || t.status === "closed").length;
  const totalAmount = userTransactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">مرحباً بك يا {user.username} في مساحتك الآمنة</p>
        </div>
        <Button asChild size="lg" className="font-bold gap-2">
          <Link href="/dashboard/new-transaction">
            <PlusCircle className="w-5 h-5" />
            إنشاء معاملة جديدة
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">نشطة حالياً</p>
              <p className="text-3xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-foreground">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">مكتملة</p>
              <p className="text-3xl font-bold">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-foreground">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">إجمالي المبالغ</p>
              <p className="text-3xl font-bold">{totalAmount} <span className="text-base font-normal">ريال</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>معاملاتك</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري تحميل المعاملات...</div>
          ) : userTransactions.length > 0 ? (
            <div className="divide-y">
              {userTransactions.map(t => (
                <Link key={t.id} href={`/dashboard/transaction/${t.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 hover:bg-muted/30 transition-colors cursor-pointer gap-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{t.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{t.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>رقم: #{t.id}</span>
                        <span>•</span>
                        <span>{new Date(t.createdAt).toLocaleDateString('ar-SA')}</span>
                        {t.brokerName && (
                          <>
                            <span>•</span>
                            <span>الوسيط: {t.brokerName}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                      <span className="font-bold text-lg">{t.amount} ريال</span>
                      <Badge variant={t.status === "active" ? "default" : t.status === "completed" ? "secondary" : "outline"} className="px-3">
                        {t.status === "pending" && "قيد الانتظار"}
                        {t.status === "active" && "نشطة"}
                        {t.status === "paid" && "تم الدفع"}
                        {t.status === "completed" && "مكتملة"}
                        {t.status === "closed" && "مغلقة"}
                        {t.status === "cancelled" && "ملغية"}
                        {!["pending","active","paid","completed","closed","cancelled"].includes(t.status) && t.status}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <Shield className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">لا توجد معاملات بعد</h3>
              <p className="text-muted-foreground mb-6">ابدأ بإنشاء أول معاملة آمنة لك على المنصة.</p>
              <Button asChild>
                <Link href="/dashboard/new-transaction">إنشاء معاملة الآن</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}