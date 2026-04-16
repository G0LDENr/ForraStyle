import React, { useState } from 'react';
import { FaImage, FaTag, FaBook, FaCheck, FaLink, FaPalette, FaRulerCombined } from 'react-icons/fa';
import LabelModal from './LabelModal';
import '../../css/pedidos/step2-notebook-customization.css';

const Step2NotebookCustomization = ({ formData, updateFormData, showLabelModal, setShowLabelModal }) => {
  // ========== VALIDACIÓN INICIAL: Asegurar que etiqueta existe ==========
  const safeFormData = {
    ...formData,
    etiqueta: formData?.etiqueta || {
      show: false,
      nombre: '',
      materia: '',
      escuela: '',
      maestro: '',
      grado: '',
      grupo: '',
      diseño: 'simple',
      posicion: 'center',
      colorFondo: '#3b82f6',
      colorTexto: '#ffffff',
      colorBorde: '#3b82f6'
    }
  };
  
  // Si formData cambió, actualizar con la versión segura
  if (formData && !formData.etiqueta) {
    updateFormData(safeFormData);
  }

  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [imageSize, setImageSize] = useState(safeFormData.imagenSize || 100);
  const [imagePosition, setImagePosition] = useState(safeFormData.imagenPosition || { x: 50, y: 50 });
  
  // Usar safeFormData en lugar de formData directamente
  const frontColor = safeFormData.colorFrontal || '#3b82f6';
  const backColor = safeFormData.colorTrasero || '#3b82f6';
  const ambosLados = safeFormData.ambosLados || false;

  const colorOptions = [
    { name: 'Azul', code: '#3b82f6' },
    { name: 'Celeste', code: '#0ea5e9' },
    { name: 'Amarillo', code: '#eab308' },
    { name: 'Naranja', code: '#f97316' },
    { name: 'Durazno', code: '#fdba74' },
    { name: 'Rosa', code: '#ec4899' },
    { name: 'Verde', code: '#22c55e' },
    { name: 'Rojo', code: '#ef4444' },
    { name: 'Morado', code: '#a855f7' },
    { name: 'Gris', code: '#6b7280' },
    { name: 'Blanco', code: '#ffffff' },
    { name: 'Negro', code: '#1f2937' }
  ];

  const paperTypes = [
    { id: 'lined', name: 'Rayado'},
    { id: 'squared', name: 'Cuadriculado'},
    { id: 'squared-large', name: 'Cuadro Grande'},
    { id: 'blank', name: 'Blanco'}
  ];

  // Función para actualizar color frontal
  const handleColorSelect = (colorCode) => {
    console.log('Seleccionando color frontal:', colorCode);
    updateFormData({ colorFrontal: colorCode });
    if (!ambosLados) {
      updateFormData({ colorTrasero: colorCode });
    }
  };

  const handleBackColorSelect = (colorCode) => {
    console.log('Seleccionando color trasero:', colorCode);
    updateFormData({ colorTrasero: colorCode, colorTraseroPersonalizado: true });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData({ imagenUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageResize = (e) => {
    const newSize = parseInt(e.target.value);
    setImageSize(newSize);
    updateFormData({ imagenSize: newSize });
  };

  const adjustColor = (color, percent) => {
    if (!color || color === '#ffffff') return '#c4b5fd';
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        
        const newR = Math.min(255, Math.max(0, r + (r * percent / 100)));
        const newG = Math.min(255, Math.max(0, g + (g * percent / 100)));
        const newB = Math.min(255, Math.max(0, b + (b * percent / 100)));
        
        return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
    }
    return '#8b5cf6';
  };

  const handleImagePositionChange = (axis, value) => {
    const newPosition = { ...imagePosition, [axis]: value };
    setImagePosition(newPosition);
    updateFormData({ imagenPosition: newPosition });
  };

  const toggleNotebook = () => {
    setIsNotebookOpen(!isNotebookOpen);
  };

  const getSpiralRings = () => {
    const rings = [];
    const ringCount = 14;
    for (let i = 0; i < ringCount; i++) {
      rings.push(<div key={i} className="boock-spiral-ring"></div>);
    }
    return rings;
  };

  const renderPages = () => {
    const pages = [];
    const pageCount = 60;
    const paperType = safeFormData.paperType || 'lined';
    
    for (let i = 0; i < pageCount; i++) {
        let backgroundStyle = {};
        
        if (paperType === 'lined') {
        backgroundStyle = { 
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='lined' patternUnits='userSpaceOnUse' width='100%25' height='28'%3E%3Cline x1='0' y1='27' x2='100%25' y2='27' stroke='%233b82f6' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23lined)'/%3E%3C/svg%3E")`,
            backgroundColor: '#ffffff'
        };
        } else if (paperType === 'squared') {
        backgroundStyle = { 
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='squared' patternUnits='userSpaceOnUse' width='20' height='20'%3E%3Cline x1='0' y1='19' x2='20' y2='19' stroke='%233b82f6' stroke-width='1'/%3E%3Cline x1='19' y1='0' x2='19' y2='20' stroke='%233b82f6' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23squared)'/%3E%3C/svg%3E")`,
            backgroundColor: '#ffffff'
        };
        } else if (paperType === 'squared-large') {
        backgroundStyle = { 
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3Cpattern id='squared-large' patternUnits='userSpaceOnUse' width='40' height='40'%3E%3Cline x1='0' y1='39' x2='40' y2='39' stroke='%233b82f6' stroke-width='1'/%3E%3Cline x1='39' y1='0' x2='39' y2='40' stroke='%233b82f6' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23squared-large)'/%3E%3C/svg%3E")`,
            backgroundColor: '#ffffff'
        };
        } else {
        backgroundStyle = { backgroundColor: '#ffffff' };
        }
        
        pages.push(
        <div 
            key={i} 
            className="boock-notebook-page"
            style={{ 
            transform: `translateX(${i * 0.3}px)`,
            zIndex: i,
            ...backgroundStyle
            }}
        ></div>
        );
    }
    return pages;
  };

  const currentBackColorDisplay = ambosLados ? backColor : frontColor;

  // Función para renderizar la etiqueta en la libreta
  const renderLabelOnNotebook = () => {
    const etiqueta = safeFormData.etiqueta;
    if (!etiqueta.show) return null;

    const getStyle = () => {
      switch(etiqueta.diseño) {
        case 'simple':
          return {
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            color: '#1f2937'
          };
        case 'colorful':
          return {
            backgroundColor: etiqueta.colorFondo || '#3b82f6',
            border: 'none',
            color: etiqueta.colorTexto || '#ffffff'
          };
        case 'white-outline':
          return {
            backgroundColor: 'white',
            border: `2px solid ${etiqueta.colorBorde || '#3b82f6'}`,
            color: '#1f2937'
          };
        default:
          return {
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            color: '#1f2937'
          };
      }
    };

    return (
      <div 
        className={`boock-cover-label ${etiqueta.diseño} ${etiqueta.posicion}`}
        style={getStyle()}
      >
        <div className="boock-label-content">
          <strong>{etiqueta.nombre || 'Tu nombre'}</strong>
          <span>{etiqueta.materia || 'Materia'}</span>
          <span className="boock-label-escuela">{etiqueta.escuela || 'Escuela'}</span>
          <span className="boock-label-maestro">{etiqueta.maestro || 'Maestro/a'}</span>
          <div className="boock-label-footer">
            <span>{etiqueta.grado || 'Grado'}</span>
            <span>{etiqueta.grupo || 'Grupo'}</span>
          </div>
        </div>
        {etiqueta.diseño === 'white-outline' && (
          <div className="boock-label-outline-divider" style={{ backgroundColor: etiqueta.colorBorde || '#3b82f6' }}></div>
        )}
      </div>
    );
  };

  // Libreta cerrada
  if (!isNotebookOpen) {
    return (
      <div className="boock-container">
        <div className="boock-interactive-section">
          <h3>Vista previa interactiva</h3>
          <div className="boock-wrapper">
            <div className="boock-closed" onClick={toggleNotebook}>
              <div 
                className="boock-cover" 
                style={{ backgroundColor: frontColor }}
              >
                <div className="boock-cover-content">
                  {safeFormData.imagenUrl && (
                    <img 
                      src={safeFormData.imagenUrl} 
                      alt="Personalización" 
                      className="boock-cover-image"
                      style={{
                        width: `${imageSize}%`,
                        top: `${imagePosition.y}%`,
                        left: `${imagePosition.x}%`,
                        transform: 'translate(-50%, -50%)',
                        position: 'absolute'
                      }}
                    />
                  )}
                  {renderLabelOnNotebook()}
                </div>
              </div>
                <div className="boock-spiral-binding">
                {safeFormData.tipoEncuadernacion === 'espiral' ? (
                    getSpiralRings()
                ) : (
                    <div 
                    className="boock-sewn-binding-closed"
                    style={{ 
                        background: `repeating-linear-gradient(180deg, ${safeFormData.colorHilo || '#8b5cf6'}, ${safeFormData.colorHilo || '#8b5cf6'} 6px, ${adjustColor(safeFormData.colorHilo || '#8b5cf6', 20)} 6px, ${adjustColor(safeFormData.colorHilo || '#8b5cf6', 20)} 12px)`
                    }}
                    ></div>
                )}
                </div>
            </div>
            <button className="boock-toggle-btn" onClick={toggleNotebook}>Abrir libreta</button>
          </div>
        </div>

        <div className="boock-customization-form-section">
          <h2>Personaliza tu libreta</h2>
          
          {/* Resto del contenido igual... */}
          <div className="boock-form-section">
            <h3><FaPalette /> Colores disponibles</h3>
            <div className="boock-color-options">
              {colorOptions.map((color) => (
                <button 
                  key={color.code} 
                  className={`boock-color-option ${frontColor === color.code ? 'selected' : ''}`} 
                  style={{ backgroundColor: color.code, border: color.code === '#ffffff' ? '1px solid #ddd' : 'none' }} 
                  onClick={() => handleColorSelect(color.code)} 
                  title={color.name}
                >
                  {frontColor === color.code && <FaCheck className="boock-color-check" />}
                </button>
              ))}
            </div>
            <div className="boock-form-group boock-checkbox">
              <label>
                <input 
                  type="checkbox" 
                  checked={ambosLados} 
                  onChange={(e) => {
                    updateFormData({ ambosLados: e.target.checked });
                    if (!e.target.checked) {
                      updateFormData({ colorTrasero: frontColor });
                    }
                  }} 
                /> 
                Color diferente en la contraportada
              </label>
            </div>
            {ambosLados && (
              <div className="boock-back-color-section">
                <label>Color de la contraportada</label>
                <div className="boock-color-options boock-mini">
                  {colorOptions.map((color) => (
                    <button 
                      key={color.code} 
                      className={`boock-color-option ${backColor === color.code ? 'selected' : ''}`} 
                      style={{ backgroundColor: color.code, border: color.code === '#ffffff' ? '1px solid #ddd' : 'none' }} 
                      onClick={() => handleBackColorSelect(color.code)} 
                      title={color.name}
                    >
                      {backColor === color.code && <FaCheck className="boock-color-check" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="boock-form-section">
            <h3><FaRulerCombined /> Tipo de papel</h3>
            <div className="boock-paper-options">
              {paperTypes.map((paper) => (
                <label key={paper.id} className={`boock-paper-option ${safeFormData.paperType === paper.id ? 'selected' : ''}`}>
                  <input type="radio" name="paperType" value={paper.id} checked={safeFormData.paperType === paper.id} onChange={(e) => updateFormData({ paperType: e.target.value })} />
                  <span className="boock-paper-icon">{paper.icon}</span>
                  <span className="boock-paper-name">{paper.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="boock-form-section">
            <h3><FaBook /> Tipo de encuadernación</h3>
            <div className="boock-binding-options">
              <label className={`boock-binding-option ${safeFormData.tipoEncuadernacion === 'espiral' ? 'selected' : ''}`}>
                <input type="radio" name="tipoEncuadernacion" value="espiral" checked={safeFormData.tipoEncuadernacion === 'espiral'} onChange={(e) => updateFormData({ tipoEncuadernacion: e.target.value })} />
                <div className="boock-binding-preview"><div className="boock-spiral-demo"></div><span>Espiral</span></div>
              </label>
              <label className={`boock-binding-option ${safeFormData.tipoEncuadernacion === 'cosida' ? 'selected' : ''}`}>
                <input type="radio" name="tipoEncuadernacion" value="cosida" checked={safeFormData.tipoEncuadernacion === 'cosida'} onChange={(e) => updateFormData({ tipoEncuadernacion: e.target.value })} />
                <div className="boock-binding-preview"><div className="boock-sewn-demo" style={{ 
                background: `repeating-linear-gradient(90deg, ${safeFormData.colorHilo || '#8b5cf6'}, ${safeFormData.colorHilo || '#8b5cf6'} 4px, ${adjustColor(safeFormData.colorHilo || '#8b5cf6', 30)} 4px, ${adjustColor(safeFormData.colorHilo || '#8b5cf6', 30)} 8px)`
                }}></div><span>Cosida</span></div>
              </label>
            </div>
            {safeFormData.tipoEncuadernacion === 'cosida' && (
              <div className="boock-form-group">
                <label><FaLink /> Color del hilo</label>
                <div className="boock-thread-colors">
                  {['#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ec4899', '#ffffff'].map((color) => (
                    <button key={color} className={`boock-thread-color ${safeFormData.colorHilo === color ? 'selected' : ''}`} style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #ddd' : 'none' }} onClick={() => updateFormData({ colorHilo: color })} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="boock-form-section">
            <h3><FaImage /> Imagen personalizada</h3>
            <div className="boock-image-upload-area">
              {safeFormData.imagenUrl ? (
                <div className="boock-image-preview-container">
                  <img src={safeFormData.imagenUrl} alt="Preview" className="boock-image-preview-img" />
                  <button className="boock-remove-image" onClick={() => updateFormData({ imagenUrl: '' })}>Eliminar</button>
                  <div className="boock-image-controls">
                    <div className="boock-control-group">
                      <label>Tamaño</label>
                      <input type="range" min="20" max="150" value={imageSize} onChange={handleImageResize} />
                      <span>{imageSize}%</span>
                    </div>
                    <div className="boock-control-group">
                      <label>Posición X</label>
                      <input type="range" min="0" max="100" value={imagePosition.x} onChange={(e) => handleImagePositionChange('x', parseInt(e.target.value))} />
                    </div>
                    <div className="boock-control-group">
                      <label>Posición Y</label>
                      <input type="range" min="0" max="100" value={imagePosition.y} onChange={(e) => handleImagePositionChange('y', parseInt(e.target.value))} />
                    </div>
                  </div>
                </div>
              ) : (
                <label className="boock-upload-label">
                  <FaImage />
                  <span>Subir imagen</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          <div className="boock-form-section">
            <h3><FaTag /> Etiqueta personalizada</h3>
            <button className="boock-btn-label" onClick={() => setShowLabelModal(true)}>
              {safeFormData.etiqueta.show ? 'Editar etiqueta' : 'Agregar etiqueta'}
            </button>
            {safeFormData.etiqueta.show && (
              <div className="boock-label-summary">
                <p><strong>Nombre:</strong> {safeFormData.etiqueta.nombre || 'No especificado'}</p>
                <p><strong>Materia:</strong> {safeFormData.etiqueta.materia || 'No especificado'}</p>
                <p><strong>Escuela:</strong> {safeFormData.etiqueta.escuela || 'No especificado'}</p>
                <p><strong>Maestro:</strong> {safeFormData.etiqueta.maestro || 'No especificado'}</p>
                <p><strong>Grado:</strong> {safeFormData.etiqueta.grado || 'No especificado'}</p>
                <p><strong>Grupo:</strong> {safeFormData.etiqueta.grupo || 'No especificado'}</p>
              </div>
            )}
          </div>
        </div>

        <LabelModal isOpen={showLabelModal} onClose={() => setShowLabelModal(false)} etiqueta={safeFormData.etiqueta} updateEtiqueta={(etiqueta) => updateFormData({ etiqueta })} />
      </div>
    );
  }

  // Libreta abierta (mismo contenido que arriba pero con la libreta abierta)
  return (
    <div className="boock-container">
      <div className="boock-interactive-section">
        <h3>Vista previa interactiva</h3>
        <div className="boock-wrapper">
          <div className="boock-open">
            <div 
              className="boock-back-cover" 
              style={{ backgroundColor: currentBackColorDisplay }}
            >
              <div className="boock-back-cover-content"></div>
            </div>
            
            <div className="boock-binding-center">
            {safeFormData.tipoEncuadernacion === 'espiral' ? (
                <div className="boock-spiral-center">{getSpiralRings()}</div>
            ) : (
                <div className="boock-sewn-center">
                <div className="boock-sewn-thread-vertical"></div>
                </div>
            )}
            </div>
            
            <div className="boock-pages-stack">
              <div className="boock-pages-container">
                {renderPages()}
              </div>
            </div>
          </div>
          <button className="boock-toggle-btn" onClick={toggleNotebook}>Cerrar libreta</button>
        </div>
      </div>

      <div className="boock-customization-form-section">
        <h2>Personaliza tu libreta</h2>
        
        {/* Mismo contenido que arriba (las opciones de personalización) */}
        <div className="boock-form-section">
          <h3><FaPalette /> Colores disponibles</h3>
          <div className="boock-color-options">
            {colorOptions.map((color) => (
              <button 
                key={color.code} 
                className={`boock-color-option ${frontColor === color.code ? 'selected' : ''}`} 
                style={{ backgroundColor: color.code, border: color.code === '#ffffff' ? '1px solid #ddd' : 'none' }} 
                onClick={() => handleColorSelect(color.code)} 
                title={color.name}
              >
                {frontColor === color.code && <FaCheck className="boock-color-check" />}
              </button>
            ))}
          </div>
          <div className="boock-form-group boock-checkbox">
            <label>
              <input 
                type="checkbox" 
                checked={ambosLados} 
                onChange={(e) => {
                  updateFormData({ ambosLados: e.target.checked });
                  if (!e.target.checked) {
                    updateFormData({ colorTrasero: frontColor });
                  }
                }} 
              /> 
              Color diferente en la contraportada
            </label>
          </div>
          {ambosLados && (
            <div className="boock-back-color-section">
              <label>Color de la contraportada</label>
              <div className="boock-color-options boock-mini">
                {colorOptions.map((color) => (
                  <button 
                    key={color.code} 
                    className={`boock-color-option ${backColor === color.code ? 'selected' : ''}`} 
                    style={{ backgroundColor: color.code, border: color.code === '#ffffff' ? '1px solid #ddd' : 'none' }} 
                    onClick={() => handleBackColorSelect(color.code)} 
                    title={color.name}
                  >
                    {backColor === color.code && <FaCheck className="boock-color-check" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="boock-form-section">
          <h3><FaRulerCombined /> Tipo de papel</h3>
          <div className="boock-paper-options">
            {paperTypes.map((paper) => (
              <label key={paper.id} className={`boock-paper-option ${safeFormData.paperType === paper.id ? 'selected' : ''}`}>
                <input type="radio" name="paperType" value={paper.id} checked={safeFormData.paperType === paper.id} onChange={(e) => updateFormData({ paperType: e.target.value })} />
                <span className="boock-paper-icon">{paper.icon}</span>
                <span className="boock-paper-name">{paper.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="boock-form-section">
          <h3><FaBook /> Tipo de encuadernación</h3>
          <div className="boock-binding-options">
            <label className={`boock-binding-option ${safeFormData.tipoEncuadernacion === 'espiral' ? 'selected' : ''}`}>
              <input type="radio" name="tipoEncuadernacion" value="espiral" checked={safeFormData.tipoEncuadernacion === 'espiral'} onChange={(e) => updateFormData({ tipoEncuadernacion: e.target.value })} />
              <div className="boock-binding-preview"><div className="boock-spiral-demo"></div><span>Espiral</span></div>
            </label>
            <label className={`boock-binding-option ${safeFormData.tipoEncuadernacion === 'cosida' ? 'selected' : ''}`}>
              <input type="radio" name="tipoEncuadernacion" value="cosida" checked={safeFormData.tipoEncuadernacion === 'cosida'} onChange={(e) => updateFormData({ tipoEncuadernacion: e.target.value })} />
              <div className="boock-binding-preview"><div className="boock-sewn-demo" style={{ 
                background: `repeating-linear-gradient(90deg, ${safeFormData.colorHilo || '#8b5cf6'}, ${safeFormData.colorHilo || '#8b5cf6'} 4px, ${adjustColor(safeFormData.colorHilo || '#8b5cf6', 30)} 4px, ${adjustColor(safeFormData.colorHilo || '#8b5cf6', 30)} 8px)`
                }}></div><span>Cosida</span></div>
            </label>
          </div>
          {safeFormData.tipoEncuadernacion === 'cosida' && (
            <div className="boock-form-group">
              <label><FaLink /> Color del hilo</label>
              <div className="boock-thread-colors">
                {['#000000', '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ec4899', '#ffffff'].map((color) => (
                  <button key={color} className={`boock-thread-color ${safeFormData.colorHilo === color ? 'selected' : ''}`} style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #ddd' : 'none' }} onClick={() => updateFormData({ colorHilo: color })} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="boock-form-section">
          <h3><FaImage /> Imagen personalizada</h3>
          <div className="boock-image-upload-area">
            {safeFormData.imagenUrl ? (
              <div className="boock-image-preview-container">
                <img src={safeFormData.imagenUrl} alt="Preview" className="boock-image-preview-img" />
                <button className="boock-remove-image" onClick={() => updateFormData({ imagenUrl: '' })}>Eliminar</button>
                <div className="boock-image-controls">
                  <div className="boock-control-group">
                    <label>Tamaño</label>
                    <input type="range" min="20" max="150" value={imageSize} onChange={handleImageResize} />
                    <span>{imageSize}%</span>
                  </div>
                  <div className="boock-control-group">
                    <label>Posición X</label>
                    <input type="range" min="0" max="100" value={imagePosition.x} onChange={(e) => handleImagePositionChange('x', parseInt(e.target.value))} />
                  </div>
                  <div className="boock-control-group">
                    <label>Posición Y</label>
                    <input type="range" min="0" max="100" value={imagePosition.y} onChange={(e) => handleImagePositionChange('y', parseInt(e.target.value))} />
                  </div>
                </div>
              </div>
            ) : (
              <label className="boock-upload-label">
                <FaImage />
                <span>Subir imagen</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        <div className="boock-form-section">
          <h3><FaTag /> Etiqueta personalizada</h3>
          <button className="boock-btn-label" onClick={() => setShowLabelModal(true)}>
            {safeFormData.etiqueta.show ? 'Editar etiqueta' : 'Agregar etiqueta'}
          </button>
          {safeFormData.etiqueta.show && (
            <div className="boock-label-summary">
              <p><strong>Nombre:</strong> {safeFormData.etiqueta.nombre || 'No especificado'}</p>
              <p><strong>Materia:</strong> {safeFormData.etiqueta.materia || 'No especificado'}</p>
              <p><strong>Escuela:</strong> {safeFormData.etiqueta.escuela || 'No especificado'}</p>
              <p><strong>Maestro:</strong> {safeFormData.etiqueta.maestro || 'No especificado'}</p>
              <p><strong>Grado:</strong> {safeFormData.etiqueta.grado || 'No especificado'}</p>
              <p><strong>Grupo:</strong> {safeFormData.etiqueta.grupo || 'No especificado'}</p>
            </div>
          )}
        </div>
      </div>

      <LabelModal isOpen={showLabelModal} onClose={() => setShowLabelModal(false)} etiqueta={safeFormData.etiqueta} updateEtiqueta={(etiqueta) => updateFormData({ etiqueta })} />
    </div>
  );
};

export default Step2NotebookCustomization;