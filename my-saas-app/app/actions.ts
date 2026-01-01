"use server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; 


export async function registerUser(formData: FormData) {
  const doctorName = formData.get("doctorName")?.toString();
  const clinicName = formData.get("clinicName")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!doctorName || !email || !password) {
    return redirect("/register?error=missing_fields");
  }

  // 1. فحص هل الإيميل موجود
  const existingUser = await db.client.findUnique({
    where: { email }
  });

  if (existingUser) {
    return redirect("/register?error=email_exists");
  }

  // 2. تشفير كلمة المرور
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // 3. إنشاء المستخدم في قاعدة البيانات
    const newUser = await db.client.create({
      data: {
        doctorName,
        clinicName: clinicName || "My Clinic",
        email,
        password: hashedPassword, // ✅ كلمة مرور مشفرة
        role: "doctor",
        onboardingCompleted: false,
        
        // ✅✅ إعداد الفترة التجريبية (20 يوماً)
        subscriptionStatus: "ACTIVE", 
        // تاريخ الانتهاء (الحاسم للإغلاق) = اليوم + 20 يوماً
        subscriptionEndsAt: new Date(new Date().setDate(new Date().getDate() + 20)),
        // تاريخ الدفع القادم (للعرض فقط)
        nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + 20)),
      }
    });

    // 4. إعداد الكوكيز (الآن نملك newUser.id)
    const cookieStore = await cookies();

    // أ) تخزين ID
    cookieStore.set("mysaas_userId", newUser.id, { httpOnly: true, path: "/" });

    // ب) تخزين الصلاحية
    cookieStore.set("mysaas_role", "doctor", { httpOnly: true, path: "/" });

    // ج) تخزين الحالة (ليتوافق مع نظام المنع الجديد)
    const status = newUser.subscriptionStatus || "ACTIVE";
    cookieStore.set("mysaas_status", status, { httpOnly: true, path: "/" });

  } catch (error) {
    console.error("Registration Error:", error);
    return redirect("/register?error=unknown");
  }

  // 5. التوجيه لصفحة الإعداد (Onboarding)
  redirect("/onboarding");
}
// 🔐 1. Authentication & Helpers
// =========================================================

export async function getClientId() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("mysaas_userId")?.value;

  if (userId) {
    // 🔥 فحص الاشتراك في كل مرة نطلب فيها الـ ID
    await checkAndExpireSubscription(userId);
  }

  return userId;
}

// 👇 هذه هي الدالة التي كانت ناقصة وتسبب الخطأ في الصفحة الرئيسية
export async function loginAsDemo() {
  const email = "demo@myclinic.pro";
  
  // البحث عن حساب الديمو أو إنشاؤه
  let user = await db.client.findUnique({ where: { email } });
  
  if (!user) {
    user = await db.client.create({
      data: {
        doctorName: "Dr. Demo User",
        clinicName: "Demo Clinic",
        email: email,
        password: "demo",
        role: "Doctor",
        status: "Active",
        plan: "Premium",
        onboardingCompleted: true
      }
    });
  }

  // تسجيل الدخول
  const cookieStore = await cookies();
  cookieStore.set("mysaas_userId", user.id, { httpOnly: true, path: "/" });
  cookieStore.set("mysaas_role", user.role, { httpOnly: true, path: "/" });

  redirect("/dashboard");
}

// في ملف app/actions.ts
// تأكد من استيراد bcrypt في أعلى الملف مرة واحدة

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. البحث عن المستخدم
  const user = await db.client.findUnique({ where: { email } });

  // إذا لم يتم العثور على المستخدم
  if (!user) {
    return redirect("/login?error=invalid");
  }

  // 2. مقارنة كلمة المرور
  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    const cookieStore = await cookies();
    
    // تنظيف الصلاحية (تحويلها لحروف صغيرة وإزالة المسافات)
    const rawRole = user.role ? user.role.toLowerCase().trim() : "doctor";
    
    // تحديد حالة الاشتراك (افتراضياً INACTIVE لو كانت فارغة)
    const subStatus = user.subscriptionStatus || "INACTIVE";

    // 3. تخزين الكوكيز (مرة واحدة وبشكل منظم)
    
    // أ) تخزين الـ ID
    cookieStore.set("mysaas_userId", user.id, { httpOnly: true, path: "/" });

    // ب) تخزين الصلاحية (Role)
    cookieStore.set("mysaas_role", rawRole, { httpOnly: true, path: "/" });

    // ج) ✅ تخزين حالة الاشتراك (مهم جداً للمنع)
    cookieStore.set("mysaas_status", subStatus, { httpOnly: true, path: "/" });

    console.log(`DEBUG: Login Success -> Role: ${rawRole}, Status: ${subStatus}`);

    // 4. التوجيه حسب الصلاحية
    if (["super_admin", "admin", "superadmin"].includes(rawRole)) {
      return redirect("/saas-admin");
    } 
    
    // إذا لم يكن أدمن، يذهب لصفحة الطبيب
    return redirect("/dashboard");
  }

  // إذا كانت كلمة المرور خاطئة
  return redirect("/login?error=invalid");
}

// app/actions.ts


