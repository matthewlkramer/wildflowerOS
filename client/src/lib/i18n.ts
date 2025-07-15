import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: "Dashboard",
      families: "Families",
      classrooms: "Classrooms", 
      messages: "Messages",
      tasks: "Tasks",
      enrollment: "Enrollment",
      billing: "Billing",
      knowledge: "Knowledge",
      settings: "Settings",
      more: "More",
      
      // Common actions
      create: "Create",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      search: "Search",
      filter: "Filter",
      add: "Add",
      
      // User roles
      parent: "Parent",
      educator: "Educator", 
      board_director: "Board Director",
      systems_administrator: "Systems Administrator",
      
      // School management
      school_settings: "School Settings",
      staff_management: "Staff Management",
      classrooms_management: "Classrooms",
      school_years: "School Years",
      academic_calendar: "Academic Calendar",
      tuition_plans: "Tuition Plans",
      
      // Family management
      family_info: "Family Information",
      children: "Children",
      emergency_contacts: "Emergency Contacts",
      enrollment_status: "Enrollment Status",
      billing_info: "Billing Information",
      
      // Messaging
      channels: "Channels",
      direct_messages: "Direct Messages",
      starred: "Starred",
      unreads: "Unreads",
      new_channel: "New Channel",
      create_channel: "Create Channel",
      channel_name: "Channel name",
      
      // Classroom levels
      infant: "Infant",
      toddler: "Toddler", 
      primary: "Primary",
      lower_elementary: "Lower Elementary",
      upper_elementary: "Upper Elementary",
      junior_high: "Junior High",
      high_school: "High School",
      
      // Enrollment statuses
      enrolled: "Enrolled",
      prospective: "Prospective", 
      withdrawn: "Withdrawn",
      graduated: "Graduated",
      
      // Time periods
      today: "Today",
      yesterday: "Yesterday",
      this_week: "This Week",
      this_month: "This Month",
      
      // Generic messages
      loading: "Loading...",
      no_data: "No data available",
      error_occurred: "An error occurred",
      success: "Success",
      
      // Language switcher
      language: "Language",
      english: "English",
      spanish: "Spanish",
    }
  },
  es: {
    translation: {
      // Navigation
      dashboard: "Panel Principal",
      families: "Familias",
      classrooms: "Aulas",
      messages: "Mensajes", 
      tasks: "Tareas",
      enrollment: "Inscripción",
      billing: "Facturación",
      knowledge: "Conocimiento",
      settings: "Configuración",
      more: "Más",
      
      // Common actions
      create: "Crear",
      edit: "Editar",
      delete: "Eliminar",
      save: "Guardar",
      cancel: "Cancelar",
      confirm: "Confirmar",
      search: "Buscar",
      filter: "Filtrar",
      add: "Agregar",
      
      // User roles
      parent: "Padre/Madre",
      educator: "Educador",
      board_director: "Director de Junta",
      systems_administrator: "Administrador de Sistemas",
      
      // School management
      school_settings: "Configuración de Escuela",
      staff_management: "Gestión de Personal",
      classrooms_management: "Aulas",
      school_years: "Años Escolares",
      academic_calendar: "Calendario Académico",
      tuition_plans: "Planes de Matrícula",
      
      // Family management
      family_info: "Información Familiar",
      children: "Niños",
      emergency_contacts: "Contactos de Emergencia",
      enrollment_status: "Estado de Inscripción",
      billing_info: "Información de Facturación",
      
      // Messaging
      channels: "Canales",
      direct_messages: "Mensajes Directos",
      starred: "Favoritos",
      unreads: "No Leídos",
      new_channel: "Nuevo Canal",
      create_channel: "Crear Canal",
      channel_name: "Nombre del canal",
      
      // Classroom levels
      infant: "Bebés",
      toddler: "Pequeños",
      primary: "Primaria",
      lower_elementary: "Primaria Básica",
      upper_elementary: "Primaria Superior", 
      junior_high: "Secundaria Básica",
      high_school: "Secundaria Superior",
      
      // Enrollment statuses
      enrolled: "Inscrito",
      prospective: "Prospecto",
      withdrawn: "Retirado",
      graduated: "Graduado",
      
      // Time periods
      today: "Hoy",
      yesterday: "Ayer",
      this_week: "Esta Semana",
      this_month: "Este Mes",
      
      // Generic messages
      loading: "Cargando...",
      no_data: "No hay datos disponibles",
      error_occurred: "Ocurrió un error",
      success: "Éxito",
      
      // Language switcher
      language: "Idioma",
      english: "Inglés",
      spanish: "Español",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;