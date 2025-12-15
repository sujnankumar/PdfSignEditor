import React, { useState, useRef, useEffect } from 'react';
import { FileText, PenTool, Image as ImageIcon, Circle, Calendar, X, ChevronRight } from 'lucide-react';
import './InsertMenu.css';

const InsertMenu = ({ onInsertField, onClose, isMobile = false, currentPage }) => {
    const [activeField, setActiveField] = useState(null);
    const [fieldAttributes, setFieldAttributes] = useState({
        text: {
            fontFamily: 'Inter',
            fontSize: 14,
            color: '#000000',
            bold: false,
            italic: false,
            underline: false
        },
        signature: {
            penColor: '#000000',
            penThickness: 'medium',
            backgroundColor: 'transparent'
        },
        image: {
            fitMode: 'contain'
        },
        radio: {
            defaultChecked: false
        },
        date: {
            format: 'MM/DD/YYYY'
        }
    });

    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (!isMobile) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [onClose, isMobile]);

    const fields = [
        {
            type: 'text',
            icon: <FileText size={20} />,
            label: 'Text',
            description: 'Add a text field'
        },
        {
            type: 'signature',
            icon: <PenTool size={20} />,
            label: 'Signature',
            description: 'Add a signature field'
        },
        {
            type: 'image',
            icon: <ImageIcon size={20} />,
            label: 'Image',
            description: 'Upload an image'
        },
        {
            type: 'radio',
            icon: <Circle size={20} />,
            label: 'Radio',
            description: 'Add a radio button'
        },
        {
            type: 'date',
            icon: <Calendar size={20} />,
            label: 'Date',
            description: 'Add a date field'
        }
    ];

    const handleFieldClick = (type) => {
        if (activeField === type) {
            setActiveField(null);
        } else {
            setActiveField(type);
        }
    };

    const handleInsert = (type) => {
        onInsertField(type, fieldAttributes[type]);
        onClose();
    };

    const updateAttribute = (fieldType, attribute, value) => {
        setFieldAttributes(prev => ({
            ...prev,
            [fieldType]: {
                ...prev[fieldType],
                [attribute]: value
            }
        }));
    };

    const toggleStyle = (style) => {
        updateAttribute('text', style, !fieldAttributes.text[style]);
    };

    const renderAttributeEditor = (type) => {
        switch (type) {
            case 'text':
                return (
                    <div className="attribute-editor">
                        <div className="attribute-section">
                            <label>Font Family</label>
                            <select 
                                value={fieldAttributes.text.fontFamily}
                                onChange={(e) => updateAttribute('text', 'fontFamily', e.target.value)}
                            >
                                <option value="Inter">Inter</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Arial">Arial</option>
                                <option value="Times New Roman">Times New Roman</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Courier New">Courier New</option>
                            </select>
                        </div>
                        <div className="attribute-row">
                            <div className="attribute-section small">
                                <label>Size</label>
                                <select 
                                    value={fieldAttributes.text.fontSize}
                                    onChange={(e) => updateAttribute('text', 'fontSize', Number(e.target.value))}
                                >
                                    <option value={10}>10</option>
                                    <option value={12}>12</option>
                                    <option value={14}>14</option>
                                    <option value={16}>16</option>
                                    <option value={18}>18</option>
                                    <option value={24}>24</option>
                                    <option value={32}>32</option>
                                </select>
                            </div>
                            <div className="attribute-section small">
                                <label>Color</label>
                                <input 
                                    type="color"
                                    value={fieldAttributes.text.color}
                                    onChange={(e) => updateAttribute('text', 'color', e.target.value)}
                                    className="color-picker"
                                />
                            </div>
                        </div>
                        <div className="attribute-section">
                            <label>Text Style</label>
                            <div className="style-buttons">
                                <button 
                                    className={`style-btn ${fieldAttributes.text.bold ? 'active' : ''}`}
                                    onClick={() => toggleStyle('bold')}
                                >
                                    <strong>B</strong>
                                </button>
                                <button 
                                    className={`style-btn ${fieldAttributes.text.italic ? 'active' : ''}`}
                                    onClick={() => toggleStyle('italic')}
                                >
                                    <em>I</em>
                                </button>
                                <button 
                                    className={`style-btn ${fieldAttributes.text.underline ? 'active' : ''}`}
                                    onClick={() => toggleStyle('underline')}
                                >
                                    <u>U</u>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'signature':
                return (
                    <div className="attribute-editor">
                        <div className="attribute-row">
                            <div className="attribute-section small">
                                <label>Pen Color</label>
                                <div className="color-presets">
                                    {['#000000', '#0066CC', '#DC3545', '#28A745'].map(color => (
                                        <button
                                            key={color}
                                            className={`color-preset ${fieldAttributes.signature.penColor === color ? 'active' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => updateAttribute('signature', 'penColor', color)}
                                        />
                                    ))}
                                    <input 
                                        type="color"
                                        value={fieldAttributes.signature.penColor}
                                        onChange={(e) => updateAttribute('signature', 'penColor', e.target.value)}
                                        className="color-picker small"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="attribute-section">
                            <label>Pen Thickness</label>
                            <div className="thickness-buttons">
                                {['thin', 'medium', 'thick'].map(thickness => (
                                    <button
                                        key={thickness}
                                        className={`thickness-btn ${fieldAttributes.signature.penThickness === thickness ? 'active' : ''}`}
                                        onClick={() => updateAttribute('signature', 'penThickness', thickness)}
                                    >
                                        {thickness.charAt(0).toUpperCase() + thickness.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="attribute-section">
                            <label>Background</label>
                            <div className="bg-buttons">
                                <button
                                    className={`bg-btn ${fieldAttributes.signature.backgroundColor === 'transparent' ? 'active' : ''}`}
                                    onClick={() => updateAttribute('signature', 'backgroundColor', 'transparent')}
                                >
                                    Transparent
                                </button>
                                <button
                                    className={`bg-btn ${fieldAttributes.signature.backgroundColor === '#FFFFFF' ? 'active' : ''}`}
                                    onClick={() => updateAttribute('signature', 'backgroundColor', '#FFFFFF')}
                                >
                                    White
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'image':
                return (
                    <div className="attribute-editor">
                        <div className="attribute-section">
                            <label>Fit Mode</label>
                            <select 
                                value={fieldAttributes.image.fitMode}
                                onChange={(e) => updateAttribute('image', 'fitMode', e.target.value)}
                            >
                                <option value="contain">Contain</option>
                                <option value="cover">Cover</option>
                                <option value="fill">Fill</option>
                            </select>
                        </div>
                    </div>
                );
            case 'radio':
                return (
                    <div className="attribute-editor">
                        <div className="attribute-section">
                            <label className="checkbox-label">
                                <input 
                                    type="checkbox"
                                    checked={fieldAttributes.radio.defaultChecked}
                                    onChange={(e) => updateAttribute('radio', 'defaultChecked', e.target.checked)}
                                />
                                Default Checked
                            </label>
                        </div>
                    </div>
                );
            case 'date':
                return (
                    <div className="attribute-editor">
                        <div className="attribute-section">
                            <label>Date Format</label>
                            <select 
                                value={fieldAttributes.date.format}
                                onChange={(e) => updateAttribute('date', 'format', e.target.value)}
                            >
                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                <option value="MMM DD, YYYY">MMM DD, YYYY</option>
                            </select>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (isMobile) {
        return (
            <div className="insert-menu-overlay" onClick={onClose}>
                <div className="insert-menu-mobile" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                    <div className="insert-menu-header">
                        <h3>Insert Field</h3>
                        <button className="close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="insert-menu-content">
                        {fields.map(field => (
                            <div key={field.type} className="field-item-wrapper">
                                <div 
                                    className={`field-item ${activeField === field.type ? 'active' : ''}`}
                                    onClick={() => handleFieldClick(field.type)}
                                >
                                    <div className="field-icon">{field.icon}</div>
                                    <div className="field-info">
                                        <div className="field-label">{field.label}</div>
                                        <div className="field-description">{field.description}</div>
                                    </div>
                                    <ChevronRight 
                                        size={18} 
                                        className={`chevron ${activeField === field.type ? 'rotated' : ''}`}
                                    />
                                </div>
                                {activeField === field.type && (
                                    <div className="field-attributes">
                                        {renderAttributeEditor(field.type)}
                                        <button 
                                            className="insert-btn"
                                            onClick={() => handleInsert(field.type)}
                                        >
                                            Insert {field.label}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="insert-menu-dropdown" ref={menuRef}>
            <div className="insert-menu-header">
                <h3>Insert Field</h3>
            </div>
            <div className="insert-menu-content">
                {fields.map(field => (
                    <div key={field.type} className="field-item-wrapper">
                        <div 
                            className={`field-item ${activeField === field.type ? 'active' : ''}`}
                            onClick={() => handleFieldClick(field.type)}
                        >
                            <div className="field-icon">{field.icon}</div>
                            <div className="field-info">
                                <div className="field-label">{field.label}</div>
                                <div className="field-description">{field.description}</div>
                            </div>
                            <ChevronRight 
                                size={16} 
                                className={`chevron ${activeField === field.type ? 'rotated' : ''}`}
                            />
                        </div>
                        {activeField === field.type && (
                            <div className="field-attributes">
                                {renderAttributeEditor(field.type)}
                                <button 
                                    className="insert-btn"
                                    onClick={() => handleInsert(field.type)}
                                >
                                    Insert {field.label}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InsertMenu;
