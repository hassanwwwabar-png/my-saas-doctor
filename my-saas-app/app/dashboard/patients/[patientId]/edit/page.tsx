import { db } from "@/lib/db";
import { updatePatientNotes } from "@/app/actions"; 
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditPatientPage({ params }: { params: { patientId: string } }) {
  const { patientId } = await params;

  const patient = await db.patient.findUnique({
    where: { id: patientId },
  });

  if (!patient) return notFound();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/dashboard/patients" className="flex items-center gap-2 text-slate-500 mb-6 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4" /> Back to List
      </Link>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Patient</h1>
        
        <form action={updatePatientNotes} className="space-y-4">
          <input type="hidden" name="id" value={patient.id} />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-slate-700">First Name</label>
              {/* أضفنا || "" لضمان عدم تمرير null */}
              <input name="firstName" defaultValue={patient.firstName || ""} required className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700">Last Name</label>
              <input name="lastName" defaultValue={patient.lastName || ""} required className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Email</label>
            <input name="email" defaultValue={patient.email || ""} type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Phone</label>
            <input name="phone" defaultValue={patient.phone || ""} required className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700">Status</label>
            <select name="status" defaultValue={patient.status || "Active"} className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-4">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}