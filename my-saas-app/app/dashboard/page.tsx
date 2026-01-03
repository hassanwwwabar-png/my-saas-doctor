import { getClientId } from "@/app/actions";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const clientId = await getClientId();
  if (!clientId) return redirect("/login");

  const client = await db.client.findUnique({ where: { id: clientId } });
  if (!client) return redirect("/login");
  
  const currency = client.currency || "$"; 

  // =========================================================
  // 1. جلب البيانات الخام
  // =========================================================
  const allAppointments = await db.appointment.findMany({
    where: { clientId },
    include: { patient: true },
    orderBy: { date: 'desc' }
  });

  const allInvoices = await db.invoice.findMany({
    where: { clientId }
  });

  // =========================================================
  // 2. معالجة البيانات للمبيان (Daily Activity)
  // =========================================================
  
  // تصفية الفواتير المدفوعة (بغض النظر عن حالة الأحرف)
  const paidInvoices = allInvoices.filter(inv => 
    inv.status && inv.status.toUpperCase() === "PAID"
  );

  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  
  // قرار ذكي: إذا كان هناك دخل نعرضه، وإلا نعرض عدد المواعيد
  const showRevenue = totalRevenue > 0; 

  const chartData = [];
  const today = new Date();
  
  // نجهز آخر 30 يوم
  for (let i = 29; i >= 0; i--) { 
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    // المفتاح للمقارنة (تاريخ اليوم بدون وقت)
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    const dayString = d.toDateString(); // Example: "Mon Jan 01 2026"

    let dailyValue = 0;

    if (showRevenue) {
      // خيار أ: جمع أرباح هذا اليوم فقط (للمبيان العمودي)
      dailyValue = paidInvoices
        .filter(inv => new Date(inv.date).toDateString() === dayString)
        .reduce((sum, inv) => sum + (inv.amount || 0), 0);
    } else {
      // خيار ب: عدد مواعيد هذا اليوم (للمبيان العمودي)
      dailyValue = allAppointments
        .filter(apt => new Date(apt.date).toDateString() === dayString)
        .length;
    }

    chartData.push({ name: dateStr, amount: dailyValue });
  }

  // =========================================================
  // 3. باقي الإحصائيات
  // =========================================================
  const totalAppointments = allAppointments.length;
  const totalPatients = await db.patient.count({ where: { clientId } });

  const scheduledCount = allAppointments.filter(a => a.status && a.status.toUpperCase() === "SCHEDULED").length;
  const completedCount = allAppointments.filter(a => a.status && a.status.toUpperCase() === "COMPLETED").length;
  const cancelledCount = allAppointments.filter(a => a.status && a.status.toUpperCase() === "CANCELLED").length;

  const capacityData = [
    { name: 'Scheduled', value: scheduledCount, color: '#3B82F6' },
    { name: 'Completed', value: completedCount, color: '#22C55E' },
    { name: 'Cancelled', value: cancelledCount, color: '#EF4444' },
  ];

  // 4. الجدول السفلي
  const recentAppointments = allAppointments.slice(0, 5).map(apt => ({
      ...apt,
      patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
      phone: apt.patient.phone || "N/A",
      status: apt.status,
      type: apt.type || "Consultation"
  }));

  return (
    <DashboardView 
      stats={{
        patients: totalPatients,
        appointments: totalAppointments,
        revenue: totalRevenue
      }}
      billingData={chartData}
      capacityData={capacityData}
      recentAppointments={recentAppointments}
      currency={showRevenue ? currency : ""}
      doctorName={client.doctorName || "Doctor"}
    />
  );
}