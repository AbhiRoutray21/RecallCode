require("dotenv").config();
const { Resend } = require("resend");

const resend = new Resend('re_GSYL4DtW_6FH9CagVv7DU4faezWxTJ15Z');

(async () => {
  try {
    console.log("Sending test email...");
    const result = await resend.emails.send({
      from: `RecallCode <onboarding@resend.dev>`,
      to: "routrayabhijit4@gmail.com",
      subject: "Resend Test",
      html: "<h1>Hello</h1><p>This is a test email from Resend API.</p>",
    });
    console.log("✅ Success:", result);
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
