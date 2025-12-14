import React, { useRef } from 'react';

const ImageUpload = ({ onUpload, onCancel }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onUpload(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#1e1e1e',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <h2 style={{color: 'white', marginTop: 0}}>Upload Image</h2>
        <p style={{color: '#888', marginBottom: '1.5rem'}}>
          Select an image to place on the PDF
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
          <button 
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Choose Image
          </button>
          <button 
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
