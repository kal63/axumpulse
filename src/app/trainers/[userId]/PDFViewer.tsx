'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2 } from 'lucide-react';
import { getImageUrl } from '@/lib/upload-utils';

// Configure PDF.js worker at module level to ensure it's set before component renders
// Match the version that react-pdf is using (5.4.296)
if (typeof window !== 'undefined') {
  // react-pdf uses pdfjs-dist 5.4.296, so we must use the same version for the worker
  // Using unpkg CDN with the exact version that matches react-pdf
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;
  
  console.log('[PDFViewer] PDF.js worker configured:', pdfjs.GlobalWorkerOptions.workerSrc, 'API version:', pdfjs.version);
}

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
}

export function PDFViewer({ fileUrl, fileName }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const fullUrl = getImageUrl(fileUrl) || fileUrl;

  useEffect(() => {
    console.log('[PDFViewer] Original URL:', fileUrl);
    console.log('[PDFViewer] Processed URL:', fullUrl);
  }, [fileUrl, fullUrl]);

  useEffect(() => {
    const updateWidth = () => {
      setContainerWidth(Math.min(1200, window.innerWidth - 64));
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error, 'URL:', fullUrl);
    setError('Failed to load PDF document. You can download it instead.');
    setLoading(false);
  }

  return (
    <div className="w-full bg-slate-900 rounded-lg overflow-hidden">
      <div 
        className="pdf-viewer-container overflow-auto max-h-[800px]"
        style={{ 
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <Document
          file={fullUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          }
          className="flex flex-col items-center py-4"
        >
          {numPages && Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={containerWidth}
              className="mb-4 shadow-lg"
            />
          ))}
        </Document>
      </div>
      {error && (
        <div className="flex flex-col items-center justify-center py-20 text-red-400">
          <p className="mb-4">{error}</p>
          <a
            href={fullUrl}
            download={fileName}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download PDF
          </a>
        </div>
      )}
    </div>
  );
}

