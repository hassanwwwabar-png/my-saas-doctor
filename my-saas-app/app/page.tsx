import Link from "next/link";
import { db } from "@/lib/db";
import { 
  Stethoscope, ArrowRight, CheckCircle, Activity, 
  Printer, ShieldCheck, Star, PlayCircle, Lock
} from "lucide-react";

export default async function LandingPage() {
  
  // 1. الإعدادات الافتراضية (في حال فشل الاتصال)
  let config = { monthlyPrice: 99, trialDays: 30 };

  // 2. محاولة الاتصال بقاعدة البيانات "بأمان"
  try {
    const dbSettings = await db.saasSettings.findUnique({ 
      where: { id: "config" } 
    });
    if (dbSettings) {
      config = dbSettings;
    }
  } catch (error) {
    // إذا حدث خطأ في قاعدة البيانات، تجاهله واستخدم الافتراضي
    console.error("Database connection failed, using default config.");
  }

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
        {/* --- Hero Section --- */}
        <section className="relative pt-24 pb-32 px-4 overflow-hidden">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
             
             <div className="max-w-5xl mx-auto text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold uppercase tracking-wider mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                   <Star className="w-4 h-4 fill-blue-700" /> Voted #1 Medical SaaS
                </div>

                <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
                   Your Practice, <br />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 animate-gradient">Simplified.</span>
                </h1>

                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
                   Manage appointments, patients, and prescriptions in one place. 
                   Join thousands of doctors who trust MyClinic for their daily operations.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-100">
                   <Link href="/register" className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold flex items-center gap-3 transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105">
                     Start {config.trialDays}-Day Free Trial <PlayCircle className="w-5 h-5" />
                   </Link>
                   
                   <p className="text-xs text-slate-400 font-semibold mt-4 sm:mt-0">
                      No credit card required • Cancel anytime
                   </p>
                </div>
             </div>
        </section>

        {/* --- Features Grid --- */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
           <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                    { icon: Printer, title: "Smart Prescriptions", desc: "Generate and print prescriptions in seconds with customizable templates." },
                    { icon: ShieldCheck, title: "Patient Data Secure", desc: "Bank-grade encryption keeps your patient records safe and compliant." },
                    { icon: Activity, title: "Analytics Dashboard", desc: "Track your clinic's performance and revenue with beautiful charts." }
                 ].map((feature, i) => (
                    <div key={i} className="bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all hover:shadow-xl group">
                       <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <feature.icon className="w-7 h-7" />
                       </div>
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                       <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                          {feature.desc}
                       </p>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="py-8 text-center text-slate-400 text-sm font-semibold border-t border-slate-100 dark:border-slate-800">
         <p>© {new Date().getFullYear()} MyClinic.pro Inc. All rights reserved.</p>
         <div className="flex justify-center gap-6 mt-4">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secure & Encrypted</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
         </div>
      </footer>
    </div>
  );
}