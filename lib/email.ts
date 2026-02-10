import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

// Helper function to safely send emails with better error handling
async function sendEmail(options: {
    to: string;
    subject: string;
    html: string;
}) {
    try {
        console.log(`📧 Attempting to send email to: ${options.to}`);
        console.log(`   Subject: ${options.subject}`);
        console.log(`   From: ${fromEmail}`);

        const result = await resend.emails.send({
            from: fromEmail,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });

        console.log(`✅ Email sent successfully to ${options.to}`, result);
        return result;
    } catch (error: any) {
        console.error(`❌ Failed to send email to ${options.to}:`, error);
        console.error(`   Error details:`, error.message || error);

        // Log specific Resend errors
        if (error.statusCode) {
            console.error(`   Status Code: ${error.statusCode}`);
        }
        if (error.name) {
            console.error(`   Error Name: ${error.name}`);
        }

        throw error;
    }
}

// Email Templates

// Teacher Emails
export async function sendMaterialApprovedEmail(
    teacherEmail: string,
    materialTitle: string,
    materialId: string
) {
    return sendEmail({
        to: teacherEmail,
        subject: "🎉 Your Material Has Been Approved!",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #10b981;">Material Approved!</h1>
                <p>Great news! Your material "<strong>${materialTitle}</strong>" has been approved and is now live on the marketplace.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>What's next?</strong></p>
                    <ul style="margin-top: 10px;">
                        <li>Students can now discover and purchase your material</li>
                        <li>You'll earn 75% from every sale</li>
                        <li>Track your sales in the analytics dashboard</li>
                    </ul>
                </div>
                
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/marketplace/${materialId}" 
                   style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    View Your Material
                </a>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Keep creating quality content and watch your earnings grow!
                </p>
            </div>
        `,
    });
}

export async function sendMaterialRejectedEmail(
    teacherEmail: string,
    materialTitle: string,
    reason?: string
) {
    return sendEmail({
        to: teacherEmail,
        subject: "Material Review Update",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ef4444;">Material Not Approved</h1>
                <p>Unfortunately, your material "<strong>${materialTitle}</strong>" was not approved for the marketplace.</p>
                
                ${reason ? `
                    <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0;">
                        <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong></p>
                        <p style="margin-top: 10px; color: #991b1b;">${reason}</p>
                    </div>
                ` : ''}
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>What you can do:</strong></p>
                    <ul style="margin-top: 10px;">
                        <li>Review our content guidelines</li>
                        <li>Make necessary improvements</li>
                        <li>Upload a revised version</li>
                    </ul>
                </div>
                
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/teacher/upload" 
                   style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    Upload New Material
                </a>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    We appreciate your effort and look forward to your next submission!
                </p>
            </div>
        `,
    });
}

export async function sendNewSaleEmail(
    teacherEmail: string,
    materialTitle: string,
    price: number,
    earnings: number,
    buyerEmail: string
) {
    return sendEmail({
        to: teacherEmail,
        subject: "💰 New Sale - You Earned KES " + earnings,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #10b981;">🎉 You Made a Sale!</h1>
                <p>Congratulations! Someone just purchased your material.</p>
                
                <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
                    <h2 style="margin-top: 0; color: #059669;">Sale Details</h2>
                    <p><strong>Material:</strong> ${materialTitle}</p>
                    <p><strong>Sale Price:</strong> KES ${price}</p>
                    <p><strong>Your Earnings (75%):</strong> <span style="color: #10b981; font-size: 24px; font-weight: bold;">KES ${earnings}</span></p>
                    <p style="font-size: 14px; color: #6b7280;">Buyer: ${buyerEmail.split('@')[0]}***</p>
                </div>
                
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/teacher/analytics" 
                   style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    View Analytics
                </a>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Your earnings have been credited to your wallet. You can withdraw anytime!
                </p>
            </div>
        `,
    });
}

export async function sendTeacherVerificationCompleteEmail(
    teacherEmail: string
) {
    return sendEmail({
        to: teacherEmail,
        subject: "✅ Teacher Verification Complete - Start Earning!",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #10b981;">Welcome to Questy Teachers! 🎓</h1>
                <p>Your teacher verification payment has been confirmed. You're now ready to start earning!</p>
                
                <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0; color: #059669;">What You Can Do Now:</h2>
                    <ul>
                        <li>Upload your teaching materials</li>
                        <li>Earn 75% from every sale</li>
                        <li>Track your earnings in real-time</li>
                        <li>Withdraw to M-Pesa anytime</li>
                    </ul>
                </div>
                
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/teacher/upload" 
                   style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    Upload Your First Material
                </a>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Start sharing your knowledge and earning today!
                </p>
            </div>
        `,
    });
}

