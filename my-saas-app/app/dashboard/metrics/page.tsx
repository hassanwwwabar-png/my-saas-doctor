import { db } from "@/lib/db";
import { getClientId } from "@/app/actions";
import { redirect } from "next/navigation";
import { MetricsView } from "@/components/dashboard/metrics-view";

export default async function MetricsPage() {
  const clientId = await getClientId();
  if (!clientId) redirect("/login");

  // 1. جلب كل المرضى
  const patients = await db.patient.findMany({
    where: { clientId },
    select: { gender: true, birthDate: true, createdAt: true }
  });

  // 2. ✅ جلب المواعيد مع الفواتير (للحصول على السعر الصحيح)
  const rawAppointments = await db.appointment.findMany({
    where: { clientId },
    select: { 
      status: true, 
      date: true,
      invoices: { // 👈 جلب الفواتير المرتبطة
        select: { amount: true }
      }
    }
  });

  // 🛠️ معالجة البيانات: استخراج السعر من الفاتورة ووضعه مع الموعد
  // هذا يجعل باقي الكود يعمل دون الحاجة لتغيير الحسابات في الأسفل
  const appointments = rawAppointments.map(apt => ({
    status: apt.status,
    date: apt.date,
    // السعر هو مبلغ أول فاتورة، أو 0 إذا لم توجد
    price: (apt.invoices && apt.invoices.length > 0) ? apt.invoices[0].amount : 0
  }));

  // --- 📊 معالجة البيانات (Data Processing) ---

  // أ) توزيع الجنس (Gender)
  const genderStats = [
    { name: 'Male', value: patients.filter(p => p.gender === 'Male').length, fill: '#3B82F6' },
    { name: 'Female', value: patients.filter(p => p.gender === 'Female').length, fill: '#EC4899' },
  ];

  // ب) توزيع الأعمار (Age Groups)
  const ageGroups: Record<string, number> = { '0-18': 0, '19-35': 0, '36-50': 0, '50+': 0 };
  const today = new Date();
  patients.forEach(p => {
    if (p.birthDate) {
      const age = today.getFullYear() - new Date(p.birthDate).getFullYear();
      if (age <= 18) ageGroups['0-18']++;
      else if (age <= 35) ageGroups['19-35']++;
      else if (age <= 50) ageGroups['36-50']++;
      else ageGroups['50+']++;
    }
  });
  const ageData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));

  // ج) حالة المواعيد (Appointment Status)
  // استخدام toUpperCase لتجنب مشاكل الأحرف (Scheduled vs scheduled)
  const statusStats = appointments.reduce((acc, curr) => {
    const statusKey = curr.status ? curr.status.charAt(0).toUpperCase() + curr.status.slice(1).toLowerCase() : 'Unknown';
    acc[statusKey] = (acc[statusKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const statusData = [
    { name: 'Completed', value: statusStats['Completed'] || 0, fill: '#10B981' }, // أخضر
    { name: 'Cancelled', value: statusStats['Cancelled'] || 0, fill: '#EF4444' }, // أحمر
    { name: 'Scheduled', value: statusStats['Scheduled'] || 0, fill: '#3B82F6' }, // أزرق
  ];

  // د) الإيرادات الشهرية (Revenue Trend)
  const revenueData = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthIdx = d.getMonth();
    const year = d.getFullYear();
    
    const monthlyTotal = appointments
      .filter(a => {
        const aDate = new Date(a.date);
        return aDate.getMonth() === monthIdx && aDate.getFullYear() === year;
      })
      .reduce((sum, a) => sum + (a.price || 0), 0);

    revenueData.push({ name: monthNames[monthIdx], amount: monthlyTotal });
  }

  // هـ) المريض (نمو شهري)
  const growthData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthIdx = d.getMonth();
    const year = d.getFullYear();
    
    const count = patients.filter(p => {
        const pDate = new Date(p.createdAt);
        return pDate.getMonth() === monthIdx && pDate.getFullYear() === year;
    }).length;

    growthData.push({ name: monthNames[monthIdx], patients: count });
  }

  return (
    <div className="animate-in fade-in duration-500">
      <MetricsView 
        genderData={genderStats}
        ageData={ageData}
        statusData={statusData}
        revenueData={revenueData}
        growthData={growthData}
        totalPatients={patients.length}
        // ✅ حساب الإجمالي الآن سيعمل بشكل صحيح لأنه يستخدم السعر المستخرج
        totalRevenue={appointments.reduce((sum, a) => sum + (a.price || 0), 0)}
      />
    </div>
  );
}