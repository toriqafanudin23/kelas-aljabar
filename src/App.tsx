import { useEffect, useState } from "react";
import "katex/dist/katex.min.css";
import { getPageFromPath, getPathFromPage } from "./types/navigation";
import type { Page, Navigate } from "./types/navigation";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { AboutPage } from "./pages/AboutPage";
import { LessonPage } from "./pages/LessonPage";

function App() {
  const [page, setPage] = useState<Page>(() =>
    getPageFromPath(window.location.pathname),
  );
  const [mobileTocOpen, setMobileTocOpen] = useState(false);

  useEffect(() => {
    const syncPage = () => setPage(getPageFromPath(window.location.pathname));
    window.addEventListener("popstate", syncPage);
    return () => window.removeEventListener("popstate", syncPage);
  }, []);

  // Tutup drawer TOC jika berpindah halaman
  useEffect(() => {
    setMobileTocOpen(false);
  }, [page]);

  const navigate: Navigate = (event, nextPage) => {
    event.preventDefault();
    if (page !== nextPage) {
      window.history.pushState({}, "", getPathFromPage(nextPage));
      setPage(nextPage);
    }
    setMobileTocOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isMaterialPage =
    page !== "home" && page !== "catalog" && page !== "about";

  return (
    <>
      <SiteHeader
        page={page}
        navigate={navigate}
        showTocButton={isMaterialPage}
        isTocOpen={mobileTocOpen}
        onToggleToc={() => setMobileTocOpen(!mobileTocOpen)}
      />
      {page === "home" && <HomePage navigate={navigate} />}
      {page === "catalog" && <CatalogPage navigate={navigate} />}
      {page === "about" && <AboutPage />}
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
