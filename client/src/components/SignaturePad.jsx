import React, { useRef, useState, useEffect } from 'react';

const SignaturePad = ({ onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size to match display size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
  }, []);

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
    const pos = getTouchPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const handleTouchMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
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
    <div className="signature-pad-modal" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="signature-pad-container" style={{
          background: 'white', padding: '20px', borderRadius: '8px',
          width: '500px', maxWidth: '90%'
      }}>
        <h3>Draw your signature</h3>
        <div style={{border: '1px solid #ccc', height: '200px', width: '100%', marginBottom: '10px'}}>
             <canvas
                ref={canvasRef}
                style={{width: '100%', height: '100%', cursor: 'crosshair'}}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
             />
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
            <button onClick={clear}>Clear</button>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={save} style={{background: 'black', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px'}}>Save Signature</button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
