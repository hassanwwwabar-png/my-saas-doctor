import Link from "next/link";
import { db } from "@/lib/db";
import { 
  Stethoscope, ArrowRight, PlayCircle, Star, 
  Printer, ShieldCheck, Activity, Lock 
} from "lucide-react";

// هذه الدالة تجعل الصفحة لا تتوقف بالكامل إذا فشلت قاعدة البيانات للحظة
async function getSettings() {
  try {
    const data = await db.saasSettings.findUnique({ where: { id: "config" } });
    // ✅ تم تعديل القيم الافتراضية هنا أيضاً
    return data || { monthlyPrice: 99, trialDays: 20 };
  } catch (error) {
    return { monthlyPrice: 99, trialDays: 20 }; 
  }
}

export default async function LandingPage() {
  const config = await getSettings();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="p-2 bg-blue-600 rounded-xl">
               <Stethoscope className="w-5 h-5 text-white" />
             </div>
             <span className="text-xl font-black text-slate-900 dark:text-white">
               MyClinic<span className="text-blue-600">.pro</span>
             </span>
           </div>
           <div className="flex gap-4">
             <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 py-2">Sign In</Link>
             <Link href="/register" className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-600 transition-all">
               Get Started
             </Link>
           </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="pt-24 pb-32 px-4 text-center">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold mb-6 text-xs uppercase">
                <Star className="w-4 h-4 fill-blue-700" /> Voted #1 Medical SaaS
             </div>
             <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
               Your Practice, <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">Simplified.</span>
             </h1>
             
             {/* ✅ تم التعديل: إزالة السعر */}
             <p className="text-xl text-slate-500 mb-8 max-w-2xl mx-auto font-medium">
                Join now and verify your clinic after your trial.
             </p>

             <div className="flex justify-center">
               <Link href="/register" className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold flex items-center gap-3 shadow-xl transition-all hover:scale-105">
                 {/* ✅ تم التعديل: جعلها 20 يوماً */}
                 Start 20-Day Free Trial <PlayCircle className="w-5 h-5" />
               </Link>
             </div>
        </section>
      </main>
    </div>
  );
}