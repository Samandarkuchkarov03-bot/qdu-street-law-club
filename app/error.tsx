"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl">Sahifani yuklab bo'lmadi</h1>
      <p className="mt-3 max-w-md text-sm text-slate-400">Ma'lumotlarni olishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.</p>
      <button type="button" onClick={() => reset()} className="btn-gold mt-6">Qayta urinish</button>
    </div>
  );
}
