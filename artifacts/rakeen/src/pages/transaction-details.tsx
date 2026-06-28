import { useGetTransaction, useListMessages, useSendMessage, usePayTransaction, useGetMe, getGetTransactionQueryKey } from "@workspace/api-client-react";
import { useParams } from "wouter";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Send, AlertCircle } from "lucide-react";

export default function TransactionDetails() {
  const { id } = useParams();
  const txId = Number(id);
  const { data: user } = useGetMe({ query: { retry: false } });
  const { data: tx, isLoading } = useGetTransaction(txId, { query: { enabled: !!txId } });
  const { data: messages } = useListMessages(txId, { query: { enabled: !!txId, refetchInterval: 3000 } });
  
  const sendMessage = useSendMessage();
  const payTransaction = usePayTransaction();
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
      queryClient.invalidateQueries({ queryKey: ["/api/transactions", txId, "messages"] });
    } catch (e) {
      toast({ title: "خطأ في الإرسال", variant: "destructive" });
    }
  };

  const handlePay = async () => {
    if (!confirm("تأكيد دفع المبلغ للمنصة؟")) return;
    try {
      await payTransaction.mutateAsync({ id: txId });
      toast({ title: "تم الدفع بنجاح", description: "المبلغ الآن في حساب المنصة بأمان" });
      queryClient.invalidateQueries({ queryKey: getGetTransactionQueryKey(txId) });
    } catch (e) {
      toast({ title: "خطأ في الدفع", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!tx) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">لم يتم العثور على المعاملة</div>;

  return (
    <div className="container py-8 max-w-5xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            {tx.title}
            <Badge variant="outline" className="text-sm font-normal">#{tx.id}</Badge>
          </h1>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <span>البائع: <strong className="text-foreground">{tx.sellerName || tx.sellerId}</strong></span>
            <span>•</span>
            <span>المشتري: <strong className="text-foreground">{tx.buyerName || tx.buyerId}</strong></span>
            <span>•</span>
            <span>الوسيط: <strong className="text-foreground">{tx.brokerName || "في الانتظار"}</strong></span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-muted px-4 py-2 rounded-lg text-center">
            <span className="block text-xs text-muted-foreground mb-1">المبلغ</span>
            <strong className="text-lg">{tx.amount} ريال</strong>
          </div>
          <div className="bg-muted px-4 py-2 rounded-lg text-center">
            <span className="block text-xs text-muted-foreground mb-1">الحالة</span>
            <Badge variant={tx.status === "active" ? "default" : "outline"} className="px-2">
              {tx.status === "pending" && "قيد الانتظار"}
              {tx.status === "active" && "نشطة"}
              {tx.status === "paid" && "تم الدفع"}
              {tx.status === "completed" && "مكتملة"}
              {tx.status === "closed" && "مغلقة"}
              {tx.status === "cancelled" && "ملغية"}
            </Badge>
          </div>
          
          {user?.id === tx.buyerId && (tx.status === "pending" || tx.status === "active") && (
            <Button onClick={handlePay} disabled={payTransaction.isPending} size="lg" className="h-[52px]">
              دفع وإيداع المبلغ
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden flex flex-col flex-1 shadow-sm">
        <div className="p-4 bg-muted/30 border-b flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="w-5 h-5 text-primary" />
          غرفة المحادثة المشفرة - يراقب الوسيط هذه المحادثة
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-background">
          <div className="text-center text-xs text-muted-foreground bg-muted/50 py-2 rounded-lg w-fit mx-auto px-4 mb-6">
            <AlertCircle className="w-4 h-4 inline-block ml-1" />
            لا تقم بمشاركة أرقام حسابات بنكية أو معلومات حساسة إلا بعد طلب الوسيط.
          </div>
          
          {messages?.map(m => {
            const isMe = m.senderId === user?.id;
            const isSystem = m.messageType === "system";
            
            if (isSystem) {
              return (
                <div key={m.id} className="flex justify-center my-4">
                  <span className="bg-muted/80 text-muted-foreground text-xs px-3 py-1 rounded-full">
                    {m.content}
                  </span>
                </div>
              );
            }
            
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                <span className="text-xs text-muted-foreground mb-1 px-1">
                  {m.senderName} {m.senderRole === "broker" && <Badge variant="secondary" className="text-[10px] px-1 ml-1 scale-75">وسيط</Badge>}
                </span>
                <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${
                  isMe 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : m.senderRole === "broker"
                      ? "bg-secondary text-secondary-foreground rounded-tl-sm border"
                      : "bg-muted text-foreground rounded-tl-sm"
                }`}>
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-card border-t">
          <form 
            className="flex gap-2" 
            onSubmit={e => { e.preventDefault(); handleSend(); }}
          >
            <Input 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="اكتب رسالتك هنا..." 
              className="h-12 bg-background"
              disabled={tx.status === "closed" || tx.status === "cancelled"}
            />
            <Button 
              type="submit" 
              className="h-12 px-8" 
              disabled={sendMessage.isPending || !content.trim() || tx.status === "closed" || tx.status === "cancelled"}
            >
              <Send className="w-5 h-5 rtl:-scale-x-100" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}