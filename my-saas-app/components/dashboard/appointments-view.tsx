"use client";

import { useLanguage } from "@/components/language-context";
import Link from "next/link";
import { useState } from "react";
import { Calendar, Clock, Search, CheckCircle, XCircle, Trash2, AlertCircle, Filter, DollarSign, Check } from "lucide-react";
import { deleteAppointment, markAsPaid } from "@/app/actions"; 
import { NewAppointmentModal } from "@/components/dashboard/new-appointment-modal"; 
import { AppointmentStatusSelect } from "@/components/dashboard/appointment-status-select";
import { PriceEditor } from "@/components/dashboard/price-editor"; // ✅ 1. استدعاء مكون التعديل

interface AppointmentsViewProps {
  appointments: any[];
  patients: any[];
}

export function AppointmentsView({ appointments, patients }: AppointmentsViewProps) {
  const { t, isRTL } = useLanguage();
  const [query, setQuery] = useState("");
  
  // حالات الفلترة
  const [filterType, setFilterType] = useState<'all' | 'today' | 'tomorrow' | 'specific'>('all');
  const [specificDate, setSpecificDate] = useState("");

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const filteredAppointments = appointments.filter((apt) => {
    // 1. فلتر البحث بالاسم
    const matchesQuery = 
      apt.patient.firstName.toLowerCase().includes(query.toLowerCase()) ||
      apt.patient.lastName.toLowerCase().includes(query.toLowerCase());

    // 2. فلتر التاريخ
    let matchesDate = true;
    const aptDate = new Date(apt.date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (filterType === 'today') {
      matchesDate = isSameDay(aptDate, today);
    } else if (filterType === 'tomorrow') {
      matchesDate = isSameDay(aptDate, tomorrow);
    } else if (filterType === 'specific' && specificDate) {
      matchesDate = isSameDay(aptDate, new Date(specificDate));
    }

    return matchesQuery && matchesDate;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header & Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Calendar className="w-5 h-5"/></div>
            {t.appointments}
          </h1>
          <p className="text-slate-500 text-sm font-bold">Manage your schedule</p>
        </div>
        <NewAppointmentModal patients={patients} />
      </div>

      {/* شريط الفلاتر */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button 
            onClick={() => { setFilterType('all'); setSpecificDate(""); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 md:flex-none ${filterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All
          </button>
          <button 
            onClick={() => { setFilterType('today'); setSpecificDate(""); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 md:flex-none ${filterType === 'today' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Today
          </button>
          <button 
            onClick={() => { setFilterType('tomorrow'); setSpecificDate(""); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 md:flex-none ${filterType === 'tomorrow' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Tomorrow
          </button>
        </div>

        <div className="relative w-full md:w-auto">
           <input 
             type="date" 
             value={specificDate}
             onChange={(e) => { 
               setSpecificDate(e.target.value); 
               setFilterType('specific'); 
             }}
             className={`w-full md:w-auto py-2 px-4 rounded-xl text-xs font-bold border outline-none transition-colors ${
               filterType === 'specific' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500'
             }`}
           />
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        <div className="relative flex-1 w-full">
          <Search className={`absolute top-2.5 w-4 h-4 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input 
            placeholder="Search patient..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full py-2 bg-transparent text-sm font-bold outline-none ${isRTL ? 'pr-10' : 'pl-10'}`}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAppointments.length === 0 ? (
           <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-slate-300" />
             </div>
             <p className="text-slate-400 font-bold">No appointments found.</p>
           </div>
        ) : (
          filteredAppointments.map((apt) => {
            // ✅ استخراج الفاتورة الأولى (لأنها مصفوفة)
            const invoice = apt.invoices && apt.invoices.length > 0 ? apt.invoices[0] : null;
            const isPaid = invoice?.status === "PAID";

            return (
              <div key={apt.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between">
                
                {/* الجزء العلوي: التاريخ والحذف */}
                <div>
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-2 text-slate-800 font-black text-lg">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(apt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </div>
                     
                     <form action={deleteAppointment} onSubmit={(e) => { if(!confirm("Delete this appointment?")) e.preventDefault(); }}>
                        <input type="hidden" name="id" value={apt.id} />
                        <button className="p-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </form>
                  </div>

                  {/* الحالة (موعد) */}
                  <div className="mb-3">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex w-fit items-center gap-1 ${
                        apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                        apt.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 
                        apt.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                     }`}>
                        {apt.status === 'Completed' && <CheckCircle className="w-3 h-3"/>}
                        {apt.status === 'Cancelled' && <XCircle className="w-3 h-3"/>}
                        {(apt.status === 'Scheduled' || apt.status === 'Pending') && <AlertCircle className="w-3 h-3"/>}
                        {apt.status}
                     </span>
                  </div>

                  {/* معلومات المريض */}
                  <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black">
                        {apt.patient.firstName[0]}
                      </div>
                      <div>
                        <Link href={`/dashboard/patients/${apt.patient.id}`} className="font-bold text-slate-800 text-sm hover:text-blue-600 hover:underline transition-colors block">
                          {apt.patient.firstName} {apt.patient.lastName}
                        </Link>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(apt.date).toLocaleDateString()}</p>
                      </div>
                  </div>
                </div>

                {/* ✅ القسم المالي الجديد (الأسفل) */}
                <div className="mt-4 pt-3 border-t border-slate-50 space-y-3">
                  {/* تغيير حالة الموعد */}
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
                     <AppointmentStatusSelect id={apt.id} currentStatus={apt.status} />
                  </div>

                  {/* ✅ حالة الدفع والسعر */}
                  <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                    <div className="flex items-center gap-1 text-slate-700 font-black">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      
                      {/* 👇✅ 2. استخدام ميزة تعديل السعر هنا */}
                      {invoice ? (
                        <PriceEditor 
                            invoiceId={invoice.id} 
                            initialAmount={invoice.amount} 
                            isPaid={isPaid}
                        />
                      ) : (
                        <span>0</span>
                      )}
                    </div>

                    {invoice ? (
                      isPaid ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-lg flex items-center gap-1">
                          <Check className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <form action={markAsPaid}>
                          <input type="hidden" name="invoiceId" value={invoice.id} />
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm">
                            Mark Paid
                          </button>
                        </form>
                      )
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">No Invoice</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}