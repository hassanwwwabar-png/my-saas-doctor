import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function resetAdmin() {
  // 👇 ضع إيميل الأدمن هنا
  const email = "admin@gmail.com"; 
  
  // كلمة المرور الجديدة التي تريدها
  const newPassword = "123456"; 

  // تشفير كلمة المرور
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const user = await db.client.update({
      where: { email: email },
      data: { password: hashedPassword },
    });
    console.log("✅ Password reset successfully for:", user.email);
    console.log("🔑 New password is:", newPassword);
  } catch (error) {
    console.error("❌ Error: User not found or DB issue.", error);
  }
}

resetAdmin();