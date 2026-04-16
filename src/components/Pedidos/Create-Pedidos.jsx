import React, { useState, useEffect } from 'react';
import { UserController } from '../../controllers/UserController';
import Step1PersonalData from './Pasos/Step1PersonalData';
import Step2Products from './Pasos/Step2Products';
import Step3Address from './Pasos/Step3Address';
import Step4ShippingMethod from './Pasos/Step4ShippingMethod';
import Step5Payment from './Pasos/Step5Payment';
import '../../css/pedidos/create-pedidos.css';
import { FaSpinner, FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';

export function CreateOrderModal({ isOpen, onClose, onOrderCreated, currentUserRole, currentAdminId }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [showLabelModal, setShowLabelModal] = useState(false);
  
  const [formData, setFormData] = useState({
    user_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    products: [],
    address: '',
    city: '',
    state: '',
    zip_code: '',
    shipping_method: 'pickup',
    shipping_cost: 0,
    payment_method: 'transfer',
    payment_evidence: null,
    total: 0,
    notes: ''
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const result = await UserController.getUsers(currentAdminId, currentUserRole);
        if (result.success) {
          const normalUsers = result.data.filter(user => user.rol === 2);
          setUsers(normalUsers);
        }
      } catch (error) {
        console.error('Error cargando usuarios:', error);
      }
    };
    
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, currentAdminId, currentUserRole]);

  useEffect(() => {
  const productsTotal = formData.products.reduce((sum, product) => sum + (product.total || 70), 0);
  const total = productsTotal + (formData.shipping_method === 'delivery' ? formData.shipping_cost : 0);
  if (formData.total !== total) {
    setFormData(prev => ({ ...prev, total }));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.products, formData.shipping_method, formData.shipping_cost]);

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const { OrderController } = await import('../../controllers/OrdenesController');
      
      if (!formData.customer_name || !formData.customer_name.trim()) {
        alert('El nombre del cliente es requerido');
        setLoading(false);
        return;
      }
      
      if (!formData.customer_email || !formData.customer_email.includes('@')) {
        alert('El email del cliente es requerido y debe ser válido');
        setLoading(false);
        return;
      }
      
      if (formData.products.length === 0) {
        alert('Debes agregar al menos un producto');
        setLoading(false);
        return;
      }
      
      const productsTotal = formData.products.reduce((sum, product) => sum + (product.total || 70), 0);
      const shippingCost = formData.shipping_method === 'delivery' ? (formData.shipping_cost || 0) : 0;
      const total = productsTotal + shippingCost;
      
      let customer_address = 'Recoger en tienda - Av. Principal #123, Centro';
      if (formData.shipping_method === 'delivery') {
        customer_address = `${formData.address || ''}, ${formData.city || ''}, ${formData.state || ''}, CP: ${formData.zip_code || ''}`;
      }
      
      const processedProducts = formData.products.map((product, index) => {
        let imagenBase64 = null;
        if (product.imagenUrl && product.imagenUrl.startsWith('data:image')) {
          imagenBase64 = product.imagenUrl;
        }
        
        const specifications = {
          name: `Libreta ${index + 1}`,
          colorFrontal: product.colorFrontal,
          colorTrasero: product.colorTrasero,
          ambosLados: product.ambosLados,
          colorHilo: product.colorHilo,
          paperType: product.paperType,
          paperTypeText: product.paperType === 'lined' ? 'Rayado' : 
                         product.paperType === 'squared' ? 'Cuadriculado' : 
                         product.paperType === 'squared-large' ? 'Cuadro Grande' : 'Blanco',
          tipoEncuadernacion: product.tipoEncuadernacion,
          encuadernacionText: product.tipoEncuadernacion === 'espiral' ? 'Espiral' : 'Cosida',
          hasImage: !!imagenBase64,
          imagenBase64: imagenBase64,
          hasLabel: product.etiqueta?.show || false,
          labelData: product.etiqueta || null
        };
        
        return {
          product_name: JSON.stringify(specifications),
          quantity: 1,
          unit_price: product.total || 70,
          subtotal: product.total || 70
        };
      });
      
      const orderData = {
        customer_name: formData.customer_name.trim(),
        customer_email: formData.customer_email.trim(),
        customer_phone: formData.customer_phone || '',
        customer_address: customer_address,
        items: processedProducts,
        total: total,
        status: 'pendiente',
        payment_evidence: formData.payment_evidence,
        notes: formData.notes || '',
        shipping_method: formData.shipping_method,
        shipping_cost: shippingCost
      };
      
      const result = await OrderController.createOrder(orderData, currentAdminId, currentUserRole);
      
      if (result.success) {
        alert('¡Pedido creado exitosamente!');
        onOrderCreated();
        onClose();
        resetForm();
      } else {
        alert(result.error || 'Error al crear el pedido');
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      alert('Error al crear el pedido: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      user_id: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      products: [],
      address: '',
      city: '',
      state: '',
      zip_code: '',
      shipping_method: 'pickup',
      shipping_cost: 0,
      payment_method: 'transfer',
      payment_evidence: null,
      total: 0,
      notes: ''
    });
  };

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return <Step1PersonalData formData={formData} updateFormData={updateFormData} users={users} />;
      case 2:
        return <Step2Products formData={formData} updateFormData={updateFormData} showLabelModal={showLabelModal} setShowLabelModal={setShowLabelModal} />;
      case 3:
        return <Step3Address formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <Step4ShippingMethod formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <Step5Payment formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  const canProceed = () => {
    switch(currentStep) {
      case 1:
        return formData.customer_name && formData.customer_email;
      case 2:
        if (formData.products.length === 0) return false;
        return formData.products.every(product => product.id);
      case 3:
        if (formData.shipping_method === 'delivery') {
          return formData.address && formData.city && formData.state && formData.zip_code;
        }
        return true;
      case 4:
        return formData.payment_evidence !== null && formData.payment_evidence !== '';
      case 5:
        return true;
      default:
        return false;
    }
  };

  const modalClassName = `create-pedidos-modal-container ${currentStep === 2 ? 'step-2-size' : ''}`;

  if (!isOpen) return null;

  return (
    <div className="create-pedidos-modal-overlay" onClick={onClose}>
      <div className={modalClassName} onClick={(e) => e.stopPropagation()}>
        <div className="create-pedidos-modal-header">
          <h3>Crear Nuevo Pedido</h3>
          <div className="create-pedidos-step-indicator">
            {[1, 2, 3, 4, 5].map(step => (
              <div key={step} className={`create-pedidos-step-dot ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}>
                {currentStep > step ? <FaCheck /> : step}
              </div>
            ))}
          </div>
          <button className="create-pedidos-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="create-pedidos-modal-body">
          {renderStep()}
        </div>
        
        <div className="create-pedidos-modal-footer">
          {currentStep > 1 && (
            <button type="button" className="create-pedidos-btn-back" onClick={handleBack}>
              <FaArrowLeft /> Anterior
            </button>
          )}
          
          {currentStep < 5 ? (
            <button type="button" className="create-pedidos-btn-next" onClick={handleNext} disabled={!canProceed()}>
              Siguiente <FaArrowRight />
            </button>
          ) : (
            <button type="button" className="create-pedidos-btn-submit" onClick={handleSubmit} disabled={loading}>
              {loading ? <><FaSpinner className="create-pedidos-spinner" /> Creando Pedido...</> : 'Confirmar Pedido'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}