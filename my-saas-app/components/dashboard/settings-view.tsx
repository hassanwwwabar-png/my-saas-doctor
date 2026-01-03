"use client";

import { useLanguage } from "@/components/language-context";
// ✅ Added CreditCard to imports
import { User, Building, MapPin, Phone, Stethoscope, Save, Settings as SettingsIcon, Lock, Mail, CreditCard } from "lucide-react";
import { updateSettings } from "@/app/actions";
import { useState } from "react";

interface SettingsViewProps {
  client: any;
}

export function SettingsView({ client }: SettingsViewProps) {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in pb-10">
      
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-slate-400" /> {t.settingsTitle}
        </h1>
        <p className="text-slate-500 text-sm font-bold mt-1">{t.settingsSubtitle}</p>
      </div>

      <form 
        action={async (formData) => {
          setLoading(true);
          await updateSettings(formData);
          setLoading(false);
          alert(t.successUpdate || "Saved!");
        }} 
        className="space-y-6"
      >
        
        {/* 1. Personal Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
            <User className="w-5 h-5 text-blue-600" /> {t.personalInfo}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">{t.doctorName}</label>
              <div className="relative">
                <User className={`absolute top-3.5 w-4 h-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input name="doctorName" defaultValue={client.doctorName} className={`w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all ${isRTL ? 'pr-9' : 'pl-9'}`} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">{t.specialty}</label>
              <div className="relative">
                <Stethoscope className={`absolute top-3.5 w-4 h-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input name="specialty" defaultValue={client.specialty} className={`w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all ${isRTL ? 'pr-9' : 'pl-9'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Security Settings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
            <Lock className="w-5 h-5 text-red-600" /> Security & Login
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">{t.email || "Email Address"}</label>
              <div className="relative">
                <Mail className={`absolute top-3.5 w-4 h-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input 
                  name="email" 
                  type="email"
                  defaultValue={client.email}
                  required
                  className={`w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all ${isRTL ? 'pr-9' : 'pl-9'}`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">New Password</label>
              <div className="relative">
                <Lock className={`absolute top-3.5 w-4 h-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input 
                  name="newPassword" 
                  type="password"
                  placeholder="Leave empty to keep current"
                  className={`w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all ${isRTL ? 'pr-9' : 'pl-9'}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Clinic Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
            <Building className="w-5 h-5 text-emerald-600" /> {t.clinicInfo}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">{t.clinicName}</label>
              <div className="relative">
                <Building className={`absolute top-3.5 w-4 h-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input name="clinicName" defaultValue={client.clinicName} className={`w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all ${isRTL ? 'pr-9' : 'pl-9'}`} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">{t.phone}</label>
              <div className="relative">
                <Phone className={`absolute top-3.5 w-4 h-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input name="phone" defaultValue={client.phone} className={`w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all ${isRTL ? 'pr-9' : 'pl-9'}`} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">{t.city}</label>
              <div className="relative">
                <MapPin className={`absolute top-3.5 w-4 h-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input name="city" defaultValue={client.city} className={`w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all ${isRTL ? 'pr-9' : 'pl-9'}`} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">{t.address}</label>
              <div className="relative">
                <MapPin className={`absolute top-3.5 w-4 h-4 text-slate-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <input name="address" defaultValue={client.address} className={`w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-emerald-500 transition-all ${isRTL ? 'pr-9' : 'pl-9'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ 4. Preferences (Currency) - NEW SECTION */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="font-black text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
            <CreditCard className="w-5 h-5 text-purple-600" /> Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">Currency Symbol</label>
              <div className="relative">
                {/* Fixed Icon for Currency */}
                <div className={`absolute top-3.5 w-4 h-4 text-slate-400 font-black flex items-center justify-center text-xs ${isRTL ? 'right-3' : 'left-3'}`}>$</div>
                <select 
                  name="currency" 
                  defaultValue={client.currency || "MAD"} 
                  className={`w-full py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-purple-500 transition-all appearance-none ${isRTL ? 'pr-9' : 'pl-9'}`}
                >
                  <option value="MAD">Moroccan Dirham (MAD)</option>
                  <option value="$">US Dollar ($)</option>
                  <option value="€">Euro (€)</option>
                  <option value="£">British Pound (£)</option>
                  <option value="SAR">Saudi Riyal (SAR)</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-400 font-bold mt-1">This symbol will be used in your dashboard and invoices.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {loading ? "Saving..." : t.saveChanges}
          </button>
        </div>

      </form>
    </div>
  );
}