import { db } from "@/lib/db";
import { sendAdminReply } from "@/app/actions";
import { Send, User, ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminChatDetail({ params }: { params: { clientId: string } }) {
  // انتظر قراءة params
  const { clientId } = await params;

  // جلب الطبيب ورسائله
  const client = await db.client.findUnique({
    where: { id: clientId },
    include: { 
      // @ts-ignore - نستخدم هذا في حال لم يقم الـ VS Code بتحديث النوع فوراً
      messages: { orderBy: { createdAt: 'asc' } } 
    }
  });

  if (!client) return notFound();

  return (
    <div className="h-[calc(100vh-40px)] flex flex-col max-w-4xl mx-auto bg-white dark:bg-slate-900 shadow-2xl border-x border-slate-200 dark:border-slate-800">
      
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/saas-admin/messages" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-500" />
        </Link>
        <div>
          <h1 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {client.doctorName}
            <span className={`w-2 h-2 rounded-full ${client.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          </h1>
          <p className="text-xs text-slate-500">{client.clinicName} • {client.phone}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950">
        {/* @ts-ignore */}
        {client.messages?.map((msg: any) => {
          const isAdmin = msg.role === 'ADMIN';
          return (
            <div key={msg.id} className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[70%] gap-3 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                  isAdmin ? 'bg-purple-600 text-white' : 'bg-white text-blue-600 border-blue-200'
                }`}>
                  {isAdmin ? <ShieldCheck className="w-4 h-4"/> : <User className="w-4 h-4"/>}
                </div>

                {/* Bubble */}
                <div>
                   <div className={`p-4 rounded-2xl text-sm shadow-sm ${
                     isAdmin 
                       ? 'bg-purple-600 text-white rounded-tr-none' 
                       : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                   }`}>
                     {msg.content}
                   </div>
                   <span className="text-[10px] text-slate-400 block mt-1 px-1">
                     {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                   </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Form */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form action={sendAdminReply} className="flex gap-3">
          <input type="hidden" name="clientId" value={clientId} />
          
          <input 
            name="content" 
            required
            placeholder="Type your reply..." 
            className="flex-1 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            autoComplete="off"
          />
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl transition-all shadow-lg hover:scale-105 flex items-center justify-center">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
}