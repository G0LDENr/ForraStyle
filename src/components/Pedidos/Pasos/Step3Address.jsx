import React, { useState, useEffect, useCallback} from 'react';
import { FaMapMarkerAlt, FaCity, FaMapPin, FaTruck, FaStore, FaMoneyBillWave, FaCalculator } from 'react-icons/fa';
import '../../../css/pedidos/Pasos/paso3.css';

const Step3Address = ({ formData, updateFormData }) => {
  const [shippingType, setShippingType] = useState(formData.shipping_method || 'pickup');
  
  const calculateShippingCost = useCallback((productCount) => {
    if (productCount === 0) return 0;
    if (productCount === 1) return 50;
    if (productCount === 2) return 70;
    if (productCount === 3) return 85;
    if (productCount >= 4) return 50 + (productCount - 1) * 25;
    return 50;
  }, []);

  const productCount = formData.products?.length || 0;
  const calculatedCost = calculateShippingCost(productCount);

  useEffect(() => {
    if (shippingType === 'delivery') {
      updateFormData({ shipping_cost: calculatedCost });
    }
  }, [productCount, shippingType, calculatedCost, updateFormData]);

  const handleShippingTypeChange = (type) => {
    setShippingType(type);
    const cost = type === 'delivery' ? calculatedCost : 0;
    updateFormData({ 
      shipping_method: type, 
      shipping_cost: cost 
    });
  };

  return (
    <div className="step-address">
      <h3>Método de Entrega</h3>
      
      {/* Mostrar cantidad de libretas */}
      <div className="products-count-badge">
        <FaCalculator />
        <span>Cantidad de libretas en el pedido: <strong>{productCount}</strong></span>
      </div>
      
      {/* Opciones de envío */}
      <div className="shipping-options">
        <div 
          className={`shipping-option ${shippingType === 'pickup' ? 'selected' : ''}`}
          onClick={() => handleShippingTypeChange('pickup')}
        >
          <div className="shipping-option-icon">
            <FaStore />
          </div>
          <div className="shipping-option-content">
            <h4>Recoger en Tienda</h4>
            <p>El cliente recoge el pedido en nuestra tienda física</p>
            <div className="shipping-option-price">Sin costo adicional</div>
          </div>
          {shippingType === 'pickup' && (
            <div className="shipping-option-check">✓</div>
          )}
        </div>

        <div 
          className={`shipping-option ${shippingType === 'delivery' ? 'selected' : ''}`}
          onClick={() => handleShippingTypeChange('delivery')}
        >
          <div className="shipping-option-icon">
            <FaTruck />
          </div>
          <div className="shipping-option-content">
            <h4>Envío a Domicilio</h4>
            <p>Entregamos el pedido en la dirección del cliente</p>
            <div className="shipping-option-price">
              <FaMoneyBillWave />
              <span>Costo: ${calculatedCost} MXN</span>
              <small className="shipping-breakdown">
                {productCount === 1 && "(1 libreta - $50)"}
                {productCount === 2 && "(2 libretas - $70)"}
                {productCount === 3 && "(3 libretas - $85)"}
                {productCount >= 4 && `(${productCount} libretas - $50 + $25 por extra)`}
                {productCount === 0 && "(Agrega libretas para calcular envío)"}
              </small>
            </div>
          </div>
          {shippingType === 'delivery' && (
            <div className="shipping-option-check">✓</div>
          )}
        </div>
      </div>

      {/* Dirección - solo visible si selecciona envío a domicilio */}
      {shippingType === 'delivery' && productCount > 0 && (
        <div className="address-section">
          <h4><FaMapMarkerAlt /> Dirección de Envío</h4>
          <div className="form-group">
            <label><FaMapMarkerAlt /> Calle y número *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
              placeholder="Calle, número, colonia"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label><FaCity /> Municipio *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
                placeholder="Ciudad"
              />
            </div>
            
            <div className="form-group">
              <label><FaMapPin /> Estado *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => updateFormData({ state: e.target.value })}
                placeholder="Estado"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Código Postal *</label>
            <input
              type="text"
              value={formData.zip_code}
              onChange={(e) => updateFormData({ zip_code: e.target.value })}
              placeholder="Código postal"
              maxLength="5"
            />
          </div>
        </div>
      )}

      {/* Mensaje si no hay libretas */}
      {shippingType === 'delivery' && productCount === 0 && (
        <div className="warning-no-products">
          <FaStore />
          <span>Agrega al menos una libreta en el paso anterior para calcular el costo de envío</span>
        </div>
      )}

      {/* Mensaje informativo para recoger en tienda */}
      {shippingType === 'pickup' && (
        <div className="pickup-info">
          <FaStore />
          <div>
            <strong>Dirección de la tienda:</strong>
            <p>Av. Principal #123, Centro, Ciudad de México, CP 12345</p>
            <small>Horario: Lunes a Viernes de 9:00 a 18:00 hrs</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step3Address;