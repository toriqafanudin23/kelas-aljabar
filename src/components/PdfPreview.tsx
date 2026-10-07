import { useEffect, useRef, useState } from "react";
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
  type RenderTask,
} from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import "./PdfPreview.css";

GlobalWorkerOptions.workerSrc = workerUrl;

interface PdfPreviewProps {
  url: string;
  title: string;
}

export function PdfPreview({ url, title }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageViewportRef = useRef<HTMLDivElement>(null);
  const [documentProxy, setDocumentProxy] = useState<PDFDocumentProxy | null>(
    null,
  );
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    const loadingTask = getDocument({ url });
    setDocumentProxy(null);
    setPageNumber(1);
    setPageCount(0);
    setIsLoading(true);
    setError("");

    loadingTask.promise
      .then((document) => {
        if (!isActive) {
          return;
        }
        setDocumentProxy(document);
        setPageCount(document.numPages);
      })
      .catch(() => {
        if (isActive) {
          setError("PDF tidak dapat dimuat. Silakan coba lagi nanti.");
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
      void loadingTask.destroy();
    };
  }, [url]);

  useEffect(() => {
    const document = documentProxy;
    const canvas = canvasRef.current;
    const viewportElement = pageViewportRef.current;
    if (!document || !canvas || !viewportElement) return;

    let isActive = true;
    let renderTask: RenderTask | null = null;
    let renderVersion = 0;

    const renderPage = async () => {
      const version = ++renderVersion;
      renderTask?.cancel();

      try {
        const page = await document.getPage(pageNumber);
        if (!isActive || version !== renderVersion) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(1, viewportElement.clientWidth);
        const scale = (availableWidth / baseViewport.width) * zoom;
        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas tidak tersedia.");

        canvas.width = Math.ceil(viewport.width * outputScale);
        canvas.height = Math.ceil(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        setIsLoading(true);

        renderTask = page.render({
          canvas,
          canvasContext: context,
          viewport,
          transform:
            outputScale === 1
              ? undefined
              : [outputScale, 0, 0, outputScale, 0, 0],
          background: "#ffffff",
        });
        await renderTask.promise;
        if (isActive && version === renderVersion) setIsLoading(false);
      } catch (renderError) {
        const wasCancelled =
          renderError instanceof Error &&
          renderError.name === "RenderingCancelledException";
        if (isActive && version === renderVersion && !wasCancelled) {
          setError("Halaman PDF tidak dapat ditampilkan.");
          setIsLoading(false);
        }
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      void renderPage();
    });
    resizeObserver.observe(viewportElement);
    void renderPage();

    return () => {
      isActive = false;
      resizeObserver.disconnect();
      renderTask?.cancel();
    };
  }, [documentProxy, pageNumber, zoom]);

  const changeZoom = (amount: number) => {
    setZoom((current) => Math.min(1.8, Math.max(0.7, current + amount)));
  };

  return (
    <div className="pdf-preview">
      <div className="pdf-preview-toolbar" aria-label="Kontrol pratinjau PDF">
        <div className="pdf-preview-page-controls">
          <button
            type="button"
            className="pdf-preview-icon-button"
            aria-label="Halaman sebelumnya"
            title="Halaman sebelumnya"
            disabled={pageNumber <= 1 || isLoading}
            onClick={() => setPageNumber((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
          <span className="pdf-preview-page-count" aria-live="polite">
            {pageCount ? `${pageNumber} / ${pageCount}` : "– / –"}
          </span>
          <button
            type="button"
            className="pdf-preview-icon-button"
            aria-label="Halaman berikutnya"
            title="Halaman berikutnya"
            disabled={pageNumber >= pageCount || isLoading}
            onClick={() =>
              setPageNumber((current) => Math.min(pageCount, current + 1))
            }
          >
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
        <div className="pdf-preview-zoom-controls">
          <button
            type="button"
            className="pdf-preview-icon-button"
            aria-label="Perkecil tampilan"
            title="Perkecil tampilan"
            disabled={zoom <= 0.7 || isLoading}
            onClick={() => changeZoom(-0.1)}
          >
            <Minus size={15} aria-hidden="true" />
          </button>
          <span className="pdf-preview-zoom-value">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="pdf-preview-icon-button"
            aria-label="Perbesar tampilan"
            title="Perbesar tampilan"
            disabled={zoom >= 1.8 || isLoading}
            onClick={() => changeZoom(0.1)}
          >
            <Plus size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="pdf-preview-viewport" ref={pageViewportRef}>
        {isLoading && !error && (
          <div className="pdf-preview-status" role="status">
            Memuat pratinjau…
          </div>
        )}
        {error ? (
          <div className="pdf-preview-status pdf-preview-error" role="alert">
            {error}
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            aria-label={`${title}, halaman ${pageNumber}`}
          />
        )}
      </div>
    </div>
  );
}
