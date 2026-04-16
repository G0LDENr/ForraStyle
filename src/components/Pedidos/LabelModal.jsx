import React, { useState, useEffect } from 'react';
import { FaTimes, FaTag, FaCheck, FaPalette, FaFont, FaBorderAll, FaSchool, FaChalkboardTeacher } from 'react-icons/fa';
import '../../css/pedidos/label-modal.css';

const LabelModal = ({ isOpen, onClose, etiqueta, updateEtiqueta }) => {
  // Inicializar formData con valores por defecto si etiqueta está vacía
  const [formData, setFormData] = useState({
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
  });
  
  const [previewStyle, setPreviewStyle] = useState('simple');

  // Cuando se abre el modal, cargar los datos de la etiqueta existente o usar valores por defecto
  useEffect(() => {
    if (isOpen) {
      if (etiqueta && etiqueta.show) {
        // Si hay una etiqueta existente, cargarla
        setFormData({
          show: etiqueta.show || false,
          nombre: etiqueta.nombre || '',
          materia: etiqueta.materia || '',
          escuela: etiqueta.escuela || '',
          maestro: etiqueta.maestro || '',
          grado: etiqueta.grado || '',
          grupo: etiqueta.grupo || '',
          diseño: etiqueta.diseño || 'simple',
          posicion: etiqueta.posicion || 'center',
          colorFondo: etiqueta.colorFondo || '#3b82f6',
          colorTexto: etiqueta.colorTexto || '#ffffff',
          colorBorde: etiqueta.colorBorde || '#3b82f6'
        });
        setPreviewStyle(etiqueta.diseño || 'simple');
      } else {
        // Si no hay etiqueta, usar valores por defecto (simple)
        setFormData({
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
        });
        setPreviewStyle('simple');
      }
    }
  }, [isOpen, etiqueta]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStyleChange = (style) => {
    setPreviewStyle(style);
    setFormData({ ...formData, diseño: style });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateEtiqueta({ ...formData, show: true });
    onClose();
  };

  const handleRemove = () => {
    updateEtiqueta({ 
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
    });
    onClose();
  };

  // Colores para fondo (colorido)
  const colorOptions = [
    { name: 'Azul', code: '#3b82f6', textColor: '#ffffff' },
    { name: 'Rojo', code: '#ef4444', textColor: '#ffffff' },
    { name: 'Verde', code: '#22c55e', textColor: '#ffffff' },
    { name: 'Amarillo', code: '#eab308', textColor: '#1f2937' },
    { name: 'Naranja', code: '#f97316', textColor: '#ffffff' },
    { name: 'Morado', code: '#a855f7', textColor: '#ffffff' },
    { name: 'Rosa', code: '#ec4899', textColor: '#ffffff' },
    { name: 'Celeste', code: '#0ea5e9', textColor: '#ffffff' },
    { name: 'Negro', code: '#1f2937', textColor: '#ffffff' },
    { name: 'Blanco', code: '#ffffff', textColor: '#1f2937' }
  ];

  // Colores de texto para colorido
  const textColorOptions = [
    { name: 'Negro', code: '#1f2937' },
    { name: 'Blanco', code: '#ffffff' },
    { name: 'Azul', code: '#3b82f6' },
    { name: 'Rojo', code: '#ef4444' },
    { name: 'Verde', code: '#22c55e' }
  ];

  // Colores de contorno para blanco con contorno
  const outlineColorOptions = [
    { name: 'Azul', code: '#3b82f6' },
    { name: 'Rojo', code: '#ef4444' },
    { name: 'Verde', code: '#22c55e' },
    { name: 'Amarillo', code: '#eab308' },
    { name: 'Naranja', code: '#f97316' },
    { name: 'Morado', code: '#a855f7' },
    { name: 'Rosa', code: '#ec4899' },
    { name: 'Gris', code: '#6b7280' },
    { name: 'Negro', code: '#1f2937' }
  ];

  // Renderizar previsualización según estilo
  const renderLabelPreview = () => {
    const { nombre, materia, escuela, maestro, grado, grupo, colorFondo, colorTexto, colorBorde } = formData;
    const previewData = {
      nombre: nombre || 'Tu Nombre',
      materia: materia || 'Matemáticas',
      escuela: escuela || 'Escuela Primaria',
      maestro: maestro || 'Profesor Ejemplo',
      grado: grado || '3er Grado',
      grupo: grupo || 'A'
    };

    switch(previewStyle) {
      case 'simple':
        return (
          <div className="label-modal-preview-simple">
            <div className="label-modal-preview-simple-content">
              <strong>{previewData.nombre}</strong>
              <span>{previewData.materia}</span>
              <span>{previewData.escuela}</span>
              <span>{previewData.maestro}</span>
              <div className="label-modal-preview-footer">
                <span>{previewData.grado}</span>
                <span>{previewData.grupo}</span>
              </div>
            </div>
          </div>
        );
      
      case 'colorful':
        return (
          <div 
            className="label-modal-preview-colorful"
            style={{
              backgroundColor: colorFondo || '#3b82f6',
            }}
          >
            <div className="label-modal-preview-colorful-content">
              <div className="label-modal-preview-colorful-header">
                <strong style={{ color: colorTexto || '#ffffff' }}>{previewData.nombre}</strong>
              </div>
              <span style={{ color: colorTexto || '#ffffff' }}>{previewData.materia}</span>
              <span style={{ color: colorTexto || '#ffffff', fontSize: '0.65rem', opacity: 0.9 }}>{previewData.escuela}</span>
              <span style={{ color: colorTexto || '#ffffff', fontSize: '0.65rem', opacity: 0.9 }}>{previewData.maestro}</span>
              <div className="label-modal-preview-footer">
                <span style={{ color: colorTexto || 'rgba(255,255,255,0.8)' }}>{previewData.grado}</span>
                <span style={{ color: colorTexto || 'rgba(255,255,255,0.8)' }}>{previewData.grupo}</span>
              </div>
            </div>
          </div>
        );
      
      case 'white-outline':
        return (
          <div 
            className="label-modal-preview-white-outline"
            style={{
              border: `2px solid ${colorBorde || '#3b82f6'}`,
            }}
          >
            <div className="label-modal-preview-white-outline-content">
              <strong>{previewData.nombre}</strong>
              <span>{previewData.materia}</span>
              <span>{previewData.escuela}</span>
              <span>{previewData.maestro}</span>
              <div className="label-modal-preview-outline-divider" style={{ backgroundColor: colorBorde || '#3b82f6' }}></div>
              <div className="label-modal-preview-footer">
                <span>{previewData.grado}</span>
                <span>{previewData.grupo}</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="label-modal-overlay" onClick={onClose}>
      <div className="label-modal-container-two-columns" onClick={(e) => e.stopPropagation()}>
        <div className="label-modal-header-two-columns">
          <h3><FaTag /> Personalizar Etiqueta</h3>
          <button className="label-modal-close-two-columns" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="label-modal-two-columns-layout">
          {/* Columna Izquierda - Solo Previsualización */}
          <div className="label-modal-left-column">
            <div className="label-modal-preview-section">
              <div className="label-modal-preview-container">
                {renderLabelPreview()}
              </div>          
            </div>
          </div>
          
          {/* Columna Derecha - Estilos, Colores y Formulario */}
          <div className="label-modal-right-column">
            <form onSubmit={handleSubmit}>
              {/* Estilos de etiqueta */}
              <div className="label-modal-styles-section">
                <h4>Estilos de etiqueta</h4>
                <div className="label-modal-style-buttons">
                  <button 
                    type="button"
                    className={`label-modal-style-btn ${previewStyle === 'simple' ? 'active' : ''}`}
                    onClick={() => handleStyleChange('simple')}
                  >
                    <div className="label-modal-style-preview simple-preview"></div>
                    <span>Simple</span>
                    <small>(Fondo blanco, texto negro)</small>
                  </button>
                  <button 
                    type="button"
                    className={`label-modal-style-btn ${previewStyle === 'colorful' ? 'active' : ''}`}
                    onClick={() => handleStyleChange('colorful')}
                  >
                    <div className="label-modal-style-preview colorful-preview"></div>
                    <span>Colorido</span>
                    <small>(Personaliza colores)</small>
                  </button>
                  <button 
                    type="button"
                    className={`label-modal-style-btn ${previewStyle === 'white-outline' ? 'active' : ''}`}
                    onClick={() => handleStyleChange('white-outline')}
                  >
                    <div className="label-modal-style-preview white-outline-preview"></div>
                    <span>Blanco con contorno</span>
                    <small>(Solo color del borde)</small>
                  </button>
                </div>
              </div>

              {/* Selectores de color según el estilo */}
              {previewStyle === 'colorful' && (
                <>
                  <div className="label-modal-colors-section">
                    <h4><FaPalette /> Color de fondo</h4>
                    <div className="label-modal-color-options">
                      {colorOptions.map((color) => (
                        <button
                          key={color.code}
                          type="button"
                          className={`label-modal-color-option ${(formData.colorFondo || '#3b82f6') === color.code ? 'selected' : ''}`}
                          style={{ backgroundColor: color.code, border: color.code === '#ffffff' ? '1px solid #ddd' : 'none' }}
                          onClick={() => setFormData({ ...formData, colorFondo: color.code, colorTexto: color.textColor })}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="label-modal-colors-section">
                    <h4><FaFont /> Color del texto</h4>
                    <div className="label-modal-color-options">
                      {textColorOptions.map((color) => (
                        <button
                          key={color.code}
                          type="button"
                          className={`label-modal-color-option ${(formData.colorTexto || '#ffffff') === color.code ? 'selected' : ''}`}
                          style={{ backgroundColor: color.code, border: color.code === '#ffffff' ? '1px solid #ddd' : 'none' }}
                          onClick={() => setFormData({ ...formData, colorTexto: color.code })}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {previewStyle === 'white-outline' && (
                <div className="label-modal-colors-section">
                  <h4><FaBorderAll /> Color del contorno</h4>
                  <div className="label-modal-color-options">
                    {outlineColorOptions.map((color) => (
                      <button
                        key={color.code}
                        type="button"
                        className={`label-modal-color-option ${(formData.colorBorde || '#3b82f6') === color.code ? 'selected' : ''}`}
                        style={{ backgroundColor: color.code, border: color.code === '#ffffff' ? '1px solid #ddd' : 'none' }}
                        onClick={() => setFormData({ ...formData, colorBorde: color.code })}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Formulario de datos */}
              <div className="label-modal-form-fields">
                <div className="label-modal-form-group">
                  <label><FaTag /> Nombre completo</label>
                  <input 
                    type="text" 
                    name="nombre" 
                    value={formData.nombre || ''} 
                    onChange={handleChange} 
                    placeholder="Ej: María González"
                  />
                </div>
                
                <div className="label-modal-form-group">
                  <label>Materia</label>
                  <input 
                    type="text" 
                    name="materia" 
                    value={formData.materia || ''} 
                    onChange={handleChange} 
                    placeholder="Ej: Matemáticas"
                  />
                </div>

                <div className="label-modal-form-group">
                  <label><FaSchool /> Escuela</label>
                  <input 
                    type="text" 
                    name="escuela" 
                    value={formData.escuela || ''} 
                    onChange={handleChange} 
                    placeholder="Ej: Esc. Primaria Benito Juárez"
                  />
                </div>

                <div className="label-modal-form-group">
                  <label><FaChalkboardTeacher /> Maestro/a</label>
                  <input 
                    type="text" 
                    name="maestro" 
                    value={formData.maestro || ''} 
                    onChange={handleChange} 
                    placeholder="Ej: Prof. Carlos López"
                  />
                </div>
                
                <div className="label-modal-form-row">
                  <div className="label-modal-form-group">
                    <label>Grado</label>
                    <input 
                      type="text" 
                      name="grado" 
                      value={formData.grado || ''} 
                      onChange={handleChange} 
                      placeholder="Ej: 3er semestre"
                    />
                  </div>
                  <div className="label-modal-form-group">
                    <label>Grupo</label>
                    <input 
                      type="text" 
                      name="grupo" 
                      value={formData.grupo || ''} 
                      onChange={handleChange} 
                      placeholder="Ej: A"
                    />
                  </div>
                </div>
                
                <div className="label-modal-form-group">
                  <label>Posición en la libreta</label>
                  <select name="posicion" value={formData.posicion || 'center'} onChange={handleChange}>
                    <option value="center">Centro</option>
                    <option value="bottom-left">Esquina inferior izquierda</option>
                    <option value="bottom-right">Esquina inferior derecha</option>
                  </select>
                </div>
              </div>
              
              <div className="label-modal-footer-two-columns">
                {etiqueta && etiqueta.show && (
                  <button type="button" className="label-modal-remove-btn" onClick={handleRemove}>
                    Eliminar etiqueta
                  </button>
                )}
                <button type="submit" className="label-modal-save-btn">
                  <FaCheck /> Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelModal;