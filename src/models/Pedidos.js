import { supabase } from '../lib/supabase'

export const OrderModel = {
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async generateOrderNumber() {
    // Obtener el último número de pedido
    const { data, error } = await supabase
      .from('orders')
      .select('order_number')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (error) throw error
    
    let lastNumber = 0
    
    if (data && data.length > 0) {
      // Extraer el número después del guión
      const parts = data[0].order_number.split('-')
      if (parts.length === 2) {
        lastNumber = parseInt(parts[1]) || 0
      }
    }
    
    // Incrementar y formatear
    const newNumber = (lastNumber + 1).toString().padStart(6, '0')
    const orderNumber = `ORD-${newNumber}`
    
    // Verificar que no exista (por si acaso)
    const { data: existing, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('order_number', orderNumber)
      .maybeSingle()
    
    if (checkError) throw checkError
    
    // Si ya existe, recursivamente generar otro
    if (existing) {
      console.log('⚠️ Número duplicado, generando otro:', orderNumber)
      return await this.generateOrderNumber()
    }
    
    console.log('✅ Número de pedido generado:', orderNumber)
    return orderNumber
  },

  async create(orderData) {
    const { 
      order_number, customer_name, customer_email, customer_phone, 
      customer_address, items, total, status, created_by, created_at,
      shipping_method, shipping_cost, payment_evidence  // <--- AGREGAR ESTOS CAMPOS
    } = orderData
    
    console.log('📝 Creando pedido con:', {
      order_number,
      customer_name,
      shipping_method,
      shipping_cost,
      has_payment_evidence: !!payment_evidence
    });
    
    // Primero insertar el pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        total,
        status,
        created_by,
        created_at,
        shipping_method: shipping_method || 'pickup',  // <--- AGREGAR
        shipping_cost: shipping_cost || 0,             // <--- AGREGAR
        payment_evidence: payment_evidence || null    // <--- AGREGAR
      }])
      .select()
      .single()
    
    if (orderError) {
      console.error('❌ Error al insertar pedido:', orderError);
      throw orderError;
    }
    
    // Luego insertar los items
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.quantity * item.unit_price
      }))
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
      
      if (itemsError) {
        console.error('❌ Error al insertar items:', itemsError);
        throw itemsError;
      }
    }
    
    console.log('✅ Pedido creado exitosamente, ID:', order.id);
    return await this.getById(order.id)
  },

  async update(id, orderData) {
    const { customer_name, customer_email, customer_phone, customer_address, total, status } = orderData
    
    const { data, error } = await supabase
      .from('orders')
      .update({
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        total,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    // Primero eliminar los items
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id)
    
    if (itemsError) throw itemsError
    
    // Luego eliminar el pedido
    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
    
    if (orderError) throw orderError
    
    return true
  },

  async getAllStatistics(startDate, endDate) {
    let query = supabase
      .from('orders')
      .select('*')
    
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    const stats = {
      total_orders: data.length,
      total_revenue: data.reduce((sum, order) => sum + (order.total || 0), 0),
      average_order_value: data.length > 0 ? data.reduce((sum, order) => sum + (order.total || 0), 0) / data.length : 0,
      total_sellers: new Set(data.map(order => order.created_by)).size,
      pending_orders: data.filter(order => order.status === 'pendiente').length,
      processing_orders: data.filter(order => order.status === 'en_proceso').length,
      shipped_orders: data.filter(order => order.status === 'enviado').length,
      delivered_orders: data.filter(order => order.status === 'entregado').length,
      cancelled_orders: data.filter(order => order.status === 'cancelado').length
    }
    
    return stats
  },

  async getUserStatistics(userId, startDate, endDate) {
    let query = supabase
      .from('orders')
      .select('*')
      .eq('created_by', userId)
    
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    const stats = {
      total_orders: data.length,
      total_revenue: data.reduce((sum, order) => sum + (order.total || 0), 0),
      average_order_value: data.length > 0 ? data.reduce((sum, order) => sum + (order.total || 0), 0) / data.length : 0,
      pending_orders: data.filter(order => order.status === 'pendiente').length,
      processing_orders: data.filter(order => order.status === 'en_proceso').length,
      shipped_orders: data.filter(order => order.status === 'enviado').length,
      delivered_orders: data.filter(order => order.status === 'entregado').length,
      cancelled_orders: data.filter(order => order.status === 'cancelado').length
    }
    
    return stats
  }
};