// ✅ دالة تسجيل الخروج
export async function logout() {
  // ✅ الخطوة الصحيحة في Next.js 15: يجب انتظار الكوكيز أولاً
  const cookieStore = await cookies();

  // الآن يمكنك الحذف
  cookieStore.delete("token"); 
  cookieStore.delete("Authorization"); 

  // التوجيه لصفحة الدخول
  redirect("/login");
}
// =========================================================
// 🏥 2. Doctor Dashboard Actions
export async function createPatient(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  // Basic
  const firstName = formData.get("firstName")?.toString() || "";
  const lastName = formData.get("lastName")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";
  const email = formData.get("email")?.toString();
  const cin = formData.get("cin")?.toString();
  const birthDate = formData.get("birthDate")?.toString();
  const gender = formData.get("gender")?.toString();

  // 🆕 Contact & Emergency
  const address = formData.get("address")?.toString();
  const city = formData.get("city")?.toString();
  const emergencyName = formData.get("emergencyName")?.toString();
  const emergencyPhone = formData.get("emergencyPhone")?.toString();

  // 🆕 Medical
  const bloodType = formData.get("bloodType")?.toString();
  const allergies = formData.get("allergies")?.toString();
  const chronicDiseases = formData.get("chronicDiseases")?.toString();
  const currentMedications = formData.get("currentMedications")?.toString();

  await db.patient.create({
    data: {
      clientId,
      firstName, lastName, phone, email, cin,
      birthDate: birthDate ? new Date(birthDate) : null,
      gender,
      
      // New Fields
      address, city, emergencyName, emergencyPhone,
      bloodType, allergies, chronicDiseases, currentMedications,
      
      status: "Active",
    },
  });

  revalidatePath("/dashboard/patients");
  redirect("/dashboard/patients");
}

export async function createAppointment(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const patientId = formData.get("patientId")?.toString();
  const date = formData.get("date")?.toString();
  const type = formData.get("type")?.toString();
  const notes = formData.get("notes")?.toString();
  
  // 👇 قراءة السعر من الفورم
  const priceRaw = formData.get("price")?.toString();
  const price = priceRaw ? parseFloat(priceRaw) : 0;

  if (patientId && date) {
    await db.appointment.create({
      data: {
        clientId,
        patientId,
        date: new Date(date),
        type: type || "Consultation",
        notes: notes || "",
        status: "Scheduled",
        price: price // 👈 حفظ السعر
      }
    });
  }
  redirect(`/dashboard/patients/${patientId}`);
}
export async function saveSettings(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const settingsJson = JSON.stringify({
    color: formData.get("color"),
    printHeader: formData.get("printHeader"),
    language: formData.get("language")
  });

  // 1. Save to ClinicProfile
  await db.clinicProfile.upsert({
    where: { clientId },
    update: { settings: settingsJson },
    create: { clientId, settings: settingsJson }
  }); 

  // 2. Mark onboarding as complete
  await db.client.update({
    where: { id: clientId },
    data: { onboardingCompleted: true }
  });

  // 3. Redirect
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}

export async function uploadFile(formData: FormData) {
  const patientId = formData.get("patientId") as string;
  const url = formData.get("url") as string;
  const name = formData.get("name") as string;
  const tags = formData.get("tags") as string;

  if (!patientId || !url) return;

  await db.patientDocument.create({
    data: {
      name: name || "Untitled",
      url: url,
      tags: tags,          // ✅ هذا موجود في السكيما
      patientId: patientId
      // ❌ تم حذف type و status لأنهم غير موجودين في الداتابيز
    }
  });

  revalidatePath(`/dashboard/patients/${patientId}`);
}

// =========================================================
// 💳 3. Subscription & Payments
// =========================================================

export async function submitPaymentProof(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const amount = parseFloat(formData.get("amount") as string);
  const period = formData.get("period") as string;
  const proofUrl = formData.get("proofUrl") as string;

  await db.subscriptionPayment.create({
    data: {
      amount,
      period,
      proofUrl,
      status: "Pending",
      clientId
    }
  });

  await createLog("PAYMENT_SUBMITTED", `Proof submitted for ${amount}$`, "Doctor");
  revalidatePath("/dashboard/subscription");
}

// =========================================================
// 💬 4. Messaging (Support)
// =========================================================



// =========================================================
// 👮‍♂️ 5. Admin Actions
// =========================================================

export async function toggleClientStatus(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const newStatus = formData.get("newStatus") as string; // 'ACTIVE' or 'INACTIVE'

  await db.client.update({
    where: { id: clientId },
    data: { subscriptionStatus: newStatus }
  });

  revalidatePath(`/saas-admin/clients/${clientId}`);
}

export async function renewSubscription(formData: FormData) {
  const id = formData.get("id") as string;
  const daysToAdd = parseInt(formData.get("days") as string) || 30;

  const client = await db.client.findUnique({ where: { id } });
  if (!client) return;

  const today = new Date();
  
  // ✅ التصحيح: التعامل مع التاريخ إذا كان فارغاً (null)
  // إذا كان التاريخ موجوداً نستخدمه، وإذا كان null نعتبره تاريخاً قديماً جداً (1970) لكي يبدأ التجديد من "اليوم"
  const currentExpiry = client.nextPaymentDate ? new Date(client.nextPaymentDate) : new Date(0);

  // إذا كان تاريخ الانتهاء في الماضي (أو غير موجود)، نبدأ الحساب من "اليوم"
  // أما إذا كان لا يزال سارياً، نضيف الأيام فوق التاريخ الحالي
  const baseDate = currentExpiry < today ? today : currentExpiry;
  
  const newExpiry = new Date(baseDate);
  newExpiry.setDate(newExpiry.getDate() + daysToAdd);

  await db.client.update({
    where: { id },
    data: {
      status: "Active",
      nextPaymentDate: newExpiry,
      lastPaymentDate: new Date()
    }
  });

  await createLog("RENEWAL", `Added ${daysToAdd} days to Client ${id}`, "Super Admin");
  revalidatePath("/saas-admin/clients");
}

export async function updateSaasConfig(formData: FormData) {
  const monthlyPrice = parseFloat(formData.get("monthlyPrice") as string) || 0;
  const yearlyPrice = parseFloat(formData.get("yearlyPrice") as string) || 0;
  const bankName = formData.get("bankName") as string;
  const accountName = formData.get("accountName") as string;
  const rib = formData.get("rib") as string;

  await db.saasSettings.upsert({
    where: { id: "config" },
    update: { monthlyPrice, yearlyPrice, bankName, accountName, rib },
    create: { id: "config", monthlyPrice, yearlyPrice, bankName, accountName, rib }
  });

  await createLog("SETTINGS_UPDATE", "Updated pricing/bank info", "Super Admin");

  revalidatePath("/saas-admin/settings");
  revalidatePath("/dashboard/subscription");
  
  redirect("/saas-admin/settings?success=true");
}

