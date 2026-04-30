import React from 'react';
import { FaCheck, FaUser, FaBox, FaTruck, FaCreditCard, FaFileImage, FaMoneyBillWave, FaStore } from 'react-icons/fa';
import '../../../css/pedidos/Pasos/paso5.css';

const Step5Summary = ({ formData }) => {
  // Calcular totales
  const calculateSubtotal = () => {
    return formData.products?.reduce((sum, product) => sum + (product.total || 70), 0) || 0;
  };

  const totalAmount = calculateSubtotal() + (formData.shipping_method === 'delivery' ? (formData.shipping_cost || 0) : 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);
  };

  // Obtener texto del tipo de papel
  const getPaperTypeText = (paperType) => {
    switch(paperType) {
      case 'lined': return 'Rayado';
      case 'squared': return 'Cuadriculado';
      case 'squared-large': return 'Cuadro Grande';
      case 'blank': return 'Blanco';
      default: return paperType || 'No especificado';
    }
  };

  // Obtener texto de encuadernación
  const getBindingText = (binding) => {
    return binding === 'espiral' ? 'Espiral' : binding === 'cosida' ? 'Cosida' : 'No especificado';
  };

  return (
    <div className="step-summary">
      <h3>Resumen del Pedido</h3>
      <p className="step-description">Revisa toda la información antes de confirmar el pedido</p>

      {/* Información del Cliente */}
      <div className="summary-section">
        <div className="summary-section-header">
          <FaUser />
          <h4>Información del Cliente</h4>
        </div>
        <div className="summary-section-content">
          <div className="summary-row">
            <span className="summary-label">Nombre:</span>
            <span className="summary-value">{formData.customer_name || 'No especificado'}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Email:</span>
            <span className="summary-value">{formData.customer_email || 'No especificado'}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Teléfono:</span>
            <span className="summary-value">{formData.customer_phone || 'No especificado'}</span>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="summary-section">
        <div className="summary-section-header">
          <FaBox />
          <h4>Productos ({formData.products?.length || 0} libretas)</h4>
        </div>
        <div className="summary-section-content">
          {formData.products?.length === 0 ? (
            <p className="summary-empty">No hay productos agregados</p>
          ) : (
            <div className="summary-products-list">
              {formData.products.map((product, index) => (
                <div key={product.id} className="summary-product-item">
                  <div className="summary-product-number">Libreta #{index + 1}</div>
                  <div className="summary-product-details">
                    <span>Papel: {getPaperTypeText(product.paperType)}</span>
                    <span>Encuadernación: {getBindingText(product.tipoEncuadernacion)}</span>
                    <span>Color: {product.colorFrontal === '#3b82f6' ? 'Azul' : 
                               product.colorFrontal === '#ef4444' ? 'Rojo' :
                               product.colorFrontal === '#22c55e' ? 'Verde' :
                               product.colorFrontal === '#eab308' ? 'Amarillo' :
                               product.colorFrontal === '#f97316' ? 'Naranja' :
                               product.colorFrontal === '#a855f7' ? 'Morado' :
                               product.colorFrontal === '#ec4899' ? 'Rosa' :
                               product.colorFrontal === '#0ea5e9' ? 'Celeste' :
                               product.colorFrontal === '#1f2937' ? 'Negro' : 'Personalizado'}</span>
                    <span>Etiqueta: {product.etiqueta?.show ? 'Sí' : 'No'}</span>
                    {product.etiqueta?.show && product.etiqueta.nombre && (
                      <span>Nombre en etiqueta: {product.etiqueta.nombre}</span>
                    )}
                  </div>
                  <div className="summary-product-price">{formatCurrency(product.total || 70)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Método de Entrega */}
      <div className="summary-section">
        <div className="summary-section-header">
          <FaTruck />
          <h4>Método de Entrega</h4>
        </div>
        <div className="summary-section-content">
          {formData.shipping_method === 'pickup' ? (
            <>
              <div className="summary-row">
                <span className="summary-label">Método:</span>
                <span className="summary-value"><FaStore /> Recoger en Tienda</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Dirección:</span>
                <span className="summary-value">Av. Principal #123, Centro, Ciudad de México, CP 12345</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Horario:</span>
                <span className="summary-value">Lunes a Viernes de 9:00 a 18:00 hrs</span>
              </div>
            </>
          ) : (
            <>
              <div className="summary-row">
                <span className="summary-label">Método:</span>
                <span className="summary-value"><FaTruck /> Envío a Domicilio</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Dirección:</span>
                <span className="summary-value">{formData.address}, {formData.city}, {formData.state}, CP: {formData.zip_code}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Costo de envío:</span>
                <span className="summary-value">{formatCurrency(formData.shipping_cost)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Método de Pago */}
      <div className="summary-section">
        <div className="summary-section-header">
          <FaCreditCard />
          <h4>Método de Pago</h4>
        </div>
        <div className="summary-section-content">
          <div className="summary-row">
            <span className="summary-label">Método:</span>
            <span className="summary-value">Transferencia Bancaria</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Banco:</span>
            <span className="summary-value">BBVA México</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Número de tarjeta:</span>
            <span className="summary-value">1234 5678 9012 3456</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Comprobante:</span>
            <span className="summary-value payment-evidence-status">
              <FaFileImage />
              {formData.payment_evidence ? 'Archivo subido correctamente' : 'No se ha subido comprobante'}
            </span>
          </div>
        </div>
      </div>

      {/* Totales */}
      <div className="summary-section summary-totals">
        <div className="summary-section-header">
          <FaMoneyBillWave />
          <h4>Resumen de Pagos</h4>
        </div>
        <div className="summary-section-content">
          <div className="summary-row">
            <span className="summary-label">Subtotal ({formData.products?.length || 0} libretas):</span>
            <span className="summary-value">{formatCurrency(calculateSubtotal())}</span>
          </div>
          {formData.shipping_method === 'delivery' && (
            <div className="summary-row">
              <span className="summary-label">Costo de envío:</span>
              <span className="summary-value">{formatCurrency(formData.shipping_cost)}</span>
            </div>
          )}
          <div className="summary-row summary-total">
            <span className="summary-label">Total a pagar:</span>
            <span className="summary-value">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Nota adicional */}
      {formData.notes && (
        <div className="summary-section">
          <div className="summary-section-header">
            <h4>Notas adicionales</h4>
          </div>
          <div className="summary-section-content">
            <p className="summary-notes">{formData.notes}</p>
          </div>
        </div>
      )}

      {/* Mensaje de confirmación */}
      <div className="summary-confirmation">
        <FaCheck />
        <span>Revisa que todos los datos sean correctos antes de confirmar el pedido</span>
      </div>
    </div>
  );
};

export default Step5Summary;