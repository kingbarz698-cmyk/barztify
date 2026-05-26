<?php
namespace App\Services;

use App\Config\App;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class MailService {
    public static function sendResetPasswordEmail(string $toEmail, string $toName, string $resetUrl): bool {
        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = App::env('SMTP_HOST', 'smtp.mailtrap.io');
            $mail->SMTPAuth   = true;
            $mail->Username   = App::env('SMTP_USERNAME', '');
            $mail->Password   = App::env('SMTP_PASSWORD', '');
            $mail->SMTPSecure = App::env('SMTP_PORT', '587') == '465' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = (int) App::env('SMTP_PORT', '587');
            $mail->CharSet    = 'UTF-8';

            $mail->setFrom(App::env('SMTP_FROM', 'noreply@barztify.com'), App::env('SMTP_FROM_NAME', 'Barztify'));
            $mail->addAddress($toEmail, $toName);

            $mail->isHTML(true);
            $mail->Subject = 'Reset Your Barztify Password';
            $mail->Body    = self::resetEmailTemplate($toName, $resetUrl);
            $mail->AltBody = "Hi {$toName},\n\nReset your password: {$resetUrl}\n\nThis link expires in 15 minutes.\n\nBarztify Team";

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log('MailService error: ' . $e->getMessage());
            return false;
        }
    }

    private static function resetEmailTemplate(string $name, string $url): string {
        $appName = App::$name;
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Password - {$appName}</title></head>
<body style="margin:0;padding:0;background:#0e1323;font-family:Inter,system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0e1323;padding:40px 20px;">
  <tr><td align="center">
    <table width="500" cellpadding="0" cellspacing="0" style="background:#1a1f30;border-radius:20px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;max-width:500px;width:100%;">
      <tr><td style="background:linear-gradient(135deg,#7c3aed,#5b21b6);padding:32px;text-align:center;">
        <h1 style="color:#fff;font-size:28px;font-weight:700;margin:0;letter-spacing:-0.5px;">{$appName}</h1>
        <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Premium Music Streaming</p>
      </td></tr>
      <tr><td style="padding:36px 32px;">
        <h2 style="color:#dee1f9;font-size:20px;font-weight:700;margin:0 0 12px;">Reset Your Password</h2>
        <p style="color:#ccc3d8;font-size:15px;line-height:1.6;margin:0 0 24px;">Hi <strong style="color:#dee1f9;">{$name}</strong>,<br><br>We received a request to reset your {$appName} password. Click the button below to set a new password. This link expires in <strong style="color:#d2bbff;">15 minutes</strong>.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="{$url}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 36px;border-radius:50px;letter-spacing:0.3px;">Reset Password</a>
        </div>
        <p style="color:#958da1;font-size:13px;line-height:1.6;margin:0;">If you didn't request this, ignore this email. Your password won't change.<br><br>Or copy this link:<br><span style="color:#d2bbff;word-break:break-all;font-size:12px;">{$url}</span></p>
      </td></tr>
      <tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding:20px 32px;text-align:center;">
        <p style="color:#4a4455;font-size:12px;margin:0;">&copy; 2024 {$appName}. All rights reserved.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>
HTML;
    }
}
