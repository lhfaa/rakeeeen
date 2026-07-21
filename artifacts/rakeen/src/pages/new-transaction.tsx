import { useCreateTransaction, useGetMe } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  title: z.string().min(3, "العنوان مطلوب"),
  description: z.string().min(10, "الوصف مطلوب"),
  amount: z.coerce.number().min(1, "المبلغ يجب أن يكون أكبر من 0"),
  type: z.string().min(2, "النوع مطلوب"),
  sellerEmail: z.string().email("البريد الإلكتروني غير صالح"),
});

export default function NewTransaction() {
  const { data: user } = useGetMe({ query: { retry: false } });
  const createTx = useCreateTransaction();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", description: "", amount: 0, type: "", sellerEmail: "" },
  });

  if (!user) {
    setLocation("/login");
    return null;
  }

  async function onSubmit(data: z.infer<typeof schema>) {
    try {
      await createTx.mutateAsync({ data: { ...data, brokerId: 1 } });
      toast({ title: "تم إنشاء المعاملة بنجاح" });
      setLocation("/dashboard");
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message || "حدث خطأ", variant: "destructive" });
    }
  }

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold mb-2">إنشاء معاملة جديدة</h1>
      <p className="text-muted-foreground mb-8">سيتم تعيين وسيطك تلقائياً: <span className="font-semibold text-foreground">احمد الشهراني</span></p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem><FormLabel>عنوان المعاملة</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem><FormLabel>الوصف</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem><FormLabel>المبلغ (ريال)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem><FormLabel>نوع المعاملة</FormLabel><FormControl><Input placeholder="مثل: حساب, دومين..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="sellerEmail" render={({ field }) => (
            <FormItem><FormLabel>البريد الإلكتروني للطرف الآخر</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="submit" className="w-full" disabled={createTx.isPending}>
            {createTx.isPending ? "جاري الإنشاء..." : "تأكيد وإنشاء"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