// Student Emails
export async function sendPurchaseConfirmationEmail(
    studentEmail: string,
    materialTitle: string,
    price: number,
    materialId: string
) {
    return sendEmail({
        to: studentEmail,
        subject: "✅ Purchase Confirmed - " + materialTitle,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #10b981;">Purchase Successful! 🎉</h1>
                <p>Thank you for your purchase. Your learning material is ready to download.</p>
                
                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0;">Order Details</h2>
                    <p><strong>Material:</strong> ${materialTitle}</p>
                    <p><strong>Amount Paid:</strong> KES ${price}</p>
                    <p><strong>Payment Method:</strong> M-Pesa</p>
                </div>
                
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/marketplace/${materialId}" 
                   style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    Download Now
                </a>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    You can download this material anytime from your dashboard.
                </p>
            </div>
        `,
    });
}

// Admin Emails
export async function sendNewMaterialPendingEmail(
    adminEmail: string,
    materialTitle: string,
    teacherEmail: string,
    materialId: string
) {
    return sendEmail({
        to: adminEmail,
        subject: "📝 New Material Pending Review",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #f59e0b;">New Material Awaiting Approval</h1>
                <p>A teacher has uploaded new material that requires your review.</p>
                
                <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <p><strong>Material:</strong> ${materialTitle}</p>
                    <p><strong>Teacher:</strong> ${teacherEmail}</p>
                    <p><strong>Uploaded:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/approvals" 
                   style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    Review Material
                </a>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    Please review and approve/reject as soon as possible.
                </p>
            </div>
        `,
    });
}

export async function sendNewTeacherRegistrationEmail(
    adminEmail: string,
    teacherEmail: string,
    teacherPhone: string
) {
    return sendEmail({
        to: adminEmail,
        subject: "👨‍🏫 New Teacher Registration",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #3b82f6;">New Teacher Registered</h1>
                <p>A new teacher has completed verification and joined the platform.</p>
                
                <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                    <p><strong>Email:</strong> ${teacherEmail}</p>
                    <p><strong>Phone:</strong> ${teacherPhone}</p>
                    <p><strong>Registered:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/teachers" 
                   style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    View All Teachers
                </a>
            </div>
        `,
    });
}

export async function sendNewReviewNotificationEmail(
    teacherEmail: string,
    materialTitle: string,
    rating: number,
    reviewerEmail: string,
    comment: string | null,
    materialId: string
) {
    const stars = "⭐".repeat(rating);
    return sendEmail({
        to: teacherEmail,
        subject: `${stars} New Review on "${materialTitle}"`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #f59e0b;">New Review Received! ${stars}</h1>
                <p>Someone just reviewed your material "<strong>${materialTitle}</strong>".</p>
                
                <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <p><strong>Rating:</strong> ${stars} (${rating}/5)</p>
                    <p><strong>Reviewer:</strong> ${reviewerEmail.split('@')[0]}***</p>
                    ${comment ? `
                        <div style="background-color: white; padding: 15px; border-radius: 6px; margin-top: 15px;">
                            <p style="margin: 0; color: #374151; font-style: italic;">"${comment}"</p>
                        </div>
                    ` : ''}
                </div>
                
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/marketplace/${materialId}" 
                   style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                    View Review & Reply
                </a>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    You can reply to this review to engage with your students!
                </p>
            </div>
        `,
    });
}

