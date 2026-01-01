import Link from "next/link";
import { db } from "@/lib/db"; // ✅ قمنا بتفعيل الاتصال بقاعدة البيانات
import { 
  Stethoscope, ArrowRight, CheckCircle, Activity, 
  Printer, ShieldCheck, Star, PlayCircle 
} from "lucide-react";

export default async function LandingPage() {
  
  // 1. محاولة جلب الإعدادات الحقيقية من قاعدة البيانات
  let settings = null;
  
  try {
    settings = await db.saasSettings.findUnique({ 
      where: { id: "config" } // نفترض أن معرف الإعدادات هو "config"
    });
  } catch (error) {
    console.log("Database not ready yet, using defaults.");
  }

  // 2. استخدام الإعدادات الحقيقية أو الافتراضية إذا لم توجد
  const config = settings || { monthlyPrice: 50, trialDays: 20 };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
           
           <div className="flex items-center gap-2.5">
             <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
               <Stethoscope className="w-5 h-5 text-white" />
             </div>
             <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
               MyClinic<span className="text-blue-600">.pro</span>
             </span>
           </div>

           <div className="flex items-center gap-4">
             <Link href="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hidden sm:block">
               Log In
             </Link>
             <Link href="/register" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
               Get Started
             </Link>
           </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-4 text-center">
             <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
               Focus on your patients. <br className="hidden md:block" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                 We'll handle the rest.
               </span>
             </h1>

             <p className="text-slate-500 mb-8 font-bold text-lg">
                Join now for only <span className="text-blue-600">${config.monthlyPrice}/mo</span> after trial.
             </p>

             <div className="flex flex-col sm:flex-row justify-center gap-4 mt-2">
               <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-xl flex items-center justify-center gap-2">
                 Start {config.trialDays}-Day Free Trial <ArrowRight className="w-5 h-5" />
               </Link>
             </div>
        </section>
      </main>
    </div>
  );
}