import { useGetWallet, useWithdrawWallet, useGetMe, getGetWalletQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Wallet, ArrowDownToLine, Banknote, CheckCircle2 } from "lucide-react";

export default function WalletPage() {
  const { data: user } = useGetMe({ query: { retry: false } });
  const { data: wallet, isLoading } = useGetWallet({ query: { enabled: !!user } });
  const withdraw = useWithdrawWallet();
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation("/login");
    return null;
  }

  const balance = wallet?.balance ?? 0;

  const handleWithdraw = async () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      toast({ title: "أدخل مبلغاً صحيحاً", variant: "destructive" });
      return;
    }
    if (val > balance) {
      toast({ title: "الرصيد غير كافٍ", variant: "destructive" });
      return;
    }
    try {
      await withdraw.mutateAsync({ data: { amount: val } });
      queryClient.invalidateQueries({ queryKey: getGetWalletQueryKey() });
      setAmount("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      toast({ title: "تم السحب بنجاح", description: `سيتم إيداع ${val} ريال في حسابك` });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "حدث خطأ", variant: "destructive" });
    }
  };

  return (
    <div className="container max-w-lg py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Wallet className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">محفظتي</h1>
          <p className="text-muted-foreground text-sm">رصيدك المتاح للسحب</p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-8 mb-8 text-center shadow-lg">
        <p className="text-primary-foreground/70 text-sm mb-2">الرصيد الحالي</p>
        {isLoading ? (
          <div className="h-12 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          </div>
        ) : (
          <div className="text-5xl font-extrabold mb-1">
            {balance.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
        <p className="text-primary-foreground/70 text-lg">ريال سعودي</p>
      </div>

      {/* Withdraw */}
      <div className="bg-card border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <ArrowDownToLine className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">سحب الرصيد</h2>
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            تم تحويل المبلغ إلى حسابك البنكي بنجاح
          </div>
        )}

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-lg pl-12"
              min={0}
              max={balance}
              step="0.01"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">ر.س</span>
          </div>
          <Button
            onClick={handleWithdraw}
            disabled={withdraw.isPending || balance === 0}
            className="h-12 px-6 font-bold"
          >
            {withdraw.isPending ? "جاري..." : "سحب"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[100, 500, 1000].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(String(Math.min(v, balance)))}
              disabled={balance < v}
              className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors disabled:opacity-40"
            >
              {v} ر.س
            </button>
          ))}
          {balance > 0 && (
            <button
              onClick={() => setAmount(String(balance))}
              className="text-xs px-3 py-1.5 rounded-full border border-primary/40 text-primary hover:bg-primary/5 transition-colors"
            >
              الكل
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 flex items-start gap-3 bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
        <Banknote className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
        <p>يتم تحويل المبلغ المسحوب إلى حسابك البنكي المسجل خلال 24 ساعة عمل. عملية السحب وهمية للعرض فقط.</p>
      </div>
    </div>
  );
}
