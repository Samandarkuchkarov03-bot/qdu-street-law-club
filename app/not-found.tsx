import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl">Sahifa topilmadi</h1>
      <p className="mt-3 text-sm text-slate-400">Siz izlagan manzil mavjud emas.</p>
      <Link href="/" className="btn-gold mt-6">Bosh sahifa</Link>
    </div>
  );
}
