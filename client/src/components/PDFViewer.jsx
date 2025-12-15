import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PDFViewer = ({
  file,
  pageNumber = 1,
  workspaceRef,
  onDocumentLoadSuccess,
  onPageLoadSuccess,
  onDimensionsChange,
  scaleMode,
  scaleValue,
}) => {
  const [containerWidth, setContainerWidth] = useState(null);
  
  useEffect(() => {
  if (!workspaceRef?.current) return;

  const resizeObserver = new ResizeObserver(entries => {
    const { width } = entries[0].contentRect;

    // subtract left + right padding of pdf-workspace (40px + 40px)
    setContainerWidth(width - 80);
  });

  resizeObserver.observe(workspaceRef.current);
  return () => resizeObserver.disconnect();
}, [workspaceRef]);

  // Force re-render when scale mode changes
  const [renderKey, setRenderKey] = React.useState(0);
  React.useEffect(() => {
    setRenderKey(prev => prev + 1);
  }, [scaleMode, scaleValue]);

  const onPageLoad = (page) => {
      onPageLoadSuccess && onPageLoadSuccess(page);
      
      let renderedWidth, renderedHeight;
      const originalViewport = page.getViewport({ scale: 1 });

      if (scaleMode === 'manual') {
          renderedWidth = originalViewport.width * scaleValue;
          renderedHeight = originalViewport.height * scaleValue;
      } else {
          // Auto mode: fit to container width
          if (containerWidth) {
             renderedWidth = containerWidth;
             renderedHeight = originalViewport.height * (containerWidth / originalViewport.width);
          } else {
             return;
          }
      }
      
      if (onDimensionsChange) {
          onDimensionsChange(
            renderedWidth,
            renderedHeight,
            originalViewport.width
          );
      }
  };

  const pageProps = {};
  if (scaleMode === 'manual') {
      pageProps.scale = scaleValue;
  } else {
      // Auto mode: full container width
      pageProps.width = containerWidth || undefined;
  }

  return (
    <div className="pdf-container" style={{ width: 'fit-content', maxWidth: 'none',display: 'inline-block' }}>
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div style={{padding: '20px', color: '#888'}}>Loading Document...</div>}
          error={<div style={{padding: '20px', color: '#ff6b6b'}}>Failed to load PDF</div>}
        >
          <Page 
            key={renderKey}
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
