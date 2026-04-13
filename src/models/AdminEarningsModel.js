// src/models/AdminEarningsModel.js
import { supabase } from '../lib/supabase';

export const AdminEarningsModel = {
  // Obtener configuración de un administrador
  async getByAdminId(adminId) {
    try {
      const { data, error } = await supabase
        .from('admin_earnings_config')
        .select('*')
        .eq('admin_id', adminId)
        .maybeSingle(); // Usar maybeSingle en lugar de single para evitar error 406
      
      if (error) throw error;
      
      // Si no existe, crear configuración por defecto
      if (!data) {
        console.log('No se encontró configuración, creando por defecto para:', adminId);
        return await this.createDefault(adminId);
      }
      
      return data;
    } catch (error) {
      console.error('Error en getByAdminId:', error);
      return null;
    }
  },

  // Crear configuración por defecto
  async createDefault(adminId) {
    try {
      const now = new Date();
      const newConfig = {
        admin_id: adminId,
        percentage_by_ship: 10,
        percentage_by_employee: 5,
        total_earnings: 0,
        monthly_earnings: 0,
        current_month: now.getMonth() + 1,
        current_year: now.getFullYear(),
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('admin_earnings_config')
        .insert([newConfig])
        .select()
        .single();
      
      if (error) throw error;
      console.log('Configuración creada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error en createDefault:', error);
      return null;
    }
  },

  // Actualizar porcentajes de un administrador (solo super admin)
  async updatePercentages(adminId, percentages, currentUserRole) {
    if (currentUserRole !== 0) {
      return { success: false, error: 'No tienes permiso para modificar porcentajes' };
    }

    try {
      // Primero verificar si existe el registro
      let config = await this.getByAdminId(adminId);
      
      if (!config) {
        config = await this.createDefault(adminId);
        if (!config) {
          return { success: false, error: 'No se pudo crear la configuración' };
        }
      }

      const { data, error } = await supabase
        .from('admin_earnings_config')
        .update({
          percentage_by_ship: percentages.percentage_by_ship,
          percentage_by_employee: percentages.percentage_by_employee,
          updated_at: new Date().toISOString()
        })
        .eq('admin_id', adminId)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error en updatePercentages:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener todos los administradores con su configuración (solo super admin)
  async getAllAdminsWithConfig() {
    try {
      // Primero obtener todos los usuarios con rol 1
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, rol')
        .eq('rol', 1);
      
      if (usersError) throw usersError;
      
      // Para cada admin, obtener su configuración
      const adminsWithConfig = await Promise.all(
        users.map(async (admin) => {
          const config = await this.getByAdminId(admin.id);
          return {
            ...admin,
            admin_earnings_config: config
          };
        })
      );
      
      return adminsWithConfig;
    } catch (error) {
      console.error('Error en getAllAdminsWithConfig:', error);
      return [];
    }
  },

  // Reiniciar ganancias mensuales (se ejecuta automáticamente al cambiar de mes)
  async resetMonthlyEarnings() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    try {
      const { error } = await supabase
        .from('admin_earnings_config')
        .update({
          monthly_earnings: 0,
          current_month: currentMonth,
          current_year: currentYear,
          updated_at: new Date().toISOString()
        })
        .neq('id', '');
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error en resetMonthlyEarnings:', error);
      return false;
    }
  },

  // Agregar ganancia por envío o empleado
  async addEarning(adminId, type, amount) {
    try {
      let config = await this.getByAdminId(adminId);
      if (!config) {
        config = await this.createDefault(adminId);
        if (!config) return false;
      }

      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Verificar si es nuevo mes para reiniciar ganancias mensuales
      let monthlyEarnings = config.monthly_earnings;
      if (config.current_month !== currentMonth || config.current_year !== currentYear) {
        monthlyEarnings = 0;
      }

      let earningAmount = 0;
      if (type === 'ship') {
        earningAmount = amount * (config.percentage_by_ship / 100);
      } else if (type === 'employee') {
        earningAmount = amount * (config.percentage_by_employee / 100);
      }

      const { error } = await supabase
        .from('admin_earnings_config')
        .update({
          total_earnings: config.total_earnings + earningAmount,
          monthly_earnings: monthlyEarnings + earningAmount,
          current_month: currentMonth,
          current_year: currentYear,
          updated_at: new Date().toISOString()
        })
        .eq('admin_id', adminId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error en addEarning:', error);
      return false;
    }
  }
};