// =========================================================
// 📝 6. Logging Helper
// =========================================================

export async function createLog(action: string, details: string, actor: string = "System") {
  try {
    await db.systemLog.create({
      data: { action, details, actor }
    });
  } catch (e) {
    console.error("Failed to create log:", e);
  }
}

// =========================================================
// 💰 Admin Payment Actions (أضف هذا في نهاية actions.ts)
// =========================================================



// =========================================================
// 🔔 7. Notifications & Search (TopBar Actions)
// =========================================================

export async function getNotifications() {
  const clientId = await getClientId();
  if (!clientId) return [];

  return await db.notification.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
}

export async function markNotificationRead(id: string) {
  await db.notification.update({
    where: { id },
    data: { isRead: true }
  });
  revalidatePath("/dashboard");
}

export async function searchGlobal(query: string) {
  const clientId = await getClientId();
  if (!clientId || !query) return { patients: [] };

  const patients = await db.patient.findMany({
    where: {
      clientId,
      OR: [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { phone: { contains: query } }
      ]
    },
    take: 5
  });

  return { patients };
}
// في ملف app/actions.ts

// 👇 دالة لإنشاء ودخول الأدمن فوراً
export async function loginAsAdmin() {
  const email = "admin@admin.com";
  
  // 1. البحث عن الأدمن أو إنشاؤه
  let user = await db.client.findUnique({ where: { email } });
  
  if (!user) {
    user = await db.client.create({
      data: {
        doctorName: "Super Admin",
        clinicName: "Headquarters",
        email: email,
        password: "admin", // 🔑 كلمة السر
        role: "super_admin", // 👑 هذا هو المهم!
        status: "Active",
        plan: "Unlimited",
        onboardingCompleted: true
      }
    });
  }

  // 2. تسجيل الدخول
  const cookieStore = await cookies();
  cookieStore.set("mysaas_userId", user.id, { httpOnly: true, path: "/" });
  cookieStore.set("mysaas_role", user.role, { httpOnly: true, path: "/" });

  // 3. التوجيه للوحة التحكم
  redirect("/saas-admin");
}


export async function updateClientDays(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const days = parseInt(formData.get("days") as string);

  if (isNaN(days)) return;

  // 1. حساب التاريخ الجديد بناءً على تاريخ اليوم + الأيام المطلوبة
  const newExpiry = new Date();
  newExpiry.setDate(newExpiry.getDate() + days);

  // 2. تحديث قاعدة البيانات
  await db.client.update({
    where: { id: clientId },
    data: {
      nextPaymentDate: newExpiry,
      status: days > 0 ? "Active" : "Expired" // إذا وضعت 0 أيام يصبح حسابه منتهياً تلقائياً
    }
  });

  // 3. تسجيل العملية في السيستم لوج
  await createLog(
    "MANUAL_DAYS_UPDATE", 
    `Admin manually set ${days} days for client ${clientId}. New expiry: ${newExpiry.toLocaleDateString()}`, 
    "Super Admin"
  );

  revalidatePath(`/saas-admin/clients/${clientId}`);
  revalidatePath("/saas-admin/clients");
}

export async function saveOnboarding(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("mysaas_userId")?.value;

  if (!userId) return redirect("/login");

  // ✅ تجهيز البيانات لتطابق أسماء الحقول في OnboardingProfile
  const data = {
    specialty: formData.get("specialty")?.toString() || "",
    teamSize: formData.get("teamSize")?.toString() || "Solo",
    
    // 👇 تصحيح الأسماء حسب السكيما الجديدة
    appointmentSystem: formData.get("appointmentType")?.toString() || "Booking", // كان appointmentType
    storeMedicalFiles: formData.get("storeFiles") === "on", // كان storeFiles
    billingEnabled: formData.get("billingEnabled") === "on",
    mainProblem: formData.get("mainProblem")?.toString() || "",
    
    // قيم افتراضية للحقول الإلزامية الأخرى
    language: "fr",
    currency: "MAD"
  };

  // 1. حفظ البيانات في الجدول الصحيح (OnboardingProfile)
  await db.onboardingProfile.upsert({
    where: { clientId: userId },
    update: data,
    create: { ...data, clientId: userId }
  });

  // 2. تحديث حالة العميل
  await db.client.update({
    where: { id: userId },
    data: { onboardingCompleted: true }
  });

  // 3. سجل في السيستم
  await createLog("ONBOARDING_COMPLETED", `Doctor ${userId} completed onboarding`, "System");

  redirect("/dashboard");
}



export async function submitOnboarding(formData: FormData) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("mysaas_userId")?.value;

  if (!userId) {
    // نرجع خطأ بدلاً من التوجيه
    return { success: false, error: "User not found" };
  }

  const rawCount = formData.get("assistantsCount");
  const assistantsCount = rawCount ? parseInt(rawCount.toString()) : 0;

  const data = {
    specialty: formData.get("specialty")?.toString() || "",
    phoneNumber: formData.get("phoneNumber")?.toString() || "",
    city: formData.get("city")?.toString() || "",
    teamSize: formData.get("teamSize")?.toString() || "Solo",
    appointmentSystem: formData.get("appointmentSystem")?.toString() || "Booking",
    dailyPatients: formData.get("dailyPatients")?.toString() || "<10",
    patientReminders: formData.get("patientReminders") === "on",
    storeMedicalFiles: formData.get("storeMedicalFiles") === "on",
    fileTypes: formData.getAll("fileTypes").join(","),
    billingEnabled: formData.get("billingEnabled") === "on",
    paymentMethods: formData.getAll("paymentMethods").join(","),
    hasAssistants: formData.get("hasAssistants") === "yes",
    assistantsCount: isNaN(assistantsCount) ? 0 : assistantsCount,
    assistantPermissions: formData.getAll("assistantPermissions").join(","),
    language: formData.get("language")?.toString() || "fr",
    currency: formData.get("currency")?.toString() || "MAD",
    mainProblem: formData.get("mainProblem")?.toString() || "",
  };

  try {
    await db.onboardingProfile.upsert({
      where: { clientId: userId },
      update: data,
      create: { ...data, clientId: userId }
    });

    await db.client.update({
      where: { id: userId },
      data: { onboardingCompleted: true }
    });

    // ✅ نرجع نجاح بدلاً من التوجيه
    return { success: true };

  } catch (error) {
    console.error("Save Error:", error);
    return { success: false, error: "Database error" };
  }
}
// ⏩ دالة التخطي (لاحقاً)
// دالة التخطي (Skip) أيضاً يجب أن توجهه للداشبورد
export async function skipOnboarding() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("mysaas_userId")?.value;
  if (!userId) return redirect("/login");

  await db.client.update({
    where: { id: userId },
    data: { onboardingCompleted: true }
  });

  redirect("/dashboard");
}

