import { getClientId } from "@/app/actions"; // ❌ حذفنا getAppointments لأننا لن نحتاجها
import { db } from "@/lib/db"; 
import { redirect } from "next/navigation";
import { AppointmentsView } from "@/components/dashboard/appointments-view";

export default async function AppointmentsPage() {
  const clientId = await getClientId();
  if (!clientId) redirect("/login");

  // ✅ 1. جلب المواعيد + الفواتير (الحل هنا)
  const appointments = await db.appointment.findMany({
    where: { clientId },
    orderBy: { date: 'desc' },
    include: {
      patient: true, // ضروري لاسم المريض
      // 👇👇 هذا هو السطر المفقود الذي سيجعل الزر يعمل!
      invoices: true 
    }
  });

  // 2. جلب قائمة المرضى (لإضافتهم في المودال)
  const patients = await db.patient.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, firstName: true, lastName: true }
  });

  return (
    <div className="animate-in fade-in duration-500">
      <AppointmentsView appointments={appointments} patients={patients} />
    </div>
  );
}