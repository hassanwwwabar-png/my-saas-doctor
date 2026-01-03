import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar"; 
import { Header } from "@/components/dashboard/header";    
import { LanguageProvider } from "@/components/language-context"; 
// ✅ استيراد أيقونة التنبيه
import { AlertTriangle } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("mysaas_userId")?.value;

  if (!userId) return redirect("/login");

  let client = null;
  let dbError = false;

  try {
    // ✅ محاولة جلب بيانات العميل بأمان
    client = await db.client.findUnique({
      where: { id: userId },
      select: { id: true, doctorName: true, clinicName: true, onboardingCompleted: true }
    });
  } catch (error) {
    // 🛑 في حال فشل الاتصال، نسجل الخطأ ولا نوقف الموقع
    console.error("❌ Layout DB Error:", error);
    dbError = true;
  }

  // إذا لم يكن هناك خطأ في الاتصال، ولكن العميل غير موجود في الداتابيس -> توجيه للدخول
  if (!dbError && !client) {
    return redirect("/login");
  }

  // إذا تم جلب العميل بنجاح ولكنه لم يكمل الإعداد -> توجيه للإعداد
  if (client && !client.onboardingCompleted) {
    return redirect("/onboarding");
  }

  return (
    <LanguageProvider>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        
        {/* القائمة الجانبية */}
        <Sidebar />

        {/* المحتوى الرئيسي */}
        <div className="flex-1 transition-all duration-300 flex flex-col min-w-0">
          
          {/* ✅ استخدام Fallback (قيم احتياطية) في حال فشل قاعدة البيانات */}
          <Header 
            doctorName={client?.doctorName || "Doctor"} 
            clinicName={client?.clinicName || "My Clinic"} 
          />
          
          <main className="p-4 md:p-8">
            
            {/* ⚠️ رسالة تنبيه تظهر فقط عند فشل الاتصال بقاعدة البيانات */}
            {dbError && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-bold text-sm">Database connection failed.</p>
                  <p className="text-xs opacity-80">Check your internet or refresh the page.</p>
                </div>
              </div>
            )}

            {children}
          </main>
        </div>

      </div>
    </LanguageProvider>
  );
}