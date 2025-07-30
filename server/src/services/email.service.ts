async sendPasswordResetEmail(email: string, link: string) {
  // Usa nodemailer o Mailgun, etc.
  await this.mailerService.sendMail({
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${link}">here</a> to reset your password.</p>`,
  });
}
