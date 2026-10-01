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

  useEffect(() => {
    const syncPage = () => setPage(getPageFromPath(window.location.pathname));
    window.addEventListener("popstate", syncPage);
    return () => window.removeEventListener("popstate", syncPage);
  }, []);

  const navigate: Navigate = (event, nextPage) => {
    event.preventDefault();
    if (page !== nextPage) {
      window.history.pushState({}, "", getPathFromPage(nextPage));
      setPage(nextPage);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isMaterialPage =
    page !== "home" && page !== "catalog" && page !== "about";

  return (
    <>
      <SiteHeader page={page} navigate={navigate} />
      {page === "home" && <HomePage navigate={navigate} />}
      {page === "catalog" && <CatalogPage navigate={navigate} />}
      {page === "about" && <AboutPage />}
      {isMaterialPage && <LessonPage slug={page} navigate={navigate} />}
      <SiteFooter navigate={navigate} />
    </>
  );
}

export default App;
