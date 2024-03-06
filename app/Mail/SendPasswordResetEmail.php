<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Auth;

class SendPasswordResetEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;
    public $userEmail;
    public $url;
    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(string $userEmail, string $userName)
    {
        $this->userEmail = $userEmail;
        $this->userName = $userName;
        $this->generateLink($userEmail);
    }

    public function generateLink($email)
    {
        $token = Crypt::encryptString($email);
        $expiresAt = now()->addMinutes(120);
        Cache::put($token, $email, $expiresAt); //2 Hours
        $token = base64_encode($token);
        $this->url = url('/password/reset', ['token' => $token]);
    }
    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Permintaan Reset Password BTW Edutech Office')
            ->replyTo('tanya@smartbtw.com')
            ->view('mail.forget-password');
    }
}
