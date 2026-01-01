import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic'; // لإجبار الصفحة على العمل في كل مرة

export default async function TestPage() {
  const dbUrl = process.env.DATABASE_URL;
  let status = "Checking...";
  let errorDetail = "";
  let data = null;

  // 1. فحص هل المتغير موجود أصلاً؟
  if (!dbUrl) {
    return (
      <div className="p-10 bg-red-50 text-red-700 font-mono">
        <h1 className="text-2xl font-bold">CRITICAL ERROR</h1>
        <p>DATABASE_URL is not defined in Vercel Environment Variables.</p>
      </div>
    );
  }

  // 2. محاولة الاتصال الحقيقي
  try {
    const prisma = new PrismaClient();
    // محاولة جلب أي شيء بسيط
    await prisma.$connect();
    status = "Connected Successfully! ✅";
    
    // محاولة قراءة الإعدادات
    try {
        data = await prisma.saasSettings.findMany({ take: 1 });
    } catch (readError: any) {
        status = "Connected, but could not read data.";
        errorDetail = readError.message;
    }

    await prisma.$disconnect();

  } catch (e: any) {
    status = "CONNECTION FAILED ❌";
    errorDetail = e.message;
  }

  return (
    <div className="min-h-screen p-10 font-sans space-y-6 bg-slate-50">
      <h1 className="text-3xl font-bold text-slate-900">Database Diagnostic Tool</h1>
      
      <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 space-y-4">
        <div>
            <strong className="block text-sm text-slate-500 uppercase">1. Environment Variable Check</strong>
            <div className="font-mono text-sm bg-slate-100 p-2 rounded mt-1">
                {dbUrl ? `Found: ${dbUrl.substring(0, 20)}... (Hidden for security)` : "MISSING"}
            </div>
        </div>

        <div>
            <strong className="block text-sm text-slate-500 uppercase">2. Connection Status</strong>
            <div className={`font-bold text-lg mt-1 ${status.includes("Success") ? "text-green-600" : "text-red-600"}`}>
                {status}
            </div>
        </div>

        {errorDetail && (
            <div>
                <strong className="block text-sm text-slate-500 uppercase">3. Error Details (Show this to Hassan)</strong>
                <pre className="bg-red-50 text-red-700 p-4 rounded-lg mt-1 text-xs overflow-auto whitespace-pre-wrap border border-red-200">
                    {errorDetail}
                </pre>
            </div>
        )}

        {data && (
            <div>
                <strong className="block text-sm text-slate-500 uppercase">4. Data Preview</strong>
                <pre className="bg-green-50 text-green-800 p-4 rounded-lg mt-1 text-xs overflow-auto">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        )}
      </div>
    </div>
  );
}