import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PDFViewer from '../components/PDFViewer';
import DraggableField from '../components/DraggableField';
import SignaturePad from '../components/SignaturePad';
import ImageUpload from '../components/ImageUpload';
import { ArrowLeft, ZoomIn, ZoomOut, Maximize, FileText, PenTool, Bug, Save } from 'lucide-react';
import '../App.css';

function Editor() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle uploaded file: create blob URL and store raw file for signing
  const uploadedFile = location.state?.file;
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfData, setPdfData] = useState(null); // Store for backend

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

  const onDocumentLoadSuccess = ({ numPages }) => {
    console.log(`Document loaded with ${numPages} pages`);
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page) => {
    // Rely on PDFViewer callback
  };

  const updatePdfDimensions = (width, height) => {
      setPdfDimensions({ width, height });
  };

  const addField = (type) => {
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
              defaultValue = new Date().toLocaleDateString('en-US');
              break;
          case 'radio':
              rect = { x: 0.4, y: 0.4, w: 0.04, h: 0.04 };
              defaultValue = 'false'; // not selected by default
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
          pageNumber: 1, 
          value: defaultValue,
          rect 
      };
      
      setFields([...fields, newField]);
      if(type === 'signature') setSignatureImage(null);
  };
  
  const handleZoomIn = () => {
    setScaleMode('manual');
    setScaleValue(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScaleMode('manual');
    setScaleValue(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const handleResetZoom = () => {
      setScaleMode('auto');
      setScaleValue(1.0);
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
        pageNumber: 1,
        value: dataUrl,
        rect: { x: 0.35, y: 0.4, w: 0.3, h: 0.1 } 
    };
    setFields([...fields, newField]);
    setSignatureImage(null);
  };

  const savePdf = async () => {
    const sigField = fields.find(f => f.type === 'signature');
    if (!sigField) {
        alert("Please add a signature first");
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

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <button className="icon-btn" onClick={() => navigate('/')}>
                <ArrowLeft size={20} />
            </button>
            <h1>BoloSign Editor</h1>
        </div>
        
        <div className="toolbar">
             <button onClick={() => addField('signature')} title="Add Signature">
                 <PenTool size={16} style={{marginRight: 6}}/> Signature
             </button>
             <button onClick={() => addField('text')} title="Add Text">
                 <FileText size={16} style={{marginRight: 6}}/> Text
             </button>
             <button onClick={() => addField('date')} title="Add Date">
                 📅 Date
             </button>
             <button onClick={() => addField('radio')} title="Add Radio">
                 ⭕ Radio
             </button>
             <button onClick={() => addField('image')} title="Add Image">
                 🖼️ Image
             </button>
             
             <div className="divider"></div>
             
             {numPages > 1 && (
                 <>
                 <span style={{color: '#aaa', fontSize: '0.85rem'}}>Page:</span>
                 <select 
                     value={currentPage} 
                     onChange={(e) => setCurrentPage(Number(e.target.value))}
                     style={{
                         background: '#222',
                         color: 'white',
                         border: '1px solid #444',
                         borderRadius: '4px',
                         padding: '4px 8px'
                     }}
                 >
                     {Array.from({length: numPages}, (_, i) => (
                         <option key={i+1} value={i+1}>{i+1}</option>
                     ))}
                 </select>
                 <div className="divider"></div>
                 </>
             )}
             
             
             <button onClick={handleZoomOut} className="icon-btn"><ZoomOut size={18}/></button>
             <span className="zoom-label">{scaleMode === 'auto' ? 'Auto' : `${Math.round(scaleValue * 100)}%`}</span>
             <button onClick={handleZoomIn} className="icon-btn"><ZoomIn size={18}/></button>
             <button onClick={handleResetZoom} className="icon-btn"><Maximize size={18}/></button>
             
             <div className="divider"></div>
             
             <button onClick={() => setDebugMode(!debugMode)} className={`icon-btn ${debugMode ? 'active' : ''}`}>
                 <Bug size={18}/>
             </button>
             
             <button className="primary" onClick={savePdf}>
                 <Save size={16} style={{marginRight: 6}}/> Finish
             </button>
        </div>
      </header>
      
      <main className="pdf-workspace">
        <div className="pdf-wrapper" style={{ position: 'relative' }}>
           <PDFViewer 
              file={pdfFile}
              pageNumber={currentPage}
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
