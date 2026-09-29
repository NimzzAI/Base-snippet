import Link from "next/link";

export default function NotFound() {
  return (
    <div className="state-page">
      <div className="code">404</div>
      <h2>Halaman Tidak Ditemukan</h2>
      <p>
        Halaman yang kamu cari mungkin telah dihapus, diubah namanya, atau tautan yang kamu tuju salah.
      </p>
      <Link href="/" className="btn btn-primary">
        <i className="fa-solid fa-house" /> Kembali ke Beranda
      </Link>
    </div>
  );
}
