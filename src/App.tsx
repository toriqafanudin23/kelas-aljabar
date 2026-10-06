import { useEffect, useState } from "react";
import "katex/dist/katex.min.css";
import { getPageFromPath, getPathFromPage } from "./types/navigation";
import type { Page, Navigate } from "./types/navigation";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { AboutPage } from "./pages/AboutPage";
import { DownloadPage } from "./pages/DownloadPage";
import { BankSoalDownloadPage } from "./pages/BankSoalDownloadPage";
import { SimulationPage } from "./pages/SimulationPage";
import { ShopPage } from "./pages/ShopPage";
import { LessonPage } from "./pages/LessonPage";
import { SEOHead } from "./components/SEOHead";

function App() {
  const [page, setPage] = useState<Page>(() =>
    getPageFromPath(window.location.pathname),
  );
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 420);
    return () => window.clearTimeout(timer);
  }, [page]);

  useEffect(() => {
    const syncPage = () => {
      setIsLoading(true);
      setPage(getPageFromPath(window.location.pathname));
      setMobileTocOpen(false);
    };
    window.addEventListener("popstate", syncPage);
    return () => window.removeEventListener("popstate", syncPage);
  }, []);

  const navigate: Navigate = (event, nextPage) => {
    event.preventDefault();
    if (page !== nextPage) {
      setIsLoading(true);
      window.requestAnimationFrame(() => {
        window.history.pushState({}, "", getPathFromPage(nextPage));
        setPage(nextPage);
      });
    }
    setMobileTocOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isMaterialPage =
    page !== "home" &&
    page !== "catalog" &&
    page !== "download" &&
    page !== "bank-download" &&
    page !== "simulation" &&
    page !== "shop" &&
    page !== "about";

  return (
    <>
      <SEOHead page={page} />
      {isLoading && (
        <div className="page-loader" role="status" aria-live="polite">
          <div className="page-loader-mark" aria-hidden="true">
            &Sigma;
          </div>
          <strong>Math 1729</strong>
          <span>Memuat halaman...</span>
          <div className="page-loader-track" aria-hidden="true">
            <span />
          </div>
        </div>
      )}
      <SiteHeader
        page={page}
        navigate={navigate}
        showTocButton={isMaterialPage}
        isTocOpen={mobileTocOpen}
        onToggleToc={() => setMobileTocOpen(!mobileTocOpen)}
      />
      {page === "home" && <HomePage navigate={navigate} />}
      {page === "catalog" && <CatalogPage navigate={navigate} />}
      {page === "download" && <DownloadPage navigate={navigate} />}
      {page === "bank-download" && <BankSoalDownloadPage navigate={navigate} />}
      {page === "simulation" && <SimulationPage navigate={navigate} />}
      {page === "shop" && <ShopPage navigate={navigate} />}
      {page === "about" && <AboutPage navigate={navigate} />}
      {isMaterialPage && (
        <LessonPage
          slug={page}
          navigate={navigate}
          mobileTocOpen={mobileTocOpen}
          setMobileTocOpen={setMobileTocOpen}
        />
      )}
      <SiteFooter navigate={navigate} />
    </>
  );
}

export default App;
