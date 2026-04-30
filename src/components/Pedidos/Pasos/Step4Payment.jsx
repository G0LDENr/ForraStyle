import React, { useState, useEffect } from 'react';
import { FaUpload, FaCheck, FaFileImage, FaTimes, FaCreditCard } from 'react-icons/fa';
import '../../../css/pedidos/Pasos/paso4.css';

const Step4Payment = ({ formData, updateFormData }) => {
  const [uploadedFile, setUploadedFile] = useState(formData.payment_evidence || null);
  const [fileName, setFileName] = useState('');

  // Sincronizar con formData cuando cambie desde fuera
  useEffect(() => {
    if (formData.payment_evidence !== uploadedFile) {
      setUploadedFile(formData.payment_evidence);
      if (!formData.payment_evidence) {
        setFileName('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.payment_evidence]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, sube una imagen (jpg, png, etc.)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const evidenceData = reader.result;
        setUploadedFile(evidenceData);
        setFileName(file.name);
        updateFormData({ payment_evidence: evidenceData });
        console.log('✅ Evidencia subida correctamente');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFileName('');
    updateFormData({ payment_evidence: null });
    console.log('❌ Evidencia eliminada');
  };

  // Calcular el total real (productos + envío)
  const calculateTotal = () => {
    const productsTotal = formData.products?.reduce((sum, product) => sum + (product.total || 70), 0) || 0;
    const shippingCost = formData.shipping_method === 'delivery' ? (formData.shipping_cost || 0) : 0;
    return productsTotal + shippingCost;
  };

  const totalAmount = calculateTotal();

  return (
    <div className="step-payment">
      <h3>Método de Pago</h3>
      <p className="step-description">Transferencia bancaria - Envía la evidencia del pago.</p>
      
      {/* Información de la tarjeta */}
      <div className="card-info-card">
        <div className="card-info-header">
          <FaCreditCard />
          <h4>Datos para transferencia</h4>
        </div>
        <div className="card-info-content">
          <div className="card-number">
            <span>Número de tarjeta:</span>
            <strong>1234 5678 9012 3456</strong>
          </div>
          <div className="card-bank">
            <span>Banco:</span>
            <span>BBVA México</span>
          </div>
          <div className="card-owner">
            <span>Titular:</span>
            <span>Libretas Personalizadas S.A. de C.V.</span>
          </div>
        </div>
      </div>

      {/* Desglose del monto a pagar */}
      <div className="amount-breakdown">
        <div className="breakdown-title">Desglose del pago:</div>
        <div className="breakdown-row">
          <span>Subtotal ({formData.products?.length || 0} libretas):</span>
          <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(formData.products?.reduce((sum, p) => sum + (p.total || 70), 0) || 0)}</span>
        </div>
        {formData.shipping_method === 'delivery' && (
          <div className="breakdown-row">
            <span>Costo de envío:</span>
            <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(formData.shipping_cost || 0)}</span>
          </div>
        )}
        <div className="breakdown-total">
          <span>Monto total a pagar:</span>
          <strong>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(totalAmount)}</strong>
        </div>
      </div>

      {/* Subir comprobante - OBLIGATORIO */}
      <div className="upload-section">
        <div className="upload-header">
          <FaUpload />
          <h4>Comprobante de pago <span className="required">*</span></h4>
        </div>
        <p className="upload-description">
          Realiza la transferencia al número de tarjeta proporcionado y sube aquí el comprobante
        </p>
        
        {!uploadedFile ? (
          <label className="upload-area">
            <FaFileImage />
            <span>Haz clic para subir tu comprobante</span>
            <small>Formatos: JPG, PNG (Máx. 5MB)</small>
            <small className="required-text">* Obligatorio para continuar</small>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        ) : (
          <div className="uploaded-file">
            <div className="file-info">
              <FaFileImage />
              <div className="file-details">
                <strong>{fileName || 'Comprobante'}</strong>
                <small>Archivo subido correctamente</small>
              </div>
            </div>
            <button className="remove-file" onClick={removeFile}>
              <FaTimes /> Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Indicador de completado */}
      {uploadedFile && (
        <div className="payment-completed">
          <FaCheck />
          <span>✅ Comprobante subido correctamente. Puedes continuar al siguiente paso.</span>
        </div>
      )}

      {/* Mensaje de obligatoriedad */}
      {!uploadedFile && (
        <div className="payment-warning">
          <span>⚠️ Debes subir el comprobante de pago para continuar</span>
        </div>
      )}
    </div>
  );
};

export default Step4Payment;