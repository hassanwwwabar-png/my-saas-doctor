import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function createBackupAdmin() {
  console.log("🔄 Creating backup admin account...");

  // بيانات الحساب الجديد المضمون
  const email = "recovery@admin.com";
  const password = "123456";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // نستخدم upsert: إذا كان موجوداً يحدثه، وإذا لم يكن موجوداً ينشئه
    const user = await db.client.upsert({
      where: { email: email },
      update: { 
        password: hashedPassword,
        status: "Active", // تأكد أن الحساب مفعل
        onboardingCompleted: true // تخطي الإعدادات
      },
      create: {
        email: email,
        password: hashedPassword,
        doctorName: "Super Admin",
        status: "Active",
        onboardingCompleted: true,
        role: "super_admin", // إذا كان لديك نظام أدوار
        clinicName: "Recovery Clinic"
      },
    });

    console.log("\n✅ SUCCESS! Backup Account Ready.");
    console.log("📧 Email:    " + email);
    console.log("🔑 Password: " + password);
    console.log("-------------------------------------");
    console.log("👉 Go log in now!");

  } catch (error) {
    console.error("❌ Error creating admin:", error);
  }
}

createBackupAdmin();