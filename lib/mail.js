import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendStudentIdEmail(to, name, studentId) {
  try {
    const data = await resend.emails.send({
      from: "Apex 2025 Registration <onboarding@resend.dev>", // Use verified sender domain
      to,
      subject: "Your Apex Student ID",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Welcome to Apex, ${name}!</h2>
          <p>Thank you for registering. Your unique Student ID is:</p>
          <div style="font-size: 20px; font-weight: bold; color: #1d4ed8; margin: 12px 0;">
            ${studentId}
          </div>
          <p>You can use this ID to log in anytime at:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="color: #1d4ed8;">${process.env.NEXT_PUBLIC_APP_URL}/login</a>
          <br><br>
          <p>Kudos!<br>— Apex Team</p>
        </div>
      `,
    });
    console.log("Email sent to:", to);
    console.log('✅ Resend API response:', data)
  } catch (err) {
    console.error("Email send error:", err);
  }
}
