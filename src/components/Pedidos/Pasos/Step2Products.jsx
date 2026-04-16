import React, { useState } from 'react';
import { FaPlus, FaTrash, FaEdit, FaCopy } from 'react-icons/fa';
import Step2NotebookCustomization from '../Step2NotebookCustomization';
import '../../../css/pedidos/Pasos/paso2.css';

const Step2Products = ({ formData, updateFormData, showLabelModal, setShowLabelModal }) => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Precio base de cada libreta
  const NOTEBOOK_BASE_PRICE = 70;

  // Estructura por defecto para una libreta
  const getDefaultProduct = () => ({
    id: Date.now(),
    colorFrontal: '#3b82f6',
    colorTrasero: '#3b82f6',
    ambosLados: false,
    colorHilo: '#8b5cf6',
    paperType: 'lined',
    tipoEncuadernacion: 'espiral',
    imagenUrl: null,
    imagenSize: 100,
    imagenPosition: { x: 50, y: 50 },
    etiqueta: {
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
    },
    items: [],
    total: NOTEBOOK_BASE_PRICE
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setCurrentProduct(getDefaultProduct());
    setShowProductModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    const productWithEtiqueta = {
      ...product,
      etiqueta: product.etiqueta || {
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
    setCurrentProduct(productWithEtiqueta);
    setShowProductModal(true);
  };

  const saveProduct = () => {
    if (currentProduct) {
      const productToSave = { 
        ...currentProduct, 
        id: currentProduct.id || Date.now(),
        total: NOTEBOOK_BASE_PRICE 
      };
      
      console.log('Guardando producto:', productToSave);
      console.log('Productos actuales antes de guardar:', formData.products);
      
      if (editingProduct) {
        // Actualizar producto existente
        const updatedProducts = formData.products.map(p => 
          p.id === editingProduct.id ? productToSave : p
        );
        updateFormData({ products: updatedProducts });
        console.log('Producto actualizado. Total productos:', updatedProducts.length);
      } else {
        // Agregar nuevo producto
        const newProducts = [...formData.products, productToSave];
        updateFormData({ products: newProducts });
        console.log('Nuevo producto agregado. Total productos:', newProducts.length);
      }
      setShowProductModal(false);
      setCurrentProduct(null);
      setEditingProduct(null);
    }
  };

  const removeProduct = (productId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta libreta?')) {
      const newProducts = formData.products.filter(p => p.id !== productId);
      updateFormData({ products: newProducts });
      console.log('Producto eliminado. Restantes:', newProducts.length);
    }
  };

  const duplicateProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
      total: NOTEBOOK_BASE_PRICE
    };
    const newProducts = [...formData.products, newProduct];
    updateFormData({ products: newProducts });
    console.log('Producto duplicado. Total:', newProducts.length);
  };

  const updateCurrentProduct = (newData) => {
    setCurrentProduct(prev => ({ ...prev, ...newData }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);
  };

  const calculateSubtotal = () => {
    const subtotal = formData.products.reduce((sum, p) => sum + (p.total || NOTEBOOK_BASE_PRICE), 0);
    return subtotal;
  };

  return (
    <div className="step2-products">
      <div className="step2-header">
        <div>
          <h3>Productos del Pedido</h3>
          <p className="step2-description">Agrega las libretas personalizadas que el cliente desea</p>
        </div>
        <div className="step2-header-info">
          <span className="step2-product-count">
            {formData.products.length} {formData.products.length === 1 ? 'libreta' : 'libretas'}
          </span>
          <span className="step2-subtotal">
            Subtotal: {formatCurrency(calculateSubtotal())}
          </span>
        </div>
      </div>
      
      <button className="step2-btn-add-product" onClick={openCreateModal}>
        <FaPlus /> Agregar Libreta
      </button>
      
      {formData.products.length === 0 ? (
        <div className="step2-empty-products">
          <p>No hay productos agregados</p>
          <small>Haz clic en "Agregar Libreta" para comenzar</small>
        </div>
      ) : (
        <div className="step2-products-list">
          {formData.products.map((product, index) => (
            <div key={product.id} className="step2-product-card">
              <div className="step2-product-header">
                <span className="step2-product-number">Libreta #{index + 1}</span>
                <div className="step2-product-actions">
                  <button onClick={() => openEditModal(product)} title="Editar">
                    <FaEdit />
                  </button>
                  <button onClick={() => duplicateProduct(product)} title="Duplicar">
                    <FaCopy />
                  </button>
                  <button onClick={() => removeProduct(product.id)} title="Eliminar">
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="step2-product-preview">
                <div 
                  className="step2-mini-preview"
                  style={{ backgroundColor: product.colorFrontal || '#3b82f6' }}
                >
                  {product.imagenUrl && (
                    <img src={product.imagenUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
                <div className="step2-product-details">
                  <p><strong>Tipo de papel:</strong> {product.paperType === 'lined' ? 'Rayado' : product.paperType === 'squared' ? 'Cuadriculado' : product.paperType === 'squared-large' ? 'Cuadro Grande' : 'Blanco'}</p>
                  <p><strong>Encuadernación:</strong> {product.tipoEncuadernacion === 'espiral' ? 'Espiral' : 'Cosida'}</p>
                  <p><strong>Color:</strong> {product.colorFrontal === '#3b82f6' ? 'Azul' : 
                             product.colorFrontal === '#ef4444' ? 'Rojo' :
                             product.colorFrontal === '#22c55e' ? 'Verde' :
                             product.colorFrontal === '#eab308' ? 'Amarillo' :
                             product.colorFrontal === '#f97316' ? 'Naranja' :
                             product.colorFrontal === '#a855f7' ? 'Morado' :
                             product.colorFrontal === '#ec4899' ? 'Rosa' :
                             product.colorFrontal === '#0ea5e9' ? 'Celeste' :
                             product.colorFrontal === '#1f2937' ? 'Negro' : 'Personalizado'}</p>
                  <p><strong>Etiqueta:</strong> {product.etiqueta?.show ? product.etiqueta.nombre || 'Sí' : 'No'}</p>
                  <p><strong>Imagen:</strong> {product.imagenUrl ? 'Sí' : 'No'}</p>
                  <p className="step2-product-price"><strong>Precio:</strong> {formatCurrency(product.total || NOTEBOOK_BASE_PRICE)}</p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="step2-products-total">
            <div className="step2-total-row">
              <span>Subtotal ({formData.products.length} libretas):</span>
              <strong>{formatCurrency(calculateSubtotal())}</strong>
            </div>
            <div className="step2-total-row step2-total-final">
              <span>Total a pagar:</span>
              <strong>{formatCurrency(calculateSubtotal())}</strong>
            </div>
            <small className="step2-total-note">* El costo de envío se calculará en el siguiente paso</small>
          </div>
        </div>
      )}
      
      {/* Modal de personalización de libreta */}
      {showProductModal && currentProduct && (
        <div className="step2-notebook-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="step2-notebook-modal" onClick={(e) => e.stopPropagation()}>
            <div className="step2-notebook-modal-header">
              <h3>{editingProduct ? 'Editar Libreta' : 'Nueva Libreta'}</h3>
              <button className="step2-modal-close" onClick={() => setShowProductModal(false)}>×</button>
            </div>
            <div className="step2-notebook-modal-body">
              <Step2NotebookCustomization 
                formData={currentProduct}
                updateFormData={updateCurrentProduct}
                showLabelModal={showLabelModal}
                setShowLabelModal={setShowLabelModal}
              />
            </div>
            <div className="step2-notebook-modal-footer">
              <button className="step2-btn-cancel" onClick={() => setShowProductModal(false)}>
                Cancelar
              </button>
              <button className="step2-btn-save" onClick={saveProduct}>
                {editingProduct ? 'Guardar Cambios' : 'Agregar Libreta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2Products;