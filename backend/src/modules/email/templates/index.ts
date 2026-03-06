import { EmailType, Language } from '@prisma/client';

/**
 * Email template content generator
 * Returns {content} portion that will be injected into base template
 */

export function getEmailTemplateContent(
  type: EmailType,
  language: Language,
): string {
  const templates: Record<
    EmailType,
    Record<Language, string>
  > = {
    // Authentication emails
    WELCOME: {
      EN: `
        <h1>Welcome to BookProof, {{userName}}!</h1>
        <p>We're thrilled to have you join our community of authors and readers.</p>
        <p>BookProof connects authors with engaged readers to generate authentic Amazon reviews. Here's what you can do next:</p>
        <div class="info-box">
          <ul>
            <li><strong>Complete your profile</strong> - Add your details and preferences</li>
            <li><strong>Explore features</strong> - Learn about our campaign system</li>
            <li><strong>Get started</strong> - Launch your first campaign or apply for books</li>
          </ul>
        </div>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you have any questions, our support team is here to help!
        </p>
      `,
      ES: `
        <h1>¡Bienvenido a BookProof, {{userName}}!</h1>
        <p>Estamos encantados de que te unas a nuestra comunidad de autores y lectores.</p>
        <p>BookProof conecta autores con lectores comprometidos para generar reseñas auténticas de Amazon. Esto es lo que puedes hacer a continuación:</p>
        <div class="info-box">
          <ul>
            <li><strong>Completa tu perfil</strong> - Agrega tus detalles y preferencias</li>
            <li><strong>Explora funciones</strong> - Aprende sobre nuestro sistema de campañas</li>
            <li><strong>Comienza</strong> - Lanza tu primera campaña o aplica para libros</li>
          </ul>
        </div>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Ir al Panel</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Si tienes alguna pregunta, ¡nuestro equipo de soporte está aquí para ayudarte!
        </p>
      `,
      PT: `
        <h1>Bem-vindo ao BookProof, {{userName}}!</h1>
        <p>Estamos muito felizes por você se juntar à nossa comunidade de autores e leitores.</p>
        <p>O BookProof conecta autores com leitores engajados para gerar avaliações autênticas da Amazon. Veja o que você pode fazer a seguir:</p>
        <div class="info-box">
          <ul>
            <li><strong>Complete seu perfil</strong> - Adicione seus detalhes e preferências</li>
            <li><strong>Explore recursos</strong> - Aprenda sobre nosso sistema de campanhas</li>
            <li><strong>Comece</strong> - Lance sua primeira campanha ou candidate-se a livros</li>
          </ul>
        </div>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Ir para o Painel</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Se você tiver alguma dúvida, nossa equipe de suporte está aqui para ajudar!
        </p>
      `,
    },

    EMAIL_VERIFICATION: {
      EN: `
        <h1>Verify Your Email Address</h1>
        <p>Thank you for registering with BookProof!</p>
        <p>Please click the button below to verify your email address and activate your account:</p>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button">Verify Email</a>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          Or copy and paste this link into your browser:<br>
          <a href="{{actionUrl}}" style="color: #2563eb; word-break: break-all;">{{actionUrl}}</a>
        </p>
        <div class="warning-box">
          <p style="margin: 0;"><strong>⏰ This link will expire in 24 hours.</strong></p>
          <p style="margin: 10px 0 0 0;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
      ES: `
        <h1>Verifica tu dirección de correo electrónico</h1>
        <p>¡Gracias por registrarte en BookProof!</p>
        <p>Por favor, haz clic en el botón de abajo para verificar tu dirección de correo electrónico y activar tu cuenta:</p>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button">Verificar Email</a>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          O copia y pega este enlace en tu navegador:<br>
          <a href="{{actionUrl}}" style="color: #2563eb; word-break: break-all;">{{actionUrl}}</a>
        </p>
        <div class="warning-box">
          <p style="margin: 0;"><strong>⏰ Este enlace expirará en 24 horas.</strong></p>
          <p style="margin: 10px 0 0 0;">Si no creaste una cuenta, puedes ignorar este correo de forma segura.</p>
        </div>
      `,
      PT: `
        <h1>Verifique seu endereço de e-mail</h1>
        <p>Obrigado por se registrar no BookProof!</p>
        <p>Por favor, clique no botão abaixo para verificar seu endereço de e-mail e ativar sua conta:</p>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button">Verificar E-mail</a>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          Ou copie e cole este link no seu navegador:<br>
          <a href="{{actionUrl}}" style="color: #2563eb; word-break: break-all;">{{actionUrl}}</a>
        </p>
        <div class="warning-box">
          <p style="margin: 0;"><strong>⏰ Este link expirará em 24 horas.</strong></p>
          <p style="margin: 10px 0 0 0;">Se você não criou uma conta, pode ignorar este e-mail com segurança.</p>
        </div>
      `,
    },

    PASSWORD_RESET: {
      EN: `
        <h1>Reset Your Password</h1>
        <p>We received a request to reset the password for your BookProof account.</p>
        <p>Click the button below to create a new password:</p>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button">Reset Password</a>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          Or copy and paste this link into your browser:<br>
          <a href="{{actionUrl}}" style="color: #2563eb; word-break: break-all;">{{actionUrl}}</a>
        </p>
        <div class="warning-box">
          <p style="margin: 0;"><strong>⏰ This link will expire in 1 hour.</strong></p>
          <p style="margin: 10px 0 0 0;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
      `,
      ES: `
        <h1>Restablece tu contraseña</h1>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de BookProof.</p>
        <p>Haz clic en el botón de abajo para crear una nueva contraseña:</p>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button">Restablecer Contraseña</a>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          O copia y pega este enlace en tu navegador:<br>
          <a href="{{actionUrl}}" style="color: #2563eb; word-break: break-all;">{{actionUrl}}</a>
        </div>
        <div class="warning-box">
          <p style="margin: 0;"><strong>⏰ Este enlace expirará en 1 hora.</strong></p>
          <p style="margin: 10px 0 0 0;">Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu contraseña permanecerá sin cambios.</p>
        </div>
      `,
      PT: `
        <h1>Redefina sua senha</h1>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta BookProof.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button">Redefinir Senha</a>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          Ou copie e cole este link no seu navegador:<br>
          <a href="{{actionUrl}}" style="color: #2563eb; word-break: break-all;">{{actionUrl}}</a>
        </div>
        <div class="warning-box">
          <p style="margin: 0;"><strong>⏰ Este link expirará em 1 hora.</strong></p>
          <p style="margin: 10px 0 0 0;">Se você não solicitou uma redefinição de senha, pode ignorar este e-mail com segurança. Sua senha permanecerá inalterada.</p>
        </div>
      `,
    },

    PASSWORD_CHANGED: {
      EN: `
        <h1>Password Changed Successfully</h1>
        <p>Hi {{userName}},</p>
        <p>This is a confirmation that the password for your BookProof account has been changed successfully.</p>
        <div class="info-box">
          <p style="margin: 0;"><strong>Changed on:</strong> {{currentDate}}</p>
          <p style="margin: 10px 0 0 0;"><strong>Account:</strong> {{userEmail}}</p>
        </div>
        <div class="warning-box">
          <p style="margin: 0;"><strong>⚠️ Didn't make this change?</strong></p>
          <p style="margin: 10px 0 0 0;">If you didn't change your password, please contact our support team immediately to secure your account.</p>
        </div>
        <div style="text-align: center;">
          <a href="{{supportUrl}}" class="button">Contact Support</a>
        </div>
      `,
      ES: `
        <h1>Contraseña cambiada exitosamente</h1>
        <p>Hola {{userName}},</p>
        <p>Esta es una confirmación de que la contraseña de tu cuenta de BookProof se ha cambiado exitosamente.</p>
        <div class="info-box">
          <p style="margin: 0;"><strong>Cambiada el:</strong> {{currentDate}}</p>
          <p style="margin: 10px 0 0 0;"><strong>Cuenta:</strong> {{userEmail}}</p>
        </div>
        <div class="warning-box">
          <p style="margin: 0;"><strong>⚠️ ¿No hiciste este cambio?</strong></p>
          <p style="margin: 10px 0 0 0;">Si no cambiaste tu contraseña, por favor contacta a nuestro equipo de soporte inmediatamente para asegurar tu cuenta.</p>
        </div>
        <div style="text-align: center;">
          <a href="{{supportUrl}}" class="button">Contactar Soporte</a>
        </div>
      `,
      PT: `
        <h1>Senha alterada com sucesso</h1>
        <p>Olá {{userName}},</p>
        <p>Esta é uma confirmação de que a senha da sua conta BookProof foi alterada com sucesso.</p>
        <div class="info-box">
          <p style="margin: 0;"><strong>Alterada em:</strong> {{currentDate}}</p>
          <p style="margin: 10px 0 0 0;"><strong>Conta:</strong> {{userEmail}}</p>
        </div>
        <div class="warning-box">
          <p style="margin: 0;"><strong>⚠️ Não fez essa alteração?</strong></p>
          <p style="margin: 10px 0 0 0;">Se você não alterou sua senha, entre em contato com nossa equipe de suporte imediatamente para proteger sua conta.</p>
        </div>
        <div style="text-align: center;">
          <a href="{{supportUrl}}" class="button">Contatar Suporte</a>
        </div>
      `,
    },

    // Reader workflow emails (continued in next part due to length)
    READER_MATERIALS_READY: {
      EN: `
        <h1 style="color: #10b981;">Your Book Materials Are Ready!</h1>
        <p>Hi {{userName}},</p>
        <p>Great news! The materials for <strong>"{{bookTitle}}"</strong> by {{authorName}} are now available for you to access.</p>
        <div class="info-box">
          <h3 style="margin-top: 0; color: #2563eb;">Important Details:</h3>
          <p><strong>Deadline:</strong> You have 72 hours to complete your review</p>
          <p><strong>What's included:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Book synopsis</li>
            <li>eBook download or Audiobook streaming</li>
            <li>Review submission form</li>
          </ul>
        </div>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button" style="background-color: #10b981;">Access Materials Now</a>
        </div>
        <div class="warning-box">
          <p style="margin: 0;"><strong>⏰ Remember:</strong> You'll receive reminders at 24h and 48h remaining. Please complete your review before the 72-hour deadline expires to maintain your reliability score.</p>
        </div>
      `,
      ES: `
        <h1 style="color: #10b981;">¡Tus materiales del libro están listos!</h1>
        <p>Hola {{userName}},</p>
        <p>¡Buenas noticias! Los materiales de <strong>"{{bookTitle}}"</strong> por {{authorName}} ya están disponibles para que accedas.</p>
        <div class="info-box">
          <h3 style="margin-top: 0; color: #2563eb;">Detalles importantes:</h3>
          <p><strong>Fecha límite:</strong> Tienes 72 horas para completar tu reseña</p>
          <p><strong>Qué incluye:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Sinopsis del libro</li>
            <li>Descarga de eBook o transmisión de audiolibro</li>
            <li>Formulario de envío de reseña</li>
          </ul>
        </div>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button" style="background-color: #10b981;">Acceder a los materiales ahora</a>
        </div>
        <div class="warning-box">
          <p style="margin: 0;"><strong>⏰ Recuerda:</strong> Recibirás recordatorios a las 24h y 48h restantes. Por favor completa tu reseña antes de que expire el plazo de 72 horas para mantener tu puntuación de confiabilidad.</p>
        </div>
      `,
      PT: `
        <h1 style="color: #10b981;">Seus materiais do livro estão prontos!</h1>
        <p>Olá {{userName}},</p>
        <p>Ótimas notícias! Os materiais de <strong>"{{bookTitle}}"</strong> por {{authorName}} já estão disponíveis para você acessar.</p>
        <div class="info-box">
          <h3 style="margin-top: 0; color: #2563eb;">Detalhes importantes:</h3>
          <p><strong>Prazo:</strong> Você tem 72 horas para completar sua avaliação</p>
          <p><strong>O que está incluído:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Sinopse do livro</li>
            <li>Download de eBook ou streaming de audiolivro</li>
            <li>Formulário de envio de avaliação</li>
          </ul>
        </div>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button" style="background-color: #10b981;">Acessar materiais agora</a>
        </div>
        <div class="warning-box">
          <p style="margin: 0;"><strong>⏰ Lembre-se:</strong> Você receberá lembretes com 24h e 48h restantes. Por favor, complete sua avaliação antes que o prazo de 72 horas expire para manter sua pontuação de confiabilidade.</p>
        </div>
      `,
    },

    READER_DEADLINE_24H: {
      EN: `
        <h1 style="color: #f59e0b;">⏰ Reminder: {{hoursRemaining}} Hours Remaining</h1>
        <p>Hi {{userName}},</p>
        <p>This is a friendly reminder that your review deadline for <strong>"{{bookTitle}}"</strong> is approaching.</p>
        <div style="background-color: #fef3c7; padding: 30px; border-radius: 6px; text-align: center; margin: 30px 0;">
          <h2 style="color: #f59e0b; margin: 0; font-size: 48px;">{{hoursRemaining}}h</h2>
          <p style="margin: 10px 0; color: #92400e;">Remaining until deadline</p>
        </div>
        <p><strong>Please complete your review as soon as possible to avoid expiration.</strong></p>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button" style="background-color: #f59e0b;">Complete Review Now</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you're unable to complete the review by the deadline, the assignment will be automatically reassigned to another reader.
        </p>
      `,
      ES: `
        <h1 style="color: #f59e0b;">⏰ Recordatorio: {{hoursRemaining}} horas restantes</h1>
        <p>Hola {{userName}},</p>
        <p>Este es un recordatorio amistoso de que la fecha límite de tu reseña para <strong>"{{bookTitle}}"</strong> se está acercando.</p>
        <div style="background-color: #fef3c7; padding: 30px; border-radius: 6px; text-align: center; margin: 30px 0;">
          <h2 style="color: #f59e0b; margin: 0; font-size: 48px;">{{hoursRemaining}}h</h2>
          <p style="margin: 10px 0; color: #92400e;">Restantes hasta la fecha límite</p>
        </div>
        <p><strong>Por favor completa tu reseña lo antes posible para evitar la expiración.</strong></p>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button" style="background-color: #f59e0b;">Completar reseña ahora</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Si no puedes completar la reseña antes de la fecha límite, la asignación se reasignará automáticamente a otro lector.
        </p>
      `,
      PT: `
        <h1 style="color: #f59e0b;">⏰ Lembrete: {{hoursRemaining}} horas restantes</h1>
        <p>Olá {{userName}},</p>
        <p>Este é um lembrete amigável de que o prazo da sua avaliação para <strong>"{{bookTitle}}"</strong> está se aproximando.</p>
        <div style="background-color: #fef3c7; padding: 30px; border-radius: 6px; text-align: center; margin: 30px 0;">
          <h2 style="color: #f59e0b; margin: 0; font-size: 48px;">{{hoursRemaining}}h</h2>
          <p style="margin: 10px 0; color: #92400e;">Restantes até o prazo</p>
        </div>
        <p><strong>Por favor, complete sua avaliação o mais rápido possível para evitar expiração.</strong></p>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button" style="background-color: #f59e0b;">Completar avaliação agora</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Se você não conseguir completar a avaliação até o prazo, a atribuição será automaticamente reatribuída a outro leitor.
        </p>
      `,
    },

    READER_DEADLINE_48H: {
      EN: `
        <h1 style="color: #f59e0b;">⏰ Reminder: {{hoursRemaining}} Hours Remaining</h1>
        <p>Hi {{userName}},</p>
        <p>This is a reminder that your review deadline for <strong>"{{bookTitle}}"</strong> is approaching.</p>
        <div style="background-color: #fef3c7; padding: 30px; border-radius: 6px; text-align: center; margin: 30px 0;">
          <h2 style="color: #f59e0b; margin: 0; font-size: 48px;">{{hoursRemaining}}h</h2>
          <p style="margin: 10px 0; color: #92400e;">Remaining until deadline</p>
        </div>
        <p>Please make sure to complete your review before the deadline to maintain your reliability score.</p>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button" style="background-color: #f59e0b;">Continue Review</a>
        </div>
      `,
      ES: `
        <h1 style="color: #f59e0b;">⏰ Recordatorio: {{hoursRemaining}} horas restantes</h1>
        <p>Hola {{userName}},</p>
        <p>Este es un recordatorio de que la fecha límite de tu reseña para <strong>"{{bookTitle}}"</strong> se está acercando.</p>
        <div style="background-color: #fef3c7; padding: 30px; border-radius: 6px; text-align: center; margin: 30px 0;">
          <h2 style="color: #f59e0b; margin: 0; font-size: 48px;">{{hoursRemaining}}h</h2>
          <p style="margin: 10px 0; color: #92400e;">Restantes hasta la fecha límite</p>
        </div>
        <p>Por favor asegúrate de completar tu reseña antes de la fecha límite para mantener tu puntuación de confiabilidad.</p>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button" style="background-color: #f59e0b;">Continuar reseña</a>
        </div>
      `,
      PT: `
        <h1 style="color: #f59e0b;">⏰ Lembrete: {{hoursRemaining}} horas restantes</h1>
        <p>Olá {{userName}},</p>
        <p>Este é um lembrete de que o prazo da sua avaliação para <strong>"{{bookTitle}}"</strong> está se aproximando.</p>
        <div style="background-color: #fef3c7; padding: 30px; border-radius: 6px; text-align: center; margin: 30px 0;">
          <h2 style="color: #f59e0b; margin: 0; font-size: 48px;">{{hoursRemaining}}h</h2>
          <p style="margin: 10px 0; color: #92400e;">Restantes até o prazo</p>
        </div>
        <p>Por favor, certifique-se de completar sua avaliação antes do prazo para manter sua pontuação de confiabilidade.</p>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button" style="background-color: #f59e0b;">Continuar avaliação</a>
        </div>
      `,
    },

    READER_DEADLINE_72H: {
      EN: `
        <h1 style="color: #dc2626;">🚨 Final Reminder: Deadline Approaching</h1>
        <p>Hi {{userName}},</p>
        <p><strong>This is your final reminder</strong> that your review deadline for <strong>"{{bookTitle}}"</strong> is about to expire.</p>
        <div style="background-color: #fee2e2; padding: 30px; border-radius: 6px; text-align: center; margin: 30px 0; border-left: 4px solid #dc2626;">
          <h2 style="color: #dc2626; margin: 0; font-size: 48px;">FINAL HOURS</h2>
          <p style="margin: 10px 0; color: #991b1b;">Your deadline is expiring soon!</p>
        </div>
        <p style="color: #dc2626;"><strong>⚠️ Please complete your review immediately to avoid assignment expiration.</strong></p>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button" style="background-color: #dc2626;">Submit Review Now</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If the deadline passes, this assignment will be marked as expired and reassigned to another reader. This will affect your completion rate.
        </p>
      `,
      ES: `
        <h1 style="color: #dc2626;">🚨 Recordatorio final: fecha límite próxima</h1>
        <p>Hola {{userName}},</p>
        <p><strong>Este es tu recordatorio final</strong> de que la fecha límite de tu reseña para <strong>"{{bookTitle}}"</strong> está a punto de expirar.</p>
        <div style="background-color: #fee2e2; padding: 30px; border-radius: 6px; text-align: center; margin: 30px 0; border-left: 4px solid #dc2626;">
          <h2 style="color: #dc2626; margin: 0; font-size: 48px;">ÚLTIMAS HORAS</h2>
          <p style="margin: 10px 0; color: #991b1b;">¡Tu fecha límite está expirando pronto!</p>
        </div>
        <p style="color: #dc2626;"><strong>⚠️ Por favor completa tu reseña inmediatamente para evitar la expiración de la asignación.</strong></p>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button" style="background-color: #dc2626;">Enviar reseña ahora</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Si pasa la fecha límite, esta asignación se marcará como expirada y se reasignará a otro lector. Esto afectará tu tasa de finalización.
        </p>
      `,
      PT: `
        <h1 style="color: #dc2626;">🚨 Lembrete final: prazo se aproximando</h1>
        <p>Olá {{userName}},</p>
        <p><strong>Este é seu lembrete final</strong> de que o prazo da sua avaliação para <strong>"{{bookTitle}}"</strong> está prestes a expirar.</p>
        <div style="background-color: #fee2e2; padding: 30px; border-radius: 6px; text-align: center; margin: 30px 0; border-left: 4px solid #dc2626;">
          <h2 style="color: #dc2626; margin: 0; font-size: 48px;">ÚLTIMAS HORAS</h2>
          <p style="margin: 10px 0; color: #991b1b;">Seu prazo está expirando em breve!</p>
        </div>
        <p style="color: #dc2626;"><strong>⚠️ Por favor, complete sua avaliação imediatamente para evitar expiração da atribuição.</strong></p>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button" style="background-color: #dc2626;">Enviar avaliação agora</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Se o prazo passar, esta atribuição será marcada como expirada e reatribuída a outro leitor. Isso afetará sua taxa de conclusão.
        </p>
      `,
    },

    READER_ASSIGNMENT_EXPIRED: {
      EN: `
        <h1 style="color: #dc2626;">Assignment Expired</h1>
        <p>Hi {{userName}},</p>
        <p>Unfortunately, the 72-hour deadline for <strong>"{{bookTitle}}"</strong> has passed without a submission.</p>
        <div class="warning-box">
          <p style="margin: 0;">This assignment has been automatically marked as expired and will be reassigned to another reader from the queue.</p>
        </div>
        <p><strong>What this means:</strong></p>
        <ul>
          <li>You will no longer have access to the materials</li>
          <li>No credits will be charged</li>
          <li>This will be reflected in your completion statistics</li>
        </ul>
        <div class="info-box">
          <p style="margin: 0;"><strong>💡 Tip:</strong> To maintain a good reliability score, please only apply for books you're committed to reviewing within the 72-hour window. Your completion rate affects future assignment opportunities.</p>
        </div>
        <p style="margin-top: 30px;">Keep browsing for other available books that interest you!</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Browse Available Books</a>
        </div>
      `,
      ES: `
        <h1 style="color: #dc2626;">Asignación expirada</h1>
        <p>Hola {{userName}},</p>
        <p>Desafortunadamente, la fecha límite de 72 horas para <strong>"{{bookTitle}}"</strong> ha pasado sin una presentación.</p>
        <div class="warning-box">
          <p style="margin: 0;">Esta asignación se ha marcado automáticamente como expirada y se reasignará a otro lector de la cola.</p>
        </div>
        <p><strong>Qué significa esto:</strong></p>
        <ul>
          <li>Ya no tendrás acceso a los materiales</li>
          <li>No se cobrarán créditos</li>
          <li>Esto se reflejará en tus estadísticas de finalización</li>
        </ul>
        <div class="info-box">
          <p style="margin: 0;"><strong>💡 Consejo:</strong> Para mantener una buena puntuación de confiabilidad, por favor solo aplica para libros que estés comprometido a reseñar dentro de la ventana de 72 horas. Tu tasa de finalización afecta futuras oportunidades de asignación.</p>
        </div>
        <p style="margin-top: 30px;">¡Sigue buscando otros libros disponibles que te interesen!</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Explorar libros disponibles</a>
        </div>
      `,
      PT: `
        <h1 style="color: #dc2626;">Atribuição expirada</h1>
        <p>Olá {{userName}},</p>
        <p>Infelizmente, o prazo de 72 horas para <strong>"{{bookTitle}}"</strong> passou sem uma submissão.</p>
        <div class="warning-box">
          <p style="margin: 0;">Esta atribuição foi automaticamente marcada como expirada e será reatribuída a outro leitor da fila.</p>
        </div>
        <p><strong>O que isso significa:</strong></p>
        <ul>
          <li>Você não terá mais acesso aos materiais</li>
          <li>Nenhum crédito será cobrado</li>
          <li>Isso será refletido em suas estatísticas de conclusão</li>
        </ul>
        <div class="info-box">
          <p style="margin: 0;"><strong>💡 Dica:</strong> Para manter uma boa pontuação de confiabilidade, por favor, candidate-se apenas a livros que você está comprometido em avaliar dentro da janela de 72 horas. Sua taxa de conclusão afeta futuras oportunidades de atribuição.</p>
        </div>
        <p style="margin-top: 30px;">Continue procurando outros livros disponíveis que te interessem!</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Procurar livros disponíveis</a>
        </div>
      `,
    },

    READER_REVIEW_SUBMITTED: {
      EN: `
        <h1 style="color: #2563eb;">📝 Review Submitted!</h1>
        <p>Hi {{userName}},</p>
        <p>Thank you for submitting your review for <strong>"{{bookTitle}}"</strong>!</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">What Happens Next:</h3>
          <p style="margin: 5px 0;">1. Our team will verify your Amazon review</p>
          <p style="margin: 5px 0;">2. Once approved, payment will be added to your wallet</p>
          <p style="margin: 5px 0;">3. You'll receive an email confirmation</p>
        </div>
        <p>Validation typically takes 24-48 hours. You don't need to do anything else!</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">View My Reviews</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Thank you for being part of the BookProof community!
        </p>
      `,
      ES: `
        <h1 style="color: #2563eb;">📝 ¡Reseña Enviada!</h1>
        <p>Hola {{userName}},</p>
        <p>¡Gracias por enviar tu reseña de <strong>"{{bookTitle}}"</strong>!</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Qué Sigue:</h3>
          <p style="margin: 5px 0;">1. Nuestro equipo verificará tu reseña en Amazon</p>
          <p style="margin: 5px 0;">2. Una vez aprobada, el pago se agregará a tu billetera</p>
          <p style="margin: 5px 0;">3. Recibirás un correo de confirmación</p>
        </div>
        <p>La validación generalmente toma 24-48 horas. ¡No necesitas hacer nada más!</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Ver Mis Reseñas</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          ¡Gracias por ser parte de la comunidad BookProof!
        </p>
      `,
      PT: `
        <h1 style="color: #2563eb;">📝 Avaliação Enviada!</h1>
        <p>Olá {{userName}},</p>
        <p>Obrigado por enviar sua avaliação de <strong>"{{bookTitle}}"</strong>!</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Próximos Passos:</h3>
          <p style="margin: 5px 0;">1. Nossa equipe verificará sua avaliação na Amazon</p>
          <p style="margin: 5px 0;">2. Após aprovação, o pagamento será adicionado à sua carteira</p>
          <p style="margin: 5px 0;">3. Você receberá um email de confirmação</p>
        </div>
        <p>A validação geralmente leva 24-48 horas. Você não precisa fazer mais nada!</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Ver Minhas Avaliações</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Obrigado por fazer parte da comunidade BookProof!
        </p>
      `,
    },

    READER_REVIEW_VALIDATED: {
      EN: `
        <h1 style="color: #10b981;">✅ Review Approved!</h1>
        <p>Hi {{userName}},</p>
        <p>Great news! Your review for <strong>"{{bookTitle}}"</strong> has been validated and approved.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Payment Details:</h3>
          <p style="margin: 5px 0;"><strong>Amount earned:</strong> {{earningsAmount}}</p>
          <p style="margin: 5px 0;"><strong>New wallet balance:</strong> {{walletBalance}}</p>
        </div>
        <p>Your payment has been added to your wallet. You can request a payout once your balance reaches $50.</p>
        <div style="text-align: center;">
          <a href="{{walletUrl}}" class="button" style="background-color: #10b981;">View Wallet</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Thank you for providing a quality review! Keep up the great work.
        </p>
      `,
      ES: `
        <h1 style="color: #10b981;">✅ ¡Reseña aprobada!</h1>
        <p>Hola {{userName}},</p>
        <p>¡Buenas noticias! Tu reseña de <strong>"{{bookTitle}}"</strong> ha sido validada y aprobada.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles del pago:</h3>
          <p style="margin: 5px 0;"><strong>Cantidad ganada:</strong> {{earningsAmount}}</p>
          <p style="margin: 5px 0;"><strong>Nuevo saldo de billetera:</strong> {{walletBalance}}</p>
        </div>
        <p>Tu pago se ha agregado a tu billetera. Puedes solicitar un retiro una vez que tu saldo alcance los $50.</p>
        <div style="text-align: center;">
          <a href="{{walletUrl}}" class="button" style="background-color: #10b981;">Ver billetera</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          ¡Gracias por proporcionar una reseña de calidad! Sigue con el gran trabajo.
        </p>
      `,
      PT: `
        <h1 style="color: #10b981;">✅ Avaliação aprovada!</h1>
        <p>Olá {{userName}},</p>
        <p>Ótimas notícias! Sua avaliação de <strong>"{{bookTitle}}"</strong> foi validada e aprovada.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes do pagamento:</h3>
          <p style="margin: 5px 0;"><strong>Valor ganho:</strong> {{earningsAmount}}</p>
          <p style="margin: 5px 0;"><strong>Novo saldo da carteira:</strong> {{walletBalance}}</p>
        </div>
        <p>Seu pagamento foi adicionado à sua carteira. Você pode solicitar um saque assim que seu saldo atingir $50.</p>
        <div style="text-align: center;">
          <a href="{{walletUrl}}" class="button" style="background-color: #10b981;">Ver carteira</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Obrigado por fornecer uma avaliação de qualidade! Continue com o ótimo trabalho.
        </p>
      `,
    },

    READER_REVIEW_REJECTED: {
      EN: `
        <h1 style="color: #f59e0b;">Review Needs Revision</h1>
        <p>Hi {{userName}},</p>
        <p>Your review for <strong>"{{bookTitle}}"</strong> has been reviewed and requires some revisions before it can be approved.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Feedback:</h3>
          <p style="margin: 0;">{{rejectionReason}}</p>
        </div>
        <p>Please review the feedback above and submit an updated version of your review. Make sure your review:</p>
        <ul>
          <li>Provides specific details about the book</li>
          <li>Is written in your own words (no plagiarism)</li>
          <li>Follows our quality guidelines</li>
          <li>Is helpful and authentic</li>
        </ul>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button">Revise Review</a>
        </div>
      `,
      ES: `
        <h1 style="color: #f59e0b;">La reseña necesita revisión</h1>
        <p>Hola {{userName}},</p>
        <p>Tu reseña de <strong>"{{bookTitle}}"</strong> ha sido revisada y requiere algunas correcciones antes de que pueda ser aprobada.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Comentarios:</h3>
          <p style="margin: 0;">{{rejectionReason}}</p>
        </div>
        <p>Por favor revisa los comentarios anteriores y envía una versión actualizada de tu reseña. Asegúrate de que tu reseña:</p>
        <ul>
          <li>Proporciona detalles específicos sobre el libro</li>
          <li>Está escrita con tus propias palabras (sin plagio)</li>
          <li>Sigue nuestras pautas de calidad</li>
          <li>Es útil y auténtica</li>
        </ul>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button">Revisar reseña</a>
        </div>
      `,
      PT: `
        <h1 style="color: #f59e0b;">Avaliação precisa de revisão</h1>
        <p>Olá {{userName}},</p>
        <p>Sua avaliação de <strong>"{{bookTitle}}"</strong> foi revisada e requer algumas correções antes de poder ser aprovada.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Feedback:</h3>
          <p style="margin: 0;">{{rejectionReason}}</p>
        </div>
        <p>Por favor, revise o feedback acima e envie uma versão atualizada da sua avaliação. Certifique-se de que sua avaliação:</p>
        <ul>
          <li>Fornece detalhes específicos sobre o livro</li>
          <li>Está escrita com suas próprias palavras (sem plágio)</li>
          <li>Segue nossas diretrizes de qualidade</li>
          <li>É útil e autêntica</li>
        </ul>
        <div style="text-align: center;">
          <a href="{{assignmentUrl}}" class="button">Revisar avaliação</a>
        </div>
      `,
    },

    READER_PAYOUT_REQUESTED: {
      EN: `
        <h1 style="color: #3b82f6;">Payout Request Received</h1>
        <p>Hi {{userName}},</p>
        <p>We've received your payout request. Your funds have been reserved and are awaiting admin processing.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Request Details:</h3>
          <p style="margin: 5px 0;"><strong>Amount:</strong> \${{amount}}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Pending Admin Processing</p>
        </div>
        <p>Your payout request will be reviewed and processed by our admin team. You'll receive another email once the payment has been sent.</p>
        <p><strong>What happens next:</strong></p>
        <ul style="margin-left: 20px;">
          <li>Admin reviews your payout request</li>
          <li>Payment is processed to your {{paymentMethod}} account</li>
          <li>You receive confirmation email once completed</li>
        </ul>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #3b82f6;">View Wallet</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Processing typically takes 1-3 business days. Thank you for your patience!
        </p>
      `,
      ES: `
        <h1 style="color: #3b82f6;">Solicitud de pago recibida</h1>
        <p>Hola {{userName}},</p>
        <p>Hemos recibido tu solicitud de pago. Tus fondos han sido reservados y están esperando el procesamiento del administrador.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles de la solicitud:</h3>
          <p style="margin: 5px 0;"><strong>Monto:</strong> \${{amount}}</p>
          <p style="margin: 5px 0;"><strong>Método de pago:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>Estado:</strong> Pendiente de procesamiento</p>
        </div>
        <p>Tu solicitud de pago será revisada y procesada por nuestro equipo de administración. Recibirás otro correo electrónico una vez que se haya enviado el pago.</p>
        <p><strong>Qué sucede ahora:</strong></p>
        <ul style="margin-left: 20px;">
          <li>El administrador revisa tu solicitud de pago</li>
          <li>El pago se procesa a tu cuenta de {{paymentMethod}}</li>
          <li>Recibes un correo de confirmación una vez completado</li>
        </ul>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #3b82f6;">Ver billetera</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          El procesamiento generalmente toma de 1 a 3 días hábiles. ¡Gracias por tu paciencia!
        </p>
      `,
      PT: `
        <h1 style="color: #3b82f6;">Solicitação de pagamento recebida</h1>
        <p>Olá {{userName}},</p>
        <p>Recebemos sua solicitação de pagamento. Seus fundos foram reservados e estão aguardando o processamento do administrador.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes da solicitação:</h3>
          <p style="margin: 5px 0;"><strong>Valor:</strong> \${{amount}}</p>
          <p style="margin: 5px 0;"><strong>Método de pagamento:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Pendente de processamento</p>
        </div>
        <p>Sua solicitação de pagamento será revisada e processada por nossa equipe administrativa. Você receberá outro e-mail assim que o pagamento for enviado.</p>
        <p><strong>O que acontece agora:</strong></p>
        <ul style="margin-left: 20px;">
          <li>O administrador revisa sua solicitação de pagamento</li>
          <li>O pagamento é processado para sua conta {{paymentMethod}}</li>
          <li>Você recebe um e-mail de confirmação assim que concluído</li>
        </ul>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #3b82f6;">Ver carteira</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          O processamento geralmente leva de 1 a 3 dias úteis. Obrigado pela sua paciência!
        </p>
      `,
    },

    READER_PAYOUT_COMPLETED: {
      EN: `
        <h1 style="color: #10b981;">Payout Completed!</h1>
        <p>Hi {{userName}},</p>
        <p>Great news! Your payout request has been processed and the funds have been sent.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Payment Details:</h3>
          <p style="margin: 5px 0;"><strong>Amount:</strong> \${{amount}}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Paid On:</strong> {{paidAt}}</p>
        </div>
        <p>The funds should arrive in your account according to your payment provider's processing times.</p>
        <div style="text-align: center;">
          <a href="{{walletUrl}}" class="button" style="background-color: #10b981;">View Wallet</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Thank you for being a valued BookProof reader! Keep reviewing to earn more.
        </p>
      `,
      ES: `
        <h1 style="color: #10b981;">Pago completado!</h1>
        <p>Hola {{userName}},</p>
        <p>Buenas noticias! Tu solicitud de pago ha sido procesada y los fondos han sido enviados.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles del pago:</h3>
          <p style="margin: 5px 0;"><strong>Monto:</strong> \${{amount}}</p>
          <p style="margin: 5px 0;"><strong>Metodo de pago:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>ID de transaccion:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Pagado el:</strong> {{paidAt}}</p>
        </div>
        <p>Los fondos deberian llegar a tu cuenta segun los tiempos de procesamiento de tu proveedor de pagos.</p>
        <div style="text-align: center;">
          <a href="{{walletUrl}}" class="button" style="background-color: #10b981;">Ver billetera</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Gracias por ser un valioso lector de BookProof! Sigue resenando para ganar mas.
        </p>
      `,
      PT: `
        <h1 style="color: #10b981;">Pagamento concluido!</h1>
        <p>Ola {{userName}},</p>
        <p>Otimas noticias! Sua solicitacao de pagamento foi processada e os fundos foram enviados.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes do pagamento:</h3>
          <p style="margin: 5px 0;"><strong>Valor:</strong> \${{amount}}</p>
          <p style="margin: 5px 0;"><strong>Metodo de pagamento:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>ID da transacao:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Pago em:</strong> {{paidAt}}</p>
        </div>
        <p>Os fundos devem chegar a sua conta de acordo com os tempos de processamento do seu provedor de pagamento.</p>
        <div style="text-align: center;">
          <a href="{{walletUrl}}" class="button" style="background-color: #10b981;">Ver carteira</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Obrigado por ser um valioso leitor do BookProof! Continue avaliando para ganhar mais.
        </p>
      `,
    },

    // Continue with remaining templates...
    // Due to length limitations, I'll create a second file for the remaining templates

    // Author workflow emails
    AUTHOR_CAMPAIGN_STARTED: {
      EN: `
        <h1 style="color: #10b981;">🚀 Campaign Started Successfully!</h1>
        <p>Hi {{userName}},</p>
        <p>Great news! Your campaign for <strong>"{{bookTitle}}"</strong> has been activated and is now live.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Campaign Details:</h3>
          <p style="margin: 5px 0;"><strong>Total reviews requested:</strong> {{totalReviews}}</p>
          <p style="margin: 5px 0;"><strong>Distribution rate:</strong> {{reviewsPerWeek}} reviews/week</p>
          <p style="margin: 5px 0;"><strong>Credits consumed:</strong> {{creditsUsed}}</p>
        </div>
        <p>Readers will start receiving your book materials according to the distribution schedule. You'll receive updates as reviews are submitted and validated.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">View Campaign Dashboard</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Your readers will complete their reviews within 72 hours of receiving materials. We'll keep you updated on the progress!
        </p>
      `,
      ES: `
        <h1 style="color: #10b981;">🚀 ¡Campaña iniciada exitosamente!</h1>
        <p>Hola {{userName}},</p>
        <p>¡Buenas noticias! Tu campaña para <strong>"{{bookTitle}}"</strong> ha sido activada y ya está en vivo.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles de la campaña:</h3>
          <p style="margin: 5px 0;"><strong>Total de reseñas solicitadas:</strong> {{totalReviews}}</p>
          <p style="margin: 5px 0;"><strong>Tasa de distribución:</strong> {{reviewsPerWeek}} reseñas/semana</p>
          <p style="margin: 5px 0;"><strong>Créditos consumidos:</strong> {{creditsUsed}}</p>
        </div>
        <p>Los lectores comenzarán a recibir los materiales de tu libro según el cronograma de distribución. Recibirás actualizaciones a medida que se envíen y validen las reseñas.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver panel de campaña</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Tus lectores completarán sus reseñas dentro de las 72 horas posteriores a recibir los materiales. ¡Te mantendremos informado sobre el progreso!
        </p>
      `,
      PT: `
        <h1 style="color: #10b981;">🚀 Campanha iniciada com sucesso!</h1>
        <p>Olá {{userName}},</p>
        <p>Ótimas notícias! Sua campanha para <strong>"{{bookTitle}}"</strong> foi ativada e já está ao vivo.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes da campanha:</h3>
          <p style="margin: 5px 0;"><strong>Total de avaliações solicitadas:</strong> {{totalReviews}}</p>
          <p style="margin: 5px 0;"><strong>Taxa de distribuição:</strong> {{reviewsPerWeek}} avaliações/semana</p>
          <p style="margin: 5px 0;"><strong>Créditos consumidos:</strong> {{creditsUsed}}</p>
        </div>
        <p>Os leitores começarão a receber os materiais do seu livro de acordo com o cronograma de distribuição. Você receberá atualizações conforme as avaliações forem enviadas e validadas.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver painel da campanha</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Seus leitores completarão suas avaliações dentro de 72 horas após receber os materiais. Manteremos você informado sobre o progresso!
        </p>
      `,
    },

    AUTHOR_CAMPAIGN_COMPLETED: {
      EN: `
        <h1 style="color: #10b981;">✅ Campaign Completed!</h1>
        <p>Hi {{userName}},</p>
        <p>Congratulations! Your campaign for <strong>"{{bookTitle}}"</strong> has been completed successfully.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Final Results:</h3>
          <p style="margin: 5px 0;"><strong>Reviews delivered:</strong> {{totalReviews}}</p>
          <p style="margin: 5px 0;"><strong>Average rating:</strong> {{averageRating}}⭐</p>
          <p style="margin: 5px 0;"><strong>Success rate:</strong> {{successRate}}%</p>
        </div>
        <p>Your campaign report is being generated and will be available shortly. This comprehensive report includes detailed metrics, rating distribution, and anonymized reader feedback.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">View Campaign Results</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Thank you for choosing BookProof! We hope these reviews help boost your book's visibility on Amazon.
        </p>
      `,
      ES: `
        <h1 style="color: #10b981;">✅ ¡Campaña completada!</h1>
        <p>Hola {{userName}},</p>
        <p>¡Felicidades! Tu campaña para <strong>"{{bookTitle}}"</strong> se ha completado exitosamente.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Resultados finales:</h3>
          <p style="margin: 5px 0;"><strong>Reseñas entregadas:</strong> {{totalReviews}}</p>
          <p style="margin: 5px 0;"><strong>Calificación promedio:</strong> {{averageRating}}⭐</p>
          <p style="margin: 5px 0;"><strong>Tasa de éxito:</strong> {{successRate}}%</p>
        </div>
        <p>Tu informe de campaña se está generando y estará disponible en breve. Este informe completo incluye métricas detalladas, distribución de calificaciones y comentarios anónimos de lectores.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver resultados de la campaña</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          ¡Gracias por elegir BookProof! Esperamos que estas reseñas ayuden a aumentar la visibilidad de tu libro en Amazon.
        </p>
      `,
      PT: `
        <h1 style="color: #10b981;">✅ Campanha concluída!</h1>
        <p>Olá {{userName}},</p>
        <p>Parabéns! Sua campanha para <strong>"{{bookTitle}}"</strong> foi concluída com sucesso.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Resultados finais:</h3>
          <p style="margin: 5px 0;"><strong>Avaliações entregues:</strong> {{totalReviews}}</p>
          <p style="margin: 5px 0;"><strong>Classificação média:</strong> {{averageRating}}⭐</p>
          <p style="margin: 5px 0;"><strong>Taxa de sucesso:</strong> {{successRate}}%</p>
        </div>
        <p>Seu relatório de campanha está sendo gerado e estará disponível em breve. Este relatório abrangente inclui métricas detalhadas, distribuição de classificação e feedback anônimo dos leitores.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver resultados da campanha</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Obrigado por escolher o BookProof! Esperamos que essas avaliações ajudem a aumentar a visibilidade do seu livro na Amazon.
        </p>
      `,
    },

    AUTHOR_REPORT_READY: {
      EN: `
        <h1 style="color: #2563eb;">📊 Campaign Report Ready</h1>
        <p>Hi {{userName}},</p>
        <p>Your comprehensive campaign report for <strong>"{{bookTitle}}"</strong> is now available for download.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Report Includes:</h3>
          <ul style="margin: 10px 0;">
            <li>Summary metrics and statistics</li>
            <li>Rating distribution analysis</li>
            <li>Campaign timeline visualization</li>
            <li>Anonymized reader feedback</li>
            <li>Performance metrics</li>
          </ul>
        </div>
        <p>This professional PDF report provides detailed insights into your campaign performance.</p>
        <div style="text-align: center;">
          <a href="{{pdfUrl}}" class="button" style="background-color: #2563eb;">Download Report PDF</a>
        </div>
        <p style="margin-top: 20px; text-align: center;">
          <a href="{{reportUrl}}" style="color: #2563eb;">View Online</a>
        </p>
      `,
      ES: `
        <h1 style="color: #2563eb;">📊 Informe de campaña listo</h1>
        <p>Hola {{userName}},</p>
        <p>Tu informe completo de campaña para <strong>"{{bookTitle}}"</strong> ya está disponible para descargar.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">El informe incluye:</h3>
          <ul style="margin: 10px 0;">
            <li>Métricas y estadísticas resumidas</li>
            <li>Análisis de distribución de calificaciones</li>
            <li>Visualización de cronograma de campaña</li>
            <li>Comentarios anónimos de lectores</li>
            <li>Métricas de rendimiento</li>
          </ul>
        </div>
        <p>Este informe PDF profesional proporciona información detallada sobre el rendimiento de tu campaña.</p>
        <div style="text-align: center;">
          <a href="{{pdfUrl}}" class="button" style="background-color: #2563eb;">Descargar informe PDF</a>
        </div>
        <p style="margin-top: 20px; text-align: center;">
          <a href="{{reportUrl}}" style="color: #2563eb;">Ver en línea</a>
        </p>
      `,
      PT: `
        <h1 style="color: #2563eb;">📊 Relatório de campanha pronto</h1>
        <p>Olá {{userName}},</p>
        <p>Seu relatório abrangente de campanha para <strong>"{{bookTitle}}"</strong> já está disponível para download.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">O relatório inclui:</h3>
          <ul style="margin: 10px 0;">
            <li>Métricas e estatísticas resumidas</li>
            <li>Análise de distribuição de classificação</li>
            <li>Visualização da linha do tempo da campanha</li>
            <li>Feedback anônimo dos leitores</li>
            <li>Métricas de desempenho</li>
          </ul>
        </div>
        <p>Este relatório PDF profissional fornece informações detalhadas sobre o desempenho da sua campanha.</p>
        <div style="text-align: center;">
          <a href="{{pdfUrl}}" class="button" style="background-color: #2563eb;">Baixar relatório PDF</a>
        </div>
        <p style="margin-top: 20px; text-align: center;">
          <a href="{{reportUrl}}" style="color: #2563eb;">Ver online</a>
        </p>
      `,
    },

    AUTHOR_PAYMENT_RECEIVED: {
      EN: `
        <h1 style="color: #10b981;">✅ Payment Received</h1>
        <p>Hi {{userName}},</p>
        <p>Thank you! Your payment of <strong>{{amount}} {{currency}}</strong> has been received successfully.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Payment Details:</h3>
          <p style="margin: 5px 0;"><strong>Amount:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Credits added:</strong> {{creditsAdded}}</p>
        </div>
        <p>Your credits have been added to your account and are ready to use for your next campaign.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">View Dashboard</a>
        </div>
      `,
      ES: `
        <h1 style="color: #10b981;">✅ Pago recibido</h1>
        <p>Hola {{userName}},</p>
        <p>¡Gracias! Tu pago de <strong>{{amount}} {{currency}}</strong> se ha recibido exitosamente.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles del pago:</h3>
          <p style="margin: 5px 0;"><strong>Monto:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>ID de transacción:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Créditos agregados:</strong> {{creditsAdded}}</p>
        </div>
        <p>Tus créditos se han agregado a tu cuenta y están listos para usar en tu próxima campaña.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver panel</a>
        </div>
      `,
      PT: `
        <h1 style="color: #10b981;">✅ Pagamento recebido</h1>
        <p>Olá {{userName}},</p>
        <p>Obrigado! Seu pagamento de <strong>{{amount}} {{currency}}</strong> foi recebido com sucesso.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes do pagamento:</h3>
          <p style="margin: 5px 0;"><strong>Valor:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>ID da transação:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Data:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Créditos adicionados:</strong> {{creditsAdded}}</p>
        </div>
        <p>Seus créditos foram adicionados à sua conta e estão prontos para usar na sua próxima campanha.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver painel</a>
        </div>
      `,
    },

    AUTHOR_PAYMENT_FAILED: {
      EN: `
        <h1 style="color: #dc2626;">❌ Payment Failed</h1>
        <p>Hi {{userName}},</p>
        <p>We were unable to process your payment of <strong>{{amount}} {{currency}}</strong>.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Reason:</h3>
          <p style="margin: 0;">{{failureReason}}</p>
        </div>
        <p><strong>What to do next:</strong></p>
        <ul>
            <li>Check that your payment method has sufficient funds</li>
            <li>Verify your card details are correct</li>
            <li>Contact your bank if the issue persists</li>
            <li>Try a different payment method</li>
          </ul>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #dc2626;">Update Payment Method</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you need assistance, please contact our support team.
        </p>
      `,
      ES: `
        <h1 style="color: #dc2626;">❌ Pago fallido</h1>
        <p>Hola {{userName}},</p>
        <p>No pudimos procesar tu pago de <strong>{{amount}} {{currency}}</strong>.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Razón:</h3>
          <p style="margin: 0;">{{failureReason}}</p>
        </div>
        <p><strong>Qué hacer a continuación:</strong></p>
        <ul>
          <li>Verifica que tu método de pago tenga fondos suficientes</li>
          <li>Verifica que los detalles de tu tarjeta sean correctos</li>
          <li>Contacta a tu banco si el problema persiste</li>
          <li>Intenta con un método de pago diferente</li>
        </ul>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #dc2626;">Actualizar método de pago</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Si necesitas ayuda, por favor contacta a nuestro equipo de soporte.
        </p>
      `,
      PT: `
        <h1 style="color: #dc2626;">❌ Pagamento falhou</h1>
        <p>Olá {{userName}},</p>
        <p>Não conseguimos processar seu pagamento de <strong>{{amount}} {{currency}}</strong>.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Motivo:</h3>
          <p style="margin: 0;">{{failureReason}}</p>
        </div>
        <p><strong>O que fazer a seguir:</strong></p>
        <ul>
          <li>Verifique se seu método de pagamento tem fundos suficientes</li>
          <li>Verifique se os detalhes do seu cartão estão corretos</li>
          <li>Entre em contato com seu banco se o problema persistir</li>
          <li>Tente um método de pagamento diferente</li>
        </ul>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #dc2626;">Atualizar método de pagamento</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Se você precisar de ajuda, entre em contato com nossa equipe de suporte.
        </p>
      `,
    },

    AUTHOR_CREDITS_EXPIRING_SOON: {
      EN: `
        <h1 style="color: #f59e0b;">⚠️ Your Credits Are Expiring Soon</h1>
        <p>Hi {{userName}},</p>
        <p>This is a reminder that <strong>{{credits}} credits</strong> in your account will expire in <strong>{{daysUntilExpiration}} days</strong>.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Expiration Details:</h3>
          <p style="margin: 5px 0;"><strong>Credits Expiring:</strong> {{credits}}</p>
          <p style="margin: 5px 0;"><strong>Expiration Date:</strong> {{expirationDate}}</p>
        </div>
        <p><strong>Don't lose your credits!</strong> Start a campaign now to use them before they expire.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #f59e0b;">Start a Campaign</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Credits must be allocated to a campaign before the activation window ends. Once allocated, they don't expire.
        </p>
      `,
      ES: `
        <h1 style="color: #f59e0b;">⚠️ Tus créditos están por expirar</h1>
        <p>Hola {{userName}},</p>
        <p>Este es un recordatorio de que <strong>{{credits}} créditos</strong> en tu cuenta expirarán en <strong>{{daysUntilExpiration}} días</strong>.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Detalles de expiración:</h3>
          <p style="margin: 5px 0;"><strong>Créditos por expirar:</strong> {{credits}}</p>
          <p style="margin: 5px 0;"><strong>Fecha de expiración:</strong> {{expirationDate}}</p>
        </div>
        <p><strong>¡No pierdas tus créditos!</strong> Inicia una campaña ahora para usarlos antes de que expiren.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #f59e0b;">Iniciar una campaña</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Los créditos deben asignarse a una campaña antes de que termine la ventana de activación. Una vez asignados, no expiran.
        </p>
      `,
      PT: `
        <h1 style="color: #f59e0b;">⚠️ Seus créditos estão expirando em breve</h1>
        <p>Olá {{userName}},</p>
        <p>Este é um lembrete de que <strong>{{credits}} créditos</strong> em sua conta irão expirar em <strong>{{daysUntilExpiration}} dias</strong>.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Detalhes da expiração:</h3>
          <p style="margin: 5px 0;"><strong>Créditos expirando:</strong> {{credits}}</p>
          <p style="margin: 5px 0;"><strong>Data de expiração:</strong> {{expirationDate}}</p>
        </div>
        <p><strong>Não perca seus créditos!</strong> Inicie uma campanha agora para usá-los antes que expirem.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #f59e0b;">Iniciar uma campanha</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Os créditos devem ser alocados para uma campanha antes do término da janela de ativação. Uma vez alocados, eles não expiram.
        </p>
      `,
    },

    AUTHOR_CREDITS_EXPIRED: {
      EN: `
        <h1 style="color: #dc2626;">❌ Credits Have Expired</h1>
        <p>Hi {{userName}},</p>
        <p>We're sorry to inform you that <strong>{{expiredCredits}} credits</strong> in your account have expired because they were not allocated to a campaign within the activation window.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Expiration Details:</h3>
          <p style="margin: 5px 0;"><strong>Credits Expired:</strong> {{expiredCredits}}</p>
          <p style="margin: 5px 0;"><strong>Remaining Credits:</strong> {{remainingCredits}}</p>
          <p style="margin: 5px 0;"><strong>Original Purchase Date:</strong> {{purchaseDate}}</p>
          <p style="margin: 5px 0;"><strong>Expiration Date:</strong> {{expirationDate}}</p>
        </div>
        <p>To prevent this in the future, please start a campaign before your activation window ends. Credits are valid once allocated to a campaign.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">View Your Credits</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you have any questions about credit validity, please contact our support team.
        </p>
      `,
      ES: `
        <h1 style="color: #dc2626;">❌ Los créditos han expirado</h1>
        <p>Hola {{userName}},</p>
        <p>Lamentamos informarte que <strong>{{expiredCredits}} créditos</strong> en tu cuenta han expirado porque no fueron asignados a una campaña dentro de la ventana de activación.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Detalles de expiración:</h3>
          <p style="margin: 5px 0;"><strong>Créditos expirados:</strong> {{expiredCredits}}</p>
          <p style="margin: 5px 0;"><strong>Créditos restantes:</strong> {{remainingCredits}}</p>
          <p style="margin: 5px 0;"><strong>Fecha de compra original:</strong> {{purchaseDate}}</p>
          <p style="margin: 5px 0;"><strong>Fecha de expiración:</strong> {{expirationDate}}</p>
        </div>
        <p>Para evitar esto en el futuro, por favor inicia una campaña antes de que termine tu ventana de activación. Los créditos son válidos una vez asignados a una campaña.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Ver tus créditos</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Si tienes alguna pregunta sobre la validez de los créditos, por favor contacta a nuestro equipo de soporte.
        </p>
      `,
      PT: `
        <h1 style="color: #dc2626;">❌ Créditos expiraram</h1>
        <p>Olá {{userName}},</p>
        <p>Lamentamos informar que <strong>{{expiredCredits}} créditos</strong> em sua conta expiraram porque não foram alocados para uma campanha dentro da janela de ativação.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Detalhes da expiração:</h3>
          <p style="margin: 5px 0;"><strong>Créditos expirados:</strong> {{expiredCredits}}</p>
          <p style="margin: 5px 0;"><strong>Créditos restantes:</strong> {{remainingCredits}}</p>
          <p style="margin: 5px 0;"><strong>Data de compra original:</strong> {{purchaseDate}}</p>
          <p style="margin: 5px 0;"><strong>Data de expiração:</strong> {{expirationDate}}</p>
        </div>
        <p>Para evitar isso no futuro, inicie uma campanha antes que sua janela de ativação termine. Os créditos são válidos uma vez alocados para uma campanha.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Ver seus créditos</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Se você tiver alguma dúvida sobre a validade dos créditos, entre em contato com nossa equipe de suporte.
        </p>
      `,
    },

    // Admin notifications
    ADMIN_NEW_ISSUE: {
      EN: `
        <h1 style="color: #f59e0b;">⚠️ New Issue Reported</h1>
        <p>A new issue has been reported and requires attention.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Issue Details:</h3>
          <p style="margin: 5px 0;"><strong>Type:</strong> {{issueType}}</p>
          <p style="margin: 5px 0;"><strong>Reported by:</strong> {{userName}}</p>
          <p style="margin: 5px 0;"><strong>Description:</strong></p>
          <p style="margin: 0;">{{issueDescription}}</p>
        </div>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button" style="background-color: #f59e0b;">View Issue</a>
        </div>
      `,
      ES: `
        <h1 style="color: #f59e0b;">⚠️ Nuevo problema reportado</h1>
        <p>Se ha reportado un nuevo problema y requiere atención.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Detalles del problema:</h3>
          <p style="margin: 5px 0;"><strong>Tipo:</strong> {{issueType}}</p>
          <p style="margin: 5px 0;"><strong>Reportado por:</strong> {{userName}}</p>
          <p style="margin: 5px 0;"><strong>Descripción:</strong></p>
          <p style="margin: 0;">{{issueDescription}}</p>
        </div>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button" style="background-color: #f59e0b;">Ver problema</a>
        </div>
      `,
      PT: `
        <h1 style="color: #f59e0b;">⚠️ Novo problema relatado</h1>
        <p>Um novo problema foi relatado e requer atenção.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Detalhes do problema:</h3>
          <p style="margin: 5px 0;"><strong>Tipo:</strong> {{issueType}}</p>
          <p style="margin: 5px 0;"><strong>Relatado por:</strong> {{userName}}</p>
          <p style="margin: 5px 0;"><strong>Descrição:</strong></p>
          <p style="margin: 0;">{{issueDescription}}</p>
        </div>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button" style="background-color: #f59e0b;">Ver problema</a>
        </div>
      `,
    },

    ADMIN_URGENT_ISSUE: {
      EN: `
        <h1 style="color: #dc2626;">🚨 URGENT: Critical Issue</h1>
        <p><strong>An urgent issue requires immediate attention!</strong></p>
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">Issue Details:</h3>
          <p style="margin: 5px 0;"><strong>Type:</strong> {{issueType}}</p>
          <p style="margin: 5px 0;"><strong>Reported by:</strong> {{userName}}</p>
          <p style="margin: 5px 0;"><strong>Severity:</strong> CRITICAL</p>
          <p style="margin: 5px 0;"><strong>Description:</strong></p>
          <p style="margin: 0;">{{issueDescription}}</p>
        </div>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button" style="background-color: #dc2626;">Handle Issue Immediately</a>
        </div>
      `,
      ES: `
        <h1 style="color: #dc2626;">🚨 URGENTE: Problema crítico</h1>
        <p><strong>¡Un problema urgente requiere atención inmediata!</strong></p>
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">Detalles del problema:</h3>
          <p style="margin: 5px 0;"><strong>Tipo:</strong> {{issueType}}</p>
          <p style="margin: 5px 0;"><strong>Reportado por:</strong> {{userName}}</p>
          <p style="margin: 5px 0;"><strong>Severidad:</strong> CRÍTICO</p>
          <p style="margin: 5px 0;"><strong>Descripción:</strong></p>
          <p style="margin: 0;">{{issueDescription}}</p>
        </div>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button" style="background-color: #dc2626;">Manejar problema inmediatamente</a>
        </div>
      `,
      PT: `
        <h1 style="color: #dc2626;">🚨 URGENTE: Problema crítico</h1>
        <p><strong>Um problema urgente requer atenção imediata!</strong></p>
        <div style="background-color: #fee2e2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">Detalhes do problema:</h3>
          <p style="margin: 5px 0;"><strong>Tipo:</strong> {{issueType}}</p>
          <p style="margin: 5px 0;"><strong>Relatado por:</strong> {{userName}}</p>
          <p style="margin: 5px 0;"><strong>Severidade:</strong> CRÍTICO</p>
          <p style="margin: 5px 0;"><strong>Descrição:</strong></p>
          <p style="margin: 0;">{{issueDescription}}</p>
        </div>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button" style="background-color: #dc2626;">Lidar com problema imediatamente</a>
        </div>
      `,
    },

    ADMIN_PAYOUT_REQUESTED: {
      EN: `
        <h1 style="color: #2563eb;">💵 New Payout Request</h1>
        <p>A reader has requested a payout that requires approval.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Payout Details:</h3>
          <p style="margin: 5px 0;"><strong>Reader:</strong> {{userName}}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> {{payoutAmount}}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>Current Balance:</strong> {{walletBalance}}</p>
        </div>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button" style="background-color: #2563eb;">Review Payout Request</a>
        </div>
      `,
      ES: `
        <h1 style="color: #2563eb;">💵 Nueva solicitud de pago</h1>
        <p>Un lector ha solicitado un pago que requiere aprobación.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles del pago:</h3>
          <p style="margin: 5px 0;"><strong>Lector:</strong> {{userName}}</p>
          <p style="margin: 5px 0;"><strong>Monto:</strong> {{payoutAmount}}</p>
          <p style="margin: 5px 0;"><strong>Método de pago:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>Saldo actual:</strong> {{walletBalance}}</p>
        </div>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button" style="background-color: #2563eb;">Revisar solicitud de pago</a>
        </div>
      `,
      PT: `
        <h1 style="color: #2563eb;">💵 Nova solicitação de pagamento</h1>
        <p>Um leitor solicitou um pagamento que requer aprovação.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes do pagamento:</h3>
          <p style="margin: 5px 0;"><strong>Leitor:</strong> {{userName}}</p>
          <p style="margin: 5px 0;"><strong>Valor:</strong> {{payoutAmount}}</p>
          <p style="margin: 5px 0;"><strong>Método de pagamento:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>Saldo atual:</strong> {{walletBalance}}</p>
        </div>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button" style="background-color: #2563eb;">Revisar solicitação de pagamento</a>
        </div>
      `,
    },

    // Payment emails
    PAYMENT_RECEIVED: {
      EN: `
        <h1 style="color: #10b981;">✅ Payment Receipt</h1>
        <p>Hi {{userName}},</p>
        <p>Thank you for your payment! This email confirms that we have successfully received your payment.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Payment Details:</h3>
          <p style="margin: 5px 0;"><strong>Amount:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
        </div>
        <p>Your payment has been processed successfully. You can view your invoice and transaction history in your dashboard.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">View Dashboard</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you have any questions about this payment, please contact our support team.
        </p>
      `,
      ES: `
        <h1 style="color: #10b981;">✅ Recibo de pago</h1>
        <p>Hola {{userName}},</p>
        <p>¡Gracias por tu pago! Este correo confirma que hemos recibido exitosamente tu pago.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles del pago:</h3>
          <p style="margin: 5px 0;"><strong>Monto:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>ID de transacción:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Método de pago:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>Número de factura:</strong> {{invoiceNumber}}</p>
        </div>
        <p>Tu pago ha sido procesado exitosamente. Puedes ver tu factura y el historial de transacciones en tu panel.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver panel</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Si tienes alguna pregunta sobre este pago, por favor contacta a nuestro equipo de soporte.
        </p>
      `,
      PT: `
        <h1 style="color: #10b981;">✅ Recibo de pagamento</h1>
        <p>Olá {{userName}},</p>
        <p>Obrigado pelo seu pagamento! Este e-mail confirma que recebemos seu pagamento com sucesso.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes do pagamento:</h3>
          <p style="margin: 5px 0;"><strong>Valor:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>ID da transação:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Data:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Método de pagamento:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>Número da fatura:</strong> {{invoiceNumber}}</p>
        </div>
        <p>Seu pagamento foi processado com sucesso. Você pode ver sua fatura e histórico de transações no seu painel.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver painel</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Se você tiver alguma dúvida sobre este pagamento, entre em contato com nossa equipe de suporte.
        </p>
      `,
    },

    PAYMENT_FAILED: {
      EN: `
        <h1 style="color: #dc2626;">❌ Payment Failed</h1>
        <p>Hi {{userName}},</p>
        <p>We were unable to process your payment. Please review the details below and update your payment method.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Payment Details:</h3>
          <p style="margin: 5px 0;"><strong>Amount:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>Reason:</strong> {{failureReason}}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> {{currentDate}}</p>
        </div>
        <p><strong>Common reasons for payment failure:</strong></p>
        <ul>
          <li>Insufficient funds in your account</li>
          <li>Incorrect card details</li>
          <li>Card expired or inactive</li>
          <li>Bank declined the transaction</li>
          <li>Payment limit exceeded</li>
        </ul>
        <p>Please update your payment information and try again.</p>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button" style="background-color: #dc2626;">Update Payment Method</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you continue to experience issues, please contact your bank or our support team.
        </p>
      `,
      ES: `
        <h1 style="color: #dc2626;">❌ Pago fallido</h1>
        <p>Hola {{userName}},</p>
        <p>No pudimos procesar tu pago. Por favor revisa los detalles a continuación y actualiza tu método de pago.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Detalles del pago:</h3>
          <p style="margin: 5px 0;"><strong>Monto:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>Razón:</strong> {{failureReason}}</p>
          <p style="margin: 5px 0;"><strong>Fecha:</strong> {{currentDate}}</p>
        </div>
        <p><strong>Razones comunes para el fallo del pago:</strong></p>
        <ul>
          <li>Fondos insuficientes en tu cuenta</li>
          <li>Detalles de tarjeta incorrectos</li>
          <li>Tarjeta vencida o inactiva</li>
          <li>El banco rechazó la transacción</li>
          <li>Límite de pago excedido</li>
        </ul>
        <p>Por favor actualiza tu información de pago e intenta de nuevo.</p>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button" style="background-color: #dc2626;">Actualizar método de pago</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Si continúas experimentando problemas, por favor contacta a tu banco o a nuestro equipo de soporte.
        </p>
      `,
      PT: `
        <h1 style="color: #dc2626;">❌ Pagamento falhou</h1>
        <p>Olá {{userName}},</p>
        <p>Não conseguimos processar seu pagamento. Por favor, revise os detalhes abaixo e atualize seu método de pagamento.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Detalhes do pagamento:</h3>
          <p style="margin: 5px 0;"><strong>Valor:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>Motivo:</strong> {{failureReason}}</p>
          <p style="margin: 5px 0;"><strong>Data:</strong> {{currentDate}}</p>
        </div>
        <p><strong>Motivos comuns para falha no pagamento:</strong></p>
        <ul>
          <li>Fundos insuficientes na sua conta</li>
          <li>Detalhes do cartão incorretos</li>
          <li>Cartão vencido ou inativo</li>
          <li>Banco recusou a transação</li>
          <li>Limite de pagamento excedido</li>
        </ul>
        <p>Por favor, atualize suas informações de pagamento e tente novamente.</p>
        <div style="text-align: center;">
          <a href="{{actionUrl}}" class="button" style="background-color: #dc2626;">Atualizar método de pagamento</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Se você continuar tendo problemas, entre em contato com seu banco ou nossa equipe de suporte.
        </p>
      `,
    },

    REFUND_PROCESSED: {
      EN: `
        <h1 style="color: #2563eb;">💰 Refund Processed</h1>
        <p>Hi {{userName}},</p>
        <p>Your refund has been processed and will be credited to your original payment method.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Refund Details:</h3>
          <p style="margin: 5px 0;"><strong>Refund Amount:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Original Payment:</strong> {{invoiceNumber}}</p>
          <p style="margin: 5px 0;"><strong>Processed Date:</strong> {{currentDate}}</p>
        </div>
        <p><strong>When will I receive the refund?</strong></p>
        <p>The refund will appear in your account within 5-10 business days, depending on your bank or card issuer.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #2563eb;">View Transaction History</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you don't see the refund after 10 business days, please contact your bank or our support team.
        </p>
      `,
      ES: `
        <h1 style="color: #2563eb;">💰 Reembolso procesado</h1>
        <p>Hola {{userName}},</p>
        <p>Tu reembolso ha sido procesado y será acreditado a tu método de pago original.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles del reembolso:</h3>
          <p style="margin: 5px 0;"><strong>Monto del reembolso:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>ID de transacción:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Pago original:</strong> {{invoiceNumber}}</p>
          <p style="margin: 5px 0;"><strong>Fecha de procesamiento:</strong> {{currentDate}}</p>
        </div>
        <p><strong>¿Cuándo recibiré el reembolso?</strong></p>
        <p>El reembolso aparecerá en tu cuenta dentro de 5-10 días hábiles, dependiendo de tu banco o emisor de tarjeta.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #2563eb;">Ver historial de transacciones</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Si no ves el reembolso después de 10 días hábiles, por favor contacta a tu banco o a nuestro equipo de soporte.
        </p>
      `,
      PT: `
        <h1 style="color: #2563eb;">💰 Reembolso processado</h1>
        <p>Olá {{userName}},</p>
        <p>Seu reembolso foi processado e será creditado ao seu método de pagamento original.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes do reembolso:</h3>
          <p style="margin: 5px 0;"><strong>Valor do reembolso:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>ID da transação:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Pagamento original:</strong> {{invoiceNumber}}</p>
          <p style="margin: 5px 0;"><strong>Data de processamento:</strong> {{currentDate}}</p>
        </div>
        <p><strong>Quando receberei o reembolso?</strong></p>
        <p>O reembolso aparecerá em sua conta dentro de 5-10 dias úteis, dependendo do seu banco ou emissor do cartão.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #2563eb;">Ver histórico de transações</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Se você não ver o reembolso após 10 dias úteis, entre em contato com seu banco ou nossa equipe de suporte.
        </p>
      `,
    },

    SUBSCRIPTION_RENEWED: {
      EN: `
        <h1 style="color: #10b981;">🔄 Subscription Renewed</h1>
        <p>Hi {{userName}},</p>
        <p>Your BookProof subscription has been renewed successfully.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Renewal Details:</h3>
          <p style="margin: 5px 0;"><strong>Plan:</strong> {{packageName}}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>Renewal Date:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Next Billing Date:</strong> {{nextBillingDate}}</p>
          <p style="margin: 5px 0;"><strong>Credits Added:</strong> {{creditsAdded}}</p>
        </div>
        <p>Your credits have been added to your account and are ready to use.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">View Dashboard</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          To manage your subscription or update payment details, visit your account settings.
        </p>
      `,
      ES: `
        <h1 style="color: #10b981;">🔄 Suscripción renovada</h1>
        <p>Hola {{userName}},</p>
        <p>Tu suscripción a BookProof ha sido renovada exitosamente.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles de la renovación:</h3>
          <p style="margin: 5px 0;"><strong>Plan:</strong> {{packageName}}</p>
          <p style="margin: 5px 0;"><strong>Monto:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>Fecha de renovación:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Próxima fecha de facturación:</strong> {{nextBillingDate}}</p>
          <p style="margin: 5px 0;"><strong>Créditos agregados:</strong> {{creditsAdded}}</p>
        </div>
        <p>Tus créditos han sido agregados a tu cuenta y están listos para usar.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver panel</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Para gestionar tu suscripción o actualizar los detalles de pago, visita la configuración de tu cuenta.
        </p>
      `,
      PT: `
        <h1 style="color: #10b981;">🔄 Assinatura renovada</h1>
        <p>Olá {{userName}},</p>
        <p>Sua assinatura do BookProof foi renovada com sucesso.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes da renovação:</h3>
          <p style="margin: 5px 0;"><strong>Plano:</strong> {{packageName}}</p>
          <p style="margin: 5px 0;"><strong>Valor:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>Data de renovação:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Próxima data de cobrança:</strong> {{nextBillingDate}}</p>
          <p style="margin: 5px 0;"><strong>Créditos adicionados:</strong> {{creditsAdded}}</p>
        </div>
        <p>Seus créditos foram adicionados à sua conta e estão prontos para usar.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver painel</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Para gerenciar sua assinatura ou atualizar detalhes de pagamento, visite as configurações da sua conta.
        </p>
      `,
    },

    SUBSCRIPTION_CANCELLED: {
      EN: `
        <h1 style="color: #f59e0b;">Subscription Cancelled</h1>
        <p>Hi {{userName}},</p>
        <p>Your BookProof subscription has been cancelled as requested.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Cancellation Details:</h3>
          <p style="margin: 5px 0;"><strong>Plan:</strong> {{packageName}}</p>
          <p style="margin: 5px 0;"><strong>Cancelled Date:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Access Until:</strong> {{accessUntil}}</p>
          <p style="margin: 5px 0;"><strong>Remaining Credits:</strong> {{remainingCredits}}</p>
        </div>
        <p><strong>What happens next?</strong></p>
        <ul>
          <li>You can use your remaining credits until {{accessUntil}}</li>
          <li>No further charges will be made</li>
          <li>Your account data will be preserved</li>
          <li>You can reactivate anytime</li>
        </ul>
        <div class="warning-box">
          <p style="margin: 0;"><strong>We're sorry to see you go!</strong> If you cancelled due to an issue, please let us know how we can improve.</p>
        </div>
        <div style="text-align: center;">
          <a href="{{supportUrl}}" class="button" style="background-color: #f59e0b;">Provide Feedback</a>
        </div>
        <p style="margin-top: 20px; text-align: center;">
          <a href="{{dashboardUrl}}" style="color: #2563eb;">Reactivate Subscription</a>
        </p>
      `,
      ES: `
        <h1 style="color: #f59e0b;">Suscripción cancelada</h1>
        <p>Hola {{userName}},</p>
        <p>Tu suscripción a BookProof ha sido cancelada como solicitaste.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles de la cancelación:</h3>
          <p style="margin: 5px 0;"><strong>Plan:</strong> {{packageName}}</p>
          <p style="margin: 5px 0;"><strong>Fecha de cancelación:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Acceso hasta:</strong> {{accessUntil}}</p>
          <p style="margin: 5px 0;"><strong>Créditos restantes:</strong> {{remainingCredits}}</p>
        </div>
        <p><strong>¿Qué sucede a continuación?</strong></p>
        <ul>
          <li>Puedes usar tus créditos restantes hasta {{accessUntil}}</li>
          <li>No se realizarán más cargos</li>
          <li>Los datos de tu cuenta se conservarán</li>
          <li>Puedes reactivar en cualquier momento</li>
        </ul>
        <div class="warning-box">
          <p style="margin: 0;"><strong>¡Lamentamos verte partir!</strong> Si cancelaste debido a un problema, por favor háznoslo saber para que podamos mejorar.</p>
        </div>
        <div style="text-align: center;">
          <a href="{{supportUrl}}" class="button" style="background-color: #f59e0b;">Proporcionar comentarios</a>
        </div>
        <p style="margin-top: 20px; text-align: center;">
          <a href="{{dashboardUrl}}" style="color: #2563eb;">Reactivar suscripción</a>
        </p>
      `,
      PT: `
        <h1 style="color: #f59e0b;">Assinatura cancelada</h1>
        <p>Olá {{userName}},</p>
        <p>Sua assinatura do BookProof foi cancelada conforme solicitado.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes do cancelamento:</h3>
          <p style="margin: 5px 0;"><strong>Plano:</strong> {{packageName}}</p>
          <p style="margin: 5px 0;"><strong>Data de cancelamento:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Acesso até:</strong> {{accessUntil}}</p>
          <p style="margin: 5px 0;"><strong>Créditos restantes:</strong> {{remainingCredits}}</p>
        </div>
        <p><strong>O que acontece a seguir?</strong></p>
        <ul>
          <li>Você pode usar seus créditos restantes até {{accessUntil}}</li>
          <li>Não serão feitas mais cobranças</li>
          <li>Os dados da sua conta serão preservados</li>
          <li>Você pode reativar a qualquer momento</li>
        </ul>
        <div class="warning-box">
          <p style="margin: 0;"><strong>Sentimos muito por você sair!</strong> Se você cancelou devido a um problema, por favor nos informe para que possamos melhorar.</p>
        </div>
        <div style="text-align: center;">
          <a href="{{supportUrl}}" class="button" style="background-color: #f59e0b;">Fornecer feedback</a>
        </div>
        <p style="margin-top: 20px; text-align: center;">
          <a href="{{dashboardUrl}}" style="color: #2563eb;">Reativar assinatura</a>
        </p>
      `,
    },

    // Keyword Research
    KEYWORD_RESEARCH_READY: {
      EN: `
        <h1 style="color: #2563eb;">📊 Keyword Research Report Ready</h1>
        <p>Hi {{userName}},</p>
        <p>Great news! Your keyword research report for <strong>"{{bookTitle}}"</strong> is ready for download.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Report Includes:</h3>
          <ul style="margin: 10px 0;">
            <li>Top keyword recommendations</li>
            <li>Search volume analysis</li>
            <li>Competition metrics</li>
            <li>Category insights</li>
            <li>Optimization suggestions</li>
          </ul>
        </div>
        <p>This comprehensive report will help you optimize your book's discoverability on Amazon.</p>
        <div style="text-align: center;">
          <a href="{{keywordPdfUrl}}" class="button" style="background-color: #2563eb;">Download Report PDF</a>
        </div>
        <p style="margin-top: 20px; text-align: center;">
          <a href="{{dashboardUrl}}" style="color: #2563eb;">View in Dashboard</a>
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Questions about your report? Contact our support team for guidance.
        </p>
      `,
      ES: `
        <h1 style="color: #2563eb;">📊 Informe de investigación de palabras clave listo</h1>
        <p>Hola {{userName}},</p>
        <p>¡Buenas noticias! Tu informe de investigación de palabras clave para <strong>"{{bookTitle}}"</strong> está listo para descargar.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">El informe incluye:</h3>
          <ul style="margin: 10px 0;">
            <li>Principales recomendaciones de palabras clave</li>
            <li>Análisis de volumen de búsqueda</li>
            <li>Métricas de competencia</li>
            <li>Información de categoría</li>
            <li>Sugerencias de optimización</li>
          </ul>
        </div>
        <p>Este informe completo te ayudará a optimizar la capacidad de descubrimiento de tu libro en Amazon.</p>
        <div style="text-align: center;">
          <a href="{{keywordPdfUrl}}" class="button" style="background-color: #2563eb;">Descargar informe PDF</a>
        </div>
        <p style="margin-top: 20px; text-align: center;">
          <a href="{{dashboardUrl}}" style="color: #2563eb;">Ver en el panel</a>
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          ¿Preguntas sobre tu informe? Contacta a nuestro equipo de soporte para orientación.
        </p>
      `,
      PT: `
        <h1 style="color: #2563eb;">📊 Relatório de pesquisa de palavras-chave pronto</h1>
        <p>Olá {{userName}},</p>
        <p>Ótimas notícias! Seu relatório de pesquisa de palavras-chave para <strong>"{{bookTitle}}"</strong> está pronto para download.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">O relatório inclui:</h3>
          <ul style="margin: 10px 0;">
            <li>Principais recomendações de palavras-chave</li>
            <li>Análise de volume de pesquisa</li>
            <li>Métricas de competição</li>
            <li>Insights de categoria</li>
            <li>Sugestões de otimização</li>
          </ul>
        </div>
        <p>Este relatório abrangente ajudará você a otimizar a descoberta do seu livro na Amazon.</p>
        <div style="text-align: center;">
          <a href="{{keywordPdfUrl}}" class="button" style="background-color: #2563eb;">Baixar relatório PDF</a>
        </div>
        <p style="margin-top: 20px; text-align: center;">
          <a href="{{dashboardUrl}}" style="color: #2563eb;">Ver no painel</a>
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Perguntas sobre seu relatório? Entre em contato com nossa equipe de suporte para orientação.
        </p>
      `,
    },

    // Affiliate emails
    AFFILIATE_APPLICATION_APPROVED: {
      EN: `
        <h1 style="color: #10b981;">🎉 Affiliate Application Approved!</h1>
        <p>Hi {{userName}},</p>
        <p>Congratulations! Your application to join the BookProof Affiliate Program has been approved.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Your Affiliate Details:</h3>
          <p style="margin: 5px 0;"><strong>Referral Code:</strong> <code style="background-color: #f3f4f6; padding: 2px 8px; border-radius: 4px;">{{referralCode}}</code></p>
          <p style="margin: 5px 0;"><strong>Commission Rate:</strong> {{commissionRate}}% per sale</p>
          <p style="margin: 5px 0;"><strong>Payout Minimum:</strong> $50</p>
        </div>
        <p><strong>How it works:</strong></p>
        <ol>
          <li>Share your unique referral link</li>
          <li>Earn {{commissionRate}}% commission on every sale</li>
          <li>Track your earnings in real-time</li>
          <li>Request payout when you reach $50</li>
        </ol>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Access Affiliate Dashboard</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Ready to start earning? Check out our affiliate resources and marketing materials!
        </p>
      `,
      ES: `
        <h1 style="color: #10b981;">🎉 ¡Solicitud de afiliado aprobada!</h1>
        <p>Hola {{userName}},</p>
        <p>¡Felicidades! Tu solicitud para unirte al Programa de Afiliados de BookProof ha sido aprobada.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles de tu afiliación:</h3>
          <p style="margin: 5px 0;"><strong>Código de referido:</strong> <code style="background-color: #f3f4f6; padding: 2px 8px; border-radius: 4px;">{{referralCode}}</code></p>
          <p style="margin: 5px 0;"><strong>Tasa de comisión:</strong> {{commissionRate}}% por venta</p>
          <p style="margin: 5px 0;"><strong>Mínimo de pago:</strong> $50</p>
        </div>
        <p><strong>Cómo funciona:</strong></p>
        <ol>
          <li>Comparte tu enlace de referido único</li>
          <li>Gana {{commissionRate}}% de comisión en cada venta</li>
          <li>Rastrea tus ganancias en tiempo real</li>
          <li>Solicita pago cuando alcances $50</li>
        </ol>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Acceder al panel de afiliado</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          ¿Listo para empezar a ganar? ¡Consulta nuestros recursos de afiliados y materiales de marketing!
        </p>
      `,
      PT: `
        <h1 style="color: #10b981;">🎉 Solicitação de afiliado aprovada!</h1>
        <p>Olá {{userName}},</p>
        <p>Parabéns! Sua solicitação para participar do Programa de Afiliados do BookProof foi aprovada.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes do seu afiliado:</h3>
          <p style="margin: 5px 0;"><strong>Código de indicação:</strong> <code style="background-color: #f3f4f6; padding: 2px 8px; border-radius: 4px;">{{referralCode}}</code></p>
          <p style="margin: 5px 0;"><strong>Taxa de comissão:</strong> {{commissionRate}}% por venda</p>
          <p style="margin: 5px 0;"><strong>Mínimo de pagamento:</strong> $50</p>
        </div>
        <p><strong>Como funciona:</strong></p>
        <ol>
          <li>Compartilhe seu link de indicação único</li>
          <li>Ganhe {{commissionRate}}% de comissão em cada venda</li>
          <li>Acompanhe seus ganhos em tempo real</li>
          <li>Solicite pagamento quando atingir $50</li>
        </ol>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Acessar painel de afiliado</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Pronto para começar a ganhar? Confira nossos recursos de afiliados e materiais de marketing!
        </p>
      `,
    },

    AFFILIATE_APPLICATION_REJECTED: {
      EN: `
        <h1 style="color: #f59e0b;">Affiliate Application Update</h1>
        <p>Hi {{userName}},</p>
        <p>Thank you for your interest in the BookProof Affiliate Program.</p>
        <p>After reviewing your application, we're unable to approve it at this time.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Reason:</h3>
          <p style="margin: 0;">{{rejectionReason}}</p>
        </div>
        <p><strong>You can reapply after:</strong></p>
        <ul>
          <li>Building a more established online presence</li>
          <li>Growing your audience in relevant niches</li>
          <li>Creating quality content related to books/publishing</li>
        </ul>
        <p>We encourage you to reapply in the future once you've met these criteria.</p>
        <div style="text-align: center;">
          <a href="{{supportUrl}}" class="button" style="background-color: #f59e0b;">Contact Support</a>
        </div>
      `,
      ES: `
        <h1 style="color: #f59e0b;">Actualización de solicitud de afiliado</h1>
        <p>Hola {{userName}},</p>
        <p>Gracias por tu interés en el Programa de Afiliados de BookProof.</p>
        <p>Después de revisar tu solicitud, no podemos aprobarla en este momento.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Razón:</h3>
          <p style="margin: 0;">{{rejectionReason}}</p>
        </div>
        <p><strong>Puedes volver a aplicar después de:</strong></p>
        <ul>
          <li>Construir una presencia en línea más establecida</li>
          <li>Hacer crecer tu audiencia en nichos relevantes</li>
          <li>Crear contenido de calidad relacionado con libros/publicación</li>
        </ul>
        <p>Te animamos a que vuelvas a aplicar en el futuro una vez que hayas cumplido estos criterios.</p>
        <div style="text-align: center;">
          <a href="{{supportUrl}}" class="button" style="background-color: #f59e0b;">Contactar soporte</a>
        </div>
      `,
      PT: `
        <h1 style="color: #f59e0b;">Atualização da solicitação de afiliado</h1>
        <p>Olá {{userName}},</p>
        <p>Obrigado pelo seu interesse no Programa de Afiliados do BookProof.</p>
        <p>Após revisar sua solicitação, não podemos aprová-la neste momento.</p>
        <div class="warning-box">
          <h3 style="margin-top: 0;">Motivo:</h3>
          <p style="margin: 0;">{{rejectionReason}}</p>
        </div>
        <p><strong>Você pode se inscrever novamente após:</strong></p>
        <ul>
          <li>Construir uma presença online mais estabelecida</li>
          <li>Aumentar sua audiência em nichos relevantes</li>
          <li>Criar conteúdo de qualidade relacionado a livros/publicação</li>
        </ul>
        <p>Encorajamos você a se inscrever novamente no futuro quando tiver atendido a esses critérios.</p>
        <div style="text-align: center;">
          <a href="{{supportUrl}}" class="button" style="background-color: #f59e0b;">Contatar suporte</a>
        </div>
      `,
    },

    AFFILIATE_PAYOUT_PROCESSED: {
      EN: `
        <h1 style="color: #10b981;">💸 Affiliate Commission Paid</h1>
        <p>Hi {{userName}},</p>
        <p>Great news! Your affiliate commission has been processed and paid.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Payout Details:</h3>
          <p style="margin: 5px 0;"><strong>Commission Amount:</strong> {{commissionAmount}}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Processed Date:</strong> {{processedDate}}</p>
          <p style="margin: 5px 0;"><strong>Referrals This Month:</strong> {{referralCount}}</p>
        </div>
        <p>The payment should arrive in your account within 3-5 business days.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">View Affiliate Dashboard</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Keep up the great work! Your promotional efforts are making a real impact.
        </p>
      `,
      ES: `
        <h1 style="color: #10b981;">💸 Comisión de afiliado pagada</h1>
        <p>Hola {{userName}},</p>
        <p>¡Buenas noticias! Tu comisión de afiliado ha sido procesada y pagada.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles del pago:</h3>
          <p style="margin: 5px 0;"><strong>Monto de comisión:</strong> {{commissionAmount}}</p>
          <p style="margin: 5px 0;"><strong>Método de pago:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>ID de transacción:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Fecha de procesamiento:</strong> {{processedDate}}</p>
          <p style="margin: 5px 0;"><strong>Referencias este mes:</strong> {{referralCount}}</p>
        </div>
        <p>El pago debe llegar a tu cuenta dentro de 3-5 días hábiles.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver panel de afiliado</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          ¡Sigue con el gran trabajo! Tus esfuerzos promocionales están teniendo un impacto real.
        </p>
      `,
      PT: `
        <h1 style="color: #10b981;">💸 Comissão de afiliado paga</h1>
        <p>Olá {{userName}},</p>
        <p>Ótimas notícias! Sua comissão de afiliado foi processada e paga.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes do pagamento:</h3>
          <p style="margin: 5px 0;"><strong>Valor da comissão:</strong> {{commissionAmount}}</p>
          <p style="margin: 5px 0;"><strong>Método de pagamento:</strong> {{paymentMethod}}</p>
          <p style="margin: 5px 0;"><strong>ID da transação:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Data de processamento:</strong> {{processedDate}}</p>
          <p style="margin: 5px 0;"><strong>Indicações este mês:</strong> {{referralCount}}</p>
        </div>
        <p>O pagamento deve chegar à sua conta dentro de 3-5 dias úteis.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver painel de afiliado</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Continue com o ótimo trabalho! Seus esforços promocionais estão fazendo um impacto real.
        </p>
      `,
    },

    AFFILIATE_NEW_REFERRAL: {
      EN: `
        <h1 style="color: #10b981;">🎉 New Referral!</h1>
        <p>Hi {{userName}},</p>
        <p>Congratulations! You've earned a new referral.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Referral Details:</h3>
          <p style="margin: 5px 0;"><strong>New User:</strong> {{referralName}}</p>
          <p style="margin: 5px 0;"><strong>Signup Date:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Registered</p>
          <p style="margin: 5px 0;"><strong>Potential Commission:</strong> {{commissionAmount}} (when they purchase)</p>
        </div>
        <p>You'll earn your commission once this user makes their first purchase.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">View Referrals</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Keep sharing your referral link to earn more commissions!
        </p>
      `,
      ES: `
        <h1 style="color: #10b981;">🎉 ¡Nuevo referido!</h1>
        <p>Hola {{userName}},</p>
        <p>¡Felicidades! Has ganado un nuevo referido.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles del referido:</h3>
          <p style="margin: 5px 0;"><strong>Nuevo usuario:</strong> {{referralName}}</p>
          <p style="margin: 5px 0;"><strong>Fecha de registro:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Estado:</strong> Registrado</p>
          <p style="margin: 5px 0;"><strong>Comisión potencial:</strong> {{commissionAmount}} (cuando compre)</p>
        </div>
        <p>Ganarás tu comisión una vez que este usuario haga su primera compra.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver referidos</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          ¡Sigue compartiendo tu enlace de referido para ganar más comisiones!
        </p>
      `,
      PT: `
        <h1 style="color: #10b981;">🎉 Nova indicação!</h1>
        <p>Olá {{userName}},</p>
        <p>Parabéns! Você ganhou uma nova indicação.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes da indicação:</h3>
          <p style="margin: 5px 0;"><strong>Novo usuário:</strong> {{referralName}}</p>
          <p style="margin: 5px 0;"><strong>Data de inscrição:</strong> {{currentDate}}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Registrado</p>
          <p style="margin: 5px 0;"><strong>Comissão potencial:</strong> {{commissionAmount}} (quando comprar)</p>
        </div>
        <p>Você ganhará sua comissão assim que este usuário fizer sua primeira compra.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver indicações</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Continue compartilhando seu link de indicação para ganhar mais comissões!
        </p>
      `,
    },

    // Closer emails
    CLOSER_PAYMENT_RECEIVED: {
      EN: `
        <h1 style="color: #10b981;">💰 Custom Package Payment Received</h1>
        <p>Hi {{userName}},</p>
        <p>Great news! Payment for your custom package has been received.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Payment Details:</h3>
          <p style="margin: 5px 0;"><strong>Client:</strong> {{clientName}}</p>
          <p style="margin: 5px 0;"><strong>Package:</strong> {{packageDetails}}</p>
          <p style="margin: 5px 0;"><strong>Amount:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>Transaction ID:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Your Commission:</strong> {{commissionAmount}}</p>
        </div>
        <p>The client's account is being set up and they'll receive their login credentials shortly.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">View Closer Dashboard</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Excellent work closing this deal! Keep up the great sales performance.
        </p>
      `,
      ES: `
        <h1 style="color: #10b981;">💰 Pago de paquete personalizado recibido</h1>
        <p>Hola {{userName}},</p>
        <p>¡Buenas noticias! Se ha recibido el pago de tu paquete personalizado.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles del pago:</h3>
          <p style="margin: 5px 0;"><strong>Cliente:</strong> {{clientName}}</p>
          <p style="margin: 5px 0;"><strong>Paquete:</strong> {{packageDetails}}</p>
          <p style="margin: 5px 0;"><strong>Monto:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>ID de transacción:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Tu comisión:</strong> {{commissionAmount}}</p>
        </div>
        <p>Se está configurando la cuenta del cliente y recibirán sus credenciales de inicio de sesión en breve.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver panel de closer</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          ¡Excelente trabajo cerrando este trato! Mantén el gran rendimiento de ventas.
        </p>
      `,
      PT: `
        <h1 style="color: #10b981;">💰 Pagamento de pacote personalizado recebido</h1>
        <p>Olá {{userName}},</p>
        <p>Ótimas notícias! O pagamento do seu pacote personalizado foi recebido.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes do pagamento:</h3>
          <p style="margin: 5px 0;"><strong>Cliente:</strong> {{clientName}}</p>
          <p style="margin: 5px 0;"><strong>Pacote:</strong> {{packageDetails}}</p>
          <p style="margin: 5px 0;"><strong>Valor:</strong> {{amount}} {{currency}}</p>
          <p style="margin: 5px 0;"><strong>ID da transação:</strong> {{transactionId}}</p>
          <p style="margin: 5px 0;"><strong>Sua comissão:</strong> {{commissionAmount}}</p>
        </div>
        <p>A conta do cliente está sendo configurada e eles receberão suas credenciais de login em breve.</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #10b981;">Ver painel de closer</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Excelente trabalho fechando este negócio! Continue com o ótimo desempenho de vendas.
        </p>
      `,
    },

    CLOSER_ACCOUNT_CREATED: {
      EN: `
        <h1 style="color: #2563eb;">✅ Client Account Created</h1>
        <p>Hi {{userName}},</p>
        <p>The account for your client <strong>{{clientName}}</strong> has been successfully created and is ready to use.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Account Details:</h3>
          <p style="margin: 5px 0;"><strong>Client Name:</strong> {{clientName}}</p>
          <p style="margin: 5px 0;"><strong>Package:</strong> {{packageDetails}}</p>
          <p style="margin: 5px 0;"><strong>Credits Added:</strong> {{creditsAdded}}</p>
          <p style="margin: 5px 0;"><strong>Account Status:</strong> Active</p>
        </div>
        <p>The client has received their welcome email with login instructions. They're all set to start their first campaign!</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #2563eb;">View Client Details</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Great job! Remember to follow up with your client to ensure they're getting started smoothly.
        </p>
      `,
      ES: `
        <h1 style="color: #2563eb;">✅ Cuenta de cliente creada</h1>
        <p>Hola {{userName}},</p>
        <p>La cuenta de tu cliente <strong>{{clientName}}</strong> ha sido creada exitosamente y está lista para usar.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles de la cuenta:</h3>
          <p style="margin: 5px 0;"><strong>Nombre del cliente:</strong> {{clientName}}</p>
          <p style="margin: 5px 0;"><strong>Paquete:</strong> {{packageDetails}}</p>
          <p style="margin: 5px 0;"><strong>Créditos agregados:</strong> {{creditsAdded}}</p>
          <p style="margin: 5px 0;"><strong>Estado de la cuenta:</strong> Activa</p>
        </div>
        <p>El cliente ha recibido su correo de bienvenida con instrucciones de inicio de sesión. ¡Está todo listo para comenzar su primera campaña!</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #2563eb;">Ver detalles del cliente</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          ¡Buen trabajo! Recuerda hacer seguimiento con tu cliente para asegurar que estén comenzando sin problemas.
        </p>
      `,
      PT: `
        <h1 style="color: #2563eb;">✅ Conta de cliente criada</h1>
        <p>Olá {{userName}},</p>
        <p>A conta do seu cliente <strong>{{clientName}}</strong> foi criada com sucesso e está pronta para usar.</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes da conta:</h3>
          <p style="margin: 5px 0;"><strong>Nome do cliente:</strong> {{clientName}}</p>
          <p style="margin: 5px 0;"><strong>Pacote:</strong> {{packageDetails}}</p>
          <p style="margin: 5px 0;"><strong>Créditos adicionados:</strong> {{creditsAdded}}</p>
          <p style="margin: 5px 0;"><strong>Status da conta:</strong> Ativa</p>
        </div>
        <p>O cliente recebeu seu e-mail de boas-vindas com instruções de login. Está tudo pronto para começar sua primeira campanha!</p>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #2563eb;">Ver detalhes do cliente</a>
        </div>
        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Ótimo trabalho! Lembre-se de acompanhar seu cliente para garantir que estejam começando sem problemas.
        </p>
      `,
    },

    // Email sent TO THE AUTHOR when their account is created by a Closer
    AUTHOR_ACCOUNT_CREATED_BY_CLOSER: {
      EN: `
        <h1 style="color: #2563eb;">🎉 Welcome to BookProof, {{userName}}!</h1>
        <p>Your account has been created and is ready to use. You can now start creating book campaigns and getting authentic reviews on Amazon.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Your Login Credentials:</h3>
          <p style="margin: 5px 0;"><strong>Email:</strong> {{userEmail}}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">{{temporaryPassword}}</code></p>
        </div>

        <div class="warning-box">
          <p style="margin: 0;"><strong>⚠️ Important:</strong> Please change your password after your first login for security reasons.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}" class="button" style="background-color: #2563eb;">Login to Your Account</a>
        </div>

        <p><strong>Before you start:</strong></p>
        <ol>
          <li>Verify your email by clicking the button below</li>
          <li>Change your temporary password</li>
          <li>Accept the terms of service on first login</li>
          <li>Create your first book campaign</li>
        </ol>

        <div style="text-align: center; margin: 20px 0;">
          <a href="{{actionUrl}}" class="button" style="background-color: #10b981;">Verify Email Address</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you have any questions, feel free to reach out to our support team. We're here to help you succeed!
        </p>
      `,
      ES: `
        <h1 style="color: #2563eb;">🎉 ¡Bienvenido a BookProof, {{userName}}!</h1>
        <p>Tu cuenta ha sido creada y está lista para usar. Ahora puedes comenzar a crear campañas de libros y obtener reseñas auténticas en Amazon.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Tus credenciales de acceso:</h3>
          <p style="margin: 5px 0;"><strong>Correo electrónico:</strong> {{userEmail}}</p>
          <p style="margin: 5px 0;"><strong>Contraseña temporal:</strong> <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">{{temporaryPassword}}</code></p>
        </div>

        <div class="warning-box">
          <p style="margin: 0;"><strong>⚠️ Importante:</strong> Por favor cambia tu contraseña después de tu primer inicio de sesión por razones de seguridad.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}" class="button" style="background-color: #2563eb;">Iniciar sesión en tu cuenta</a>
        </div>

        <p><strong>Antes de comenzar:</strong></p>
        <ol>
          <li>Verifica tu correo electrónico haciendo clic en el botón de abajo</li>
          <li>Cambia tu contraseña temporal</li>
          <li>Acepta los términos de servicio en tu primer inicio de sesión</li>
          <li>Crea tu primera campaña de libro</li>
        </ol>

        <div style="text-align: center; margin: 20px 0;">
          <a href="{{actionUrl}}" class="button" style="background-color: #10b981;">Verificar correo electrónico</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte. ¡Estamos aquí para ayudarte a tener éxito!
        </p>
      `,
      PT: `
        <h1 style="color: #2563eb;">🎉 Bem-vindo ao BookProof, {{userName}}!</h1>
        <p>Sua conta foi criada e está pronta para usar. Agora você pode começar a criar campanhas de livros e obter avaliações autênticas na Amazon.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Suas credenciais de acesso:</h3>
          <p style="margin: 5px 0;"><strong>E-mail:</strong> {{userEmail}}</p>
          <p style="margin: 5px 0;"><strong>Senha temporária:</strong> <code style="background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">{{temporaryPassword}}</code></p>
        </div>

        <div class="warning-box">
          <p style="margin: 0;"><strong>⚠️ Importante:</strong> Por favor, altere sua senha após o primeiro login por razões de segurança.</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}" class="button" style="background-color: #2563eb;">Entrar na sua conta</a>
        </div>

        <p><strong>Antes de começar:</strong></p>
        <ol>
          <li>Verifique seu e-mail clicando no botão abaixo</li>
          <li>Altere sua senha temporária</li>
          <li>Aceite os termos de serviço no primeiro login</li>
          <li>Crie sua primeira campanha de livro</li>
        </ol>

        <div style="text-align: center; margin: 20px 0;">
          <a href="{{actionUrl}}" class="button" style="background-color: #10b981;">Verificar endereço de e-mail</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Se você tiver alguma dúvida, não hesite em entrar em contato com nossa equipe de suporte. Estamos aqui para ajudá-lo a ter sucesso!
        </p>
      `,
    },

    // Reader assignment reassigned
    READER_ASSIGNMENT_REASSIGNED: {
      EN: `
        <h1 style="color: #2563eb;">Your Assignment Has Been Reassigned</h1>
        <p>Hi {{userName}},</p>
        <p>Your reading assignment has been updated. You've been reassigned to a new book.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Previous Assignment</h3>
          <p><strong>Book:</strong> {{oldBookTitle}}</p>
        </div>

        <div class="success-box" style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">New Assignment</h3>
          <p><strong>Book:</strong> {{newBookTitle}}</p>
        </div>

        <p>Please check your reader dashboard for the new book details and reading materials.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">View New Assignment</a>
        </div>
      `,
      ES: `
        <h1 style="color: #2563eb;">Tu Asignación Ha Sido Reasignada</h1>
        <p>Hola {{userName}},</p>
        <p>Tu asignación de lectura ha sido actualizada. Has sido reasignado a un nuevo libro.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Asignación Anterior</h3>
          <p><strong>Libro:</strong> {{oldBookTitle}}</p>
        </div>

        <div class="success-box" style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">Nueva Asignación</h3>
          <p><strong>Libro:</strong> {{newBookTitle}}</p>
        </div>

        <p>Por favor, revisa tu panel de lector para ver los detalles del nuevo libro y los materiales de lectura.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Ver Nueva Asignación</a>
        </div>
      `,
      PT: `
        <h1 style="color: #2563eb;">Sua Atribuição Foi Reatribuída</h1>
        <p>Olá {{userName}},</p>
        <p>Sua atribuição de leitura foi atualizada. Você foi reatribuído a um novo livro.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Atribuição Anterior</h3>
          <p><strong>Livro:</strong> {{oldBookTitle}}</p>
        </div>

        <div class="success-box" style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">Nova Atribuição</h3>
          <p><strong>Livro:</strong> {{newBookTitle}}</p>
        </div>

        <p>Por favor, verifique seu painel de leitor para os detalhes do novo livro e materiais de leitura.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Ver Nova Atribuição</a>
        </div>
      `,
    },

    // Reader assignment cancelled
    READER_ASSIGNMENT_CANCELLED: {
      EN: `
        <h1 style="color: #2563eb;">Your Assignment Has Been Cancelled</h1>
        <p>Hi {{userName}},</p>
        <p>We're writing to inform you that your reading assignment for <strong>{{bookTitle}}</strong> has been cancelled.</p>

        <div class="warning-box">
          <p style="margin: 0;"><strong>Reason:</strong> {{reason}}</p>
        </div>

        <p>This does not affect your reader status. You can continue to accept new assignments when they become available.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you have any questions about this cancellation, please don't hesitate to contact our support team.
        </p>
      `,
      ES: `
        <h1 style="color: #2563eb;">Tu Asignación Ha Sido Cancelada</h1>
        <p>Hola {{userName}},</p>
        <p>Te escribimos para informarte que tu asignación de lectura para <strong>{{bookTitle}}</strong> ha sido cancelada.</p>

        <div class="warning-box">
          <p style="margin: 0;"><strong>Razón:</strong> {{reason}}</p>
        </div>

        <p>Esto no afecta tu estado de lector. Puedes continuar aceptando nuevas asignaciones cuando estén disponibles.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Ir al Panel</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Si tienes alguna pregunta sobre esta cancelación, no dudes en contactar a nuestro equipo de soporte.
        </p>
      `,
      PT: `
        <h1 style="color: #2563eb;">Sua Atribuição Foi Cancelada</h1>
        <p>Olá {{userName}},</p>
        <p>Estamos escrevendo para informá-lo que sua atribuição de leitura para <strong>{{bookTitle}}</strong> foi cancelada.</p>

        <div class="warning-box">
          <p style="margin: 0;"><strong>Motivo:</strong> {{reason}}</p>
        </div>

        <p>Isso não afeta seu status de leitor. Você pode continuar aceitando novas atribuições quando estiverem disponíveis.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Ir para o Painel</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Se você tiver alguma dúvida sobre este cancelamento, não hesite em entrar em contato com nossa equipe de suporte.
        </p>
      `,
    },

    // Reader deadline extended
    READER_DEADLINE_EXTENDED: {
      EN: `
        <h1 style="color: #10b981;">Good News - Your Deadline Has Been Extended!</h1>
        <p>Hi {{userName}},</p>
        <p>Your deadline for reading <strong>{{bookTitle}}</strong> has been extended.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Updated Deadline Information</h3>
          <p><strong>Previous Deadline:</strong> {{oldDeadline}}</p>
          <p><strong>New Deadline:</strong> {{newDeadline}}</p>
          <p><strong>Extension:</strong> {{extensionHours}} hours</p>
        </div>

        <p>Please make sure to complete your reading and submit your review by the new deadline.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">View Assignment</a>
        </div>
      `,
      ES: `
        <h1 style="color: #10b981;">¡Buenas Noticias - Tu Fecha Límite Ha Sido Extendida!</h1>
        <p>Hola {{userName}},</p>
        <p>Tu fecha límite para leer <strong>{{bookTitle}}</strong> ha sido extendida.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Información Actualizada de la Fecha Límite</h3>
          <p><strong>Fecha Límite Anterior:</strong> {{oldDeadline}}</p>
          <p><strong>Nueva Fecha Límite:</strong> {{newDeadline}}</p>
          <p><strong>Extensión:</strong> {{extensionHours}} horas</p>
        </div>

        <p>Por favor, asegúrate de completar tu lectura y enviar tu reseña antes de la nueva fecha límite.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Ver Asignación</a>
        </div>
      `,
      PT: `
        <h1 style="color: #10b981;">Boas Notícias - Seu Prazo Foi Estendido!</h1>
        <p>Olá {{userName}},</p>
        <p>Seu prazo para ler <strong>{{bookTitle}}</strong> foi estendido.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Informações Atualizadas do Prazo</h3>
          <p><strong>Prazo Anterior:</strong> {{oldDeadline}}</p>
          <p><strong>Novo Prazo:</strong> {{newDeadline}}</p>
          <p><strong>Extensão:</strong> {{extensionHours}} horas</p>
        </div>

        <p>Por favor, certifique-se de completar sua leitura e enviar sua avaliação até o novo prazo.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Ver Atribuição</a>
        </div>
      `,
    },

    // Reader resubmission requested
    READER_RESUBMISSION_REQUESTED: {
      EN: `
        <h1 style="color: #f59e0b;">Resubmission Requested for Your Review</h1>
        <p>Hi {{userName}},</p>
        <p>We've received your review for <strong>{{bookTitle}}</strong>, but we need you to make some changes before we can approve it.</p>

        <div class="warning-box">
          <h3 style="margin-top: 0;">Requested Changes</h3>
          <p>{{resubmissionInstructions}}</p>
        </div>

        <div class="info-box">
          <p><strong>New Deadline:</strong> {{resubmissionDeadline}}</p>
        </div>

        <p>Please update your review and resubmit it by the deadline above.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Edit Your Review</a>
        </div>
      `,
      ES: `
        <h1 style="color: #f59e0b;">Se Solicita Reenvío de Tu Reseña</h1>
        <p>Hola {{userName}},</p>
        <p>Hemos recibido tu reseña para <strong>{{bookTitle}}</strong>, pero necesitamos que hagas algunos cambios antes de poder aprobarla.</p>

        <div class="warning-box">
          <h3 style="margin-top: 0;">Cambios Solicitados</h3>
          <p>{{resubmissionInstructions}}</p>
        </div>

        <div class="info-box">
          <p><strong>Nueva Fecha Límite:</strong> {{resubmissionDeadline}}</p>
        </div>

        <p>Por favor, actualiza tu reseña y reenvíala antes de la fecha límite indicada.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Editar Tu Reseña</a>
        </div>
      `,
      PT: `
        <h1 style="color: #f59e0b;">Reenvio Solicitado para Sua Avaliação</h1>
        <p>Olá {{userName}},</p>
        <p>Recebemos sua avaliação para <strong>{{bookTitle}}</strong>, mas precisamos que você faça algumas alterações antes de podermos aprová-la.</p>

        <div class="warning-box">
          <h3 style="margin-top: 0;">Alterações Solicitadas</h3>
          <p>{{resubmissionInstructions}}</p>
        </div>

        <div class="info-box">
          <p><strong>Novo Prazo:</strong> {{resubmissionDeadline}}</p>
        </div>

        <p>Por favor, atualize sua avaliação e reenvie-a até o prazo indicado.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Editar Sua Avaliação</a>
        </div>
      `,
    },

    // Reader replacement assignment (14-day guarantee)
    READER_REPLACEMENT_ASSIGNED: {
      EN: `
        <h1 style="color: #10b981;">New Review Opportunity Available!</h1>
        <p>Hi {{userName}},</p>
        <p>Good news! You've been assigned a replacement review for <strong>{{bookTitle}}</strong> by {{bookAuthor}}.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">What This Means</h3>
          <p>A previously validated review for this book was removed from Amazon within the 14-day guarantee period. As the next reader in the queue, you've been selected to provide a replacement review.</p>
        </div>

        <div class="success-box" style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">Your Assignment</h3>
          <p><strong>Book:</strong> {{bookTitle}}</p>
          <p><strong>Author:</strong> {{bookAuthor}}</p>
          <p><strong>Status:</strong> Scheduled for immediate access</p>
        </div>

        <p>You'll receive another email when your book materials are ready to access. This replacement review follows the same process as regular assignments:</p>
        <ul>
          <li>72-hour deadline after receiving materials</li>
          <li>Same compensation as regular reviews</li>
          <li>Full access to book materials</li>
        </ul>

        <p>Thank you for being an active and reliable reader on BookProof!</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">View Assignment</a>
        </div>
      `,
      ES: `
        <h1 style="color: #10b981;">¡Nueva Oportunidad de Reseña Disponible!</h1>
        <p>Hola {{userName}},</p>
        <p>¡Buenas noticias! Se te ha asignado una reseña de reemplazo para <strong>{{bookTitle}}</strong> de {{bookAuthor}}.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Qué Significa Esto</h3>
          <p>Una reseña previamente validada para este libro fue eliminada de Amazon dentro del período de garantía de 14 días. Como el próximo lector en la cola, has sido seleccionado para proporcionar una reseña de reemplazo.</p>
        </div>

        <div class="success-box" style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">Tu Asignación</h3>
          <p><strong>Libro:</strong> {{bookTitle}}</p>
          <p><strong>Autor:</strong> {{bookAuthor}}</p>
          <p><strong>Estado:</strong> Programado para acceso inmediato</p>
        </div>

        <p>Recibirás otro correo cuando los materiales del libro estén listos para acceder. Esta reseña de reemplazo sigue el mismo proceso que las asignaciones regulares:</p>
        <ul>
          <li>Plazo de 72 horas después de recibir los materiales</li>
          <li>Misma compensación que las reseñas regulares</li>
          <li>Acceso completo a los materiales del libro</li>
        </ul>

        <p>¡Gracias por ser un lector activo y confiable en BookProof!</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Ver Asignación</a>
        </div>
      `,
      PT: `
        <h1 style="color: #10b981;">Nova Oportunidade de Avaliação Disponível!</h1>
        <p>Olá {{userName}},</p>
        <p>Boas notícias! Você foi designado para uma avaliação de substituição para <strong>{{bookTitle}}</strong> de {{bookAuthor}}.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">O Que Isso Significa</h3>
          <p>Uma avaliação previamente validada para este livro foi removida da Amazon dentro do período de garantia de 14 dias. Como o próximo leitor na fila, você foi selecionado para fornecer uma avaliação de substituição.</p>
        </div>

        <div class="success-box" style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">Sua Atribuição</h3>
          <p><strong>Livro:</strong> {{bookTitle}}</p>
          <p><strong>Autor:</strong> {{bookAuthor}}</p>
          <p><strong>Status:</strong> Agendado para acesso imediato</p>
        </div>

        <p>Você receberá outro e-mail quando os materiais do livro estiverem prontos para acessar. Esta avaliação de substituição segue o mesmo processo que as atribuições regulares:</p>
        <ul>
          <li>Prazo de 72 horas após receber os materiais</li>
          <li>Mesma compensação que as avaliações regulares</li>
          <li>Acesso completo aos materiais do livro</li>
        </ul>

        <p>Obrigado por ser um leitor ativo e confiável no BookProof!</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Ver Atribuição</a>
        </div>
      `,
    },

    // Author credits added
    AUTHOR_CREDITS_ADDED: {
      EN: `
        <h1 style="color: #10b981;">Credits Added to Your Account</h1>
        <p>Hi {{userName}},</p>
        <p>We're happy to inform you that credits have been added to your BookProof account.</p>

        <div class="success-box" style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">Credit Details</h3>
          <p><strong>Credits Added:</strong> {{creditsAdded}}</p>
          <p><strong>New Balance:</strong> {{newBalance}} credits</p>
          <p><strong>Reason:</strong> {{reason}}</p>
        </div>

        <p>You can use these credits to launch new review campaigns for your books.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>
        </div>
      `,
      ES: `
        <h1 style="color: #10b981;">Créditos Añadidos a Tu Cuenta</h1>
        <p>Hola {{userName}},</p>
        <p>Nos complace informarte que se han añadido créditos a tu cuenta de BookProof.</p>

        <div class="success-box" style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">Detalles del Crédito</h3>
          <p><strong>Créditos Añadidos:</strong> {{creditsAdded}}</p>
          <p><strong>Nuevo Saldo:</strong> {{newBalance}} créditos</p>
          <p><strong>Razón:</strong> {{reason}}</p>
        </div>

        <p>Puedes usar estos créditos para lanzar nuevas campañas de reseñas para tus libros.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Ir al Panel</a>
        </div>
      `,
      PT: `
        <h1 style="color: #10b981;">Créditos Adicionados à Sua Conta</h1>
        <p>Olá {{userName}},</p>
        <p>Estamos felizes em informar que créditos foram adicionados à sua conta BookProof.</p>

        <div class="success-box" style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">Detalhes do Crédito</h3>
          <p><strong>Créditos Adicionados:</strong> {{creditsAdded}}</p>
          <p><strong>Novo Saldo:</strong> {{newBalance}} créditos</p>
          <p><strong>Motivo:</strong> {{reason}}</p>
        </div>

        <p>Você pode usar esses créditos para lançar novas campanhas de avaliações para seus livros.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Ir para o Painel</a>
        </div>
      `,
    },

    // Author credits removed
    AUTHOR_CREDITS_REMOVED: {
      EN: `
        <h1 style="color: #ef4444;">Credits Removed from Your Account</h1>
        <p>Hi {{userName}},</p>
        <p>We're writing to inform you that credits have been removed from your BookProof account.</p>

        <div class="warning-box">
          <h3 style="margin-top: 0;">Credit Details</h3>
          <p><strong>Credits Removed:</strong> {{creditsRemoved}}</p>
          <p><strong>New Balance:</strong> {{newBalance}} credits</p>
          <p><strong>Reason:</strong> {{reason}}</p>
        </div>

        <p>If you have any questions about this adjustment, please contact our support team.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">View Your Credits</a>
        </div>
      `,
      ES: `
        <h1 style="color: #ef4444;">Créditos Eliminados de Tu Cuenta</h1>
        <p>Hola {{userName}},</p>
        <p>Te escribimos para informarte que se han eliminado créditos de tu cuenta de BookProof.</p>

        <div class="warning-box">
          <h3 style="margin-top: 0;">Detalles del Crédito</h3>
          <p><strong>Créditos Eliminados:</strong> {{creditsRemoved}}</p>
          <p><strong>Nuevo Saldo:</strong> {{newBalance}} créditos</p>
          <p><strong>Razón:</strong> {{reason}}</p>
        </div>

        <p>Si tienes alguna pregunta sobre este ajuste, por favor contacta a nuestro equipo de soporte.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Ver Tus Créditos</a>
        </div>
      `,
      PT: `
        <h1 style="color: #ef4444;">Créditos Removidos da Sua Conta</h1>
        <p>Olá {{userName}},</p>
        <p>Estamos escrevendo para informá-lo que créditos foram removidos da sua conta BookProof.</p>

        <div class="warning-box">
          <h3 style="margin-top: 0;">Detalhes do Crédito</h3>
          <p><strong>Créditos Removidos:</strong> {{creditsRemoved}}</p>
          <p><strong>Novo Saldo:</strong> {{newBalance}} créditos</p>
          <p><strong>Motivo:</strong> {{reason}}</p>
        </div>

        <p>Se você tiver alguma dúvida sobre este ajuste, por favor entre em contato com nossa equipe de suporte.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" class="button">Ver Seus Créditos</a>
        </div>
      `,
    },

    // Author account suspended (Section 4.5)
    AUTHOR_SUSPENDED: {
      EN: `
        <h1 style="color: #ef4444;">Your Account Has Been Suspended</h1>
        <p>Hi {{userName}},</p>
        <p>We're writing to inform you that your BookProof author account has been suspended.</p>

        <div class="warning-box">
          <h3 style="margin-top: 0;">Suspension Details</h3>
          <p><strong>Reason:</strong> {{reason}}</p>
          <p><strong>Date:</strong> {{suspendedAt}}</p>
          {{#if pausedCampaignsCount}}
          <p><strong>Campaigns Affected:</strong> {{pausedCampaignsCount}} active campaign(s) have been paused</p>
          {{/if}}
        </div>

        <div class="info-box">
          <h3 style="margin-top: 0;">What This Means</h3>
          <ul style="margin: 10px 0;">
            <li>You will not be able to log in to your account</li>
            <li>All active campaigns have been paused</li>
            <li>No new reviews will be distributed</li>
          </ul>
        </div>

        <p>If you believe this suspension was made in error or would like to appeal this decision, please contact our support team:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{supportUrl}}" class="button">Contact Support</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          <strong>Support Email:</strong> {{supportEmail}}
        </p>
      `,
      ES: `
        <h1 style="color: #ef4444;">Tu Cuenta Ha Sido Suspendida</h1>
        <p>Hola {{userName}},</p>
        <p>Te escribimos para informarte que tu cuenta de autor de BookProof ha sido suspendida.</p>

        <div class="warning-box">
          <h3 style="margin-top: 0;">Detalles de la Suspensión</h3>
          <p><strong>Razón:</strong> {{reason}}</p>
          <p><strong>Fecha:</strong> {{suspendedAt}}</p>
          {{#if pausedCampaignsCount}}
          <p><strong>Campañas Afectadas:</strong> {{pausedCampaignsCount}} campaña(s) activa(s) han sido pausadas</p>
          {{/if}}
        </div>

        <div class="info-box">
          <h3 style="margin-top: 0;">Qué Significa Esto</h3>
          <ul style="margin: 10px 0;">
            <li>No podrás iniciar sesión en tu cuenta</li>
            <li>Todas las campañas activas han sido pausadas</li>
            <li>No se distribuirán nuevas reseñas</li>
          </ul>
        </div>

        <p>Si crees que esta suspensión fue un error o deseas apelar esta decisión, por favor contacta a nuestro equipo de soporte:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{supportUrl}}" class="button">Contactar Soporte</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          <strong>Email de Soporte:</strong> {{supportEmail}}
        </p>
      `,
      PT: `
        <h1 style="color: #ef4444;">Sua Conta Foi Suspensa</h1>
        <p>Olá {{userName}},</p>
        <p>Estamos escrevendo para informá-lo que sua conta de autor BookProof foi suspensa.</p>

        <div class="warning-box">
          <h3 style="margin-top: 0;">Detalhes da Suspensão</h3>
          <p><strong>Motivo:</strong> {{reason}}</p>
          <p><strong>Data:</strong> {{suspendedAt}}</p>
          {{#if pausedCampaignsCount}}
          <p><strong>Campanhas Afetadas:</strong> {{pausedCampaignsCount}} campanha(s) ativa(s) foram pausadas</p>
          {{/if}}
        </div>

        <div class="info-box">
          <h3 style="margin-top: 0;">O Que Isso Significa</h3>
          <ul style="margin: 10px 0;">
            <li>Você não poderá fazer login na sua conta</li>
            <li>Todas as campanhas ativas foram pausadas</li>
            <li>Nenhuma nova avaliação será distribuída</li>
          </ul>
        </div>

        <p>Se você acredita que esta suspensão foi feita por engano ou gostaria de apelar desta decisão, por favor entre em contato com nossa equipe de suporte:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{supportUrl}}" class="button">Contatar Suporte</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          <strong>Email de Suporte:</strong> {{supportEmail}}
        </p>
      `,
    },

    // Author account unsuspended (Section 4.5)
    AUTHOR_UNSUSPENDED: {
      EN: `
        <h1 style="color: #10b981;">Your Account Has Been Restored</h1>
        <p>Hi {{userName}},</p>
        <p>Good news! Your BookProof author account has been unsuspended and restored to full functionality.</p>

        <div class="success-box">
          <h3 style="margin-top: 0;">Restoration Details</h3>
          <p><strong>Reason:</strong> {{reason}}</p>
          <p><strong>Date:</strong> {{unsuspendedAt}}</p>
        </div>

        <div class="info-box">
          <h3 style="margin-top: 0;">What You Can Do Now</h3>
          <ul style="margin: 10px 0;">
            <li>Log in to your account</li>
            <li>Resume your paused campaigns</li>
            <li>Create new campaigns</li>
            <li>Access all platform features</li>
          </ul>
        </div>

        <p>We're glad to have you back! You can now log in and continue using BookProof.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}" class="button">Log In to Your Account</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you have any questions, please don't hesitate to contact our support team.
        </p>
      `,
      ES: `
        <h1 style="color: #10b981;">Tu Cuenta Ha Sido Restaurada</h1>
        <p>Hola {{userName}},</p>
        <p>¡Buenas noticias! Tu cuenta de autor de BookProof ha sido reactivada y restaurada a plena funcionalidad.</p>

        <div class="success-box">
          <h3 style="margin-top: 0;">Detalles de la Restauración</h3>
          <p><strong>Razón:</strong> {{reason}}</p>
          <p><strong>Fecha:</strong> {{unsuspendedAt}}</p>
        </div>

        <div class="info-box">
          <h3 style="margin-top: 0;">Qué Puedes Hacer Ahora</h3>
          <ul style="margin: 10px 0;">
            <li>Iniciar sesión en tu cuenta</li>
            <li>Reanudar tus campañas pausadas</li>
            <li>Crear nuevas campañas</li>
            <li>Acceder a todas las funciones de la plataforma</li>
          </ul>
        </div>

        <p>¡Nos alegra tenerte de vuelta! Ahora puedes iniciar sesión y continuar usando BookProof.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}" class="button">Iniciar Sesión en Tu Cuenta</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.
        </p>
      `,
      PT: `
        <h1 style="color: #10b981;">Sua Conta Foi Restaurada</h1>
        <p>Olá {{userName}},</p>
        <p>Boas notícias! Sua conta de autor BookProof foi reativada e restaurada para funcionalidade completa.</p>

        <div class="success-box">
          <h3 style="margin-top: 0;">Detalhes da Restauração</h3>
          <p><strong>Motivo:</strong> {{reason}}</p>
          <p><strong>Data:</strong> {{unsuspendedAt}}</p>
        </div>

        <div class="info-box">
          <h3 style="margin-top: 0;">O Que Você Pode Fazer Agora</h3>
          <ul style="margin: 10px 0;">
            <li>Fazer login na sua conta</li>
            <li>Retomar suas campanhas pausadas</li>
            <li>Criar novas campanhas</li>
            <li>Acessar todos os recursos da plataforma</li>
          </ul>
        </div>

        <p>Estamos felizes em tê-lo de volta! Agora você pode fazer login e continuar usando o BookProof.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}" class="button">Fazer Login na Sua Conta</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Se você tiver alguma dúvida, não hesite em entrar em contato com nossa equipe de suporte.
        </p>
      `,
    },

    // Closer package sent to client
    CLOSER_PACKAGE_SENT_TO_CLIENT: {
      EN: `
        <h1 style="color: #2563eb;">Your Custom Package from BookProof</h1>
        <p>Hi {{userName}},</p>
        <p>{{closerName}} from BookProof has created a custom package for you!</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Package Details</h3>
          <p><strong>Package Name:</strong> {{packageName}}</p>
          <p><strong>Description:</strong> {{packageDescription}}</p>
          <p><strong>Credits Included:</strong> {{credits}}</p>
          <p><strong>Validity:</strong> {{validityDays}} days from activation</p>
          <p><strong>Price:</strong> {{price}} {{currency}}</p>
        </div>

        {{#if specialTerms}}
        <div class="info-box">
          <h3 style="margin-top: 0;">Special Terms</h3>
          <p>{{specialTerms}}</p>
        </div>
        {{/if}}

        {{#if customMessage}}
        <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Message from {{closerName}}:</strong></p>
          <p style="margin: 10px 0 0 0;">{{customMessage}}</p>
        </div>
        {{/if}}

        <p><strong>Payment Link Expires:</strong> {{expirationDate}}</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{paymentLink}}" class="button" style="font-size: 18px; padding: 15px 40px;">Complete Purchase</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          If you have any questions about this package, please reply to this email or contact {{closerEmail}}.
        </p>
      `,
      ES: `
        <h1 style="color: #2563eb;">Tu Paquete Personalizado de BookProof</h1>
        <p>Hola {{userName}},</p>
        <p>¡{{closerName}} de BookProof ha creado un paquete personalizado para ti!</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Detalles del Paquete</h3>
          <p><strong>Nombre del Paquete:</strong> {{packageName}}</p>
          <p><strong>Descripción:</strong> {{packageDescription}}</p>
          <p><strong>Créditos Incluidos:</strong> {{credits}}</p>
          <p><strong>Validez:</strong> {{validityDays}} días desde la activación</p>
          <p><strong>Precio:</strong> {{price}} {{currency}}</p>
        </div>

        {{#if specialTerms}}
        <div class="info-box">
          <h3 style="margin-top: 0;">Términos Especiales</h3>
          <p>{{specialTerms}}</p>
        </div>
        {{/if}}

        {{#if customMessage}}
        <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Mensaje de {{closerName}}:</strong></p>
          <p style="margin: 10px 0 0 0;">{{customMessage}}</p>
        </div>
        {{/if}}

        <p><strong>El Enlace de Pago Expira:</strong> {{expirationDate}}</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{paymentLink}}" class="button" style="font-size: 18px; padding: 15px 40px;">Completar Compra</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Si tienes alguna pregunta sobre este paquete, por favor responde a este correo o contacta a {{closerEmail}}.
        </p>
      `,
      PT: `
        <h1 style="color: #2563eb;">Seu Pacote Personalizado do BookProof</h1>
        <p>Olá {{userName}},</p>
        <p>{{closerName}} do BookProof criou um pacote personalizado para você!</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">Detalhes do Pacote</h3>
          <p><strong>Nome do Pacote:</strong> {{packageName}}</p>
          <p><strong>Descrição:</strong> {{packageDescription}}</p>
          <p><strong>Créditos Incluídos:</strong> {{credits}}</p>
          <p><strong>Validade:</strong> {{validityDays}} dias a partir da ativação</p>
          <p><strong>Preço:</strong> {{price}} {{currency}}</p>
        </div>

        {{#if specialTerms}}
        <div class="info-box">
          <h3 style="margin-top: 0;">Termos Especiais</h3>
          <p>{{specialTerms}}</p>
        </div>
        {{/if}}

        {{#if customMessage}}
        <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Mensagem de {{closerName}}:</strong></p>
          <p style="margin: 10px 0 0 0;">{{customMessage}}</p>
        </div>
        {{/if}}

        <p><strong>Link de Pagamento Expira:</strong> {{expirationDate}}</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{paymentLink}}" class="button" style="font-size: 18px; padding: 15px 40px;">Completar Compra</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Se você tiver alguma dúvida sobre este pacote, por favor responda a este e-mail ou entre em contato com {{closerEmail}}.
        </p>
      `,
    },

    // Reader application
    READER_APPLICATION_RECEIVED: {
      EN: `
        <h1>Application Received!</h1>
        <p>Hi {{readerName}},</p>
        <p>We've received your application to review <strong>{{bookTitle}}</strong>.</p>
        <p>You're now in the queue and will be notified when it's your turn to access the materials.</p>
        <p>Thank you for being part of the BookProof community!</p>
      `,
      ES: `
        <h1>¡Solicitud Recibida!</h1>
        <p>Hola {{readerName}},</p>
        <p>Hemos recibido tu solicitud para revisar <strong>{{bookTitle}}</strong>.</p>
        <p>Ahora estás en la cola y serás notificado cuando sea tu turno de acceder a los materiales.</p>
        <p>¡Gracias por ser parte de la comunidad BookProof!</p>
      `,
      PT: `
        <h1>Inscrição Recebida!</h1>
        <p>Olá {{readerName}},</p>
        <p>Recebemos sua inscrição para revisar <strong>{{bookTitle}}</strong>.</p>
        <p>Você está na fila e será notificado quando for sua vez de acessar os materiais.</p>
        <p>Obrigado por fazer parte da comunidade BookProof!</p>
      `,
    },

    // Admin - new affiliate application
    ADMIN_NEW_AFFILIATE_APPLICATION: {
      EN: `
        <h1>New Affiliate Application</h1>
        <p>Hi Admin,</p>
        <p>A new affiliate has applied to join the program:</p>
        <div class="info-box">
          <p><strong>Name:</strong> {{affiliateName}}</p>
          <p><strong>Email:</strong> {{affiliateEmail}}</p>
          <p><strong>Website:</strong> {{websiteUrl}}</p>
        </div>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Review Application</a>
        </div>
      `,
      ES: `
        <h1>Nueva Solicitud de Afiliado</h1>
        <p>Hola Admin,</p>
        <p>Un nuevo afiliado ha solicitado unirse al programa:</p>
        <div class="info-box">
          <p><strong>Nombre:</strong> {{affiliateName}}</p>
          <p><strong>Email:</strong> {{affiliateEmail}}</p>
          <p><strong>Sitio web:</strong> {{websiteUrl}}</p>
        </div>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Revisar Solicitud</a>
        </div>
      `,
      PT: `
        <h1>Nova Inscrição de Afiliado</h1>
        <p>Olá Admin,</p>
        <p>Um novo afiliado se inscreveu no programa:</p>
        <div class="info-box">
          <p><strong>Nome:</strong> {{affiliateName}}</p>
          <p><strong>Email:</strong> {{affiliateEmail}}</p>
          <p><strong>Site:</strong> {{websiteUrl}}</p>
        </div>
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="button">Revisar Inscrição</a>
        </div>
      `,
    },

    // Admin - critical error notification (Section 16.2)
    ADMIN_CRITICAL_ERROR: {
      EN: `
        <h1 style="color: #dc2626;">🚨 CRITICAL ERROR</h1>
        <p>Hi Admin,</p>
        <p style="color: #dc2626; font-weight: bold;">A critical error has occurred in the system that requires immediate attention.</p>
        <div class="info-box" style="background-color: #fee2e2; border-left: 4px solid #dc2626;">
          <p><strong>Error ID:</strong> <code>{{issueId}}</code></p>
          <p><strong>Error Type:</strong> {{issueType}}</p>
          <p><strong>Error Message:</strong> {{issueDescription}}</p>
          <p><strong>Path:</strong> <code>{{actionUrl}}</code></p>
          <p><strong>User Context:</strong> {{userEmail}} ({{userName}})</p>
        </div>
        <p><strong>Stack Trace:</strong></p>
        <pre style="background-color: #1f2937; color: #f3f4f6; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 12px;">{{reason}}</pre>
        <div style="text-align: center; margin-top: 20px;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #dc2626;">View Error Logs</a>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">This is an automated alert. Reference Error ID <code>{{issueId}}</code> when investigating.</p>
      `,
      ES: `
        <h1 style="color: #dc2626;">🚨 ERROR CRÍTICO</h1>
        <p>Hola Admin,</p>
        <p style="color: #dc2626; font-weight: bold;">Ha ocurrido un error crítico en el sistema que requiere atención inmediata.</p>
        <div class="info-box" style="background-color: #fee2e2; border-left: 4px solid #dc2626;">
          <p><strong>ID de Error:</strong> <code>{{issueId}}</code></p>
          <p><strong>Tipo de Error:</strong> {{issueType}}</p>
          <p><strong>Mensaje de Error:</strong> {{issueDescription}}</p>
          <p><strong>Ruta:</strong> <code>{{actionUrl}}</code></p>
          <p><strong>Contexto del Usuario:</strong> {{userEmail}} ({{userName}})</p>
        </div>
        <p><strong>Trazabilidad de Pila:</strong></p>
        <pre style="background-color: #1f2937; color: #f3f4f6; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 12px;">{{reason}}</pre>
        <div style="text-align: center; margin-top: 20px;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #dc2626;">Ver Registros de Errores</a>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">Esta es una alerta automatizada. Referencia ID de Error <code>{{issueId}}</code> al investigar.</p>
      `,
      PT: `
        <h1 style="color: #dc2626;">🚨 ERRO CRÍTICO</h1>
        <p>Olá Admin,</p>
        <p style="color: #dc2626; font-weight: bold;">Ocorreu um erro crítico no sistema que requer atenção imediata.</p>
        <div class="info-box" style="background-color: #fee2e2; border-left: 4px solid #dc2626;">
          <p><strong>ID do Erro:</strong> <code>{{issueId}}</code></p>
          <p><strong>Tipo de Erro:</strong> {{issueType}}</p>
          <p><strong>Mensagem de Erro:</strong> {{issueDescription}}</p>
          <p><strong>Caminho:</strong> <code>{{actionUrl}}</code></p>
          <p><strong>Contexto do Usuário:</strong> {{userEmail}} ({{userName}})</p>
        </div>
        <p><strong>Rastreamento de Pilha:</strong></p>
        <pre style="background-color: #1f2937; color: #f3f4f6; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 12px;">{{reason}}</pre>
        <div style="text-align: center; margin-top: 20px;">
          <a href="{{dashboardUrl}}" class="button" style="background-color: #dc2626;">Ver Registros de Erros</a>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #6b7280;">Este é um alerta automatizado. Referencie o ID do Erro <code>{{issueId}}</code> ao investigar.</p>
      `,
    },

    // Admin notification to user (Section 5.2)
    ADMIN_NOTIFICATION: {
      EN: `
        <h1>Message from BookProof Support</h1>
        <p>Hi {{userName}},</p>
        <p>You've received a message from the BookProof support team:</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">{{subject}}</h3>
          <p style="white-space: pre-wrap;">{{message}}</p>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          If you have any questions, you can reply to this email or contact our support team.
        </p>
        <p style="font-size: 12px; color: #6b7280;">
          Sent by: {{adminEmail}}
        </p>
      `,
      ES: `
        <h1>Mensaje del soporte de BookProof</h1>
        <p>Hola {{userName}},</p>
        <p>Has recibido un mensaje del equipo de soporte de BookProof:</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">{{subject}}</h3>
          <p style="white-space: pre-wrap;">{{message}}</p>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          Si tienes alguna pregunta, puedes responder a este correo o contactar a nuestro equipo de soporte.
        </p>
        <p style="font-size: 12px; color: #6b7280;">
          Enviado por: {{adminEmail}}
        </p>
      `,
      PT: `
        <h1>Mensagem do suporte BookProof</h1>
        <p>Olá {{userName}},</p>
        <p>Você recebeu uma mensagem da equipe de suporte da BookProof:</p>
        <div class="info-box">
          <h3 style="margin-top: 0;">{{subject}}</h3>
          <p style="white-space: pre-wrap;">{{message}}</p>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
          Se você tiver alguma dúvida, pode responder a este email ou entrar em contato com nossa equipe de suporte.
        </p>
        <p style="font-size: 12px; color: #6b7280;">
          Enviado por: {{adminEmail}}
        </p>
      `,
    },

    // Affiliate application received
    AFFILIATE_APPLICATION_RECEIVED: {
      EN: `
        <h1>Application Received!</h1>
        <p>Hi {{affiliateName}},</p>
        <p>Thank you for applying to the BookProof Affiliate Program!</p>
        <p>We're reviewing your application and will get back to you within 2-3 business days.</p>
        <div class="info-box">
          <h3>What happens next?</h3>
          <ul>
            <li>Our team reviews your application</li>
            <li>You'll receive an email with the decision</li>
            <li>Once approved, you'll get access to your affiliate dashboard</li>
          </ul>
        </div>
        <p>Thank you for your interest in partnering with BookProof!</p>
      `,
      ES: `
        <h1>¡Solicitud Recibida!</h1>
        <p>Hola {{affiliateName}},</p>
        <p>¡Gracias por aplicar al Programa de Afiliados de BookProof!</p>
        <p>Estamos revisando tu solicitud y te responderemos en 2-3 días hábiles.</p>
        <div class="info-box">
          <h3>¿Qué sigue?</h3>
          <ul>
            <li>Nuestro equipo revisa tu solicitud</li>
            <li>Recibirás un correo con la decisión</li>
            <li>Una vez aprobado, tendrás acceso a tu panel de afiliado</li>
          </ul>
        </div>
        <p>¡Gracias por tu interés en asociarte con BookProof!</p>
      `,
      PT: `
        <h1>Inscrição Recebida!</h1>
        <p>Olá {{affiliateName}},</p>
        <p>Obrigado por se inscrever no Programa de Afiliados da BookProof!</p>
        <p>Estamos revisando sua inscrição e retornaremos em 2-3 dias úteis.</p>
        <div class="info-box">
          <h3>O que acontece agora?</h3>
          <ul>
            <li>Nossa equipe revisa sua inscrição</li>
            <li>Você receberá um email com a decisão</li>
            <li>Após aprovação, terá acesso ao painel de afiliado</li>
          </ul>
        </div>
        <p>Obrigado pelo interesse em fazer parceria com a BookProof!</p>
      `,
    },

    // Landing page welcome email
    LANDING_PAGE_WELCOME: {
      EN: `
        <h1 style="color: #2563eb;">Welcome to the BookProof Waitlist!</h1>
        <p>Hi {{userName}},</p>
        <p>Thank you for joining our waitlist! We're excited to have you as one of our early supporters.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">What happens next?</h3>
          <ul>
            <li>You'll be among the first to know when we launch</li>
            <li>Early access to our platform with exclusive pricing</li>
            <li>Regular updates on our progress and features</li>
          </ul>
        </div>

        <p><strong>What is BookProof?</strong></p>
        <p>BookProof connects authors with verified readers to generate authentic Amazon reviews. Our platform ensures:</p>
        <ul>
          <li>Real readers who genuinely read your book</li>
          <li>Honest, authentic reviews</li>
          <li>Natural distribution patterns</li>
          <li>14-day guarantee on all reviews</li>
        </ul>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Stay tuned for more updates. We can't wait to help you succeed with your book marketing!
        </p>
      `,
      ES: `
        <h1 style="color: #2563eb;">¡Bienvenido a la lista de espera de BookProof!</h1>
        <p>Hola {{userName}},</p>
        <p>¡Gracias por unirte a nuestra lista de espera! Estamos emocionados de tenerte como uno de nuestros primeros seguidores.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">¿Qué sucede ahora?</h3>
          <ul>
            <li>Serás de los primeros en saber cuándo lancemos</li>
            <li>Acceso anticipado a nuestra plataforma con precios exclusivos</li>
            <li>Actualizaciones regulares sobre nuestro progreso y características</li>
          </ul>
        </div>

        <p><strong>¿Qué es BookProof?</strong></p>
        <p>BookProof conecta autores con lectores verificados para generar reseñas auténticas en Amazon. Nuestra plataforma garantiza:</p>
        <ul>
          <li>Lectores reales que genuinamente leen tu libro</li>
          <li>Reseñas honestas y auténticas</li>
          <li>Patrones de distribución naturales</li>
          <li>Garantía de 14 días en todas las reseñas</li>
        </ul>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Mantente atento para más actualizaciones. ¡No podemos esperar para ayudarte a tener éxito con el marketing de tu libro!
        </p>
      `,
      PT: `
        <h1 style="color: #2563eb;">Bem-vindo à lista de espera do BookProof!</h1>
        <p>Olá {{userName}},</p>
        <p>Obrigado por se juntar à nossa lista de espera! Estamos animados em tê-lo como um dos nossos primeiros apoiadores.</p>

        <div class="info-box">
          <h3 style="margin-top: 0;">O que acontece agora?</h3>
          <ul>
            <li>Você será um dos primeiros a saber quando lançarmos</li>
            <li>Acesso antecipado à nossa plataforma com preços exclusivos</li>
            <li>Atualizações regulares sobre nosso progresso e recursos</li>
          </ul>
        </div>

        <p><strong>O que é o BookProof?</strong></p>
        <p>O BookProof conecta autores com leitores verificados para gerar avaliações autênticas na Amazon. Nossa plataforma garante:</p>
        <ul>
          <li>Leitores reais que genuinamente leem seu livro</li>
          <li>Avaliações honestas e autênticas</li>
          <li>Padrões de distribuição naturais</li>
          <li>Garantia de 14 dias em todas as avaliações</li>
        </ul>

        <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
          Fique ligado para mais atualizações. Mal podemos esperar para ajudá-lo a ter sucesso com o marketing do seu livro!
        </p>
      `,
    },
  };

  return templates[type][language] || templates[type][Language.EN];
}
