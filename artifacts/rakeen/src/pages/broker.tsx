import { useGetMe, useListAllTransactions, useCloseTransaction, useDeleteTransaction, useBrokerTransfer } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Banknote, Send, Infinity } from "lucide-react";
import { useState } from "react";

function statusLabel(s: string) {
  if (s === "pending") return "قيد الانتظار";
  if (s === "active") return "نشطة";
  if (s === "paid") return "تم الدفع";
  if (s === "completed") return "مكتملة";
  if (s === "closed") return "مغلقة";
  if (s === "cancelled") return "ملغية";
  return s;
}

export default function Broker() {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  const { data: transactions } = useListAllTransactions({ query: { enabled: user?.role === "broker" } });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const closeTx = useCloseTransaction();
  const deleteTx = useDeleteTransaction();
  const brokerTransfer = useBrokerTransfer();

  const [transferEmail, setTransferEmail] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [lastTransfer, setLastTransfer] = useState<{ name: string; amount: number } | null>(null);

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
    } catch {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("تأكيد إلغاء المعاملة؟")) return;
    try {
      await deleteTx.mutateAsync({ id });
      toast({ title: "تم إلغاء المعاملة" });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    } catch {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  const handleTransfer = async () => {
    const amt = parseFloat(transferAmount);
    if (!transferEmail.trim()) {
      toast({ title: "أدخل البريد الإلكتروني", variant: "destructive" });
      return;
    }
    if (!amt || amt <= 0) {
      toast({ title: "أدخل مبلغاً صحيحاً", variant: "destructive" });
      return;
    }
    try {
      const result = await brokerTransfer.mutateAsync({ data: { email: transferEmail.trim(), amount: amt } });
      setLastTransfer({ name: result.recipientName, amount: amt });
      setTransferEmail("");
      setTransferAmount("");
      toast({ title: "تم التحويل بنجاح", description: `تم إيداع ${amt} ريال في محفظة ${result.recipientName}` });
    } catch (e: any) {
      toast({ title: "خطأ في التحويل", description: e.message || "حدث خطأ", variant: "destructive" });
    }
  };

  return (
    <div className="container py-8 max-w-4xl space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-1">بوابة الوسيط</h1>
        <p className="text-muted-foreground">مرحباً {user.username} — إدارة المعاملات والتحويلات</p>
      </div>

      {/* ─── Transfer Panel ─── */}
      <div className="bg-card border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Banknote className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">تحويل رصيد</h2>
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              رصيدك:
              <span className="font-bold text-foreground flex items-center gap-0.5">
                <Infinity className="w-4 h-4" /> لا محدود
              </span>
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-[1fr_160px_120px] gap-3 items-end">
          <div>
            <label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني للمستلم</label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={transferEmail}
              onChange={e => setTransferEmail(e.target.value)}
              className="h-11"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">المبلغ (ريال)</label>
            <Input
              type="number"
              placeholder="0"
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
              className="h-11"
              min={1}
            />
          </div>
          <Button
            onClick={handleTransfer}
            disabled={brokerTransfer.isPending}
            className="h-11 gap-2 font-bold"
          >
            <Send className="w-4 h-4" />
            {brokerTransfer.isPending ? "جاري..." : "إرسال"}
          </Button>
        </div>

        {lastTransfer && (
          <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />
            تم تحويل <strong className="mx-1">{lastTransfer.amount} ريال</strong> إلى محفظة
            <strong className="mx-1">{lastTransfer.name}</strong> بنجاح
          </div>
        )}
      </div>

      {/* ─── Transactions ─── */}
      <div>
        <h2 className="text-xl font-bold mb-4">المعاملات الموكلة إليك ({assignedTx.length})</h2>
        <div className="space-y-4">
          {assignedTx.map(t => (
            <Card key={t.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <Link href={`/dashboard/transaction/${t.id}`} className="text-xl font-bold hover:text-primary transition-colors">
                        {t.title}
                      </Link>
                      <Badge variant={t.status === "active" ? "default" : t.status === "paid" ? "secondary" : "outline"}>
                        {statusLabel(t.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{t.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span>المشتري: <strong className="text-foreground">{t.buyerName}</strong></span>
                      <span>البائع: <strong className="text-foreground">{t.sellerName}</strong></span>
                      <span className="bg-muted px-2 py-0.5 rounded font-bold text-foreground">{t.amount} ريال</span>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/transaction/${t.id}`}>المحادثة</Link>
                    </Button>
                    {t.status !== "closed" && t.status !== "cancelled" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => handleClose(t.id)}>
                          <CheckCircle className="w-3.5 h-3.5 ml-1" /> إنهاء
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleCancel(t.id)}>
                          <XCircle className="w-3.5 h-3.5 ml-1" /> إلغاء
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
    </div>
  );
}