// 👇 1. إنشاء حساب طبيب جديد من لوحة الأدمن
export async function createClientByAdmin(formData: FormData) {
  const doctorName = formData.get("doctorName") as string;
  const clinicName = formData.get("clinicName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  await db.client.create({
    data: {
      doctorName,
      clinicName,
      email,
      password,
      role: "Doctor",
      status: "Active",
      plan: "Free",
      onboardingCompleted: false, // لكي يجيب على الأسئلة عند دخوله أول مرة
      nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + 14)), // نعطيه 14 يوم مجاناً
    }
  });

  // تسجيل العملية
  await createLog("ADMIN_ADD_CLIENT", `Created account for ${email}`, "Super Admin");
  
  redirect("/saas-admin/clients");
}

// 👇 2. حذف حساب الطبيب نهائياً
export async function deleteClient(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  
  // حماية: تأكد أن الطالب هو أدمن (اختياري، يفضل وجوده)
  const cookieStore = await cookies();
  const role = cookieStore.get("mysaas_role")?.value;
  if (role !== "super_admin" && role !== "admin" && role !== "superadmin") return;

  await db.client.delete({ where: { id: clientId } });
  redirect("/saas-admin/clients");
}

// --- 6. Delete Patient ---
export async function deletePatient(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const patientId = formData.get("patientId")?.toString();

  if (patientId) {
    await db.patient.delete({
      where: {
        id: patientId,
        clientId: clientId // 🔒 أمان: التأكد أن الطبيب يملك هذا المريض
      }
    });
  }

  redirect("/dashboard/patients");
}

// --- 7. Create Appointment (From General Page) ---
export async function createGeneralAppointment(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const patientId = formData.get("patientId")?.toString();
  const date = formData.get("date")?.toString();
  const type = formData.get("type")?.toString();
  const notes = formData.get("notes")?.toString();
  const priceRaw = formData.get("price")?.toString();
  const price = priceRaw ? parseFloat(priceRaw) : 0;

  if (patientId && date) {
    await db.appointment.create({
      data: {
        clientId,
        patientId,
        date: new Date(date),
        type: type || "General Consultation",
        notes: notes || "",
        status: "Scheduled",
        price: price
      }
    });
  }
  
  revalidatePath("/dashboard/appointments");
  // لا نقوم بإعادة التوجيه (Redirect) لكي نبقى في نفس الصفحة
}

// --- 8. Update Appointment Status ---
// app/actions.ts

// ... الاستيرادات السابقة

// ✅ التعديل: نقبل id و status كمتغيرات نصية مباشرة
export async function updateAppointmentStatus(id: string, status: string) {
  const clientId = await getClientId();
  if (!clientId) return;

  await db.appointment.update({
    where: { id, clientId },
    data: { status }
  });

  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/patients/[patientId]");
}
export async function deleteAppointment(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const id = formData.get("id") as string;
  await db.appointment.delete({
    where: { id, clientId }
  });
  
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/patients/[patientId]"); // تحديث صفحة المريض أيضاً
}

// --- 10. Update Invoice Status ---
export async function updateInvoiceStatus(invoiceId: string, newStatus: string) {
  const clientId = await getClientId();
  if (!clientId) return;

  await db.invoice.update({
    where: { id: invoiceId, clientId },
    data: { status: newStatus }
  });

  revalidatePath("/dashboard/invoices");
}

// --- 11. Delete Invoice ---
// app/actions.ts

// ... existing imports

export async function deleteInvoice(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const id = formData.get("id") as string;
  if (!id) return;

  await db.invoice.delete({
    where: { 
      id,
      clientId 
    }
  });

  revalidatePath("/dashboard/invoices");
}
// app/actions.ts

