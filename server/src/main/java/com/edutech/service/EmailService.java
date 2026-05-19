
// import org.springframework.stereotype.Service;

// import java.util.logging.Logger;

// @Service
// public class EmailService {

//     private static final Logger log = Logger.getLogger(EmailService.class.getName());

//     public void sendOtpEmail(String toEmail, String subject, String otp) {
//         // Log OTP for development/testing
//         log.info("========================================");
//         log.info("OTP EMAIL (Dev Mode - Configure SMTP for production)");
//         log.info("To: " + toEmail);
//         log.info("Subject: " + subject);
//         log.info("OTP: " + otp);
//         log.info("Expires in 5 minutes");
//         log.info("========================================");

//         // TODO: For production email sending, inject JavaMailSender
//         // after adding spring-boot-starter-mail dependency and SMTP config.
//         // The OTP is currently returned in the API response for development convenience.
//     }
// }

package com.edutech.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.internet.MimeMessage;
import java.util.logging.Logger;

@Service
public class EmailService {

    private static final Logger log = Logger.getLogger(EmailService.class.getName());

    @Autowired
    private JavaMailSender mailSender;

    @Value("${mail.from}")
    private String mailFrom;

    public void sendOtpEmail(String toEmail, String subject, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(buildEmailBody(subject, otp), true);

            mailSender.send(message);
            log.info("OTP email sent successfully to: " + toEmail);

        } catch (Exception e) {
            log.severe("Failed to send OTP email to " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Failed to send email. Please check SMTP configuration.", e);
        }
    }

    private String buildEmailBody(String subject, String otp) {
        return "<!DOCTYPE html>" +
                "<html><body style='margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;'>" +
                "<div style='max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;" +
                "box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;'>" +

                "<div style='background:linear-gradient(135deg,#6c63ff,#4f46e5);padding:32px;text-align:center;'>" +
                "<h1 style='color:white;margin:0;font-size:26px;letter-spacing:1px;'>NexLancer</h1>" +
                "<p style='color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;'>Freelance Marketplace</p>" +
                "</div>" +

                "<div style='padding:36px 32px;'>" +
                "<h2 style='color:#1a1a2e;font-size:20px;margin:0 0 12px;'>" + subject + "</h2>" +
                "<p style='color:#555;font-size:15px;margin:0 0 24px;line-height:1.6;'>" +
                "Use the verification code below to proceed. This code is valid for <strong>5 minutes</strong>." +
                "</p>" +

                "<div style='background:#f0eeff;border:2px dashed #6c63ff;border-radius:12px;" +
                "padding:24px;text-align:center;margin:0 0 24px;'>" +
                "<p style='margin:0 0 6px;color:#6c63ff;font-size:12px;font-weight:600;" +
                "letter-spacing:2px;text-transform:uppercase;'>Your OTP Code</p>" +
                "<div style='font-size:42px;font-weight:800;letter-spacing:12px;color:#4f46e5;" +
                "font-family:Courier New,monospace;'>" + otp + "</div>" +
                "</div>" +

                "<p style='color:#888;font-size:13px;margin:0 0 8px;'>⚠ Do not share this code with anyone.</p>" +
                "<p style='color:#888;font-size:13px;margin:0;'>If you did not request this, please ignore this email.</p>"
                +
                "</div>" +

                "<div style='background:#f9f9f9;padding:16px 32px;text-align:center;" +
                "border-top:1px solid #eee;'>" +
                "<p style='color:#bbb;font-size:12px;margin:0;'>© 2025 NexLancer. All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }
}