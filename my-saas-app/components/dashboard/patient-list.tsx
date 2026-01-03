"use client";

import { useLanguage } from "@/components/language-context";
import Link from "next/link";
import { useState } from "react";
// ✅ Added Trash2 for delete icon
import { Users, Plus, Search, Filter, Trash2 } from "lucide-react";
import { AddVisitModal } from "@/components/dashboard/add-visit-modal"; 
// ✅ Imported delete action
import { deletePatient } from "@/app/actions"; 

interface PatientListProps {
  initialPatients: any[];
}

export function PatientList({ initialPatients }: PatientListProps) {
  const { t, isRTL } = useLanguage();
  const [query, setQuery] = useState("");

  // 🔍 Safe Search Logic
  const filteredPatients = initialPatients.filter((patient) => {
    const searchLower = query.toLowerCase().trim();
    if (!searchLower) return true;

    const firstName = (patient.firstName || "").toLowerCase();
    const lastName = (patient.lastName || "").toLowerCase();
    const fullName = `${firstName} ${lastName}`;
    const phone = (patient.phone || "").toLowerCase();
    const cin = (patient.cin || "").toLowerCase();
    const id = (patient.id || "").toLowerCase();

    return (
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      fullName.includes(searchLower) ||
      phone.includes(searchLower) ||
      cin.includes(searchLower) ||
      id.includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> {t.patients}
          </h1>
          <p className="text-slate-500 text-sm font-bold">Manage your clinic members</p>
        </div>
        
        <Link 
          href="/dashboard/patients/new" 
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
        >
          <Plus className="w-4 h-4" /> {t.addPatient}
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-3 w-4 h-4 text-slate-400`} />
          <input 
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full ${isRTL ? 'pr-10' : 'pl-10'} py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100`}
          />
        </div>
        <div className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2">
          <Filter className="w-4 h-4" /> 
          <span>{filteredPatients.length} Results</span>
        </div>
      </div>

      {/* Table */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
          <p className="text-slate-400 font-bold mb-2">{t.noPatients}</p>
          <button onClick={() => setQuery("")} className="text-blue-600 font-bold text-xs underline">
            Clear search
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.firstName} / {t.lastName}</th>
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.gender}</th>
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.bloodType}</th>
                <th className={`px-6 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t.phone}</th>
                <th className="px-6 py-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-black text-xs shrink-0">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </div>
                      <div className={isRTL ? 'text-right' : 'text-left'}>
                        <p className="text-sm font-black text-slate-800">{patient.firstName} {patient.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{patient.cin || "No ID"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${
                      patient.gender === 'Male' ? 'bg-blue-50 text-blue-600' :
                      patient.gender === 'Female' ? 'bg-pink-50 text-pink-600' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {patient.gender === 'Male' ? t.male : patient.gender === 'Female' ? t.female : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                      <span className="font-black text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">{patient.bloodType || "-"}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-600">{patient.phone || "N/A"}</td>
                  
                  {/* 👇 Actions Column (Updated with Delete) */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        
                        {/* View Profile */}
                        <Link href={`/dashboard/patients/${patient.id}`} className="text-blue-600 font-black text-[10px] uppercase bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg transition-all">
                        {t.viewProfile}
                        </Link>

                        {/* Quick Visit */}
                        <AddVisitModal 
                            patientId={patient.id} 
                            patientName={`${patient.firstName} ${patient.lastName}`} 
                        />

                        {/* ✅ Delete Button */}
                        <form 
                          action={deletePatient} 
                          onSubmit={(e) => {
                            if(!confirm("Are you sure you want to delete this patient? All data will be lost.")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={patient.id} />
                          <button 
                            type="submit" 
                            className="text-red-500 bg-red-50 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-all border border-red-100"
                            title="Delete Patient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}