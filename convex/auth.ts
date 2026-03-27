import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";
import { Resend } from "resend";
import { convexAuth } from "@convex-dev/auth/server";
import { getAppUrl } from "./lib/appUrl";

const ResendResetProvider = Email({
  id: "resend",
  sendVerificationRequest: async ({
    identifier,
    token,
  }: {
    identifier: string;
    token: string;
  }) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const baseUrl = getAppUrl();
    const resetLink = `${baseUrl}/login?step=resetPassword&code=${encodeURIComponent(token)}&email=${encodeURIComponent(identifier)}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "VidMetrics <vidmetrics@app.solventio.co>",
      to: identifier,
      subject: "Reset your VidMetrics password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px;">
          <div style="background-color: #1a1a1a; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">VidMetrics</h1>
            <p style="color: #a68cff; margin: 4px 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Video Intelligence</p>
          </div>
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #eaeaea;">
            <h2 style="color: #333333; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #555555; line-height: 1.6;">Hello,</p>
            <p style="color: #555555; line-height: 1.6;">We received a request to reset your password. Click the button below to set a new one:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background-color: #704aff; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #777777; font-size: 14px; margin-bottom: 0;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      reset: ResendResetProvider,
    }),
    ResendResetProvider,
  ],
});
