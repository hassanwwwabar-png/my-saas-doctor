"use client";

import { useState } from "react";
import { updateInvoicePrice } from "@/app/actions";
import { Pencil, Check, X } from "lucide-react";

interface PriceEditorProps {
  invoiceId: string;
  initialAmount: number;
  currency?: string;
  isPaid: boolean;
}

export function PriceEditor({ invoiceId, initialAmount, currency = "$", isPaid }: PriceEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(initialAmount);

  // إذا كانت الفاتورة مدفوعة، لا تسمح بالتعديل (اختياري)
  if (isPaid) {
    return <span className="font-bold text-slate-700">{currency} {initialAmount}</span>;
  }

  if (isEditing) {
    return (
      <form 
        action={async (formData) => {
          await updateInvoicePrice(formData);
          setIsEditing(false);
        }}
        className="flex items-center gap-1"
      >
        <input type="hidden" name="invoiceId" value={invoiceId} />
        <input 
          type="number" 
          name="amount" 
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          className="w-20 h-7 text-xs px-1 border rounded bg-white"
          autoFocus
        />
        <button type="submit" className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200">
          <Check className="w-3 h-3" />
        </button>
        <button 
          type="button" 
          onClick={() => { setIsEditing(false); setAmount(initialAmount); }} // إلغاء
          className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
        >
          <X className="w-3 h-3" />
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <span className="font-bold text-slate-700">{currency} {initialAmount}</span>
      <button 
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-opacity"
        title="Edit Price"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
}