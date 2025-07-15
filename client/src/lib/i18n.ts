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
      
      // Dashboard
      welcome: "Welcome",
      overview: "Overview",
      recent_activity: "Recent Activity",
      quick_actions: "Quick Actions",
      statistics: "Statistics",
      students: "Students",
      staff: "Staff",
      active_enrollments: "Active Enrollments",
      pending_tasks: "Pending Tasks",
      upcoming_events: "Upcoming Events",
      financial_summary: "Financial Summary",
      
      // Page headers and titles
      family_management: "Family Management",
      classroom_management: "Classroom Management",
      staff_directory: "Staff Directory",
      student_records: "Student Records",
      academic_planning: "Academic Planning",
      financial_management: "Financial Management",
      
      // Common labels
      name: "Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      date: "Date",
      status: "Status",
      actions: "Actions",
      description: "Description",
      notes: "Notes",
      
      // Status indicators
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      completed: "Completed",
      draft: "Draft",
      published: "Published",
      
      // Form labels
      first_name: "First Name",
      last_name: "Last Name",
      middle_name: "Middle Name",
      date_of_birth: "Date of Birth",
      grade_level: "Grade Level",
      start_date: "Start Date",
      end_date: "End Date",
      
      // Navigation sections
      main_navigation: "Main Navigation",
      user_account: "User Account",
      system_administration: "System Administration",
      
      // Error messages
      field_required: "This field is required",
      invalid_email: "Invalid email address",
      invalid_date: "Invalid date",
      save_error: "Error saving data",
      load_error: "Error loading data",
      
      // Success messages
      save_success: "Data saved successfully",
      delete_success: "Item deleted successfully",
      update_success: "Update completed successfully",
      
      // Search and filters
      search_families: "Search families...",
      all_statuses: "All Statuses",
      all_classrooms: "All Classrooms",
      families_found: "families found",
      
      // Additional labels
      family: "Family",
      child: "Child",
      contact: "Contact",
      classroom: "Classroom",
      view_details: "View Details",
      send_message: "Send Message",
      view_billing: "View Billing",
      sign_out: "Sign Out",
      profile: "Profile",
      
      // Dashboard specific content
      total_students: "Total Students",
      active_classrooms: "Active Classrooms",
      monthly_revenue: "Monthly Revenue",
      recent_activity: "Recent Activity",
      upcoming_tasks: "Upcoming Tasks",
      my_classrooms: "My Classrooms",
      new_enrollment: "New Enrollment",
      create_task: "Create Task",
      manage_classrooms: "Manage classrooms",
      view_tasks: "View tasks",
      view_all_activity: "View all activity",
      view_all_tasks: "View all tasks",
      no_pending_tasks: "No pending tasks",
      great_job_staying: "Great job staying on top of everything!",
      export_report: "Export Report",
      
      // Time indicators
      hours_ago: "hours ago",
      no_data_available: "No data available",
      
      // Activity descriptions
      added_comment: "Added a new comment to the",
      discussion: "discussion",
      completed_enrollment: "Completed enrollment for the",
      children_enrolled: "children enrolled in",
      created_task: "Created task",
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
      
      // Dashboard
      welcome: "Bienvenido",
      overview: "Resumen",
      statistics: "Estadísticas",
      students: "Estudiantes",
      staff: "Personal",
      active_enrollments: "Inscripciones Activas",
      pending_tasks: "Tareas Pendientes",
      upcoming_events: "Próximos Eventos",
      financial_summary: "Resumen Financiero",
      
      // Page headers and titles
      family_management: "Gestión Familiar",
      classroom_management: "Gestión de Aulas",
      staff_directory: "Directorio de Personal",
      student_records: "Registros de Estudiantes",
      academic_planning: "Planificación Académica",
      financial_management: "Gestión Financiera",
      
      // Common labels
      name: "Nombre",
      email: "Correo Electrónico",
      phone: "Teléfono",
      address: "Dirección",
      date: "Fecha",
      status: "Estado",
      actions: "Acciones",
      description: "Descripción",
      notes: "Notas",
      
      // Status indicators
      active: "Activo",
      inactive: "Inactivo",
      pending: "Pendiente",
      completed: "Completado",
      draft: "Borrador",
      published: "Publicado",
      
      // Form labels
      first_name: "Nombre",
      last_name: "Apellido",
      middle_name: "Segundo Nombre",
      date_of_birth: "Fecha de Nacimiento",
      grade_level: "Nivel de Grado",
      start_date: "Fecha de Inicio",
      end_date: "Fecha de Fin",
      
      // Navigation sections
      main_navigation: "Navegación Principal",
      user_account: "Cuenta de Usuario",
      system_administration: "Administración del Sistema",
      
      // Error messages
      field_required: "Este campo es obligatorio",
      invalid_email: "Dirección de correo inválida",
      invalid_date: "Fecha inválida",
      save_error: "Error al guardar datos",
      load_error: "Error al cargar datos",
      
      // Success messages
      save_success: "Datos guardados exitosamente",
      delete_success: "Elemento eliminado exitosamente",
      update_success: "Actualización completada exitosamente",
      
      // Search and filters
      search_families: "Buscar familias...",
      all_statuses: "Todos los Estados",
      all_classrooms: "Todas las Aulas",
      families_found: "familias encontradas",
      
      // Additional labels
      family: "Familia",
      child: "Niño",
      contact: "Contacto",
      classroom: "Aula",
      view_details: "Ver Detalles",
      send_message: "Enviar Mensaje",
      view_billing: "Ver Facturación",
      sign_out: "Cerrar Sesión",
      profile: "Perfil",
      
      // Dashboard specific content
      total_students: "Total Estudiantes",
      active_classrooms: "Aulas Activas",
      monthly_revenue: "Ingresos Mensuales",
      recent_activity: "Actividad Reciente",
      upcoming_tasks: "Tareas Pendientes",
      quick_actions: "Acciones Rápidas",
      my_classrooms: "Mis Aulas",
      new_enrollment: "Nueva Inscripción",
      create_task: "Crear Tarea",
      manage_classrooms: "Gestionar aulas",
      view_tasks: "Ver tareas",
      view_all_activity: "Ver toda la actividad",
      view_all_tasks: "Ver todas las tareas",
      no_pending_tasks: "Sin tareas pendientes",
      great_job_staying: "¡Excelente trabajo manteniéndote al día!",
      export_report: "Exportar Reporte",
      
      // Time indicators
      hours_ago: "horas atrás",
      no_data_available: "No hay datos disponibles",
      
      // Activity descriptions
      added_comment: "Agregó un nuevo comentario a la",
      discussion: "discusión",
      completed_enrollment: "Completó la inscripción para la",
      children_enrolled: "niños inscritos en",
      created_task: "Creó la tarea",
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