import React, { useRef, useState, useEffect } from 'react';

const SignaturePad = ({ onSave, onCancel, attributes = {} }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size to match display size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Apply pen attributes from Insert menu
    const penThicknessMap = {
      thin: 1.5,
      medium: 2.5,
      thick: 4
    };
    
    ctx.lineWidth = penThicknessMap[attributes.penThickness] || 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = attributes.penColor || '#000000';
  }, [attributes.penColor, attributes.penThickness]);

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
          background: 'linear-gradient(to bottom, #1a1a1a, #111)',
          padding: '0',
          borderRadius: '16px',
          width: '600px', 
          maxWidth: '95%',
          border: '1px solid #333',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #2a2a2a',
          background: 'linear-gradient(to bottom, rgba(30, 30, 30, 0.5), transparent)'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 600,
            color: '#f0f0f0',
            letterSpacing: '-0.01em'
          }}>Draw Your Signature</h3>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '0.85rem',
            color: '#888'
          }}>Sign in the box below</p>
        </div>

        {/* Canvas Area */}
        <div style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            border: '2px dashed rgba(59, 130, 246, 0.3)', 
            borderRadius: '12px',
            width: '100%',
            aspectRatio: '2.5 / 1',
            background: 'rgba(255, 255, 255, 0.03)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%', 
                height: '100%', 
                cursor: 'crosshair',
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

          {/* Action Buttons */}
          <div style={{
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'space-between', 
            gap: '12px',
            paddingTop: '8px'
          }}>
            <button 
              onClick={clear}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#e0e0e0',
                border: '1px solid #333',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                flex: '1 1 auto',
                minWidth: '80px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.borderColor = '#444';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = '#333';
              }}
            >
              Clear
            </button>
            <button 
              onClick={onCancel}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#e0e0e0',
                border: '1px solid #333',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                flex: '1 1 auto',
                minWidth: '80px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.borderColor = '#444';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.borderColor = '#333';
              }}
            >
              Cancel
            </button>
            <button 
              onClick={save} 
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(59, 130, 246, 0.15))',
                color: '#f0f0f0',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                flex: '1 1 auto',
                minWidth: '140px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(59, 130, 246, 0.25))';
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(59, 130, 246, 0.15))';
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)';
              }}
            >
              Save Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
