import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

const DraggableField = ({ 
  id, 
  type, 
  initialPos,
  pdfDimensions,
  value,
  onUpdate,
  onRemove,
  onValueChange,
  selected,
  onSelect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');

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
      // Toggle radio selection
      const newValue = value === 'true' ? 'false' : 'true';
      if (onValueChange) {
        onValueChange(id, newValue);
      }
    }
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
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleTextBlur}
            autoFocus
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              textAlign: 'center',
              fontSize: '12px',
              outline: 'none'
            }}
          />
        );
      } else {
        return (
          <div style={{
            pointerEvents: 'none', 
            fontSize: '12px', 
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {value || 'Double-click to edit'}
          </div>
        );
      }
    } else if (type === 'date') {
      if (isEditing) {
        return (
          <input
            type="date"
            onChange={handleDateChange}
            onBlur={handleTextBlur}
            autoFocus
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              fontSize: '11px',
              outline: 'none'
            }}
          />
        );
      } else {
        return (
          <div style={{
            pointerEvents: 'none', 
            fontSize: '11px', 
            fontWeight: 500,
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
            border: '2px solid #333',
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
      className={`draggable-field ${selected ? 'selected' : ''}`}
      onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
      }}
      onDoubleClick={handleDoubleClick}
      style={{
        border: selected ? '2px solid #2563eb' : '1px dashed #64748b',
        backgroundColor: (type === 'signature' && value) || type === 'radio' || (type === 'image' && value) ? 'transparent' : 'rgba(255, 255, 255, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'move',
        boxSizing: 'border-box',
        padding: type === 'radio' ? '2px' : '4px'
      }}
    >
      {renderContent()}
      {selected && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(id); }}
            style={{
                position: 'absolute',
                top: -10,
                right: -10,
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 24,
                height: 24,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
              ×
          </button>
      )}
    </Rnd>
  );
};

export default DraggableField;
