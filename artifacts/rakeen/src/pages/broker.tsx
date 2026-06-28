import { useGetMe, useListAllTransactions, useCloseTransaction, useDeleteTransaction } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle } from "lucide-react";

export default function Broker() {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  const { data: transactions } = useListAllTransactions({ query: { enabled: user?.role === "broker" } });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const closeTx = useCloseTransaction();
  const deleteTx = useDeleteTransaction();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!user || user.role !== "broker") {
    setLocation("/dashboard");
    return null;
  }

  const assignedTx = transactions?.filter(t => t.brokerId === user.id) || [];

  const handleClose = async (id: number) => {
    if (!confirm("تأكيد إغلاق المعاملة بنجاح؟")) return;
    try {
      await closeTx.mutateAsync({ id });
      toast({ title: "تم إغلاق المعاملة" });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    } catch (e) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("تأكيد إلغاء المعاملة؟")) return;
    try {
      await deleteTx.mutateAsync({ id });
      toast({ title: "تم إلغاء المعاملة" });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    } catch (e) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">بوابة الوسيط</h1>
      <p className="text-muted-foreground mb-8">إدارة المعاملات الموكلة إليك</p>

      <div className="space-y-4">
        {assignedTx.map(t => (
          <Card key={t.id}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/dashboard/transaction/${t.id}`} className="text-xl font-bold hover:text-primary transition-colors">
                      {t.title}
                    </Link>
                    <Badge variant={t.status === "active" ? "default" : "outline"}>{t.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.description}</p>
                  <div className="mt-4 text-sm font-bold bg-muted/50 inline-block px-3 py-1 rounded-md">
                    المبلغ: {t.amount} ريال
                  </div>
                </div>
                
                <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/transaction/${t.id}`}>الدخول للمحادثة</Link>
                  </Button>
                  {t.status !== "closed" && t.status !== "cancelled" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" className="flex-1" onClick={() => handleClose(t.id)}>
                        <CheckCircle className="w-4 h-4 ml-1" /> إنهاء
                      </Button>
                      <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleCancel(t.id)}>
                        <XCircle className="w-4 h-4 ml-1" /> إلغاء
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {assignedTx.length === 0 && (
          <div className="text-center py-16 bg-muted/20 border rounded-xl">
            <p className="text-muted-foreground">لا توجد معاملات موكلة إليك حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}