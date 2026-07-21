import { useGetWallet, useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Wallet } from "lucide-react";

export default function WalletPage() {
  const { data: user } = useGetMe({ query: { retry: false } });
  const { data: wallet, isLoading } = useGetWallet({ query: { enabled: !!user } });
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation("/login");
    return null;
  }

  const balance = wallet?.balance ?? 0;

  return (
    <div className="container max-w-lg py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Wallet className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">محفظتي</h1>
          <p className="text-muted-foreground text-sm">رصيدك المتاح</p>
        </div>
      </div>

      <div className="bg-primary text-primary-foreground rounded-2xl p-10 text-center shadow-lg">
        <p className="text-primary-foreground/70 text-sm mb-3">الرصيد الحالي</p>
        {isLoading ? (
          <div className="h-14 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          </div>
        ) : (
          <div className="text-6xl font-extrabold mb-2">
            {balance.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
        <p className="text-primary-foreground/70 text-xl">ريال سعودي</p>
      </div>
    </div>
  );
}
