import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="label text-stone-500">404</p>
      <h1 className="display mt-4 text-[44px] sm:text-[64px]">That page has moved on.</h1>
      <p className="mt-4 max-w-md text-[15px] text-stone-600">
        The page you&apos;re looking for doesn&apos;t exist or is no longer available.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">
          Back home
        </Link>
        <Link href="/products" className="btn-secondary">
          Shop all
        </Link>
      </div>
    </div>
  );
}
