import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, ArrowRight } from 'lucide-react';
import '../App.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFiles(files[0]);
    }
  };

  const handleFiles = (file) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.');
      return;
    }
    
    // Pass the File object via navigation state
    // Editor.jsx will handle creating blob URL and reading for backend
    navigate('/editor', { state: { file } });
  };

  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="brand">
           <div className="logo-circle"><FileText size={24} color="white"/></div>
           <h1>pdfSignEditor</h1>
        </div>
        
        <h2 className="hero-title">Sign Documents with Confidence</h2>
        <p className="hero-subtitle">Fast, Secure, and Pixel-Perfect E-Signatures.</p>
        
        <div 
          className={`upload-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
           <Upload size={48} className="upload-icon" />
           <h3>Drop your PDF here</h3>
           <p>or click to browse</p>
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileSelect} 
             accept="application/pdf" 
             hidden 
           />
        </div>
        
        <div className="demo-actions">
           <button className="secondary-btn" onClick={() => navigate('/editor')}>
              Try Sample Document <ArrowRight size={16} style={{marginLeft: 8}}/>
           </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
