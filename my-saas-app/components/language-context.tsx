"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // --- Sidebar & Navigation ---
    dashboard: "Dashboard",
    patients: "Patients",
    allReports: "All Reports",
    appointments: "Appointments",
    invoices: "Invoices",
    metrics: "Clinical Metrics",
    todos: "To-Do's",
    settings: "Settings",
    logout: "Log Out",
    support: "Technical Support", // ✅ تمت إضافتها
    
    // --- Header ---
    search: "Search...",
    manager: "Manager",
    
    // --- Dashboard & Home ---
    welcomeBack: "Welcome back,",
    quickStats: "Quick Stats",
    recentActivity: "Recent Activity",
    activePatients: "Active Patients",
    upcomingAppointments: "Upcoming Appointments",
    totalVisits: "Total Visits",
    clinicalConsultations: "Clinical Consultations",
    patientsAdmitted: "Patients Admitted",
    scheduledAppointments: "Scheduled Appointments",
    billingSummary: "Billing Summary",
    capacityStatus: "Capacity Status",
    appointmentDetails: "Appointment Details",
    dateTime: "Date - Time",
    contact: "Contact",
    department: "Department",

    // --- Patient Page & Form ---
    addPatient: "Add Patient",
    newPatientTitle: "Register New Patient",
    firstName: "First Name",
    lastName: "Last Name",
    phone: "Phone Number",
    email: "Email Address",
    cin: "National ID (CIN)",
    birthDate: "Birth Date",
    gender: "Gender",
    bloodType: "Blood Type",
    savePatient: "Save Patient Profile",
    male: "Male",
    female: "Female",
    cancel: "Cancel",
    save: "Save",
    addVisit: "Add Visit", // ✅ زر الزيارة السريعة

    // Form Sections
    sectionIdentity: "Identity & Basic Info",
    sectionContact: "Contact Information",
    sectionMedical: "Medical Profile",
    
    address: "Address",
    addressPlaceholder: "Street, Building, Apt...",
    
    emergencyContact: "Emergency Contact",
    emergencyName: "Contact Name",
    emergencyPhone: "Contact Phone",
    
    allergies: "Allergies & Chronic Diseases",
    allergiesPlaceholder: "List allergies...",
    
    chronicDiseases: "Chronic Diseases",
    chronicPlaceholder: "Diabetes, Hypertension...",
    
    currentMedications: "Current Medications",
    medicationsPlaceholder: "List current medications...",
    
    // --- Patient List & Filter ---
    filter: "Filter",
    searchPlaceholder: "Search by name, phone or ID...",
    noPatients: "No patients found matching your search.",
    viewProfile: "View Profile",
    id: "ID",
    actions: "Actions",

    // --- Pro Profile Keys ---
    medicalSummary: "Medical Summary",
    generalInfo: "General Information",
    appointmentsHistory: "Appointments History",
    documents: "Documents & Files",
    noAppointments: "No appointments recorded.",
    noDocuments: "No documents uploaded.",
    upload: "Upload",
    download: "Download",
    view: "View",
    notes: "Notes",

    // --- Reports & Analytics ---
    reportsTitle: "Reports & Analytics",
    reportsSubtitle: "Performance overview of your clinic",
    visitsPerPatient: "Visits / Patient",
    monthlyRevenue: "Monthly Revenue (Last 6 Months)",
    appointmentsBreakdown: "Appointments Breakdown",
    comingSoon: "Detailed Analytics Charts Coming Soon...",
    advancedAnalytics: "Advanced Analytics",
    metricsTitle: "Clinical Analytics",
    metricsSubtitle: "Deep dive into your clinic's performance",
    totalPatients: "Total Patients",
    patientGrowth: "Patient Growth",
    genderDistribution: "Gender Distribution",
    ageDistribution: "Age Group Distribution",
    appointmentStatus: "Appointment Status Stats",
    revenueTrend: "Revenue Trend",
    printReport: "Print Report",
    unknown: "Unknown",

    // --- Payments & Invoices ---
    billingStatus: "Billing Status",
    fee: "Fee",
    paid: "Paid",
    partiallyPaid: "Partially Paid",
    pending: "Pending",
    cancelled: "Cancelled",
    amount: "Amount",
    invoiceDate: "Invoice Date",
    totalRevenue: "Total Revenue",
    newInvoice: "New Invoice",
    createInvoice: "Create Invoice",
    invoiceAmount: "Invoice Amount",
    paymentStatus: "Payment Status",
    invoiceDetails: "Invoice Details",
    printInvoice: "Print Invoice",
    billTo: "Bill To",
    from: "From",
    itemDescription: "Description",
    thankYou: "Thank you for your trust!",

    // --- Delete Actions ---
    delete: "Delete",
    deleteConfirmation: "Are you sure you want to delete this item? This action cannot be undone.",

    // --- Appointments Page Keys ---
    scheduleAppointment: "Schedule Appointment",
    newAppointment: "New Appointment",
    selectPatient: "Select Patient",
    consultationType: "Consultation Type",
    consultationPlaceholder: "e.g. General Checkup, Follow-up...",
    medicalNotes: "Medical Notes",
    noAppointmentsYet: "No appointments scheduled yet.",
    statusScheduled: "Scheduled",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    statusPending: "Pending",
    deleteAppointmentConfirm: "Are you sure you want to delete this appointment?",
    filterAll: "All",
    filterToday: "Today",
    filterTomorrow: "Tomorrow",

    // --- Quick Add ---
    quickAdd: "Quick Visit",
    quickAddTitle: "Register Visit & Payment",
    visitDetails: "Visit Details",
    payment: "Payment",
    createAll: "Create All Records",
