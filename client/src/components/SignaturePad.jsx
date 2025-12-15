import React, { useRef, useState, useEffect } from 'react';
import { Palette, PenLine } from 'lucide-react';

const SignaturePad = ({ onSave, onCancel, attributes = {} }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState(attributes.penColor || '#000000');
  const [penThickness, setPenThickness] = useState(attributes.penThickness || 'medium');

  // Colors available for selection
  const colors = [
    { value: '#000000', label: 'Black' },
    { value: '#0000FF', label: 'Blue' },
    { value: '#FF0000', label: 'Red' },
    { value: '#008000', label: 'Green' }
  ];

  // Thickness options
  const thicknesses = [
    { value: 'thin', label: 'Thin', size: 1.5 },
    { value: 'medium', label: 'Medium', size: 2.5 },
    { value: 'thick', label: 'Thick', size: 4 }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size to match display size if not already set or simplified resize handling
    if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    const ctx = canvas.getContext('2d');
    
    const thicknessValue = thicknesses.find(t => t.value === penThickness)?.size || 2.5;
    
    ctx.lineWidth = thicknessValue;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round'; // smoother turns
    ctx.strokeStyle = penColor;
  }, [penColor, penThickness]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
  };

  // Touch event handlers for mobile support
  const getTouchPos = (touchEvent) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = touchEvent.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getTouchPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const handleTouchMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();
    const pos = getTouchPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ctx = canvasRef.current.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
  };

  const clear = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath(); // Reset path
  };

  const save = () => {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
  };

  return (
    <div 
      className="signature-pad-modal" 
      onClick={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.preventDefault()}
      style={{
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)', 
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '20px',
        touchAction: 'none'
    }}>
      <div className="signature-pad-container" style={{
          background: 'linear-gradient(to bottom, #1a1a1a, #0f0f0f)',
          padding: '0',
          borderRadius: '16px',
          width: '600px', 
          maxWidth: '95%',
          border: '1px solid #333',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
      }}>
        {/* Header with Tools */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #2a2a2a',
          background: '#1a1a1a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
             <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f0f0f0' }}>Sign Document</h3>
             <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#888' }}>Draw your signature below</p>
          </div>

          {/* Tools Container */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            
            {/* Color Picker */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {colors.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => setPenColor(color.value)}
                        title={color.label}
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: color.value,
                            border: penColor === color.value ? '2px solid #fff' : '2px solid transparent',
                            boxShadow: penColor === color.value ? '0 0 0 2px rgba(255,255,255,0.2)' : 'none',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'transform 0.1s',
                            transform: penColor === color.value ? 'scale(1.1)' : 'scale(1)'
                        }}
                    />
                ))}
            </div>

            <div style={{ width: '1px', height: '24px', background: '#333' }}></div>

            {/* Thickness Picker */}
            <div style={{ display: 'flex', gap: '4px', background: '#252525', padding: '2px', borderRadius: '6px' }}>
                {thicknesses.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setPenThickness(t.value)}
                        title={t.label}
                        style={{
                            padding: '4px 8px',
                            background: penThickness === t.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div style={{
                            width: '16px',
                            height: `${t.size}px`,
                            backgroundColor: penThickness === t.value ? '#fff' : '#666',
                            borderRadius: '1px'
                        }} />
                    </button>
                ))}
            </div>

          </div>
        </div>

        {/* Canvas Area */}
        <div style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          flex: 1
        }}>
          <div style={{
            border: '2px dashed #cbd5e1', // Slate-300
            borderRadius: '12px',
            width: '100%',
            aspectRatio: '2.5 / 1',
            background: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'crosshair'
          }}>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%', 
                height: '100%', 
                display: 'block',
                touchAction: 'none'
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <button 
              onClick={clear}
              style={{
                background: 'transparent',
                color: '#aaa',
                border: '1px solid #333',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                flex: '0 1 auto' // Allow shrinking but prefer natural width
              }}
              onMouseEnter={(e) => { e.target.style.color = '#fff'; e.target.style.borderColor = '#555'; }}
              onMouseLeave={(e) => { e.target.style.color = '#aaa'; e.target.style.borderColor = '#333'; }}
            >
              Clear
            </button>
            
            <div style={{ 
                display: 'flex', 
                gap: '12px', 
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                flex: '1 1 auto'
            }}>
                <button 
                onClick={onCancel}
                style={{
                    background: 'transparent',
                    color: '#e0e0e0',
                    border: '1px solid transparent',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                Cancel
                </button>
                <button 
                onClick={save} 
                style={{
                    background: '#2563eb', // Standard primary blue
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap' // Prevent text wrapping inside button
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = '#1d4ed8';
                    e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = '#2563eb';
                    e.target.style.transform = 'translateY(0)';
                }}
                >
                Use Signature
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
