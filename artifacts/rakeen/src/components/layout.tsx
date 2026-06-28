import { useGetMe, useLogout } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut, LayoutDashboard, User, ShieldAlert } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetMe({ query: { retry: false } });
  const logout = useLogout();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout.mutateAsync();
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-2xl">
            <ShieldCheck className="w-8 h-8" />
            <span>ركين</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              الرئيسية
            </Link>
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                      <LayoutDashboard className="w-4 h-4" />
                      لوحة التحكم
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                        <ShieldAlert className="w-4 h-4" />
                        لوحة الإدارة
                      </Link>
                    )}
                    {user.role === "broker" && (
                      <Link href="/broker" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                        <User className="w-4 h-4" />
                        بوابة الوسيط
                      </Link>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-2 text-destructive hover:text-destructive">
                      <LogOut className="w-4 h-4" />
                      تسجيل خروج
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
                      تسجيل الدخول
                    </Link>
                    <Button asChild size="sm">
                      <Link href="/register">ابدأ الآن</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center w-full">
        <div className="w-full flex flex-col items-center">
          {children}
        </div>
      </main>

      <footer className="border-t py-8 mt-auto bg-muted/30">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground">ركين</span>
          </div>
          <p>© {new Date().getFullYear()} منصة ركين للوساطة الإلكترونية. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}