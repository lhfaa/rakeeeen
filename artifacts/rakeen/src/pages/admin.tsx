import { useGetMe, useListAllTransactions, useListBrokers, useDeleteBroker, useDeleteTransaction, useCloseTransaction, useCreateBroker } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ShieldAlert, Trash2, CheckCircle, Plus } from "lucide-react";

export default function Admin() {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  const { data: transactions } = useListAllTransactions({ query: { enabled: user?.role === "admin" } });
  const { data: brokers } = useListBrokers({ query: { enabled: user?.role === "admin" } });
  
  const deleteBroker = useDeleteBroker();
  const deleteTx = useDeleteTransaction();
  const closeTx = useCloseTransaction();
  const createBroker = useCreateBroker();
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newBrokerUserId, setNewBrokerUserId] = useState("");

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!user || user.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  const handleDeleteBroker = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف الوسيط؟")) return;
    try {
      await deleteBroker.mutateAsync({ id });
      toast({ title: "تم الحذف بنجاح" });
      queryClient.invalidateQueries({ queryKey: ["/api/brokers"] });
    } catch (e) {
      toast({ title: "خطأ في الحذف", variant: "destructive" });
    }
  };

  const handleAddBroker = async () => {
    if (!newBrokerUserId) return;
    try {
      await createBroker.mutateAsync({ data: { userId: Number(newBrokerUserId) } });
      setNewBrokerUserId("");
      toast({ title: "تمت إضافة الوسيط" });
      queryClient.invalidateQueries({ queryKey: ["/api/brokers"] });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "فشل الإضافة", variant: "destructive" });
    }
  };

  const handleCloseTx = async (id: number) => {
    if (!confirm("إغلاق المعاملة؟")) return;
    try {
      await closeTx.mutateAsync({ id });
      toast({ title: "تم الإغلاق" });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions"] }); // Usually just invalidate all or specific
    } catch (e) {
      toast({ title: "خطأ", variant: "destructive" });
    }
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-destructive" />
        <h1 className="text-3xl font-bold">لوحة الإدارة</h1>
      </div>
      
      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>إدارة الوسطاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-6 p-4 bg-muted/30 rounded-lg border">
              <Input 
                placeholder="رقم المستخدم" 
                value={newBrokerUserId}
                onChange={e => setNewBrokerUserId(e.target.value)}
                type="number"
              />
              <Button onClick={handleAddBroker} disabled={createBroker.isPending || !newBrokerUserId}>
                <Plus className="w-4 h-4 ml-1" /> إضافة وسيط
              </Button>
            </div>
            
            <div className="space-y-3">
              {brokers?.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20">
                  <div>
                    <p className="font-bold">{b.username}</p>
                    <p className="text-xs text-muted-foreground">{b.email} | تقييم: {b.rating}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBroker(b.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {!brokers?.length && <p className="text-center text-muted-foreground py-4">لا يوجد وسطاء</p>}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>كافة المعاملات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {transactions?.map(t => (
                <div key={t.id} className="flex flex-col p-4 border rounded-lg hover:bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-sm line-clamp-1">{t.title}</p>
                    <Badge variant="outline">
                      {t.status === "pending" && "قيد الانتظار"}
                      {t.status === "active" && "نشطة"}
                      {t.status === "paid" && "تم الدفع"}
                      {t.status === "completed" && "مكتملة"}
                      {t.status === "closed" && "مغلقة"}
                      {t.status === "cancelled" && "ملغية"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{t.amount} ريال</span>
                    <span>الوسيط: {t.brokerName || '-'}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    {t.status !== "closed" && t.status !== "cancelled" && (
                      <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleCloseTx(t.id)}>
                        <CheckCircle className="w-3 h-3 ml-1" /> إغلاق
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {!transactions?.length && <p className="text-center text-muted-foreground py-4">لا توجد معاملات</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}