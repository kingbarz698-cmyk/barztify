<?php
namespace App\Controllers;

use App\Config\App;
use App\Models\UserModel;
use App\Services\MailService;
use App\Services\NotificationService;
use App\Middleware\RateLimitMiddleware;

class ForgotPasswordController {
    public static function sendReset(): void {
        RateLimitMiddleware::handle(5, 300); // 5 per 5 min
        $body       = json_decode(file_get_contents('php://input'), true) ?? [];
        $identifier = trim($body['identifier'] ?? $body['email'] ?? '');

        if (!$identifier) App::error('Email or username is required.', 422);

        // Lookup — support email or username
        $user = null;
        if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $user = UserModel::findByEmail($identifier);
        }
        if (!$user) {
            // Try username lookup (reuse auth method for the email/username match)
            $tmp = UserModel::findByIdentifierForAuth($identifier);
            if ($tmp) {
                $user = ['id' => $tmp['id'], 'name' => $tmp['name'], 'email' => $tmp['email']];
            }
        }

        // Always respond success — never reveal if email/username exists
        if ($user) {
            $token  = bin2hex(random_bytes(32));
            $expiry = date('Y-m-d H:i:s', strtotime('+15 minutes'));
            UserModel::setResetToken((int)$user['id'], $token, $expiry);

            $appUrl   = App::env('APP_URL', 'http://localhost:5173');
            $resetUrl = "{$appUrl}/reset-password?token={$token}";
            MailService::sendResetPasswordEmail($user['email'], $user['name'], $resetUrl);
        }

        App::response(null, 200, 'If an account exists, a reset link has been sent.');
    }

    public static function resetPassword(): void {
        $body     = json_decode(file_get_contents('php://input'), true) ?? [];
        $token    = trim($body['token']    ?? '');
        $password = trim($body['password'] ?? '');

        if (!$token || !$password) App::error('Token and new password are required.', 422);
        if (strlen($password) < 8) App::error('Password must be at least 8 characters.', 422);

        $user = UserModel::findByResetToken($token);
        if (!$user) App::error('Reset link is invalid or has expired.', 400);

        $hash = password_hash($password, PASSWORD_BCRYPT);
        UserModel::updatePassword((int)$user['id'], $hash);

        NotificationService::create((int)$user['id'], 'Password changed', 'Your password was reset successfully.', 'password_reset');

        App::response(null, 200, 'Password updated successfully. You can now log in.');
    }
}
