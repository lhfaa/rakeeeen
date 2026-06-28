import { useGetTransaction, useListMessages, useSendMessage, usePayTransaction, useDeleteTransaction, useGetMe, getGetTransactionQueryKey, getListMessagesQueryKey } from "@workspace/api-client-react";
import { useParams, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Send, AlertCircle, Trash2, CreditCard, ArrowRight } from "lucide-react";
import { Link } from "wouter";

function statusLabel(status: string) {
  if (status === "pending") return "قيد الانتظار";
  if (status === "active") return "نشطة";
  if (status === "paid") return "تم الدفع";
  if (status === "completed") return "مكتملة";
  if (status === "closed") return "مغلقة";
  if (status === "cancelled") return "ملغية";
  return status;
}

export default function TransactionDetails() {
  const { id } = useParams();
  const txId = Number(id);
  const [, setLocation] = useLocation();
  const { data: user } = useGetMe({ query: { retry: false } });
  const { data: tx, isLoading } = useGetTransaction(txId, { query: { enabled: !!txId } });
  const { data: messages } = useListMessages(txId, {
    query: { enabled: !!txId, queryKey: getListMessagesQueryKey(txId), refetchInterval: 3000 },
  });

  const sendMessage = useSendMessage();
  const payTransaction = usePayTransaction();
  const deleteTransaction = useDeleteTransaction();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!content.trim()) return;
    try {
      await sendMessage.mutateAsync({ id: txId, data: { content } });
      setContent("");
      queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(txId) });
    } catch {
      toast({ title: "خطأ في الإرسال", variant: "destructive" });
    }
  };

  const handlePay = async () => {
    if (!confirm("تأكيد دفع المبلغ؟ سيتم حجزه في منصة ركين حتى اكتمال الصفقة.")) return;
    try {
      await payTransaction.mutateAsync({ id: txId });
      toast({ title: "تم الدفع بنجاح", description: "المبلغ الآن محجوز بأمان في منصة ركين" });
      queryClient.invalidateQueries({ queryKey: getGetTransactionQueryKey(txId) });
    } catch {
      toast({ title: "خطأ في الدفع", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذه المعاملة؟ لا يمكن التراجع.")) return;
    try {
      await deleteTransaction.mutateAsync({ id: txId });
      toast({ title: "تم حذف المعاملة" });
      setLocation("/dashboard");
    } catch {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!tx) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">لم يتم العثور على المعاملة</div>;

  const isBuyer = user?.id === tx.buyerId;
  const canPay = isBuyer && (tx.status === "pending" || tx.status === "active");
  const canDelete = isBuyer || user?.role === "admin" || user?.role === "broker";
  const isClosed = tx.status === "closed" || tx.status === "cancelled";

  return (
    <div className="w-full container py-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              <Link href="/dashboard">
                <ArrowRight className="w-4 h-4" />
                لوحة التحكم
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 flex-wrap">
            {tx.title}
            <Badge variant="outline" className="text-sm font-normal">#{tx.id}</Badge>
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>المشتري: <strong className="text-foreground">{tx.buyerName || tx.buyerId}</strong></span>
            <span>البائع: <strong className="text-foreground">{tx.sellerName || tx.sellerId}</strong></span>
            <span>الوسيط: <strong className="text-foreground">{tx.brokerName || "في الانتظار"}</strong></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-muted px-4 py-2 rounded-lg text-center">
            <span className="block text-xs text-muted-foreground mb-1">المبلغ</span>
            <strong className="text-lg">{tx.amount} ريال</strong>
          </div>
          <div className="bg-muted px-4 py-2 rounded-lg text-center">
            <span className="block text-xs text-muted-foreground mb-1">الحالة</span>
            <Badge
              variant={tx.status === "active" ? "default" : tx.status === "paid" ? "secondary" : "outline"}
              className="px-2"
            >
              {statusLabel(tx.status)}
            </Badge>
          </div>

          {canPay && (
            <Button
              onClick={handlePay}
              disabled={payTransaction.isPending}
              size="lg"
              className="h-[52px] gap-2 font-bold"
            >
              <CreditCard className="w-5 h-5" />
              {payTransaction.isPending ? "جاري الدفع..." : "دفع المبلغ"}
            </Button>
          )}

          {canDelete && (
            <Button
              onClick={handleDelete}
              disabled={deleteTransaction.isPending}
              variant="destructive"
              size="lg"
              className="h-[52px] gap-2"
            >
              <Trash2 className="w-5 h-5" />
              حذف
            </Button>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm" style={{ height: "calc(100vh - 320px)", minHeight: "400px" }}>
        <div className="p-4 bg-muted/30 border-b flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="w-5 h-5 text-primary" />
          غرفة المحادثة المشفرة — يراقب الوسيط هذه المحادثة
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-background">
          <div className="flex justify-center my-2">
            <span className="bg-muted/70 text-muted-foreground text-xs px-4 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              لا تشارك أرقام حسابات بنكية إلا بطلب من الوسيط
            </span>
          </div>

          {messages?.map((m) => {
            const isMe = m.senderId === user?.id;
            const isSystem = m.messageType === "system";
            const isPayment = m.messageType === "payment";

            if (isSystem) {
              return (
                <div key={m.id} className="flex justify-center my-2">
                  <span className="bg-muted/80 text-muted-foreground text-xs px-3 py-1.5 rounded-full">
                    {m.content}
                  </span>
                </div>
              );
            }

            if (isPayment) {
              return (
                <div key={m.id} className="flex justify-center my-3">
                  <div className="bg-primary/10 border border-primary/30 text-foreground text-sm px-5 py-3 rounded-xl flex items-center gap-2 font-medium">
                    <CreditCard className="w-4 h-4 text-primary" />
                    {m.content}
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-xs text-muted-foreground mb-1 px-1 flex items-center gap-1">
                  {m.senderName}
                  {m.senderRole === "broker" && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">وسيط</Badge>
                  )}
                  {m.senderRole === "admin" && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">مسؤول</Badge>
                  )}
                </span>
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : m.senderRole === "broker"
                      ? "bg-secondary text-secondary-foreground rounded-tl-sm border"
                      : "bg-muted text-foreground rounded-tl-sm"
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {new Date(m.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-card border-t">
          {isClosed ? (
            <p className="text-center text-sm text-muted-foreground py-2">هذه المعاملة مغلقة — لا يمكن إرسال رسائل جديدة</p>
          ) : (
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className="h-12 bg-background"
              />
              <Button
                type="submit"
                className="h-12 px-8"
                disabled={sendMessage.isPending || !content.trim()}
              >
                <Send className="w-5 h-5 rtl:-scale-x-100" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
