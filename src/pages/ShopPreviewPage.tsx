import { ArrowLeft } from "lucide-react";
import { PdfPreview } from "../components/PdfPreview";
import { SHOP_PREVIEWS } from "../data/shopProducts";
import type { Navigate } from "../types/navigation";

interface ShopPreviewPageProps {
  navigate: Navigate;
}

export function ShopPreviewPage({ navigate }: ShopPreviewPageProps) {
  const productId = new URLSearchParams(window.location.search).get("produk");
  const product = SHOP_PREVIEWS.find(({ id }) => id === productId);

  const handleBack = (event: React.MouseEvent<HTMLAnchorElement>) => {
    navigate(event, "shop");
  };

  return (
    <main className="site-width inner-page shop-preview-page">
      <div className="breadcrumb">
        <a href="/beli" onClick={handleBack}>
          Beli Produk
        </a>
        <span>/</span>
        <span>Preview PDF</span>
      </div>

      {product ? (
        <>
          <div className="page-intro">
            <span className="section-kicker">Pratinjau Produk</span>
            <h1>{product.title}</h1>
            <p>Gunakan kontrol PDF untuk menavigasi dan memperbesar dokumen.</p>
          </div>
          <div className="shop-pdf-viewer">
            <PdfPreview url={product.url} title={product.title} />
          </div>
        </>
      ) : (
        <section className="shop-preview-not-found" role="status">
          <h1>Preview tidak ditemukan</h1>
          <p>Pilih produk dari halaman toko untuk melihat preview PDF.</p>
          <a
            className="button button-primary"
            href="/beli"
            onClick={handleBack}
          >
            <ArrowLeft size={16} aria-hidden="true" /> Kembali ke toko
          </a>
        </section>
      )}
    </main>
  );
}
