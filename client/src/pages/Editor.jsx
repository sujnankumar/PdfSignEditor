import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PDFViewer from '../components/PDFViewer';
import DraggableField from '../components/DraggableField';
import SignaturePad from '../components/SignaturePad';
import ImageUpload from '../components/ImageUpload';
import InsertMenu from '../components/InsertMenu';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, Plus, Download } from 'lucide-react';
import '../App.css';

function Editor() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle uploaded file: create blob URL and store raw file for signing
  const uploadedFile = location.state?.file;
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfData, setPdfData] = useState(null); // Store for backend

  const workspaceRef = React.useRef(null);

  const [effectiveScale, setEffectiveScale] = useState(1);

  // Create blob URL from uploaded file or use sample
  React.useEffect(() => {
    if (uploadedFile && uploadedFile instanceof File) {
      const url = URL.createObjectURL(uploadedFile);
      setPdfFile(url);
      
      // Read file as base64 for backend
      const reader = new FileReader();
      reader.onload = () => {
        setPdfData(reader.result);
      };
      reader.readAsDataURL(uploadedFile);
      
      return () => URL.revokeObjectURL(url);
    } else {
      setPdfFile('/sample.pdf');
      setPdfData(null); // Will use sample on backend
    }
  }, [uploadedFile]);

  const [pdfDimensions, setPdfDimensions] = useState(null);
  const [fields, setFields] = useState([]); 
  const [selectedField, setSelectedField] = useState(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureImage, setSignatureImage] = useState(null);
  const [scaleMode, setScaleMode] = useState('auto');
  const [scaleValue, setScaleValue] = useState(1.0);
  const [debugMode, setDebugMode] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showZoomControls, setShowZoomControls] = useState(true); // Always show
  const [isZoomCollapsed, setIsZoomCollapsed] = useState(false); // Start expanded
  const [zoomControlPos, setZoomControlPos] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState(null);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log(`Document loaded with ${numPages} pages`);
    setNumPages(numPages);
  };

  const handleZoomControlMouseDown = (e) => {
    if (e.target.closest('.zoom-btn')) return;
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleZoomControlTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStartTime(Date.now());
    setIsLongPressing(false);
    
    // Set up long-press timer
    const longPressTimer = setTimeout(() => {
      // Long press detected - start drag mode
      setIsLongPressing(true);
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      
      // Prevent scrolling
      if (e.cancelable) {
        e.preventDefault();
      }
    }, 500); // 500ms long press threshold
    
    // Store timer ID to clear it if touch ends early
    e.currentTarget.longPressTimer = longPressTimer;
  };

  const handleZoomControlMouseMove = (e) => {
    if (!isDragging) return;
    
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;
    
    const controlWidth = isZoomCollapsed ? 60 : 280;
    const controlHeight = 50;
    const padding = 10;
    const maxX = window.innerWidth - controlWidth - padding;
    const maxY = window.innerHeight - controlHeight - padding;
    
    newX = Math.max(padding, Math.min(newX, maxX));
    newY = Math.max(padding, Math.min(newY, maxY));
    
    setZoomControlPos({ x: newX, y: newY });
  };

  const handleZoomControlTouchMove = (e) => {
    if (!isDragging || !isLongPressing) return;
    
    // Prevent background scrolling
    if (e.cancelable) {
      e.preventDefault();
    }
    
    const touch = e.touches[0];
    let newX = touch.clientX - dragOffset.x;
    let newY = touch.clientY - dragOffset.y;
    
    const controlWidth = isZoomCollapsed ? 60 : 280;
    const controlHeight = 50;
    const padding = 10;
    const maxX = window.innerWidth - controlWidth - padding;
    const maxY = window.innerHeight - controlHeight - padding;
    
    newX = Math.max(padding, Math.min(newX, maxX));
    newY = Math.max(padding, Math.min(newY, maxY));
    
    setZoomControlPos({ x: newX, y: newY });
  };

  const handleZoomControlMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomControlTouchEnd = (e) => {
    // Clear long press timer if it exists
    if (e.currentTarget.longPressTimer) {
      clearTimeout(e.currentTarget.longPressTimer);
    }
    
    const touchDuration = Date.now() - touchStartTime;
    
    // If it was a quick tap (not a long press), allow button clicks
    if (touchDuration < 500 && !isLongPressing) {
      // Normal tap - button click will handle it
      setIsDragging(false);
      setIsLongPressing(false);
      return;
    }
    
    // End drag mode
    setIsDragging(false);
    setIsLongPressing(false);
  };

  // Handle window resize to keep control in bounds
  React.useEffect(() => {
    const handleResize = () => {
      if (zoomControlPos.x !== null) {
        const controlWidth = isZoomCollapsed ? 60 : 280;
        const controlHeight = 50;
        const padding = 10;
        
        const maxX = window.innerWidth - controlWidth - padding;
        const maxY = window.innerHeight - controlHeight - padding;
        
        setZoomControlPos(prev => ({
          x: Math.max(padding, Math.min(prev.x, maxX)),
          y: Math.max(padding, Math.min(prev.y, maxY))
        }));
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [zoomControlPos, isZoomCollapsed]);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleZoomControlMouseMove);
      window.addEventListener('mouseup', handleZoomControlMouseUp);
      window.addEventListener('touchmove', handleZoomControlTouchMove);
      window.addEventListener('touchend', handleZoomControlTouchEnd);
      return () => {
        window.removeEventListener('mousemove', handleZoomControlMouseMove);
        window.removeEventListener('mouseup', handleZoomControlMouseUp);
        window.removeEventListener('touchmove', handleZoomControlTouchMove);
        window.removeEventListener('touchend', handleZoomControlTouchEnd);
      };
    }
  }, [isDragging, dragOffset, isZoomCollapsed]);

  const onPageLoadSuccess = (page) => {
    // Rely on PDFViewer callback
  };

  const updatePdfDimensions = (width, height, originalWidth) => {
      setPdfDimensions({ width, height });
      if (originalWidth) {
          setEffectiveScale(width / originalWidth);
      }
  };

  const addField = (type, attributes = {}) => {
      if (type === 'signature' && !signatureImage) {
          setShowSignaturePad(true);
          return;
      }
      
      const id = Date.now().toString();
      // Default positions and values based on type
      let rect = { x: 0.4, y: 0.4, w: 0.2, h: 0.05 };
      let defaultValue = '';
      
      switch(type) {
          case 'text':
              rect = { x: 0.4, y: 0.4, w: 0.15, h: 0.03 };
              defaultValue = 'Text Field';
              break;
          case 'date':
              rect = { x: 0.4, y: 0.4, w: 0.12, h: 0.03 };
              const format = attributes.format || 'MM/DD/YYYY';
              defaultValue = new Date().toLocaleDateString('en-US');
              break;
          case 'radio':
              rect = { x: 0.4, y: 0.4, w: 0.04, h: 0.04 };
              defaultValue = attributes.defaultChecked ? 'true' : 'false';
              break;
          case 'image':
              rect = { x: 0.4, y: 0.4, w: 0.15, h: 0.15 };
              defaultValue = null; // Will be set after image upload
              setShowImageUpload(true);
              return; // Exit early, will add field after upload
          case 'signature':
              rect = { x: 0.4, y: 0.4, w: 0.2, h: 0.05 };
              defaultValue = signatureImage;
              break;
      }
      
      const newField = {
          id,
          type,
          pageNumber: currentPage, // Use current page instead of hardcoded 1
          value: defaultValue,
          rect,
          attributes // Store attributes for field customization
      };
      
      setFields([...fields, newField]);
      if(type === 'signature') setSignatureImage(null);
  };
  
  const handleZoomIn = () => {
    if (isLongPressing) return; // Ignore clicks during drag
    if (scaleMode === 'auto') {
      setScaleMode('manual');
      setScaleValue(Math.min(effectiveScale + 0.1, 3));
    } else {
      setScaleValue(prev => Math.min(prev + 0.1, 3));
    }
  };

  const handleZoomOut = () => {
    if (isLongPressing) return; // Ignore clicks during drag
    if (scaleMode === 'auto') {
      setScaleMode('manual');
      setScaleValue(Math.max(effectiveScale - 0.1, 0.5));
    } else {
      setScaleValue(prev => Math.max(prev - 0.1, 0.5));
    }
  };

  
  const handleResetZoom = () => {
      setScaleMode('auto');
      setScaleValue(1.0);
      if (workspaceRef.current) {
        workspaceRef.current.scrollLeft = 0;
        workspaceRef.current.scrollTop = 0;
      }
  };

  const updateField = (id, newNormalizedPos) => {
      setFields(fields.map(f => f.id === id ? { ...f, rect: newNormalizedPos } : f));
  };

  const removeField = (id) => {
      setFields(fields.filter(f => f.id !== id));
      if (selectedField === id) setSelectedField(null);
  };

  const handleSaveSignature = (dataUrl) => {
    setSignatureImage(dataUrl);
    setShowSignaturePad(false);
    const id = Date.now().toString();
    const newField = {
        id,
        type: 'signature',
        pageNumber: currentPage, // Use current page
        value: dataUrl,
        rect: { x: 0.35, y: 0.4, w: 0.3, h: 0.1 } 
    };
    setFields([...fields, newField]);
    setSignatureImage(null);
  };

  const savePdf = async () => {
    // Allow saving with any fields, not just signature
    if (fields.length === 0) {
        alert("Please add at least one field to the PDF");
        return;
    }

    try {
        // Send ALL fields to backend for burn-in
        const response = await fetch('http://localhost:5000/sign-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pdfId: pdfData ? 'uploaded' : 'sample',
                pdfData: pdfData,
                fields: fields.map(f => ({ // Send all fields
                    type: f.type,
                    value: f.value,
                    rect: f.rect,
                    pageNumber: f.pageNumber
                }))
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url);
        } else {
            console.error('Failed to sign');
            alert('Failed to sign PDF');
        }
    } catch (e) {
        console.error(e);
        alert('Error signing PDF');
    }
  };

  const updateFieldValue = (id, newValue) => {
      setFields(fields.map(f => f.id === id ? { ...f, value: newValue } : f));
  };

  const handleImageUpload = (imageDataUrl) => {
      setShowImageUpload(false);
      const id = Date.now().toString();
      const newField = {
          id,
          type: 'image',
          pageNumber: currentPage,
          value: imageDataUrl,
          rect: { x: 0.35, y: 0.4, w: 0.15, h: 0.15 }
      };
      setFields([...fields, newField]);
  };

  // Handle right-click to show insert menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    
    // Approximate menu dimensions
    const menuWidth = 380;
    const menuHeight = 500;
    const padding = 10;
    
    // Calculate position ensuring menu stays within viewport
    let x = e.clientX;
    let y = e.clientY;
    
    // Check right boundary
    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }
    
    // Check bottom boundary
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }
    
    // Ensure menu doesn't go off left or top
    x = Math.max(padding, x);
    y = Math.max(padding, y);
    
    setContextMenuPos({ x, y });
    setShowInsertMenu(true);
  };

  // Close context menu when clicking elsewhere
  const handleCloseContextMenu = () => {
    setShowInsertMenu(false);
    setContextMenuPos(null);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
            <button className="icon-btn back-btn" onClick={() => navigate('/')}>
                <ArrowLeft size={20} />
            </button>
            <div className="brand-section">
                <h1>BoloSign Editor</h1>
            </div>
        </div>
        
        {/* Desktop Toolbar */}
        <div className="toolbar desktop-toolbar">
             <div className="insert-button-wrapper">
                 <button 
                     className="insert-btn" 
                     onClick={() => {
                       setContextMenuPos(null);
                       setShowInsertMenu(!showInsertMenu);
                     }}
                     title="Insert Field"
                 >
                     <Plus size={18} style={{marginRight: 6}}/> Insert
                 </button>
                 {showInsertMenu && (
                     <InsertMenu 
                         onInsertField={(type, attrs) => {
                           addField(type, attrs);
                           handleCloseContextMenu();
                         }}
                         onClose={handleCloseContextMenu}
                         isMobile={false}
                         currentPage={currentPage}
                         contextMenuPos={contextMenuPos}
                     />
                 )}
             </div>
             
             {numPages > 1 && (
                 <>
                 <div className="divider"></div>
                 <div className="page-selector">
                     <span>Page</span>
                     <select 
                         value={currentPage} 
                         onChange={(e) => setCurrentPage(Number(e.target.value))}
                     >
                         {Array.from({length: numPages}, (_, i) => (
                             <option key={i+1} value={i+1}>{i+1} / {numPages}</option>
                         ))}
                     </select>
                 </div>
                 </>
             )}
             
             <div className="divider"></div>
             
             <button className="save-btn" onClick={savePdf}>
                 <Download size={16} style={{marginRight: 6}}/> Export
             </button>
        </div>

      {/* Mobile Menu Button - Now shows Insert directly */}
      <div className="mobile-header-actions">
          <button 
              className="mobile-insert-fab" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              title="Insert Field"
          >
              <Plus size={24} />
          </button>
      </div>
      </header>

      {/* Mobile Insert Menu */}
      {showMobileMenu && (
          <InsertMenu 
              onInsertField={(type, attrs) => {
                  addField(type, attrs);
                  setShowMobileMenu(false);
              }}
              onClose={() => setShowMobileMenu(false)}
              isMobile={true}
              currentPage={currentPage}
          />
      )}

      {/* Mobile Bottom Toolbar */}
      <div className="mobile-bottom-toolbar">
          <div className="mobile-toolbar-section">
              {numPages > 1 && (
                  <div className="mobile-page-nav">
                      <button 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="page-nav-btn"
                      >
                          ‹
                      </button>
                      <span className="page-indicator">{currentPage} / {numPages}</span>
                      <button 
                          onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                          disabled={currentPage === numPages}
                          className="page-nav-btn"
                      >
                          ›
                      </button>
                  </div>
              )}
          </div>
          <button className="mobile-export-btn" onClick={savePdf}>
              <Download size={20} />
              <span>Export</span>
          </button>
      </div>

      {/* Floating Zoom Controls - Always Visible */}
      {showZoomControls && (
          <div 
              className={`floating-zoom-controls ${isZoomCollapsed ? 'collapsed' : ''} ${isDragging ? 'dragging' : ''}`}
              style={{
                  ...(zoomControlPos.x !== null && {
                      left: `${zoomControlPos.x}px`,
                      top: `${zoomControlPos.y}px`,
                      transform: 'none'
                  })
              }}
              onMouseDown={handleZoomControlMouseDown}
              onTouchStart={handleZoomControlTouchStart}
          >
              {!isZoomCollapsed && (
                  <>
                      <button onClick={handleZoomOut} className="zoom-btn">
                          <ZoomOut size={24}/>
                      </button>
                      <span className="zoom-display">{scaleMode === 'auto' ? 'Auto' : `${Math.round(scaleValue * 100)}%`}</span>
                      <button onClick={handleZoomIn} className="zoom-btn">
                          <ZoomIn size={24}/>
                      </button>
                      <button onClick={handleResetZoom} className="zoom-btn fit">
                          <Maximize size={24}/>
                      </button>
                  </>
              )}
              <button 
                  onClick={() => setIsZoomCollapsed(!isZoomCollapsed)} 
                  className="zoom-btn toggle"
                  title={isZoomCollapsed ? "Expand" : "Collapse"}
              >
                  {isZoomCollapsed ? '›' : '‹'}
              </button>
          </div>
      )}
      
      
      <main className="pdf-workspace" ref={workspaceRef} onContextMenu={handleContextMenu}>
        <div className="pdf-wrapper" style={{ position: 'relative' }}>
           <PDFViewer 
              file={pdfFile}
              pageNumber={currentPage}
              workspaceRef={workspaceRef}   
              onDocumentLoadSuccess={onDocumentLoadSuccess}
              onPageLoadSuccess={onPageLoadSuccess}
              onDimensionsChange={updatePdfDimensions}
              scaleMode={scaleMode}
              scaleValue={scaleValue}
           />
           
           {/* Debug Overlay */}
           {debugMode && pdfDimensions && (
               <div className="debug-overlay" style={{
                   width: pdfDimensions.width, height: pdfDimensions.height,
                   backgroundSize: `${pdfDimensions.width * 0.1}px ${pdfDimensions.height * 0.1}px`,
               }}>
                   <div className="debug-info">W: {Math.round(pdfDimensions.width)}px, H: {Math.round(pdfDimensions.height)}px</div>
               </div>
           )}

           {pdfDimensions && fields
               .filter(field => field.pageNumber === currentPage)
               .map(field => (
               <DraggableField
                 key={field.id}
                 id={field.id}
                 type={field.type}
                 value={field.value}
                 initialPos={field.rect} 
                 pageNumber={field.pageNumber}
                 pdfDimensions={pdfDimensions}
                 onUpdate={(id, newRect) => updateField(id, newRect)} 
                 onValueChange={updateFieldValue}
                 onRemove={removeField}
                 selected={selectedField === field.id}
                 onSelect={setSelectedField}
               />
           ))}
        </div>
      </main>

      {showSignaturePad && (
          <SignaturePad 
            onSave={handleSaveSignature}
            onCancel={() => setShowSignaturePad(false)}
          />
      )}
      
      {showImageUpload && (
          <ImageUpload 
            onUpload={handleImageUpload}
            onCancel={() => setShowImageUpload(false)}
          />
      )}
    </div>
  );
}

export default Editor;
