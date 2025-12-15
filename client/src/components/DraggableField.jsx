import React, { useState, useRef, useEffect } from 'react';
import { Rnd } from 'react-rnd';

const DraggableField = ({ 
  id, 
  type, 
  initialPos,
  pdfDimensions,
  value,
  scale = 1,
  attributes = {},
  onUpdate,
  onRemove,
  onValueChange,
  selected,
  onSelect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [lastTapTime, setLastTapTime] = useState(0);
  const textareaRef = useRef(null);
  const displayRef = useRef(null);

  // Auto-adjust height for text fields - only when content changes
  useEffect(() => {
    if (type !== 'text' || !pdfDimensions) return;
    
    const measureHeight = () => {
      const element = isEditing ? textareaRef.current : displayRef.current;
      if (!element) return;
      
      const scrollHeight = element.scrollHeight;
      const minHeight = 30 * scale; // Proportional minimum height
      const newHeight = Math.max(minHeight, scrollHeight + (4 * scale)); // Proportional padding
      
      const normalizedHeight = newHeight / pdfDimensions.height;
      
      if (Math.abs(normalizedHeight - initialPos.h) > 0.005) {
        onUpdate(id, {
          ...initialPos,
          h: normalizedHeight
        });
      }
    };
    
    measureHeight();
  }, [editValue, value, isEditing]);

  if (!pdfDimensions) return null;

  const pixelPos = {
    x: initialPos.x * pdfDimensions.width,
    y: initialPos.y * pdfDimensions.height,
    width: initialPos.w * pdfDimensions.width,
    height: initialPos.h * pdfDimensions.height,
  };

  const handleDragStop = (e, d) => {
    const newNormalized = {
      x: d.x / pdfDimensions.width,
      y: d.y / pdfDimensions.height,
      w: pixelPos.width / pdfDimensions.width,
      h: pixelPos.height / pdfDimensions.height
    };
    onUpdate(id, newNormalized);
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    const newNormalized = {
      x: position.x / pdfDimensions.width,
      y: position.y / pdfDimensions.height,
      w: parseInt(ref.style.width, 10) / pdfDimensions.width,
      h: parseInt(ref.style.height, 10) / pdfDimensions.height
    };
    onUpdate(id, newNormalized);
  };

  const handleDoubleClick = () => {
    if (type === 'text' || type === 'date') {
      setIsEditing(true);
    } else if (type === 'radio') {
      const newValue = value === 'true' ? 'false' : 'true';
      if (onValueChange) {
        onValueChange(id, newValue);
      }
    }
  };

  // Simple mobile touch handler for the overlay
  const handleMobileTap = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Just select the field on tap
    onSelect(id);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    if (onValueChange) {
      onValueChange(id, editValue);
    }
  };

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const formattedDate = date.toLocaleDateString('en-US');
    setEditValue(formattedDate);
  };

  const renderContent = () => {
    if (type === 'signature' && value) {
      return (
        <img 
          src={value} 
          alt="Signature" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none'
          }}
        />
      );
    } else if (type === 'image' && value) {
      return (
        <img 
          src={value} 
          alt="Uploaded" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none'
          }}
        />
      );
    } else if (type === 'text') {
      if (isEditing) {
        return (
          <textarea 
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleTextBlur}
            autoFocus
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              height: '100%',
              margin: 0,
              padding: 0,
              border: 'none',
              background: 'transparent',
              fontFamily: attributes.fontFamily || 'Inter',
              fontSize: `${(attributes.fontSize || 14) * scale}px`,
              lineHeight: 1.2,
              color: attributes.color || '#000',
              fontWeight: attributes.bold ? 'bold' : 'normal',
              fontStyle: attributes.italic ? 'italic' : 'normal',
              textDecoration: attributes.underline ? 'underline' : 'none',
              outline: 'none',
              pointerEvents: 'auto',
              resize: 'none',
              overflow: 'hidden',
              wordWrap: 'break-word',
              boxSizing: 'border-box',
              verticalAlign: 'top',
              WebkitFontSmoothing: 'antialiased'
            }}
          />
        );
      } else {
        return (
          <div 
            ref={displayRef}
            style={{
              width: '100%',
              height: '100%',
              margin: 0,
              padding: 0,
              border: 'none',
              pointerEvents: 'none',
              fontFamily: attributes.fontFamily || 'Inter',
              fontSize: `${(attributes.fontSize || 14) * scale}px`,
              lineHeight: 1.2,
              color: attributes.color || '#000',
              fontWeight: attributes.bold ? 'bold' : 'normal',
              fontStyle: attributes.italic ? 'italic' : 'normal',
              textDecoration: attributes.underline ? 'underline' : 'none',
              overflow: 'hidden',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              boxSizing: 'border-box',
              verticalAlign: 'top',
              WebkitFontSmoothing: 'antialiased',
              textAlign: 'left'
            }}>
            {value || (selected && !isEditing ? 'Tap to select' : 'Text Field')}
          </div>
        );
      }
    } else if (type === 'date') {
      if (isEditing) {
        return (
          <input
            type="date"
            value={editValue}
            onChange={handleDateChange}
            onBlur={handleTextBlur}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            autoFocus
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              fontFamily: attributes.fontFamily || 'Inter',
              fontSize: `${(attributes.fontSize || 14) * scale}px`,
              color: attributes.color || '#000',
              outline: 'none',
              pointerEvents: 'auto'
            }}
          />
        );
      } else {
        return (
          <div style={{
            pointerEvents: 'none',
            fontFamily: attributes.fontFamily || 'Inter',
            fontSize: `${(attributes.fontSize || 14) * scale}px`,
            color: attributes.color || '#000',
            fontWeight: attributes.bold ? 'bold' : 'normal',
            fontStyle: attributes.italic ? 'italic' : 'normal',
            textDecoration: attributes.underline ? 'underline' : 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {value || 'DD/MM/YYYY'}
          </div>
        );
      }
    } else if (type === 'radio') {
      const isSelected = value === 'true';
      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{
            width: '80%',
            height: '80%',
            borderRadius: '50%',
            border: `${2 * scale}px solid #333`,
            background: isSelected ? '#2563eb' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isSelected && (
              <div style={{
                width: '50%',
                height: '50%',
                borderRadius: '50%',
                background: 'white'
              }}></div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div style={{pointerEvents: 'none', fontSize: '12px', fontWeight: 500}}>
          {type}
        </div>
      );
    }
  };

  return (
    <Rnd
      size={{ width: pixelPos.width, height: pixelPos.height }}
      position={{ x: pixelPos.x, y: pixelPos.y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      bounds="parent"
      disableDragging={isEditing}
      enableResizing={!isEditing}
      className={`draggable-field ${selected ? 'selected' : ''}`}
      onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
      }}
      onDoubleClick={handleDoubleClick}
      style={{
        border: `${1 * scale}px dashed #64748b`,
        outline: selected ? `${2 * scale}px solid #2563eb` : 'none',
        outlineOffset: 0,
        backgroundColor: (type === 'signature' && value) || type === 'radio' || (type === 'image' && value) ? 'transparent' : 'rgba(255, 255, 255, 0.5)',
        display: 'flex',
        alignItems: type === 'text' || type === 'date' ? 'flex-start' : 'center',
        justifyContent: type === 'text' || type === 'date' ? 'flex-start' : 'center',
        cursor: isEditing ? 'text' : 'move',
        boxSizing: 'border-box',
        padding: type === 'radio' ? `${2 * scale}px` : `${4 * scale}px`
      }}
    >
      {renderContent()}
      
      {/* Mobile Touch Overlay - captures touches before react-rnd */}
      {!isEditing && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            cursor: 'pointer',
            background: 'transparent'
          }}
          onTouchEnd={handleMobileTap}
        />
      )}
      
      {/* Edit Button - visible when selected for text/date fields */}
      {selected && !isEditing && (type === 'text' || type === 'date') && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsEditing(true);
          }}
          style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#2a3f5f',
            color: '#fff',
            border: '1px solid #3b5998',
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '10px',
            fontWeight: '500',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            pointerEvents: 'auto',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s'
          }}
        >
          Edit
        </button>
      )}
      
      {/* Delete Button */}
      {selected && !isEditing && (
          <button 
            onClick={(e) => { 
                e.stopPropagation();
                e.preventDefault();
                onRemove(id); 
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onRemove(id);
            }}
            style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '50%',
                width: 20,
                height: 20,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                pointerEvents: 'auto',
                zIndex: 1000,
                transition: 'all 0.2s'
            }}
          >
              ×
          </button>
      )}
    </Rnd>
  );
};

export default DraggableField;
