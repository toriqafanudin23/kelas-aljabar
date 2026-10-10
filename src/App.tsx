import { lazy, Suspense, useEffect, useState } from "react";
import "katex/dist/katex.min.css";
import { getPageFromPath, getPathFromPage } from "./types/navigation";
import type { Page, Navigate } from "./types/navigation";
import { SiteHeader, SiteFooter, SEOHead } from "./components";
import { getMaterialBySlug } from "./materi";

const HomePage = lazy(() =>
  import("./pages/HomePage").then((m) => ({ default: m.HomePage })),
);
const CatalogPage = lazy(() =>
  import("./pages/CatalogPage").then((m) => ({ default: m.CatalogPage })),
);
const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const DownloadPage = lazy(() =>
  import("./pages/DownloadPage").then((m) => ({ default: m.DownloadPage })),
);
const BankSoalDownloadPage = lazy(() =>
  import("./pages/BankSoalDownloadPage").then((m) => ({
    default: m.BankSoalDownloadPage,
  })),
);
const PracticePage = lazy(() =>
  import("./pages/PracticePage").then((m) => ({ default: m.PracticePage })),
);
const TkaExamPage = lazy(() =>
  import("./pages/TkaExamPage").then((m) => ({ default: m.TkaExamPage })),
);
const PracticeExercisePage = lazy(() =>
  import("./pages/PracticeExercisePage").then((m) => ({
    default: m.PracticeExercisePage,
  })),
);
const SimulationPage = lazy(() =>
  import("./pages/SimulationPage").then((m) => ({ default: m.SimulationPage })),
);
const SimulationPlayPage = lazy(() =>
  import("./pages/SimulationPlayPage").then((m) => ({
    default: m.SimulationPlayPage,
  })),
);
const ShopPage = lazy(() =>
  import("./pages/ShopPage").then((m) => ({ default: m.ShopPage })),
);
const ShopPreviewPage = lazy(() =>
  import("./pages/ShopPreviewPage").then((m) => ({
    default: m.ShopPreviewPage,
  })),
);
const LessonPage = lazy(() =>
  import("./pages/LessonPage").then((m) => ({ default: m.LessonPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

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
    page !== "practice" &&
    page !== "practice-tka-paket1" &&
    page !== "practice-eksponensial" &&
    page !== "practice-barisan-deret" &&
    page !== "practice-vektor" &&
    page !== "practice-sppl" &&
    page !== "practice-fungsi-kuadrat" &&
    page !== "practice-perbandingan-trigonometri" &&
    page !== "practice-peluang" &&
    page !== "practice-statistika" &&
    page !== "practice-transformasi-geometri" &&
    page !== "practice-polinomial" &&
    page !== "practice-matriks" &&
    page !== "practice-lingkaran" &&
    page !== "practice-komposisi-fungsi-dan-invers" &&
    page !== "practice-turunan" &&
    page !== "practice-fungsi-pemodelan" &&
    page !== "practice-transformasi-fungsi" &&
    page !== "practice-kombinatorika" &&
    page !== "practice-irisan-kerucut" &&
    page !== "practice-integral" &&
    page !== "practice-analisis-data-peluang" &&
    page !== "practice-limit" &&
    page !== "practice-bilangan-kompleks" &&
    page !== "simulation" &&
    page !== "simulation-play" &&
    page !== "shop" &&
    page !== "shop-preview" &&
    page !== "not-found" &&
    page !== "about";
  const material = isMaterialPage ? getMaterialBySlug(page) : undefined;
  const isNotFoundPage = page === "not-found" || (isMaterialPage && !material);
  const resolvedPage = isNotFoundPage ? "not-found" : page;

  return (
    <>
      <SEOHead page={resolvedPage} />
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
        page={resolvedPage}
        navigate={navigate}
        showTocButton={isMaterialPage && !isNotFoundPage}
        isTocOpen={mobileTocOpen}
        onToggleToc={() => setMobileTocOpen(!mobileTocOpen)}
      />
      <Suspense fallback={null}>
        {page === "home" && <HomePage navigate={navigate} />}
        {page === "catalog" && <CatalogPage navigate={navigate} />}
        {page === "download" && <DownloadPage navigate={navigate} />}
        {page === "bank-download" && (
          <BankSoalDownloadPage navigate={navigate} />
        )}
        {page === "practice" && <PracticePage navigate={navigate} />}
        {page === "practice-tka-paket1" && <TkaExamPage navigate={navigate} />}
        {page === "practice-eksponensial" && (
          <PracticeExercisePage navigate={navigate} exercise="eksponensial" />
        )}
        {page === "practice-barisan-deret" && (
          <PracticeExercisePage navigate={navigate} exercise="barisan-deret" />
        )}
        {page === "practice-vektor" && (
          <PracticeExercisePage navigate={navigate} exercise="vektor" />
        )}
        {page === "practice-sppl" && (
          <PracticeExercisePage navigate={navigate} exercise="sppl" />
        )}
        {page === "practice-fungsi-kuadrat" && (
          <PracticeExercisePage navigate={navigate} exercise="fungsi-kuadrat" />
        )}
        {page === "practice-perbandingan-trigonometri" && (
          <PracticeExercisePage
            navigate={navigate}
            exercise="perbandingan-trigonometri"
          />
        )}
        {page === "practice-peluang" && (
          <PracticeExercisePage navigate={navigate} exercise="peluang" />
        )}
        {page === "practice-statistika" && (
          <PracticeExercisePage navigate={navigate} exercise="statistika" />
        )}
        {page === "practice-transformasi-geometri" && (
          <PracticeExercisePage
            navigate={navigate}
            exercise="transformasi-geometri"
          />
        )}
        {page === "practice-polinomial" && (
          <PracticeExercisePage navigate={navigate} exercise="polinomial" />
        )}
        {page === "practice-matriks" && (
          <PracticeExercisePage navigate={navigate} exercise="matriks" />
        )}
        {page === "practice-lingkaran" && (
          <PracticeExercisePage navigate={navigate} exercise="lingkaran" />
        )}
        {page === "practice-komposisi-fungsi-dan-invers" && (
          <PracticeExercisePage
            navigate={navigate}
            exercise="komposisi-fungsi-dan-invers"
          />
        )}
        {page === "practice-turunan" && (
          <PracticeExercisePage navigate={navigate} exercise="turunan" />
        )}
        {page === "practice-fungsi-pemodelan" && (
          <PracticeExercisePage
            navigate={navigate}
            exercise="fungsi-pemodelan"
          />
        )}
        {page === "practice-transformasi-fungsi" && (
          <PracticeExercisePage
            navigate={navigate}
            exercise="transformasi-fungsi"
          />
        )}
        {page === "practice-kombinatorika" && (
          <PracticeExercisePage navigate={navigate} exercise="kombinatorika" />
        )}
        {page === "practice-irisan-kerucut" && (
          <PracticeExercisePage navigate={navigate} exercise="irisan-kerucut" />
        )}
        {page === "practice-integral" && (
          <PracticeExercisePage navigate={navigate} exercise="integral" />
        )}
        {page === "practice-analisis-data-peluang" && (
          <PracticeExercisePage
            navigate={navigate}
            exercise="analisis-data-peluang"
          />
        )}
        {page === "practice-limit" && (
          <PracticeExercisePage navigate={navigate} exercise="limit" />
        )}
        {page === "practice-bilangan-kompleks" && (
          <PracticeExercisePage
            navigate={navigate}
            exercise="bilangan-kompleks"
          />
        )}
        {page === "simulation" && <SimulationPage navigate={navigate} />}
        {page === "simulation-play" && (
          <SimulationPlayPage navigate={navigate} />
        )}
        {page === "shop" && <ShopPage navigate={navigate} />}
        {page === "shop-preview" && <ShopPreviewPage navigate={navigate} />}
        {isNotFoundPage && <NotFoundPage navigate={navigate} />}
        {page === "about" && <AboutPage navigate={navigate} />}
        {isMaterialPage && !isNotFoundPage && (
          <LessonPage
            slug={page}
            navigate={navigate}
            mobileTocOpen={mobileTocOpen}
            setMobileTocOpen={setMobileTocOpen}
          />
        )}
      </Suspense>
      <SiteFooter navigate={navigate} />
    </>
  );
}

export default App;
