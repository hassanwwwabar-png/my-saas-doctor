"use client";

import { useLanguage } from "@/components/language-context";
import { 
  Users, Calendar, DollarSign, 
  Clock, Activity, Phone, FileText, BarChart3 
} from "lucide-react";
import Link from "next/link";
import { 
  BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell
} from "recharts";

interface DashboardViewProps {
  stats: {
    patients: number;
    appointments: number;
    revenue: number;
  };
  recentAppointments: any[];
  billingData: any[];
  doctorName: string;
  currency: string;
  capacityData: any[];
}

const formatYAxis = (tickItem: number) => {
  if (tickItem >= 1000000) return `${(tickItem / 1000000).toFixed(1)}M`;
  if (tickItem >= 1000) return `${(tickItem / 1000).toFixed(0)}k`;
  return tickItem.toString();
};

export function DashboardView({ 
  stats, 
  recentAppointments, 
  billingData, 
  capacityData,
  doctorName,
  currency 
}: DashboardViewProps) {
  
  const { t: rawT, isRTL } = useLanguage();
  const t = rawT as any; 
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? (t.goodMorning || "Good Morning") : hour < 18 ? (t.goodAfternoon || "Good Afternoon") : (t.goodEvening || "Good Evening");
  const today = new Date().toLocaleDateString(isRTL ? 'ar-MA' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10" dir={isRTL ? "rtl" : "ltr"}>
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-slate-500 font-bold text-sm mb-1 uppercase tracking-wider">{today}</p>
          <h1 className="text-3xl font-black text-slate-800">
            {greeting}, <span className="text-blue-600">{t.doctorTitle || "Dr."} {doctorName}</span> 👋
          </h1>
          <p className="text-slate-400 font-medium mt-1">{t.dashboardOverview || "Here is your clinic's performance overview."}</p>
        </div>
        
        <Link href="/dashboard/appointments" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
          <Calendar className="w-4 h-4" /> {t.newAppointment || "New Appointment"}
        </Link>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-slate-400 font-bold text-xs uppercase mb-1">{t.totalAppointments || "Total Appointments"}</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.appointments}</h3>
           </div>
           <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
              <Activity className="w-6 h-6" />
           </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-slate-400 font-bold text-xs uppercase mb-1">{t.totalPatients || "Total Patients"}</p>
              <h3 className="text-3xl font-black text-slate-800">{stats.patients}</h3>
           </div>
           <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
              <Users className="w-6 h-6" />
           </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-slate-400 font-bold text-xs uppercase mb-1">Scheduled</p>
              <h3 className="text-3xl font-black text-slate-800">
                {capacityData.find((d: any) => d.name === 'Scheduled')?.value || 0}
              </h3>
           </div>
           <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
              <Calendar className="w-6 h-6" />
           </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
           <div>
              <p className="text-slate-400 font-bold text-xs uppercase mb-1">{t.totalRevenue || "Total Revenue"}</p>
              <h3 className="text-3xl font-black text-slate-800">{currency}{stats.revenue.toLocaleString()}</h3>
           </div>
           <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
              <DollarSign className="w-6 h-6" />
           </div>
        </div>
      </div>

      {/* 3. Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Clinic Activity (Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                 <BarChart3 className="w-5 h-5 text-indigo-500" /> {t.clinicActivity || "Clinic Activity (30 Days)"}
              </h3>
           </div>
           
           <div className="h-[250px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={billingData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#94a3b8'}} 
                      interval={4} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 12, fill: '#94a3b8'}} 
                      tickFormatter={formatYAxis} 
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}} 
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="#6366f1" 
                      radius={[4, 4, 0, 0]} 
                      barSize={20} 
                    />
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800">Appointment Status</h3>
           </div>
           <div className="h-[200px] w-full relative" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={capacityData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                       {capacityData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                       ))}
                    </Pie>
                    <Tooltip />
                 </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                 <p className="text-xs text-slate-400 font-bold">Total</p>
                 <p className="text-xl font-black text-slate-800">{stats.appointments}</p>
              </div>
           </div>
           <div className="flex justify-center gap-4 mt-4">
              {capacityData.map((item: any, i: number) => (
                 <div key={i} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="text-[10px] font-bold text-slate-500">{item.name}</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* 4. Table (Visits) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800">{t.recentVisits || "Recent Visits"}</h3>
          <Link href="/dashboard/appointments" className="text-xs font-bold text-blue-600 hover:underline">
            {t.viewAll || "View All"}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-slate-400 text-xs uppercase font-bold">
                 <th className={`pb-4 pl-2 ${isRTL ? 'text-right' : 'text-left'}`}>Patient Name</th>
                 <th className={`pb-4 ${isRTL ? 'text-right' : 'text-left'}`}>Status</th>
                 <th className={`pb-4 ${isRTL ? 'text-right' : 'text-left'}`}>Type</th>
                 <th className={`pb-4 ${isRTL ? 'text-right' : 'text-left'}`}>Date - Time</th>
                 <th className={`pb-4 ${isRTL ? 'text-right' : 'text-left'}`}>Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentAppointments.length === 0 ? (
                 <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-sm">{t.noAppointments || "No recent appointments"}</td></tr>
              ) : (
                recentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                     
                     <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xs font-black text-blue-600">
                              {apt.patientName[0]}
                           </div>
                           <div>
                              <span className="font-bold text-sm text-slate-800 block">{apt.patientName}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">ID: {apt.patientId ? apt.patientId.slice(0, 4) : "---"}</span>
                           </div>
                        </div>
                     </td>

                     <td className="py-4">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                           apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                           apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-600' :
                           'bg-blue-100 text-blue-600'
                        }`}>
                           {apt.status}
                        </span>
                     </td>

                     <td className="py-4">
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-xs">
                           <FileText className="w-3 h-3 text-slate-400" /> {apt.type}
                        </div>
                     </td>

                     <td className="py-4 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                           <Calendar className="w-3 h-3 text-slate-400" />
                           {new Date(apt.date).toLocaleDateString()} 
                           <span className="text-slate-300 mx-1">|</span>
                           <Clock className="w-3 h-3 text-slate-400" />
                           {new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                     </td>

                     <td className="py-4 text-xs font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                           <Phone className="w-3 h-3 text-slate-400" /> {apt.phone}
                        </div>
                     </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}