uploadFile: "Upload File",
documentName: "Document Name",
fileType: "File Type",
selectPatientForDoc: "Select Patient Owner",
saveDocument: "Save Document",

deleteDocConfirm: "Delete this file permanently?",
settingsSubtitle: "Manage your profile and clinic information",
personalInfo: "Personal Information",
clinicInfo: "Clinic Details",
doctorName: "Doctor Name",
specialty: "Specialty",
clinicName: "Clinic Name",

city: "City",
saveChanges: "Save Changes",
successUpdate: "Settings updated successfully!",

settingsTitle: "Clinic Settings", // ✅ أضف هذا السطر المفقود
   
date: "Date",           // ✅ أضف هذا    // ✅ وأضف هذا
    status: "Status",       // ✅ وأضف هذا
   noInvoices: "No invoices found.", // ✅ السطر المفقود
    // ...


   
    appointmentsToday: "Appointments Today",
   
    dashboardOverview: "Dashboard Overview",
    // ...
    // ... (الكلمات القديمة)
    patientId: "Patient ID",
    active: "Active",
    years: "Years",
    vitals: "Vital Signs",
    blood: "Blood",
    weight: "Weight",
    height: "Height",
    clinicalNotes: "Clinical Notes",
  
    medicalAlerts: "Medical Alerts",
    visits: "Visits",
    pendingBills: "Pending Bills",
    nextAppointment: "Next Appointment",
    noUpcomingApps: "No upcoming appointments.",
    bookNow: "Book Now",
    recentAppointments: "Recent Appointments",
    noNotes: "No clinical notes added.",
    noAllergies: "No known allergies.",
    prescriptions: "Prescriptions",
    noPrescriptions: "No prescriptions yet.",

    completeSubscription: "Complete Your Subscription",
    securePayment: "Secure payment to activate your clinic account.",
    paymentReview: "Payment Under Review",
    paymentReviewDesc: "We received your receipt. Account activation usually takes 1-2 hours.",
    activeSubscription: "Your Subscription is Active",
    activeSubscriptionDesc: "Enjoy full access to MyClinic Pro features.",
    selectedPlan: "Selected Plan",
    perMonth: "/ Month",
    bankTransferDetails: "Bank Transfer Details",
    bankName: "Bank Name",
    accountName: "Account Name",
    ribNumber: "RIB Number",
    copyRib: "Copy RIB",
    confirmPayment: "Confirm Payment",
    uploadReceipt: "Upload Payment Receipt",
    uploadDesc: "Please upload a screenshot of your transfer receipt.",
    clickToUpload: "Click to upload receipt",
    sending: "Sending...",
    confirmAndActivate: "Confirm & Activate Account",
    otherPaymentMethod: "Want another payment method? Contact Support",
    unlimitedPatients: "Unlimited Patients",
    subscription: "Subscription", // 👈 أضف هذا
    prioritySupport: "Priority Support",
