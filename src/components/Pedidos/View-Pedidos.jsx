import React, { useState } from 'react';
import { FaPrint, FaPalette, FaBook, FaTag, FaImage, FaRulerCombined, FaEye, FaTruck, FaMapMarkerAlt, FaMoneyBillWave, FaStore } from 'react-icons/fa';
import '../../css/pedidos/view-pedidos.css';

export function ViewOrderModal({ isOpen, onClose, order }) {
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pendiente': 'Pendiente', 'en_proceso': 'En Proceso',
      'enviado': 'Enviado', 'entregado': 'Entregado', 'cancelado': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const classMap = {
      'pendiente': 'pedidos-status-pending', 'en_proceso': 'pedidos-status-processing',
      'enviado': 'pedidos-status-shipped', 'entregado': 'pedidos-status-delivered',
      'cancelado': 'pedidos-status-cancelled'
    };
    return classMap[status] || 'pedidos-status-pending';
  };

  const getColorName = (colorCode) => {
    const colorMap = {
      '#3b82f6': 'Azul', '#0ea5e9': 'Celeste', '#eab308': 'Amarillo',
      '#f97316': 'Naranja', '#fdba74': 'Durazno', '#ec4899': 'Rosa',
      '#22c55e': 'Verde', '#ef4444': 'Rojo', '#a855f7': 'Morado',
      '#6b7280': 'Gris', '#ffffff': 'Blanco', '#1f2937': 'Negro',
      '#000000': 'Negro', '#8b5cf6': 'Morado claro'
    };
    return colorMap[colorCode] || colorCode;
  };

  const getDesignText = (design) => {
    const designMap = { 'simple': 'Simple', 'colorful': 'Colorido', 'white-outline': 'Blanco con contorno' };
    return designMap[design] || design;
  };

  const getPositionText = (position) => {
    const positionMap = { 'center': 'Centro', 'bottom-left': 'Esquina inferior izquierda', 'bottom-right': 'Esquina inferior derecha' };
    return positionMap[position] || position;
  };

  const getShippingMethodText = (method) => {
    if (method === 'delivery') return '🚚 Envío a domicilio';
    if (method === 'pickup') return '🏪 Recoger en tienda';
    return method === 'delivery' ? '🚚 Envío a domicilio' : '🏪 Recoger en tienda';
  };

  const getShippingMethodIcon = (method) => {
    if (method === 'pickup') return <FaStore />;
    return <FaTruck />;
  };

  const parseSpecifications = (productName) => {
    try {
      if (productName && typeof productName === 'string') {
        if (productName.includes('{') || productName.includes('"')) {
          return JSON.parse(productName);
        }
      }
    } catch (e) {
      console.error('Error parsing specifications:', e);
    }
    return { name: productName };
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !order) return null;

  const LabelDetailModal = ({ label, onClose }) => {
    if (!label) return null;
    return (
      <div className="pedidos-modal-overlay" onClick={onClose}>
        <div className="pedidos-modal-container" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
          <div className="pedidos-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Detalles de la Etiqueta</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
          </div>
          <div className="pedidos-modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p><strong>Estilo:</strong> {getDesignText(label.diseño)}</p>
              <p><strong>Nombre:</strong> {label.nombre || '—'}</p>
              <p><strong>Materia:</strong> {label.materia || '—'}</p>
              <p><strong>Escuela:</strong> {label.escuela || '—'}</p>
              <p><strong>Maestro/a:</strong> {label.maestro || '—'}</p>
              <p><strong>Grado:</strong> {label.grado || '—'}</p>
              <p><strong>Grupo:</strong> {label.grupo || '—'}</p>
              <p><strong>Posición:</strong> {getPositionText(label.posicion)}</p>
              {label.diseño === 'colorful' && (
                <>
                  <p><strong>Color fondo:</strong> 
                    <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: label.colorFondo, verticalAlign: 'middle', marginLeft: '0.5rem' }}></span> 
                    {getColorName(label.colorFondo)}
                  </p>
                  <p><strong>Color texto:</strong> 
                    <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: label.colorTexto, verticalAlign: 'middle', marginLeft: '0.5rem' }}></span> 
                    {getColorName(label.colorTexto)}
                  </p>
                </>
              )}
              {label.diseño === 'white-outline' && (
                <p><strong>Color borde:</strong> 
                  <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: label.colorBorde, verticalAlign: 'middle', marginLeft: '0.5rem' }}></span> 
                  {getColorName(label.colorBorde)}
                </p>
              )}
            </div>
          </div>
          <div className="pedidos-modal-footer">
            <button className="pedidos-modal-cancel" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    );
  };

  const ImageModal = ({ imageUrl, onClose, title = "Imagen" }) => {
    if (!imageUrl) return null;

    const handleDownload = () => {
      try {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `imagen_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error al descargar imagen:', error);
        alert('Error al descargar la imagen');
      }
    };

    return (
      <div className="pedidos-modal-overlay" onClick={onClose}>
        <div className="pedidos-modal-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
          <div className="pedidos-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{title}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
          </div>
          <div className="pedidos-modal-body" style={{ textAlign: 'center' }}>
            <img src={imageUrl} alt={title} style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} />
          </div>
          <div className="pedidos-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
            <button 
              onClick={handleDownload}
              style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Descargar imagen
            </button>
            <button 
              className="pedidos-modal-cancel" 
              onClick={onClose}
              style={{ background: '#6b7280', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ShippingInfoModal = ({ order, onClose }) => {
    if (!order) return null;

    const isPickup = order.shipping_method === 'pickup';
    const shippingMethod = order.shipping_method || (order.shipping_cost > 0 ? 'delivery' : 'pickup');

    return (
      <div className="pedidos-modal-overlay" onClick={onClose}>
        <div className="pedidos-modal-container" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
          <div className="pedidos-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{getShippingMethodIcon(shippingMethod)} Información de {isPickup ? 'Recolección' : 'Envío'}</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
          </div>
          <div className="pedidos-modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: isPickup ? '#fef3c7' : '#f0f9ff', borderRadius: '8px', borderLeft: `4px solid ${isPickup ? '#f59e0b' : '#3b82f6'}` }}>
                <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {getShippingMethodIcon(shippingMethod)} {getShippingMethodText(shippingMethod)}
                </p>
                {!isPickup && order.shipping_cost > 0 && (
                  <p style={{ marginTop: '0.5rem' }}><strong>Costo de envío:</strong> {formatCurrency(order.shipping_cost)}</p>
                )}
                {isPickup && <p style={{ marginTop: '0.5rem' }}><strong>Costo:</strong> Sin costo</p>}
              </div>
              
              {isPickup ? (
                <div>
                  <p><FaStore style={{ display: 'inline-block', marginRight: '0.5rem', color: '#f59e0b' }} /> 
                    <strong>Dirección de recolección:</strong>
                  </p>
                  <div style={{ marginLeft: '1.5rem', padding: '0.5rem', background: '#f9fafb', borderRadius: '6px' }}>
                    <p style={{ margin: '0.25rem 0' }}><strong>Tienda:</strong> Libretas Personalizadas</p>
                    <p style={{ margin: '0.25rem 0' }}><strong>Dirección:</strong> Av. Principal #123, Col. Centro</p>
                    <p style={{ margin: '0.25rem 0' }}><strong>Ciudad:</strong> México, CDMX</p>
                    <p style={{ margin: '0.25rem 0' }}><strong>Horario:</strong> Lunes a Viernes 10:00 - 18:00 hrs</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p><FaMapMarkerAlt style={{ display: 'inline-block', marginRight: '0.5rem', color: '#ef4444' }} /> 
                      <strong>Dirección de envío:</strong>
                    </p>
                    <div style={{ marginLeft: '1.5rem', padding: '0.5rem', background: '#f9fafb', borderRadius: '6px' }}>
                      <p style={{ margin: '0.25rem 0' }}><strong>Destinatario:</strong> {order.customer_name}</p>
                      <p style={{ margin: '0.25rem 0' }}><strong>Dirección:</strong> {order.customer_address || '—'}</p>
                      <p style={{ margin: '0.25rem 0' }}><strong>Teléfono:</strong> {order.customer_phone || '—'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="pedidos-modal-footer">
            <button className="pedidos-modal-cancel" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    );
  };

  // Obtener la URL de la evidencia de pago
  const getPaymentEvidenceUrl = () => {
    if (order.payment_evidence) return order.payment_evidence;
    if (order.payment_evidence_url) return order.payment_evidence_url;
    if (order.transferencia_evidence) return order.transferencia_evidence;
    if (order.bank_transfer_image) return order.bank_transfer_image;
    return null;
  };

  const paymentEvidenceUrl = getPaymentEvidenceUrl();
  const hasPaymentEvidence = !!paymentEvidenceUrl;
  
  // Determinar método de envío
  const shippingMethod = order.shipping_method || (order.shipping_cost > 0 ? 'delivery' : 'pickup');

  return (
    <>
      <div className="pedidos-modal-overlay" onClick={onClose}>
        <div className="pedidos-modal-container view-order-modal" style={{ maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
          <div className="pedidos-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <h3>Detalles del Pedido</h3>
            <button onClick={handlePrint} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaPrint /> Imprimir
            </button>
          </div>
          
          <div className="pedidos-modal-body" style={{ flex: 1, overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                <p><strong>Número de Pedido:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1e3a8a' }}>{order.order_number || order.id}</span></p>
                <p><strong>Fecha:</strong> {formatDate(order.created_at)}</p>
                <p><strong>Estado:</strong> <span className={`pedidos-order-status-badge ${getStatusClass(order.status)}`}>{getStatusText(order.status)}</span></p>
              </div>
            </div>
            
            <hr />
            
            <div style={{ margin: '1rem 0' }}>
              <h4 style={{ color: '#1e3a8a', marginBottom: '0.75rem' }}>Información del Cliente</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem' }}>
                <p><strong>Nombre:</strong> {order.customer_name}</p>
                <p><strong>Email:</strong> {order.customer_email}</p>
                <p><strong>Teléfono:</strong> {order.customer_phone || '—'}</p>
                {shippingMethod === 'delivery' && (
                  <p><strong>Dirección:</strong> {order.customer_address || '—'}</p>
                )}
              </div>
            </div>
            
            <hr />
            
            {/* Sección de Pago y Transferencia */}
            <div style={{ margin: '1rem 0' }}>
              <h4 style={{ color: '#1e3a8a', marginBottom: '0.75rem' }}>
                <FaMoneyBillWave /> Información de Pago
              </h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                <div style={{ background: '#f9fafb', padding: '0.75rem', borderRadius: '6px' }}>
                  <p><strong>Método de pago:</strong> Transferencia bancaria</p>
                  <p><strong>Estado del pago:</strong> 
                    <span style={{ 
                      marginLeft: '0.5rem', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem',
                      background: hasPaymentEvidence ? '#d1fae5' : '#fed7aa',
                      color: hasPaymentEvidence ? '#065f46' : '#9a3412'
                    }}>
                      {hasPaymentEvidence ? 'Comprobante recibido' : 'Pendiente de comprobante'}
                    </span>
                  </p>
                </div>
                
                {/* Datos bancarios para transferencia */}
                <div style={{ background: '#fef3c7', padding: '0.75rem', borderRadius: '6px' }}>
                  <p><strong>Datos bancarios:</strong></p>
                  <p><strong>Tarjeta:</strong> 1234 5678 9012 3456</p>
                  <p><strong>Banco:</strong> BBVA México</p>
                  <p><strong>Titular:</strong> Libretas Personalizadas S.A. de C.V.</p>
                </div>
              </div>
              
              {/* Evidencia de transferencia */}
              {hasPaymentEvidence ? (
                <div style={{ marginTop: '1rem' }}>
                  <h5 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>📎 Comprobante de Transferencia</h5>
                  <button 
                    onClick={() => setShowEvidenceModal(true)} 
                    style={{ 
                      background: '#3b82f6', 
                      color: 'white', 
                      border: 'none', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <FaEye /> Ver Comprobante de Transferencia
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fee2e2', borderRadius: '6px' }}>
                  <p style={{ color: '#991b1b', margin: 0, fontSize: '0.875rem' }}>
                    ⚠️ Aún no se ha subido el comprobante de transferencia
                  </p>
                </div>
              )}
            </div>
            
            <hr />
            
            {/* Sección de Envío/Recolección */}
            <div style={{ margin: '1rem 0' }}>
              <h4 style={{ color: '#1e3a8a', marginBottom: '0.75rem' }}>
                {shippingMethod === 'pickup' ? <FaStore /> : <FaTruck />} 
                {shippingMethod === 'pickup' ? ' Información de Recolección' : ' Información de Envío'}
              </h4>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', flex: 1 }}>
                  <p style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    {getShippingMethodIcon(shippingMethod)} {getShippingMethodText(shippingMethod)}
                  </p>
                  {shippingMethod === 'delivery' && (
                    <>
                      <p><strong>Costo de envío:</strong> {formatCurrency(order.shipping_cost || 0)}</p>
                      <p><strong>Dirección:</strong> {order.customer_address || '—'}</p>
                    </>
                  )}
                  {shippingMethod === 'pickup' && (
                    <>
                      <p><strong>Costo:</strong> Sin costo</p>
                      <p><strong>Dirección:</strong> Av. Principal #123, Col. Centro, CDMX</p>
                    </>
                  )}
                </div>
                
                <button 
                  onClick={() => setShowShippingModal(true)} 
                  style={{ 
                    background: '#10b981', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem'
                  }}
                >
                  <FaEye /> Ver Detalles Completos
                </button>
              </div>
            </div>
            
            <hr />
            
            <div style={{ margin: '1rem 0' }}>
              <h4 style={{ color: '#1e3a8a', marginBottom: '0.75rem' }}>Productos</h4>
              {order.order_items && order.order_items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {order.order_items.map((item, idx) => {
                    const specs = parseSpecifications(item.product_name);
                    return (
                      <div key={idx} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                          <strong style={{ color: '#1e3a8a', fontSize: '1rem' }}>{specs.name || `Libreta ${idx + 1}`}</strong>
                          <span style={{ fontWeight: 'bold', color: '#059669', fontSize: '1rem' }}>{formatCurrency(item.subtotal)}</span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.875rem' }}>
                            <FaPalette style={{ color: '#3b82f6', marginTop: '0.125rem', flexShrink: 0 }} />
                            <div>
                              <strong>Colores:</strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: specs.colorFrontal || '#3b82f6', border: '1px solid #d1d5db' }}></div>
                                  <span>Portada: {getColorName(specs.colorFrontal || '#3b82f6')}</span>
                                </div>
                                {specs.ambosLados && specs.colorTrasero && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: specs.colorTrasero, border: '1px solid #d1d5db' }}></div>
                                    <span>Contraportada: {getColorName(specs.colorTrasero)}</span>
                                  </div>
                                )}
                                {!specs.ambosLados && <span>(Mismo color en ambos lados)</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                            <FaRulerCombined style={{ color: '#3b82f6', flexShrink: 0 }} />
                            <div><strong>Tipo de papel:</strong> {specs.paperTypeText || (specs.paperType === 'lined' ? 'Rayado' : specs.paperType === 'squared' ? 'Cuadriculado' : specs.paperType === 'squared-large' ? 'Cuadro Grande' : 'Blanco')}</div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                            <FaBook style={{ color: '#3b82f6', flexShrink: 0 }} />
                            <div>
                              <strong>Encuadernación:</strong> {specs.encuadernacionText || (specs.tipoEncuadernacion === 'espiral' ? 'Espiral' : 'Cosida')}
                              {specs.tipoEncuadernacion === 'cosida' && specs.colorHilo && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.5rem' }}>
                                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: specs.colorHilo, border: '1px solid #d1d5db' }}></div>
                                  Hilo: {getColorName(specs.colorHilo)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                            <FaImage style={{ color: specs.hasImage ? '#3b82f6' : '#9ca3af', flexShrink: 0 }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <strong>Imagen personalizada:</strong> {specs.hasImage ? 'Sí' : 'No'}
                              {specs.hasImage && specs.imagenBase64 && (
                                <button 
                                  onClick={() => {
                                    setSelectedImage(specs.imagenBase64);
                                    setShowImageModal(true);
                                  }}
                                  style={{ background: '#6b7280', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                                >
                                  <FaEye /> Ver imagen
                                </button>
                              )}
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem' }}>
                            <FaTag style={{ color: specs.hasLabel ? '#3b82f6' : '#9ca3af', flexShrink: 0 }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <strong>Etiqueta personalizada:</strong> {specs.hasLabel ? 'Sí' : 'No'}
                              {specs.hasLabel && specs.labelData && (
                                <button onClick={() => { setSelectedLabel(specs.labelData); setShowLabelModal(true); }} style={{ background: '#6b7280', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <FaEye /> Ver etiqueta
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid #e5e7eb', fontSize: '0.75rem', color: '#6b7280' }}>
                          <span>Cantidad: {item.quantity}</span>
                          <span>Precio unitario: {formatCurrency(item.unit_price)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No hay productos en este pedido</p>
              )}
            </div>
            
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #e5e7eb', textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '0.25rem 0' }}>
                <span>Subtotal:</span>
                <span>{formatCurrency(order.order_items?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || order.subtotal || 0)}</span>
              </div>
              {order.shipping_cost > 0 && shippingMethod === 'delivery' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '0.25rem 0' }}>
                  <span>Envío:</span>
                  <span>{formatCurrency(order.shipping_cost)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', padding: '0.25rem 0', fontSize: '1.125rem', fontWeight: 'bold', borderTop: '1px solid #e5e7eb', marginTop: '0.25rem', paddingTop: '0.5rem' }}>
                <span>Total:</span>
                <span style={{ color: '#059669' }}>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
          
          <div className="pedidos-modal-footer" style={{ flexShrink: 0 }}>
            <button className="pedidos-modal-cancel" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>

      {showLabelModal && <LabelDetailModal label={selectedLabel} onClose={() => setShowLabelModal(false)} />}
      {showImageModal && <ImageModal imageUrl={selectedImage} onClose={() => setShowImageModal(false)} title="Imagen Personalizada" />}
      {showEvidenceModal && <ImageModal imageUrl={paymentEvidenceUrl} onClose={() => setShowEvidenceModal(false)} title="Comprobante de Transferencia" />}
      {showShippingModal && <ShippingInfoModal order={order} onClose={() => setShowShippingModal(false)} />}
    </>
  );
}