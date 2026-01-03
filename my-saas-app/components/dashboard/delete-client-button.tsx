"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteClient } from "@/app/actions";
import { useRouter } from "next/navigation"; // ✅ إضافة الراوتر

interface Props {
  clientId: string;
}

export function DeleteClientButton({ clientId }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter(); // ✅ تفعيل الراوتر

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmed = window.confirm("Are you sure you want to delete this client permanently? This action cannot be undone.");
    
    if (confirmed) {
      setIsDeleting(true);
      
      const formData = new FormData();
      // ✅ تصحيح الاسم: يجب أن يكون "id" وليس "clientId" ليتوافق مع app/actions.ts
      formData.append("id", clientId); 
      
      try {
        await deleteClient(formData);
        
        // ✅ توجيه يدوي لضمان عدم تعليق الصفحة
        router.push("/saas-admin/clients");
        router.refresh(); 
      } catch (error) {
        console.error("Delete failed", error);
        setIsDeleting(false); // إيقاف التحميل في حال الخطأ
        alert("Failed to delete. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleDelete}>
      <button 
        disabled={isDeleting}
        className="w-full flex items-center justify-center gap-2 p-3 bg-white text-red-500 hover:bg-red-50 border border-red-100 hover:border-red-200 rounded-xl font-bold text-sm transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" /> Delete Account Permanently
          </>
        )}
      </button>
    </form>
  );
}