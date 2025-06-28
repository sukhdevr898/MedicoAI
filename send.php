<?php
// send.php

// Include Composer's autoloader
require 'vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Allow CORS if needed
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

// Sanitize and validate input
function clean($str) {
    return trim(strip_tags($str));
}

$name = isset($_POST['name']) ? clean($_POST['name']) : '';
$email = isset($_POST['email']) ? clean($_POST['email']) : '';
$message = isset($_POST['message']) ? clean($_POST['message']) : '';

if (!$name || !$email || !$message) {
    echo json_encode(['success' => false, 'error' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid email address.']);
    exit;
}

// Compose HTML mail template
$htmlMail = '
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Medico AI - Contact Message</title>
  <meta name="color-scheme" content="light only">
  <style>
    body { background: #f8fafc; font-family: Poppins, Arial, sans-serif; margin:0; padding:0;}
    .container { max-width:480px; margin:36px auto; background:#fff; border-radius:20px; box-shadow:0 8px 32px 0 #3B82F620; border:1px solid #e0e7ef;}
    .header { background:linear-gradient(90deg,#10B981 0,#3B82F6 100%); padding:2.2rem 0 1.4rem;text-align:center;}
    .header-logo { display:inline-block; background:#fff; border-radius:50%; padding:10px; margin-bottom:10px;}
    .header-title { font-size:1.7rem; font-weight:bold; color:#fff; letter-spacing:.01em; font-family:Poppins,Arial,sans-serif;}
    .header-title span { color:#10B981;}
    .header-desc { color:#e0f2fe; font-size:1.07rem; margin-top:5px;}
    .content { padding:2.1rem 2.2rem 0.8rem 2.2rem;}
    .main-title { font-size:1.15rem; color:#374151; margin-bottom:1.2rem; font-weight:600;}
    .data-table { width:100%; border-collapse:collapse; font-size:1rem; color:#374151; margin-bottom:1.7rem;}
    .data-table td { padding:10px 0 7px 0; vertical-align:top;}
    .data-table .label { color:#3B82F6; font-weight:600; width:80px; padding-right:8px;}
    .data-table .value { color:#374151;}
    .msg-box { background:#f3f4f6; border-left:4px solid #10B981; border-radius:8px; font-size:1rem; color:#374151; margin:12px 0 18px 0; padding:14px 16px; line-height:1.7; word-break:break-word; white-space:pre-line;}
    .footer { background:#f3f4f6; color:#64748B; font-size:1rem; text-align:center; padding:16px 24px; border-top:1px solid #e0e7ef; border-radius:0 0 20px 20px;}
    .sent-from { font-size:0.97rem; color:#64748B; text-align:right;}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="header-logo">
        <img src="https://img.icons8.com/color/48/doctor-male.png" width="36" height="36" alt="Medico AI"/>
      </span>
      <div class="header-title">Medico <span>AI</span></div>
      <div class="header-desc">Contact Form Submission</div>
    </div>
    <div class="content">
      <div class="main-title">New message received from Medico AI website:</div>
      <table class="data-table">
        <tr>
          <td class="label">Name:</td>
          <td class="value">'.htmlspecialchars($name).'</td>
        </tr>
        <tr>
          <td class="label">Email:</td>
          <td class="value">'.htmlspecialchars($email).'</td>
        </tr>
      </table>
      <div class="msg-box">'.nl2br(htmlspecialchars($message)).'</div>
      <div class="sent-from">Sent from Medico AI | <span style="color:#10B981;">medico.html</span></div>
    </div>
    <div class="footer">&copy; 2024 Medico AI. All rights reserved.</div>
  </div>
</body>
</html>
';

$mail = new PHPMailer(true);

try {
    //Server settings
    // $mail->SMTPDebug = SMTP::DEBUG_SERVER; // Enable verbose debug output if needed
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com'; // Set SMTP server
    $mail->SMTPAuth   = true;
    $mail->Username   = 'SMTP USERNAME HERE'; // SMTP username
    $mail->Password   = 'PASSWORD'; // SMTP password (App Password for Gmail)
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    //Recipients
    $mail->setFrom('USERNAME', 'Medico AI');
    $mail->addAddress('SEND TO EMAIL'); // Add recipient

    // Content
    $mail->isHTML(true);
    $mail->Subject = "Medico AI Contact Form: $name";
    $mail->Body    = $htmlMail;
    $mail->AltBody = "Name: $name\nEmail: $email\nMessage:\n$message";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Message sent successfully.']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Failed to send email. Mailer Error: ' . $mail->ErrorInfo]);
}
?>