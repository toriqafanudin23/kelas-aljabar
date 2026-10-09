import { useEffect, useRef, useState } from "react";
import {
  GlobalWorkerOptions,
  getDocument,
  type PDFDocumentProxy,
  type RenderTask,
} from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Download, ExternalLink, Minus, Plus } from "lucide-react";
import "./PdfPreview.css";

GlobalWorkerOptions.workerSrc = workerUrl;

interface PdfPreviewProps {
  url: string;
  title: string;
}

interface PdfPageCanvasProps {
  documentProxy: PDFDocumentProxy;
  pageNumber: number;
  availableWidth: number;
  zoom: number;
  title: string;
  onError: (message: string) => void;
}

function PdfPageCanvas({
  documentProxy,
  pageNumber,
  availableWidth,
  zoom,
  title,
  onError,
}: PdfPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let isActive = true;
    let renderTask: RenderTask | null = null;

    const renderPage = async () => {
      try {
        const page = await documentProxy.getPage(pageNumber);
        if (!isActive) return;

        const baseViewport = page.getViewport({ scale: 1 });
        const scale = (availableWidth / baseViewport.width) * zoom;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) throw new Error("Canvas tidak tersedia.");

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.ceil(viewport.width * outputScale);
        canvas.height = Math.ceil(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

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
      } catch (renderError) {
        const wasCancelled =
          renderError instanceof Error &&
          renderError.name === "RenderingCancelledException";
        if (isActive && !wasCancelled) {
          onError("Halaman PDF tidak dapat ditampilkan.");
        }
      }
    };

    void renderPage();
    return () => {
      isActive = false;
      renderTask?.cancel();
    };
  }, [availableWidth, documentProxy, onError, pageNumber, title, zoom]);

  return (
    <div className="pdf-preview-page">
      <canvas ref={canvasRef} aria-label={`${title}, halaman ${pageNumber}`} />
    </div>
  );
}

export function PdfPreview({ url, title }: PdfPreviewProps) {
  const pageViewportRef = useRef<HTMLDivElement>(null);
  const [documentProxy, setDocumentProxy] = useState<PDFDocumentProxy | null>(
    null,
  );
  const [availableWidth, setAvailableWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    const loadingTask = getDocument({ url });
    setDocumentProxy(null);
    setIsLoading(true);
    setError("");

    loadingTask.promise
      .then((document) => {
        if (!isActive) {
          return;
        }
        setDocumentProxy(document);
        setIsLoading(false);
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
    const viewportElement = pageViewportRef.current;
    if (!viewportElement) return;

    const resizeObserver = new ResizeObserver(() => {
      setAvailableWidth(Math.max(1, viewportElement.clientWidth - 32));
    });
    resizeObserver.observe(viewportElement);
    setAvailableWidth(Math.max(1, viewportElement.clientWidth - 32));

    return () => resizeObserver.disconnect();
  }, []);

  const changeZoom = (amount: number) => {
    setZoom((current) => Math.min(1.8, Math.max(0.7, current + amount)));
  };

  return (
    <div className="pdf-preview">
      <div className="pdf-preview-toolbar" aria-label="Kontrol pratinjau PDF">
        <span className="pdf-preview-page-count" aria-live="polite">
          {documentProxy ? `${documentProxy.numPages} halaman` : "Memuat PDF"}
        </span>
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
        <div className="pdf-preview-file-controls">
          <a
            className="pdf-preview-icon-button"
            href={url}
            download
            aria-label="Unduh PDF"
            title="Unduh PDF"
          >
            <Download size={15} aria-hidden="true" />
          </a>
          <a
            className="pdf-preview-icon-button"
            href={url}
            target="_blank"
            rel="noreferrer"
            aria-label="Buka file PDF asli"
            title="Buka file PDF asli"
          >
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div
        className="pdf-preview-viewport"
        ref={pageViewportRef}
        aria-busy={isLoading}
      >
        {isLoading && !error && (
          <div className="pdf-preview-status" role="status">
            Memuat pratinjau…
          </div>
        )}
        {error ? (
          <div className="pdf-preview-status pdf-preview-error" role="alert">
            {error}
          </div>
        ) : documentProxy && availableWidth > 0 ? (
          <div className="pdf-preview-pages">
            {Array.from({ length: documentProxy.numPages }, (_, index) => (
              <PdfPageCanvas
                key={index + 1}
                documentProxy={documentProxy}
                pageNumber={index + 1}
                availableWidth={availableWidth}
                zoom={zoom}
                title={title}
                onError={setError}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
