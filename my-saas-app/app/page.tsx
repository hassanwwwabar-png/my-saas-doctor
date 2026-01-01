import Link from "next/link";
// import { db } from "@/lib/db";  <-- لقد حذفت هذا السطر لأنه السبب في المشكلة
import { 
  Stethoscope, ArrowRight, CheckCircle, Activity, 
  Printer, ShieldCheck, Star, PlayCircle, Lock
} from "lucide-react";

export default function LandingPage() {
  
  // نستخدم إعدادات ثابتة الآن لضمان عمل الموقع
  const config = { monthlyPrice: 99, trialDays: 30 };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 font-sans">
      
      {/* --- Navbar --- */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2.5">
             <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
               <Stethoscope className="w-5 h-5 text-white" />
             </div>
             <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
               MyClinic<span className="text-blue-600">.pro</span>
             </span>
           </div>

           <div className="flex items-center gap-4">
             <Link href="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors hidden sm:block">
               Sign In
             </Link>
             <Link href="/register" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-blue-600 hover:text-white dark:hover:bg-slate-200 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2">
               Get Started <ArrowRight className="w-4 h-4" />
             </Link>
           </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative pt-24 pb-32 px-4 overflow-hidden text-center">
             <div className="max-w-5xl mx-auto space-y-8">
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                   Your Practice, <br />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600">Simplified.</span>
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                   Manage appointments, patients, and prescriptions in one place. 
                </p>
                <div className="flex justify-center gap-4 pt-4">
                   <Link href="/register" className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold flex items-center gap-3 transition-all shadow-xl">
                     Start {config.trialDays}-Day Free Trial <PlayCircle className="w-5 h-5" />
                   </Link>
                </div>
             </div>
        </section>
      </main>
    </div>
  );
}