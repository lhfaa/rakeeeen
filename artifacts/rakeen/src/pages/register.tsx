import { useRegister } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const schema = z.object({
  username: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  phone: z.string().min(8, "رقم الجوال قصير جداً"),
  countryCode: z.string().min(1, "اختر كود الدولة"),
});

export default function Register() {
  const register = useRegister();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", email: "", password: "", phone: "", countryCode: "+966" },
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    try {
      await register.mutateAsync({ data });
      toast({ title: "تم إنشاء الحساب بنجاح" });
      setLocation("/dashboard");
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "حدث خطأ أثناء التسجيل", variant: "destructive" });
    }
  }

  return (
    <div className="container max-w-md py-24">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
          <CardDescription>انضم إلى ركين وابدأ تعاملاتك بأمان</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem><FormLabel>الاسم</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>البريد الإلكتروني</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>كلمة المرور</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="flex gap-2">
                <FormField control={form.control} name="countryCode" render={({ field }) => (
                  <FormItem className="w-1/3">
                    <FormLabel>الرمز</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="كود" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="+966">SA +966</SelectItem>
                        <SelectItem value="+971">AE +971</SelectItem>
                        <SelectItem value="+965">KW +965</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem className="flex-1"><FormLabel>رقم الجوال</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full" disabled={register.isPending}>
                {register.isPending ? "جاري الإنشاء..." : "إنشاء حساب"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            لديك حساب بالفعل؟ <Link href="/login" className="text-primary font-medium hover:underline">تسجيل الدخول</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}