goodMorning: "Good Morning",
  goodAfternoon: "Good Afternoon",
  goodEvening: "Good Evening",
  doctorTitle: "Dr.",
  
  paidInvoices: "Paid Invoices Only",
  revenueGrowth: "Revenue Growth",
  days: "Days",
  revenue: "Revenue",
  recentVisits: "Recent Visits",
  viewAll: "View All",
  
},

  ar: {
    // --- Sidebar & Navigation ---
    
    goodMorning: "صباح الخير",
  goodAfternoon: "مساء الخير",
  goodEvening: "مساء الخير",
  doctorTitle: "د.",
  
  totalAppointments: "مجموع المواعيد",
  
  paidInvoices: "الفواتير المدفوعة فقط",
  revenueGrowth: "نمو الأرباح",
  days: "أيام",
  revenue: "الدخل",
  recentVisits: "أحدث الزيارات",
  viewAll: "عرض الكل",
    dashboard: "لوحة التحكم",
    patients: "المرضى",
    allReports: "التقارير",
    appointments: "المواعيد",
    invoices: "الفواتير",
    metrics: "الإحصائيات",
    todos: "المهام",
    settings: "الإعدادات",
    logout: "خروج",
    support: "الدعم الفني", // ✅ تمت إضافتها
    
    // --- Header ---
    search: "بحث...",
    manager: "مدير",

    // --- Dashboard & Home ---
    welcomeBack: "مرحباً بعودتك،",
    quickStats: "إحصائيات سريعة",
    recentActivity: "النشاط الحديث",
    activePatients: "المرضى النشطين",
    upcomingAppointments: "المواعيد القادمة",
    totalVisits: "مجموع الزيارات",
    clinicalConsultations: "استشارات طبية",
    patientsAdmitted: "المرضى المقبولين",
    scheduledAppointments: "المواعيد المجدولة",
    billingSummary: "ملخص الفواتير",
    capacityStatus: "حالة الاستيعاب",
    appointmentDetails: "تفاصيل المواعيد",
    dateTime: "التاريخ - الوقت",
    contact: "اتصال",
    department: "القسم",
    
    // --- Patient Page & Form ---
    addPatient: "إضافة مريض",
    newPatientTitle: "تسجيل مريض جديد",
    firstName: "الاسم الأول",
    lastName: "الاسم الأخير",
    phone: "رقم الهاتف",
    email: "البريد الإلكتروني",
    cin: "رقم البطاقة الوطنية",
    birthDate: "تاريخ الميلاد",
    gender: "الجنس",
    bloodType: "فصيلة الدم",
    savePatient: "حفظ ملف المريض",
    male: "ذكر",
    female: "أنثى",
    cancel: "إلغاء",
    save: "حفظ",
    addVisit: "إضافة زيارة",

    // Form Sections
    sectionIdentity: "الهوية والمعلومات الأساسية",
    sectionContact: "معلومات التواصل",
    sectionMedical: "الملف الطبي",
    
    address: "العنوان",
    addressPlaceholder: "الشارع، العمارة، الشقة...",
    
    emergencyContact: "اتصال الطوارئ",
    emergencyName: "اسم الشخص",
    emergencyPhone: "هاتف الطوارئ",
    
    allergies: "الحساسية والأمراض المزمنة",
    allergiesPlaceholder: "اكتب الحساسية...",
    
    chronicDiseases: "الأمراض المزمنة",
    chronicPlaceholder: "سكري، ضغط الدم...",
    
    currentMedications: "الأدوية الحالية",
    medicationsPlaceholder: "قائمة الأدوية الحالية...",
    
    // --- Patient List & Filter ---
    filter: "تصفية",
    searchPlaceholder: "بحث بالاسم، الهاتف أو الهوية...",
    noPatients: "لم يتم العثور على مرضى مطابقين للبحث.",
    viewProfile: "عرض الملف",
    id: "المعرف",
    actions: "إجراءات",

    // --- Pro Profile Keys ---
    medicalSummary: "الملخص الطبي",
    generalInfo: "المعلومات العامة",
    appointmentsHistory: "سجل المواعيد",
    documents: "المستندات والملفات",
    noAppointments: "لا توجد مواعيد مسجلة.",
    noDocuments: "لا توجد مستندات مرفوعة.",
    upload: "رفع",
    download: "تحميل",
    view: "عرض",
    notes: "ملاحظات",

    // --- Reports & Analytics ---
    reportsTitle: "التقارير والتحليلات",
    reportsSubtitle: "نظرة عامة على أداء العيادة",
    visitsPerPatient: "زيارة / مريض",
    monthlyRevenue: "المداخيل الشهرية (آخر 6 أشهر)",
    appointmentsBreakdown: "توزيع المواعيد",
    comingSoon: "الرسوم البيانية التفصيلية قادمة قريباً...",
    advancedAnalytics: "تحليلات متقدمة",
    metricsTitle: "التحليلات السريرية",
    metricsSubtitle: "نظرة متعمقة على أداء العيادة",
    totalPatients: "إجمالي المرضى",
    patientGrowth: "نمو المرضى",
    genderDistribution: "توزيع الجنس",
    ageDistribution: "توزيع الفئات العمرية",
    appointmentStatus: "إحصائيات المواعيد",
    revenueTrend: "اتجاه الإيرادات",
    printReport: "طباعة التقرير",
    unknown: "غير محدد",

    // --- Payments & Invoices ---
    billingStatus: "حالة الدفع",
    fee: "الرسوم",
    paid: "مدفوع",
    partiallyPaid: "مدفوع جزئياً",
    pending: "قيد الانتظار",
    cancelled: "ملغي",
    amount: "المبلغ",
    invoiceDate: "تاريخ الفاتورة",
    totalRevenue: "إجمالي الدخل",
    newInvoice: "فاتورة جديدة",
    createInvoice: "إنشاء فاتورة",
    invoiceAmount: "قيمة الفاتورة",
    paymentStatus: "حالة الدفع",
    invoiceDetails: "تفاصيل الفاتورة",
    printInvoice: "طباعة الفاتورة",
    billTo: "فاتورة إلى",
    from: "من",
    itemDescription: "الوصف",
    thankYou: "شكراً لثقتكم بنا!",

    // --- Delete Actions ---
    delete: "حذف",
    deleteConfirmation: "هل أنت متأكد أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.",

    // --- Appointments Page Keys ---
    scheduleAppointment: "جدولة موعد",
    newAppointment: "موعد جديد",
    selectPatient: "اختر المريض",
    consultationType: "نوع الاستشارة",
    consultationPlaceholder: "مثال: فحص عام، متابعة...",
    medicalNotes: "ملاحظات طبية",
    noAppointmentsYet: "لا توجد مواعيد مجدولة بعد.",
    statusScheduled: "مجدول",
    statusCompleted: "مكتمل",
    statusCancelled: "ملغي",
    statusPending: "قيد الانتظار",
    deleteAppointmentConfirm: "هل أنت متأكد أنك تريد حذف هذا الموعد؟",
    filterAll: "الكل",
    filterToday: "اليوم",
    filterTomorrow: "غداً",

    // --- Quick Add ---
    quickAdd: "إضافة سريعة",
    quickAddTitle: "تسجيل زيارة ودفع",
    visitDetails: "تفاصيل الزيارة",
    payment: "الدفع",
    createAll: "إنشاء كافة السجلات",
    uploadFile: "رفع ملف",
documentName: "اسم المستند",
fileType: "نوع الملف",
selectPatientForDoc: "اختر المريض صاحب الملف",
saveDocument: "حفظ المستند",

deleteDocConfirm: "حذف هذا الملف نهائياً؟",
settingsTitle: "إعدادات العيادة",
settingsSubtitle: "إدارة الملف الشخصي ومعلومات العيادة",
personalInfo: "المعلومات الشخصية",
clinicInfo: "تفاصيل العيادة",
doctorName: "اسم الطبيب",
specialty: "التخصص",
clinicName: "اسم العيادة",

city: "المدينة",
saveChanges: "حفظ التغييرات",
successUpdate: "تم تحديث الإعدادات بنجاح!",
  date: "التاريخ",        // ✅ أضف هذا    // ✅ وأضف هذا
    status: "الحالة",       // ✅ وأضف هذا
   noInvoices: "لا توجد فواتير.",    // ✅ السطر المفقود
  appointmentsToday: "مواعيد اليوم",
dashboardOverview: "نظرة عامة",
patientId: "رقم المريض",
    active: "نشط",
    years: "سنة",
    vitals: "العلامات الحيوية",
    blood: "الدم",
    weight: "الوزن",
    height: "الطول",
    clinicalNotes: "الملاحظات السريرية",
    
    medicalAlerts: "تنبيهات طبية",
    visits: "الزيارات",
    pendingBills: "فواتير معلقة",
    nextAppointment: "الموعد القادم",
    noUpcomingApps: "لا توجد مواعيد قادمة.",
    bookNow: "احجز الآن",
    recentAppointments: "آخر المواعيد",
    noNotes: "لا توجد ملاحظات مسجلة.",
    noAllergies: "لا توجد حساسية معروفة.",
    prescriptions: "الوصفات الطبية",
    noPrescriptions: "لا توجد وصفات طبية.",
    completeSubscription: "إتمام عملية الاشتراك",
    securePayment: "دفع آمن لتفعيل حساب عيادتك فوراً.",
    paymentReview: "الدفع قيد المراجعة",
    paymentReviewDesc: "تلقينا الوصل الخاص بك. سيتم تفعيل الحساب عادة خلال 1-2 ساعة.",
    activeSubscription: "اشتراكك مفعل حالياً",
    activeSubscriptionDesc: "استمتع بكافة مميزات MyClinic Pro.",
    selectedPlan: "الخطة المختارة",
    perMonth: "/ شهر",
    bankTransferDetails: "بيانات التحويل البنكي",
    bankName: "اسم البنك",
    accountName: "اسم صاحب الحساب",
    ribNumber: "رقم التعريف البنكي (RIB)",
    copyRib: "نسخ الـ RIB",
    confirmPayment: "تأكيد الدفع",
    uploadReceipt: "رفع وصل الدفع",
    uploadDesc: "يرجى رفع صورة أو لقطة شاشة لوصل التحويل البنكي.",
    clickToUpload: "اضغط لرفع الوصل",
    sending: "جاري الإرسال...",
    confirmAndActivate: "تأكيد وتفعيل الحساب",
    otherPaymentMethod: "تريد طريقة دفع أخرى؟ تواصل معنا",
    unlimitedPatients: "عدد مرضى غير محدود",
   subscription: "الاشتراك", // 👈 أضف هذا
    prioritySupport: "دعم فني ذو أولوية",
},
  fr: {
    // --- Sidebar & Navigation ---
    dashboard: "Tableau de bord",
    patients: "Patients",
    allReports: "Rapports",
    appointments: "Rendez-vous",
    invoices: "Factures",
    metrics: "Métriques",
    todos: "Tâches",
    settings: "Paramètres",
    logout: "Déconnexion",
    support: "Support Technique", // ✅ تمت إضافتها
    
    // --- Header ---
    search: "Rechercher...",
    manager: "Gérant",

    // --- Dashboard & Home ---
    welcomeBack: "Bon retour,",
    quickStats: "Statistiques Rapides",
    recentActivity: "Activité Récente",
    activePatients: "Patients Actifs",
    upcomingAppointments: "Rendez-vous à venir",
    totalVisits: "Total des Visites",
    clinicalConsultations: "Consultations Cliniques",
    patientsAdmitted: "Patients Admis",
    scheduledAppointments: "Rendez-vous Prévus",
    billingSummary: "Résumé de Facturation",
    capacityStatus: "État de Capacité",
    appointmentDetails: "Détails des Rendez-vous",
    dateTime: "Date - Heure",
    contact: "Contact",
    department: "Département",
    
    // --- Patient Page & Form ---
    addPatient: "Ajouter Patient",
    newPatientTitle: "Enregistrer Nouveau Patient",
    firstName: "Prénom",
    lastName: "Nom",
    phone: "Téléphone",
    email: "Email",
    cin: "CIN",
    birthDate: "Date de naissance",
    gender: "Genre",
    bloodType: "Groupe Sanguin",
    savePatient: "Enregistrer le Profil",
    male: "Homme",
    female: "Femme",
    cancel: "Annuler",
    save: "Enregistrer",
    addVisit: "Ajouter Visite",

    // Sections
    sectionIdentity: "Identité & Infos de base",
    sectionContact: "Coordonnées",
    sectionMedical: "Profil Médical",
    
    address: "Adresse",
    addressPlaceholder: "Rue, Immeuble, Appt...",
    
    emergencyContact: "Contact d'urgence",
    emergencyName: "Nom du contact",
    emergencyPhone: "Tél d'urgence",
    
    allergies: "Allergies et Maladies",
    allergiesPlaceholder: "Liste des allergies...",
    
    chronicDiseases: "Maladies Chroniques",
    chronicPlaceholder: "Diabète, Hypertension...",
    
    currentMedications: "Médicaments Actuels",
    medicationsPlaceholder: "Liste des médicaments...",

    // --- Patient List & Filter ---
    filter: "Filtrer",
    searchPlaceholder: "Chercher par nom, tél ou ID...",
    noPatients: "Aucun patient trouvé.",
    viewProfile: "Voir Profil",
    id: "ID",
    actions: "Actions",

    // --- Pro Profile Keys ---
    medicalSummary: "Résumé Médical",
    generalInfo: "Informations Générales",
    appointmentsHistory: "Historique des Rendez-vous",
    documents: "Documents et Fichiers",
    noAppointments: "Aucun rendez-vous enregistré.",
    noDocuments: "Aucun document téléchargé.",
    upload: "Télécharger",
    download: "Télécharger",
    view: "Voir",
    notes: "Notes",

    // --- Reports & Analytics ---
    reportsTitle: "Rapports et Analytiques",
    reportsSubtitle: "Aperçu des performances",
    visitsPerPatient: "Visites / Patient",
    monthlyRevenue: "Revenu Mensuel (6 derniers mois)",
    appointmentsBreakdown: "Répartition des Rendez-vous",
    comingSoon: "Graphiques détaillés bientôt disponibles...",
    advancedAnalytics: "Analyses Avancées",
    metricsTitle: "Analytique Clinique",
    metricsSubtitle: "Analyse approfondie des performances",
    totalPatients: "Total Patients",
    patientGrowth: "Croissance des patients",
    genderDistribution: "Répartition par sexe",
    ageDistribution: "Répartition par âge",
    appointmentStatus: "Statistiques des rendez-vous",
    revenueTrend: "Tendance des revenus",
    printReport: "Imprimer le rapport",
    unknown: "Inconnu",
    
    // --- Payments & Invoices ---
    billingStatus: "Statut de Paiement",
    fee: "Frais",
    paid: "Payé",
    partiallyPaid: "Partiellement Payé",
    pending: "En attente",
    cancelled: "Annulé",
    amount: "Montant",
    invoiceDate: "Date de facture",
    totalRevenue: "Revenu Total",
    newInvoice: "Nouvelle Facture",
    createInvoice: "Créer une facture",
    invoiceAmount: "Montant de la facture",
    paymentStatus: "Statut de paiement",
    invoiceDetails: "Détails de la facture",
    printInvoice: "Imprimer la facture",
    billTo: "Facturé à",
    from: "De",
    itemDescription: "Description",
    thankYou: "Merci de votre confiance !",

    // --- Delete Actions ---
    delete: "Supprimer",
    deleteConfirmation: "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",

    // --- Appointments Page Keys ---
    scheduleAppointment: "Planifier un rendez-vous",
    newAppointment: "Nouveau Rendez-vous",
    selectPatient: "Sélectionner un patient",
    consultationType: "Type de Consultation",
    consultationPlaceholder: "ex: Consultation générale, Suivi...",
    medicalNotes: "Notes Médicales",
    noAppointmentsYet: "Aucun rendez-vous prévu pour le moment.",
    statusScheduled: "Programmé",
    statusCompleted: "Terminé",
    statusCancelled: "Annulé",
    statusPending: "En attente",
    deleteAppointmentConfirm: "Êtes-vous sûr de vouloir supprimer ce rendez-vous ?",
    filterAll: "Tous",
    filterToday: "Aujourd'hui",
    filterTomorrow: "Demain",

    // --- Quick Add ---
    quickAdd: "Ajout Rapide",
    quickAddTitle: "Enregistrer Visite & Paiement",
    visitDetails: "Détails de la visite",
    payment: "Paiement",
    createAll: "Tout Créer",
    uploadFile: "Télécharger un fichier",
documentName: "Nom du document",
fileType: "Type de fichier",
selectPatientForDoc: "Sélectionner le patient",
saveDocument: "Enregistrer le document",
deleteDocConfirm: "Supprimer ce fichier définitivement ?",
settingsTitle: "Paramètres de la Clinique",
settingsSubtitle: "Gérez votre profil et les informations de la clinique",
personalInfo: "Informations Personnelles",
clinicInfo: "Détails de la Clinique",
doctorName: "Nom du Docteur",
specialty: "Spécialité",
clinicName: "Nom de la Clinique",

city: "Ville",
saveChanges: "Enregistrer les modifications",
successUpdate: "Paramètres mis à jour avec succès !",
 // ...
    date: "Date",           // ✅ أضف هذا     // ✅ وأضف هذا
    status: "Statut",
noInvoices: "Aucune facture trouvée.", // ✅ السطر المفقود
appointmentsToday: "Rendez-vous Aujourd'hui",
dashboardOverview: "Vue d'ensemble",
patientId: "ID Patient",
    active: "Actif",
    years: "Ans",
    vitals: "Signes Vitaux",
    blood: "Sang",
    weight: "Poids",
    height: "Taille",
    clinicalNotes: "Notes Cliniques",
   
    medicalAlerts: "Alertes Médicales",
    visits: "Visites",
    pendingBills: "Factures en attente",
    nextAppointment: "Prochain Rendez-vous",
    noUpcomingApps: "Pas de rendez-vous à venir.",
    bookNow: "Réserver",
    recentAppointments: "Rendez-vous Récents",
    noNotes: "Aucune note clinique ajoutée.",
    noAllergies: "Aucune allergie connue.",
   prescriptions: "Ordonnances",
   noPrescriptions: "Aucune ordonnance.",
   // 👇 كلمات صفحة الدفع (Payment)
    completeSubscription: "Finaliser votre abonnement",
    securePayment: "Paiement sécurisé pour activer votre compte clinique.",
    paymentReview: "Paiement en cours d'examen",
    paymentReviewDesc: "Nous avons reçu votre reçu. L'activation prend généralement 1 à 2 heures.",
    activeSubscription: "Votre abonnement est actif",
    activeSubscriptionDesc: "Profitez d'un accès complet aux fonctionnalités MyClinic Pro.",
    selectedPlan: "Plan Sélectionné",
    perMonth: "/ Mois",
    bankTransferDetails: "Détails du virement bancaire",
    bankName: "Nom de la banque",
    accountName: "Nom du compte",
    ribNumber: "Numéro RIB",
    copyRib: "Copier le RIB",
    confirmPayment: "Confirmer le paiement",
    uploadReceipt: "Télécharger le reçu",
    uploadDesc: "Veuillez télécharger une capture d'écran de votre reçu de virement.",
    clickToUpload: "Cliquez pour télécharger",
    sending: "Envoi...",
    confirmAndActivate: "Confirmer et activer le compte",
    otherPaymentMethod: "Autre méthode de paiement ? Contactez le support",
    unlimitedPatients: "Patients illimités",
   subscription: "Abonnement", // 👈 أضف هذا
    prioritySupport: "Support prioritaire",
    goodMorning: "Bonjour",
  goodAfternoon: "Bon après-midi",
  goodEvening: "Bonsoir",
  doctorTitle: "Dr.",
  
  totalAppointments: "Total Rendez-vous",
  
  paidInvoices: "Factures payées uniquement",
  revenueGrowth: "Croissance des revenus",
  days: "Jours",
  revenue: "Revenu",
  recentVisits: "Visites récentes",
  viewAll: "Voir tout",
 
}
};

type Language = 'en' | 'fr' | 'ar';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations['en'];
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('app-lang') as Language;
    if (saved) setLang(saved);
  }, []);

  const changeLanguage = (l: Language) => {
    setLang(l);
    localStorage.setItem('app-lang', l);
  };

  const isRTL = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLanguage, t: translations[lang], isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};