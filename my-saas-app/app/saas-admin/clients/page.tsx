import { db } from "@/lib/db";
import Link from "next/link";
import { 
  Users, Search, Eye, 
  CheckCircle, XCircle, Building, Mail, AlertTriangle 
} from "lucide-react";

export default async function ClientsPage() {
  
  // ✅ الحل هنا: أضفنا : any[] لنخبر TypeScript أن هذا متغير مسموح
  let clients: any[] = []; 
  let dbError = false;

  try {
    clients = await db.client.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("❌ Database Connection Error:", error);
    dbError = true;
    clients = [];
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
              <Users className="w-8 h-8" />
            </div>
            Clients (Doctors)
          </h1>
          <p className="text-slate-500 font-bold mt-2 ml-14">
            Manage your registered doctors and clinics.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
           <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
           <input 
             placeholder="Search doctors..." 
             className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 w-full md:w-64 font-bold text-sm" 
           />
        </div>
      </div>

      {/* ⚠️ Error Alert */}
      {dbError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>Database connection failed. Please check your internet or Neon status.</span>
        </div>
      )}

      {/* Clients Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        
        {clients.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-black">
              <tr>
                <th className="p-5">Doctor / Clinic</th>
                <th className="p-5">Contact</th>
                <th className="p-5">Status</th>
                <th className="p-5">Joined Date</th>
                <th className="p-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {clients.map((client: any) => (
                <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                  
                  {/* Name & Clinic */}
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-black text-sm uppercase">
                        {client.doctorName?.[0] || "D"}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{client.doctorName}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-bold">
                           <Building className="w-3 h-3" /> {client.clinicName || "No Clinic Name"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="p-5">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Mail className="w-3 h-3" /> {client.email}
                       </div>
                       {client.phone && (
                         <div className="text-xs text-slate-400 pl-5">
                            {client.phone}
                         </div>
                       )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                      client.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {client.status === 'Active' ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                      {client.status || "INACTIVE"}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="p-5 text-xs font-bold text-slate-500">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td className="p-5 text-right">
                    <Link 
                      href={`/saas-admin/clients/${client.id}`} 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-bold shadow-sm"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </Link>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
               <Users className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-800">
                {dbError ? "Database is offline." : "No clients found."}
            </h3>
            <p className="text-slate-400 text-sm font-bold max-w-xs mt-2">
              {dbError ? "Check your internet connection." : "Doctors who register on your platform will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}