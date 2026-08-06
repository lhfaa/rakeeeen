# ركين - منصة الوساطة الإلكترونية

منصة وساطة إلكترونية موثوقة تتيح إتمام المعاملات بين الأفراد والشركات بأمان وشفافية تامة.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — تشغيل الخادم (port 8080)
- `pnpm --filter @workspace/rakeen run dev` — تشغيل الواجهة الأمامية (port 21838)
- `pnpm run typecheck` — فحص الأنواع في جميع الحزم
- `pnpm run build` — typecheck + build
- `pnpm --filter @workspace/api-spec run codegen` — إعادة توليد hooks و Zod schemas
- `pnpm --filter @workspace/db run push` — تطبيق تغييرات DB schema

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Arabic RTL
- API: Express 5 + express-session + bcryptjs
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — مصدر الحقيقة لجميع عقود API
- `lib/db/src/schema/index.ts` — مخطط قاعدة البيانات (users, brokers, transactions, messages)
- `artifacts/api-server/src/routes/` — مسارات API
- `artifacts/rakeen/src/` — كود الواجهة الأمامية

## Accounts

- Do not store development or production passwords in this file.
- Create the first administrator through a controlled database seed or a
  one-time administrative process, then rotate that password before launch.

## Architecture decisions

- Session-based auth (express-session + cookie) — no JWT
- All users register as "user" role by default; admin promotes to broker via admin panel
- Broker records stored in separate brokers table linked to users table
- Messages polled every 3 seconds for real-time feel
- Payment is simulated (sets status to "paid" + adds system message)

## Product

- صفحة رئيسية احترافية بالعربي مع Hero, مميزات, خطوات, إحصائيات, آراء, FAQ, CTA
- تسجيل دخول وإنشاء حساب (اسم, بريد, باسورد, جوال, كود دولة)
- لوحة تحكم للمستخدم: عرض معاملاته وإنشاء معاملة جديدة
- شات ثلاثي (مشتري + بائع + وسيط) مع زر دفع وهمي
- بوابة الوسيط: عرض معاملاته وإغلاقها/حذفها
- لوحة الإدارة: إدارة الوسطاء والمعاملات

## User preferences

- الموقع بالكامل باللغة العربية RTL
- ألوان: أبيض + أسود + أزرق (#1a56db)
- خط عربي حديث (Noto Sans Arabic / Cairo)

## Gotchas

- SESSION_SECRET متوفر في environment secrets
- لا تحفظ كلمات المرور أو قيم الأسرار في المستودع.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
