import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PDFViewer = ({ file, pageNumber = 1, onDocumentLoadSuccess, onPageLoadSuccess, onDimensionsChange, scaleMode, scaleValue, ...props }) => {
  const [containerWidth, setContainerWidth] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        setContainerWidth(width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const onPageLoad = (page) => {
      onPageLoadSuccess && onPageLoadSuccess(page);
      
      console.log('Page Load. ScaleMode:', scaleMode, 'Value:', scaleValue);
      
      let renderedWidth, renderedHeight;
      const originalViewport = page.getViewport({ scale: 1 });

      if (scaleMode === 'manual') {
          renderedWidth = originalViewport.width * scaleValue;
          renderedHeight = originalViewport.height * scaleValue;
      } else {
          if (containerWidth) {
             const scale = containerWidth / originalViewport.width;
             renderedWidth = containerWidth;
             renderedHeight = originalViewport.height * scale;
          } else {
             return;
          }
      }
      
      if (onDimensionsChange) {
          onDimensionsChange(renderedWidth, renderedHeight);
      }
  };

  const pageProps = {};
  if (scaleMode === 'manual') {
      pageProps.scale = scaleValue;
  } else {
      pageProps.width = containerWidth ? Math.min(containerWidth, 800) : undefined;
  }

  return (
    <div ref={containerRef} className="pdf-container" style={{ width: '100%', maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div style={{padding: '20px', color: '#888'}}>Loading Document...</div>}
          error={<div style={{padding: '20px', color: '#ff6b6b'}}>Failed to load PDF</div>}
        >
          <Page 
            pageNumber={pageNumber}
            {...pageProps}
            onLoadSuccess={onPageLoad}
            renderTextLayer={false} 
            renderAnnotationLayer={false}
            className="pdf-page-shadow"
          />
        </Document>
    </div>
  );
};

export default PDFViewer;