export async function createInvoice(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const patientId = formData.get("patientId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const status = formData.get("status") as string;
  const dateStr = formData.get("date") as string;
  
  // Default to today if no date picked
  const date = dateStr ? new Date(dateStr) : new Date();

  await db.invoice.create({
    data: {
      clientId,
      patientId,
      amount: amount || 0,
      status: status || "Pending",
      date: date
    }
  });

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/patients/[patientId]");
}

// --- 13. Quick Add (Patient + Appointment + Invoice) ---
export async function createQuickVisit(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  // 1. بيانات المريض
  const firstName = formData.get("firstName")?.toString() || "";
  const lastName = formData.get("lastName")?.toString() || "";
  const phone = formData.get("phone")?.toString() || "";

  // 2. بيانات الموعد والمال
  const amount = parseFloat(formData.get("amount")?.toString() || "0");
  const type = formData.get("type")?.toString() || "Consultation";
  const paymentStatus = formData.get("paymentStatus")?.toString() || "Paid";
  
  if (firstName && lastName) {
    // نستخدم transaction لضمان إنشاء كل شيء أو لا شيء
    await db.$transaction(async (tx) => {
      
      // أ) إنشاء المريض
      const newPatient = await tx.patient.create({
        data: {
          clientId,
          firstName,
          lastName,
          phone,
          status: "Active"
        }
      });

      // ب) إنشاء الموعد (مكتمل فوراً لأن المريض حضر)
      await tx.appointment.create({
        data: {
          clientId,
          patientId: newPatient.id,
          date: new Date(), // الوقت الحالي
          type,
          price: amount,
          status: "Completed", // نفترض أن الزيارة تمت
          notes: "Quick Visit Entry"
        }
      });

      // ج) إنشاء الفاتورة (إذا كان هناك مبلغ)
      if (amount > 0) {
        await tx.invoice.create({
          data: {
            clientId,
            patientId: newPatient.id,
            amount,
            status: paymentStatus,
            date: new Date()
          }
        });
      }
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/patients");
  revalidatePath("/dashboard/invoices");
}

// --- 14. Create Visit for Existing Patient ---
export async function createVisitForPatient(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const patientId = formData.get("patientId")?.toString();
  const price = parseFloat(formData.get("price")?.toString() || "0");
  const type = formData.get("type")?.toString() || "Consultation";

  if (patientId) {
    await db.$transaction(async (tx) => {
      // 1. إنشاء الموعد (Completed)
      await tx.appointment.create({
        data: {
          clientId,
          patientId,
          date: new Date(),
          type,
          price,
          status: "Completed", // لأن المريض موجود بالفعل
        }
      });

      // 2. إنشاء الفاتورة
      if (price > 0) {
        await tx.invoice.create({
          data: {
            clientId,
            patientId,
            amount: price,
            status: "Paid", // نفترض الدفع، ويمكن تعديله لاحقاً
            date: new Date()
          }
        });
      }
    });
  }

  revalidatePath("/dashboard/patients");
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/invoices");
}

// --- 15. Message System ---

// إرسال رسالة

// جلب رسائل مريض محدد

// ✅✅✅ هذا هو الكود الصحيح الذي يجب أن يبقى ✅✅✅

// --- 16. Support System (Doctor <-> Admin) ---

// إرسال رسالة من الطبيب إلى الآدمن
export async function sendSupportMessage(formData: FormData) {
  const phone = formData.get("phone") as string;
  const message = formData.get("message") as string;

  if (!phone || !message) return;

  await db.supportMessage.create({
    data: {
      phone,
      message
    }
  });
  revalidatePath("/dashboard/support");
}

// جلب المحادثة
export async function getSupportMessages() {
  const clientId = await getClientId();
  if (!clientId) return [];

  return await db.supportMessage.findMany({
    where: { clientId },
    orderBy: { createdAt: 'asc' }
  });
}

// --- 17. Document System ---

// --- 17. Document System ---

// 1. جلب المستندات
export async function getDocuments() {
  const clientId = await getClientId();
  if (!clientId) return [];

  return await db.document.findMany({
    where: { clientId },
    include: {
      patient: { select: { firstName: true, lastName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}
// --- 17. Document System ---
// app/actions.ts

// ... keep imports ...

export async function uploadDocument(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const file = formData.get("file") as File;
  const nameInput = formData.get("name") as string;
  const patientId = formData.get("patientId") as string;

  if (!patientId || !file || file.size === 0) return;

  // 1. Determine Name
  const finalName = nameInput && nameInput.trim() !== "" ? nameInput : file.name;

  // 2. Determine Type
  let finalType = "File";
  if (file.type.includes("pdf")) finalType = "PDF";
  else if (file.type.includes("image")) finalType = "Image";

  // 3. ✨ MAGIC FIX: Convert File to Base64 (Data URI)
  // This makes the file viewable immediately without an external server
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const fileDataUrl = `data:${file.type};base64,${base64}`;

  await db.document.create({
    data: {
      clientId,
      patientId,
      name: finalName,
      type: finalType,
      url: fileDataUrl, // ✅ Saves the actual file data here
    }
  });

  revalidatePath("/dashboard/patients/[patientId]", "page");
}


// 3. حذف مستند (جديد ✅)
export async function deleteDocument(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const documentId = formData.get("id") as string;

  await db.document.delete({
    where: { 
      id: documentId,
      clientId // لضمان الأمان
    }
  });

  revalidatePath("/dashboard/documents");
}

// دالة تجريبية لإنشاء مستند وهمي (للتجربة فقط)
export async function createMockDocument() {
  const clientId = await getClientId();
  if (!clientId) return;

  const patient = await db.patient.findFirst({ where: { clientId } });
  if (!patient) return;

  await db.document.create({
    data: {
      clientId,
      patientId: patient.id,
      name: "Medical Analysis Result.pdf",
      type: "PDF",
      url: "#",
    }
  });
  revalidatePath("/dashboard/documents");
}

// استبدل الدالة القديمة بهذه:
// --- 18. Settings System ---
// app/actions.ts

// 1. استيراد bcrypt في أعلى الملف


export async function updateSettings(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  // جلب البيانات من الفورم
  const doctorName = formData.get("doctorName") as string;
  const clinicName = formData.get("clinicName") as string; // 👈 تأكد من وجود هذا
  const specialty = formData.get("specialty") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const email = formData.get("email") as string;
  const newPassword = formData.get("newPassword") as string;

  let updateData: any = {
    doctorName,
    clinicName, // 👈 وتأكد من وجوده هنا داخل data
    specialty,
    phone,
    address,
    city,
    email
  };

  if (newPassword && newPassword.trim().length > 0) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    updateData.password = hashedPassword;
  }

  await db.client.update({
    where: { id: clientId },
    data: updateData
  });

  // تحديث الصفحات لكي تظهر البيانات الجديدة فوراً
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/invoices"); // 👈 أضف هذا لتحديث الفواتير
}
// app/actions.ts
// 📄 app/actions.ts
// 📄 ملف: app/actions.ts
// ابحث عن دالة getInvoices واستبدلها بهذا التحديث:

// ✅ دالة جلب الفواتير
// ✅ دالة جلب الفواتير (مصححة)
export async function getInvoices() {
  const clientId = await getClientId();
  if (!clientId) return [];

  return await db.invoice.findMany({
    where: { clientId },
    include: {
      patient: true, // بيانات المريض
      client: true   // ✅ بيانات العيادة (للطباعة والعملة)
    },
    // ✅ تم التصحيح: الترتيب حسب date بدلاً من createdAt
    orderBy: { date: 'desc' } 
  });
}


// app/actions.ts

export async function getAppointments() {
  const clientId = await getClientId();
  if (!clientId) return [];

  return await db.appointment.findMany({
    where: { clientId },
    include: {
      // ✅ ضروري جداً: جلب بيانات المريض لنحصل على اسمه والـ ID الخاص به
      patient: {
        select: { id: true, firstName: true, lastName: true, phone: true }
      }
    },
    orderBy: { date: 'asc' } // ترتيب حسب الأقرب
  });
}


// app/actions.ts
// app/actions.ts

// ... (تأكد من وجود الاستيرادات في الأعلى)

// app/actions.ts

// ... (تأكد من وجود الاستيرادات في الأعلى: db, getClientId)
// app/actions.ts

// app/actions.ts

export async function getDashboardStats() {
  const clientId = await getClientId();
  if (!clientId) return { 
    patients: 0, appointments: 0, revenue: 0, todayAppointments: 0, 
    recentAppointments: [], statusDistribution: [], chartData: [] 
  };

  // 1. الإحصائيات الأساسية
  const patientsCount = await db.patient.count({ where: { clientId } });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = await db.appointment.count({
    where: { clientId, date: { gte: today, lt: tomorrow } }
  });

  const scheduledApps = await db.appointment.count({ where: { clientId, status: 'Scheduled' } });

  const revenueData = await db.invoice.aggregate({
    where: { clientId, status: 'Paid' },
    _sum: { amount: true }
  });

  // 2. آخر 5 مواعيد
  const recentAppointments = await db.appointment.findMany({
    where: { clientId },
    take: 5,
    orderBy: { date: 'desc' },
    include: { patient: true }
  });

  // 3. توزيع الحالات (الرسم الدائري)
  const statusDistribution = await db.appointment.groupBy({
    by: ['status'],
    where: { clientId },
    _count: { status: true }
  });

  // ✅ 4. (الجديد) حساب الدخل لآخر 7 أيام (الرسم البياني الخطي)
  const chartData = [];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i); // الرجوع i أيام للوراء
    
    // تحديد بداية ونهاية ذلك اليوم
    const startOfDay = new Date(d); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(d); endOfDay.setHours(23,59,59,999);

    // حساب مجموع الفواتير المدفوعة في ذلك اليوم تحديداً
    const dailySum = await db.invoice.aggregate({
      where: {
        clientId,
        status: 'Paid',
        date: { gte: startOfDay, lte: endOfDay }
      },
      _sum: { amount: true }
    });

    // إضافة النتيجة للمصفوفة (اسم اليوم + المبلغ)
    chartData.push({
      name: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue...
      revenue: dailySum._sum.amount || 0
    });
  }

  return {
    patients: patientsCount,
    appointments: scheduledApps,
    todayAppointments: todayAppointments,
    revenue: revenueData._sum.amount || 0,
    recentAppointments,
    statusDistribution,
    chartData // ✅ نرسل البيانات الحقيقية الآن
  };
}
// 2. حذف وصفة
export async function deletePrescription(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const id = formData.get("id") as string;
  const patientId = formData.get("patientId") as string; // نحتاجه لتحديث الصفحة

  await db.prescription.delete({
    where: { id, clientId }
  });

  revalidatePath(`/dashboard/patients/${patientId}`);
}

export async function getPatient(patientId: string) {
  const clientId = await getClientId();
  if (!clientId) return null;

  return await db.patient.findFirst({
    where: { id: patientId, clientId },
    include: {
      invoices: true,
      documents: true,
      appointments: true,
      
      // ✅✅✅ أضف هذين السطرين
      prescriptions: { orderBy: { createdAt: 'desc' } }, 
      client: true // نحتاج بيانات الطبيب لطباعة الوصفة
    }
  });
}
// ... (تأكد أنك لا تحذف الأكواد السابقة)
// ... (تأكد أنك لا تحذف الأكواد السابقة)

// ✅ 1. إنشاء وصفة طبية (Create Prescription)
export async function createPrescription(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const patientId = formData.get("patientId") as string;
  const notes = formData.get("notes") as string;
  
  // الأدوية تأتي كـ نص JSON من الواجهة الأمامية
  const medications = formData.get("medications") as string; 

  await db.prescription.create({
    data: {
      clientId,
      patientId,
      medications,
      notes
    }
  });

  // تحديث صفحة المريض لرؤية الوصفة الجديدة فوراً
  revalidatePath(`/dashboard/patients/${patientId}`);
}

// app/actions.ts

// ... (تأكد أنك لا تحذف الأكواد السابقة)

// ✅ تحديث ملاحظات المريض
export async function updatePatientNotes(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const patientId = formData.get("patientId") as string;
  const notes = formData.get("notes") as string;

  await db.patient.update({
    where: { id: patientId, clientId },
    data: { notes }
  });

  revalidatePath(`/dashboard/patients/${patientId}`);
}
// app/actions.ts

// ... الاستيرادات السابقة ...

// 1. جلب معلومات البنك (للعميل)

// أضف هذه الاستيرادات في أعلى ملف app/actions.ts
import { mkdir, writeFile } from "fs/promises";
import path from "path";

// ... دوال أخرى ...

// ✅ دالة الدفع مع رفع الصورة (رفع حقيقي)
export async function submitPayment(formData: FormData) {
  const clientId = await getClientId();
  if (!clientId) return;

  const file = formData.get("receipt") as File;
  let fileUrl = "";

  if (file && file.size > 0) {
    try {
      // 1. تحويل الملف إلى Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 2. تحديد مسار مجلد public/uploads
      // process.cwd() يعطيك المسار الرئيسي للمشروع
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      // ✅✅ خطوة مهمة جداً: إنشاء المجلد إذا لم يكن موجوداً
      await mkdir(uploadDir, { recursive: true });

      // 3. إنشاء اسم فريد للملف
      // نستخدم Date.now() لضمان عدم تكرار الأسماء
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);

      // 4. كتابة الملف في المسار المحدد
      await writeFile(filePath, buffer);

      // 5. تحديد الرابط الذي سيحفظ في الداتابيز
      // ملاحظة: في المتصفح، public يعتبر هو الجذر (/)
      fileUrl = `/uploads/${fileName}`;
      
      console.log("File saved successfully at:", filePath);

    } catch (error) {
      console.error("Error uploading file:", error);
      // يمكنك هنا إرجاع خطأ إذا أردت
    }
  }

  // حفظ الطلب في قاعدة البيانات
  await db.paymentRequest.create({
    data: {
      clientId,
      amount: 300,
      receiptUrl: fileUrl, // الرابط الصحيح
      status: "PENDING"
    }
  });

  // تحديث حالة العميل
  await db.client.update({ 
    where: { id: clientId }, 
    data: { subscriptionStatus: "PENDING" } 
  });

  revalidatePath("/dashboard/subscription");
}

// 3. تفعيل الحساب (Admin Only)
// app/actions.ts

// ✅ 1. قبول الدفع (وتفعيل حساب الطبيب فوراً)
export async function approvePayment(formData: FormData) {
  const paymentId = formData.get("id") as string;

  // أولاً: نجلب الطلب لنعرف من هو الطبيب
  const payment = await db.paymentRequest.findUnique({ where: { id: paymentId } });
  if (!payment) return;

  // ثانياً: تحديث حالة الطلب إلى APPROVED
  await db.paymentRequest.update({
    where: { id: paymentId },
    data: { status: "APPROVED" }
  });

  // ثالثاً: تفعيل حساب الطبيب (ليتمكن من الدخول)
  await db.client.update({
    where: { id: payment.clientId },
    data: { 
      subscriptionStatus: "ACTIVE",
      // (اختياري) تمديد تاريخ الدفع شهراً إضافياً
      nextPaymentDate: new Date(new Date().setDate(new Date().getDate() + 30))
    }
  });
  await db.client.update({
    where: { id: payment.clientId },
    data: { 
      subscriptionStatus: "ACTIVE",
      // ✅ نضيف 30 يوماً من تاريخ اليوم
      subscriptionEndsAt: new Date(new Date().setDate(new Date().getDate() + 30))
    }
  });

  revalidatePath("/saas-admin/payments");
}

// ✅ 2. رفض الدفع
export async function rejectPayment(formData: FormData) {
  const paymentId = formData.get("id") as string;

  await db.paymentRequest.update({
    where: { id: paymentId },
    data: { status: "REJECTED" }
  });

  revalidatePath("/saas-admin/payments");
}

// ✅ 3. حذف الطلب نهائياً
export async function deletePayment(formData: FormData) {
  const paymentId = formData.get("id") as string;
  await db.paymentRequest.delete({ where: { id: paymentId } });
  revalidatePath("/saas-admin/payments");
}
// 4. تحديث معلومات البنك (Admin Settings)
export async function updateBankSettings(formData: FormData) {
  const rib = formData.get("rib") as string;
  const bankName = formData.get("bankName") as string;
  
  await db.systemSetting.upsert({ where: { key: "BANK_RIB" }, update: { value: rib }, create: { key: "BANK_RIB", value: rib } });
  await db.systemSetting.upsert({ where: { key: "BANK_NAME" }, update: { value: bankName }, create: { key: "BANK_NAME", value: bankName } });
  
  revalidatePath("/dashboard/settings");
}
// ✅ دالة إرسال تقرير من داخل لوحة التحكم (للطبيب المسجل)
// app/actions.ts

export async function sendReport(formData: FormData) { // 👈 يجب أن تكون FormData
  const clientId = await getClientId();
  if (!clientId) return;

  // استخراج البيانات من الـ FormData
  const message = formData.get("message") as string;
  const phone = formData.get("phone") as string;

  await db.supportMessage.create({
    data: {
      message,
      phone: phone || "Registered Doctor",
      clientId,
      status: "OPEN_TICKET"
    }
  });

  revalidatePath("/dashboard/support");
}
// app/actions.ts

// ✅ دالة إعادة تعيين كلمة المرور
export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const newPassword = formData.get("newPassword") as string;

  // 1. البحث عن العميل الذي يملك هذا الإيميل وهذا الهاتف
  const client = await db.client.findFirst({
    where: { 
      email: email,
      phone: phone 
    }
  });

  if (!client) {
    return { success: false, message: "No account found with this email and phone number." };
  }

  // 2. تشفير كلمة المرور الجديدة
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 3. تحديث البيانات
  await db.client.update({
    where: { id: client.id },
    data: { password: hashedPassword }
  });

  return { success: true, message: "Password updated successfully! Please login." };
}

// app/actions.ts

// ✅ تحديد الرسالة كمحلولة (Resolved)
export async function resolveMessage(formData: FormData) {
  const id = formData.get("id") as string;
  await db.supportMessage.update({
    where: { id },
    data: { status: "RESOLVED" }
  });
  revalidatePath("/saas-admin/messages");
}

// ✅ حذف الرسالة
export async function deleteMessage(formData: FormData) {
  const id = formData.get("id") as string;
  await db.supportMessage.delete({ where: { id } });
  revalidatePath("/saas-admin/messages");
}
// app/actions.ts

// ✅ دالة فحص وتحديث الاشتراك أوتوماتيكياً
export async function checkAndExpireSubscription(clientId: string) {
  const client = await db.client.findUnique({ 
    where: { id: clientId },
    select: { subscriptionStatus: true, subscriptionEndsAt: true }
  });

  if (!client || !client.subscriptionEndsAt) return;

  const now = new Date();
  const expiryDate = new Date(client.subscriptionEndsAt);

  // إذا كان التاريخ الحالي أكبر من تاريخ الانتهاء، والحالة ما زالت ACTIVE
  if (now > expiryDate && client.subscriptionStatus === "ACTIVE") {
    
    // ⛔ إيقاف الحساب فوراً
    await db.client.update({
      where: { id: clientId },
      data: { subscriptionStatus: "INACTIVE" }
    });

    // تحديث الكوكيز لكي يطرده الـ Middleware
    const cookieStore = await cookies();
    cookieStore.set("mysaas_status", "INACTIVE", { httpOnly: true, path: "/" });
  }
}



// ... (تأكد أن دوال loginUser و registerUser و getClientId موجودة هنا في الأعلى) ...


// ==========================================
// ✅ 1. دالة جلب إعدادات العميل (للطبيب)
/// 1. دالة جلب إعدادات النظام (وإنشائها إذا لم تكن موجودة)
export async function getSystemSettings() {
  try {
    let settings = await db.systemSettings.findFirst();

    // إذا لم توجد إعدادات، ننشئ القيم الافتراضية
    if (!settings) {
      console.log("⚠️ No settings found, creating default...");
      settings = await db.systemSettings.create({
        data: {
          // الأساسيات
          monthlyPrice: 300,
          currency: "MAD",
          
          // البنك
          bankName: "CIH Bank",
          rib: "0000 0000 0000 0000",
          accountName: "SaaS Admin",
          
          // الطريقة الإضافية (فارغة افتراضياً)
          extraMethodName: "",
          extraMethodNumber: "",
          extraMethodOwner: "",
          
          // الملاحظات (فارغة افتراضياً)
          paymentNote: ""
        }
      });
    }
    return settings;
  } catch (error) {
    console.error("❌ Error getting settings:", error);
    return null;
  }
}
// ==========================================
// ✅ 3. تحديث إعدادات النظام (للأدمن)
// ===========================
// ==========================================
// ✅ 4. تفاصيل البنك (لواجهة الدفع)
// ==========================================

// ... (تأكد أنك داخل الملف)

// ✅ دالة التحكم في مدة الاشتراك (تغيير الأيام يدوياً)
// app/actions.ts

// 1. تحديث دالة الجلب (getSystemSettings)
// ... داخل الدالة، في جزء create default ...


// 2. تحديث دالة التحديث (updateSystemSettings)
export async function updateSystemSettings(formData: FormData) {
  "use server";
  const settings = await getSystemSettings();
  if (!settings) return;

  const rawPrice = formData.get("monthlyPrice");
  const price = rawPrice ? parseFloat(rawPrice.toString()) : 0;

  const updateData = {
    monthlyPrice: price,
    currency: (formData.get("currency")?.toString() || "MAD"),
    bankName: (formData.get("bankName")?.toString() || ""),
    rib: (formData.get("rib")?.toString() || ""),
    accountName: (formData.get("accountName")?.toString() || ""),
    extraMethodName: (formData.get("extraMethodName")?.toString() || ""),
    extraMethodNumber: (formData.get("extraMethodNumber")?.toString() || ""),
    extraMethodOwner: (formData.get("extraMethodOwner")?.toString() || ""),
    
    // ✅ حفظ الملاحظة الجديدة
    paymentNote: (formData.get("paymentNote")?.toString() || ""),
  };

  await db.systemSettings.update({
    where: { id: settings.id },
    data: updateData
  });

  revalidatePath("/saas-admin/settings");
  revalidatePath("/dashboard/subscription");
}

// 3. تحديث دالة getBankDetails
export async function getBankDetails() {
  const settings = await getSystemSettings();
  
  if (!settings) return { 
    bankName: "", rib: "", accountName: "", price: 0, currency: "",
    extraMethodName: "", extraMethodNumber: "", extraMethodOwner: "", paymentNote: ""
  };

  return {
    bankName: settings.bankName,
    rib: settings.rib,
    accountName: settings.accountName,
    price: settings.monthlyPrice,
    currency: settings.currency,
    extraMethodName: settings.extraMethodName,
    extraMethodNumber: settings.extraMethodNumber,
    extraMethodOwner: settings.extraMethodOwner,
    // ✅ تمرير الملاحظة
    paymentNote: settings.paymentNote
  };
}
// app/actions.ts

// ... (تأكد أنك في نهاية الملف)

// ✅ دالة التحكم في مدة الاشتراك (تغيير الأيام يدوياً من الأدمن)
export async function updateSubscriptionDuration(formData: FormData) {
  const clientId = formData.get("clientId") as string;
  const daysString = formData.get("days") as string;
  const days = parseInt(daysString);

  if (!clientId || isNaN(days)) return;

  // حساب تاريخ الانتهاء الجديد (من اليوم + عدد الأيام المدخلة)
  const newEndDate = new Date();
  newEndDate.setDate(newEndDate.getDate() + days);

  await db.client.update({
    where: { id: clientId },
    data: { 
      subscriptionStatus: "ACTIVE", // تفعيل الحساب فوراً
      subscriptionEndsAt: newEndDate,
      nextPaymentDate: newEndDate 
    }
  });

  revalidatePath(`/saas-admin/clients/${clientId}`);
}
// ✅ دالة جلب إعدادات الطبيب (للداشبورد)
export async function getSettings() {
  const clientId = await getClientId();
  if (!clientId) return null;

  // جلب بيانات العميل (التي تحتوي على الإعدادات والعملة)
  return await db.client.findUnique({ 
    where: { id: clientId } 
  });
}
// 👇 أضف هذه الدالة في نهاية ملف app/actions.ts
export async function sendAdminReply(formData: FormData) {
  "use server";
  
  const clientId = formData.get("clientId") as string;
  const content = formData.get("content") as string;

  if (!clientId || !content) return;

  // إنشاء رسالة جديدة في قاعدة البيانات
  await db.message.create({
    data: {
      content,
      role: "ADMIN",
      clientId,
    },
  });

  // تحديث الصفحة لرؤية الرسالة الجديدة فوراً
  revalidatePath(`/saas-admin/messages/${clientId}`);
}