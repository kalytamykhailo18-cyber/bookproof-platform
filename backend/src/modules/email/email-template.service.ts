import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { EmailType, Language } from '@prisma/client';

export interface EmailVariables {
  // User variables
  userName?: string;
  userEmail?: string;

  // Campaign variables
  bookTitle?: string;
  bookAuthor?: string;
  authorName?: string;
  campaignId?: string;

  // Deadline variables
  deadlineAt?: Date;
  hoursRemaining?: number;
  isUrgent?: boolean;
  isFinal?: boolean;

  // Review variables
  submittedAt?: Date;
  reviewId?: string;
  rating?: number;
  feedback?: string;
  rejectionReason?: string;
  instructions?: string;
  reviewLink?: string;

  // Payment variables
  amount?: number;
  currency?: string;
  transactionId?: string;
  invoiceNumber?: string;

  // Payout variables
  payoutAmount?: number;
  paymentMethod?: string;
  processedDate?: string;
  paidAt?: Date;  // Date when payout was completed

  // Wallet variables
  walletBalance?: number;
  earningsAmount?: number;

  // Links
  actionUrl?: string;
  dashboardUrl?: string;
  assignmentUrl?: string;
  walletUrl?: string;
  reportUrl?: string;
  supportUrl?: string;
  unsubscribeUrl?: string;

  // Other
  currentYear?: number;
  logoUrl?: string;
  appUrl?: string;

  // Report variables
  pdfUrl?: string;

  // Issue variables
  issueId?: string;
  issueType?: string;
  issueDescription?: string;

  // Admin notification variables
  adminName?: string;
  authorEmail?: string;
  keywordResearchId?: string;
  processingStartedAt?: string;
  actionRequired?: string;

  // Reader queue variables
  readerName?: string;
  queuePosition?: number;
  estimatedWeek?: number;
  formatAssigned?: string;

  // Keyword research
  keywordPdfUrl?: string;

  // Affiliate
  referralCode?: string;
  commissionAmount?: number;
  referralName?: string;
  affiliateName?: string;
  websiteUrl?: string;
  promotionPlan?: string;
  affiliateEmail?: string;
  reviewUrl?: string;

  // Closer - Package and Payment
  clientName?: string;
  clientEmail?: string;
  clientCompany?: string;
  packageName?: string;
  packageDescription?: string;
  packageDetails?: string;
  validityDays?: number;
  specialTerms?: string;
  paymentLink?: string;
  closerName?: string;
  closerEmail?: string;
  customMessage?: string;
  accountCreated?: boolean;
  price?: number;

  // Credit expiration
  expiredCredits?: number;
  remainingCredits?: number;
  credits?: number;
  daysUntilExpiration?: number;
  purchaseDate?: Date;
  expirationDate?: Date;

  // Campaign completion
  totalReviews?: number;
  targetReviews?: number;

  // Closer-created account
  temporaryPassword?: string;
  loginUrl?: string;

  // Authentication links
  verificationLink?: string; // Email verification link
  resetLink?: string; // Password reset link

  // Admin credit adjustments
  creditsAdded?: number;
  creditsRemoved?: number;
  newBalance?: number;
  reason?: string;

  // Admin notifications (Section 5.2)
  subject?: string; // Email subject for admin notifications
  message?: string; // Email message body
  adminEmail?: string; // Admin sender email

  // Deadline changes
  extensionHours?: number;
  oldDeadline?: string;
  newDeadline?: string;

  // Reassignment
  oldBookTitle?: string;
  newBookTitle?: string;

  // Resubmission request
  resubmissionDeadline?: string;
  resubmissionInstructions?: string;

  // Credit purchase
  creditsPurchased?: number;
  amountPaid?: string;
  activationDeadline?: string;

  // Account suspension (Section 4.5)
  suspendedAt?: string;
  unsuspendedAt?: string;
  pausedCampaignsCount?: number;
  supportEmail?: string;
}

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get email template from database or fallback to default
   */
  async getTemplate(type: EmailType, language: Language): Promise<string> {
    try {
      // Try to get custom template from database
      const customTemplate = await this.prisma.emailTemplate.findFirst({
        where: {
          type,
          language,
          isActive: true,
          isDefault: true,
        },
      });

      if (customTemplate) {
        this.logger.debug(`Using custom template for ${type} (${language})`);
        return customTemplate.htmlBody;
      }

      // Fall back to default hardcoded template
      this.logger.debug(`Using default template for ${type} (${language})`);
      return this.getDefaultTemplate(type, language);
    } catch (error) {
      this.logger.error(`Error fetching template for ${type} (${language}):`, error);
      // Fall back to default template on error
      return this.getDefaultTemplate(type, language);
    }
  }

  /**
   * Get email subject line
   */
  getSubject(type: EmailType, language: Language, variables: EmailVariables): string {
    const subjects: Record<EmailType, Record<Language, string>> = {
      // Authentication
      WELCOME: {
        EN: `Welcome to BookProof, ${variables.userName || 'there'}!`,
        ES: `¡Bienvenido a BookProof, ${variables.userName || 'usuario'}!`,
        PT: `Bem-vindo ao BookProof, ${variables.userName || 'usuário'}!`,
      },
      EMAIL_VERIFICATION: {
        EN: 'Verify Your Email - BookProof',
        ES: 'Verifica tu correo electrónico - BookProof',
        PT: 'Verifique seu e-mail - BookProof',
      },
      PASSWORD_RESET: {
        EN: 'Reset Your Password - BookProof',
        ES: 'Restablece tu contraseña - BookProof',
        PT: 'Redefina sua senha - BookProof',
      },
      PASSWORD_CHANGED: {
        EN: 'Password Changed Successfully',
        ES: 'Contraseña cambiada exitosamente',
        PT: 'Senha alterada com sucesso',
      },

      // Reader workflow
      READER_APPLICATION_RECEIVED: {
        EN: `Application Received - ${variables.bookTitle || 'Book Review'}`,
        ES: `Solicitud recibida - ${variables.bookTitle || 'Reseña del libro'}`,
        PT: `Inscrição recebida - ${variables.bookTitle || 'Avaliação do livro'}`,
      },
      READER_MATERIALS_READY: {
        EN: `Your Book Materials Are Ready! - ${variables.bookTitle || 'Your Book'}`,
        ES: `¡Tus materiales del libro están listos! - ${variables.bookTitle || 'Tu libro'}`,
        PT: `Seus materiais do livro estão prontos! - ${variables.bookTitle || 'Seu livro'}`,
      },
      READER_DEADLINE_24H: {
        EN: `Reminder: ${variables.hoursRemaining || '24'}h Remaining - ${variables.bookTitle || 'Your Book'}`,
        ES: `Recordatorio: ${variables.hoursRemaining || '24'}h restantes - ${variables.bookTitle || 'Tu libro'}`,
        PT: `Lembrete: ${variables.hoursRemaining || '24'}h restantes - ${variables.bookTitle || 'Seu livro'}`,
      },
      READER_DEADLINE_48H: {
        EN: `Reminder: ${variables.hoursRemaining || '48'}h Remaining - ${variables.bookTitle || 'Your Book'}`,
        ES: `Recordatorio: ${variables.hoursRemaining || '48'}h restantes - ${variables.bookTitle || 'Tu libro'}`,
        PT: `Lembrete: ${variables.hoursRemaining || '48'}h restantes - ${variables.bookTitle || 'Seu livro'}`,
      },
      READER_DEADLINE_72H: {
        EN: `Final Reminder: 72h Deadline - ${variables.bookTitle || 'Your Book'}`,
        ES: `Recordatorio final: fecha límite de 72h - ${variables.bookTitle || 'Tu libro'}`,
        PT: `Lembrete final: prazo de 72h - ${variables.bookTitle || 'Seu livro'}`,
      },
      READER_ASSIGNMENT_EXPIRED: {
        EN: `Assignment Expired - ${variables.bookTitle || 'Your Book'}`,
        ES: `Asignación expirada - ${variables.bookTitle || 'Tu libro'}`,
        PT: `Atribuição expirada - ${variables.bookTitle || 'Seu livro'}`,
      },
      READER_REVIEW_SUBMITTED: {
        EN: `Review Submitted Successfully - ${variables.bookTitle || 'Your Review'}`,
        ES: `Reseña enviada con éxito - ${variables.bookTitle || 'Tu reseña'}`,
        PT: `Avaliação enviada com sucesso - ${variables.bookTitle || 'Sua avaliação'}`,
      },
      READER_REVIEW_VALIDATED: {
        EN: `Review Approved - ${variables.bookTitle || 'Your Review'}`,
        ES: `Reseña aprobada - ${variables.bookTitle || 'Tu reseña'}`,
        PT: `Avaliação aprovada - ${variables.bookTitle || 'Sua avaliação'}`,
      },
      READER_REVIEW_REJECTED: {
        EN: `Review Needs Revision - ${variables.bookTitle || 'Your Review'}`,
        ES: `La reseña necesita revisión - ${variables.bookTitle || 'Tu reseña'}`,
        PT: `Avaliação precisa de revisão - ${variables.bookTitle || 'Sua avaliação'}`,
      },
      READER_PAYOUT_REQUESTED: {
        EN: `Payout Request Received - $${variables.amount || '0'}`,
        ES: `Solicitud de pago recibida - $${variables.amount || '0'}`,
        PT: `Solicitação de pagamento recebida - $${variables.amount || '0'}`,
      },
      READER_PAYOUT_COMPLETED: {
        EN: `Payout Completed - $${variables.amount || '0'} Sent`,
        ES: `Pago completado - $${variables.amount || '0'} enviado`,
        PT: `Pagamento concluído - $${variables.amount || '0'} enviado`,
      },

      // Author workflow
      AUTHOR_CAMPAIGN_STARTED: {
        EN: `Campaign Started - ${variables.bookTitle || 'Your Book'}`,
        ES: `Campaña iniciada - ${variables.bookTitle || 'Tu libro'}`,
        PT: `Campanha iniciada - ${variables.bookTitle || 'Seu livro'}`,
      },
      AUTHOR_CAMPAIGN_COMPLETED: {
        EN: `Campaign Completed - ${variables.bookTitle || 'Your Book'}`,
        ES: `Campaña completada - ${variables.bookTitle || 'Tu libro'}`,
        PT: `Campanha concluída - ${variables.bookTitle || 'Seu livro'}`,
      },
      AUTHOR_REPORT_READY: {
        EN: `Campaign Report Ready - ${variables.bookTitle || 'Your Book'}`,
        ES: `Informe de campaña listo - ${variables.bookTitle || 'Tu libro'}`,
        PT: `Relatório de campanha pronto - ${variables.bookTitle || 'Seu livro'}`,
      },
      AUTHOR_PAYMENT_RECEIVED: {
        EN: 'Payment Received - BookProof',
        ES: 'Pago recibido - BookProof',
        PT: 'Pagamento recebido - BookProof',
      },
      AUTHOR_PAYMENT_FAILED: {
        EN: 'Payment Failed - Action Required',
        ES: 'Pago fallido - Acción requerida',
        PT: 'Pagamento falhou - Ação necessária',
      },
      AUTHOR_CREDITS_EXPIRING_SOON: {
        EN: 'Your Credits Are Expiring Soon',
        ES: 'Tus créditos están por expirar',
        PT: 'Seus créditos estão expirando em breve',
      },
      AUTHOR_CREDITS_EXPIRED: {
        EN: 'Credits Have Expired',
        ES: 'Créditos expirados',
        PT: 'Créditos expiraram',
      },

      // Admin notifications
      ADMIN_NEW_ISSUE: {
        EN: `New Issue Reported - ${variables.issueType || 'Issue'}`,
        ES: `Nuevo problema reportado - ${variables.issueType || 'Problema'}`,
        PT: `Novo problema relatado - ${variables.issueType || 'Problema'}`,
      },
      ADMIN_URGENT_ISSUE: {
        EN: `🚨 URGENT: ${variables.issueType || 'Critical Issue'}`,
        ES: `🚨 URGENTE: ${variables.issueType || 'Problema crítico'}`,
        PT: `🚨 URGENTE: ${variables.issueType || 'Problema crítico'}`,
      },
      ADMIN_PAYOUT_REQUESTED: {
        EN: `New Payout Request - ${variables.paymentMethod || 'Payout'}`,
        ES: `Nueva solicitud de pago - ${variables.paymentMethod || 'Pago'}`,
        PT: `Nova solicitação de pagamento - ${variables.paymentMethod || 'Pagamento'}`,
      },
      ADMIN_NEW_AFFILIATE_APPLICATION: {
        EN: `New Affiliate Application - ${variables.userName || 'Applicant'}`,
        ES: `Nueva solicitud de afiliado - ${variables.userName || 'Solicitante'}`,
        PT: `Nova inscrição de afiliado - ${variables.userName || 'Candidato'}`,
      },
      ADMIN_CRITICAL_ERROR: {
        EN: `🚨 CRITICAL ERROR: ${variables.issueType || 'System Error'} [ID: ${variables.issueId}]`,
        ES: `🚨 ERROR CRÍTICO: ${variables.issueType || 'Error del sistema'} [ID: ${variables.issueId}]`,
        PT: `🚨 ERRO CRÍTICO: ${variables.issueType || 'Erro do sistema'} [ID: ${variables.issueId}]`,
      },
      ADMIN_NOTIFICATION: {
        EN: variables.subject ?? 'Message from BookProof Support',
        ES: variables.subject ?? 'Mensaje del soporte de BookProof',
        PT: variables.subject ?? 'Mensagem do suporte BookProof',
      },

      // Payments
      PAYMENT_RECEIVED: {
        EN: `Payment Receipt - $${variables.amount || '0'}`,
        ES: `Recibo de pago - $${variables.amount || '0'}`,
        PT: `Recibo de pagamento - $${variables.amount || '0'}`,
      },
      PAYMENT_FAILED: {
        EN: 'Payment Failed - Please Update Payment Method',
        ES: 'Pago fallido - Por favor actualice el método de pago',
        PT: 'Pagamento falhou - Por favor atualize o método de pagamento',
      },
      REFUND_PROCESSED: {
        EN: `Refund Processed - $${variables.amount || '0'}`,
        ES: `Reembolso procesado - $${variables.amount || '0'}`,
        PT: `Reembolso processado - $${variables.amount || '0'}`,
      },
      SUBSCRIPTION_RENEWED: {
        EN: 'Subscription Renewed Successfully',
        ES: 'Suscripción renovada exitosamente',
        PT: 'Assinatura renovada com sucesso',
      },
      SUBSCRIPTION_CANCELLED: {
        EN: 'Subscription Cancelled',
        ES: 'Suscripción cancelada',
        PT: 'Assinatura cancelada',
      },

      // Keyword research
      KEYWORD_RESEARCH_READY: {
        EN: 'Your Keyword Research Report is Ready',
        ES: 'Tu informe de investigación de palabras clave está listo',
        PT: 'Seu relatório de pesquisa de palavras-chave está pronto',
      },

      // Affiliate
      AFFILIATE_APPLICATION_APPROVED: {
        EN: 'Affiliate Application Approved!',
        ES: '¡Solicitud de afiliado aprobada!',
        PT: 'Solicitação de afiliado aprovada!',
      },
      AFFILIATE_APPLICATION_REJECTED: {
        EN: 'Affiliate Application Update',
        ES: 'Actualización de solicitud de afiliado',
        PT: 'Atualização de solicitação de afiliado',
      },
      AFFILIATE_PAYOUT_PROCESSED: {
        EN: `Commission Paid - $${variables.commissionAmount || '0'}`,
        ES: `Comisión pagada - $${variables.commissionAmount || '0'}`,
        PT: `Comissão paga - $${variables.commissionAmount || '0'}`,
      },
      AFFILIATE_NEW_REFERRAL: {
        EN: 'New Referral Registered!',
        ES: '¡Nuevo referido registrado!',
        PT: 'Nova indicação registrada!',
      },

      // Closer
      CLOSER_PAYMENT_RECEIVED: {
        EN: `Custom Package Payment - $${variables.amount || '0'}`,
        ES: `Pago de paquete personalizado - $${variables.amount || '0'}`,
        PT: `Pagamento de pacote personalizado - $${variables.amount || '0'}`,
      },
      CLOSER_ACCOUNT_CREATED: {
        EN: `Client Account Created - ${variables.clientName || 'New Client'}`,
        ES: `Cuenta de cliente creada - ${variables.clientName || 'Nuevo cliente'}`,
        PT: `Conta de cliente criada - ${variables.clientName || 'Novo cliente'}`,
      },

      // Author account created by Closer (sent to the author)
      AUTHOR_ACCOUNT_CREATED_BY_CLOSER: {
        EN: `Welcome to BookProof, ${variables.userName || 'there'}! Your Account is Ready`,
        ES: `¡Bienvenido a BookProof, ${variables.userName || 'usuario'}! Tu cuenta está lista`,
        PT: `Bem-vindo ao BookProof, ${variables.userName || 'usuário'}! Sua conta está pronta`,
      },

      // Closer package sent to client
      CLOSER_PACKAGE_SENT_TO_CLIENT: {
        EN: `Your Custom Package from BookProof - ${variables.packageName || 'Custom Package'}`,
        ES: `Tu paquete personalizado de BookProof - ${variables.packageName || 'Paquete personalizado'}`,
        PT: `Seu pacote personalizado do BookProof - ${variables.packageName || 'Pacote personalizado'}`,
      },

      // Reader admin actions
      READER_ASSIGNMENT_REASSIGNED: {
        EN: `Your Reading Assignment Has Been Changed - ${variables.newBookTitle || 'New Book'}`,
        ES: `Tu asignación de lectura ha sido cambiada - ${variables.newBookTitle || 'Nuevo libro'}`,
        PT: `Sua atribuição de leitura foi alterada - ${variables.newBookTitle || 'Novo livro'}`,
      },
      READER_ASSIGNMENT_CANCELLED: {
        EN: `Your Reading Assignment Has Been Cancelled - ${variables.bookTitle || 'Book'}`,
        ES: `Tu asignación de lectura ha sido cancelada - ${variables.bookTitle || 'Libro'}`,
        PT: `Sua atribuição de leitura foi cancelada - ${variables.bookTitle || 'Livro'}`,
      },
      READER_DEADLINE_EXTENDED: {
        EN: `Good News! Your Deadline Has Been Extended - ${variables.bookTitle || 'Book'}`,
        ES: `¡Buenas noticias! Tu fecha límite ha sido extendida - ${variables.bookTitle || 'Libro'}`,
        PT: `Boas notícias! Seu prazo foi estendido - ${variables.bookTitle || 'Livro'}`,
      },
      READER_RESUBMISSION_REQUESTED: {
        EN: `Please Update Your Review - ${variables.bookTitle || 'Book'}`,
        ES: `Por favor actualiza tu reseña - ${variables.bookTitle || 'Libro'}`,
        PT: `Por favor atualize sua avaliação - ${variables.bookTitle || 'Livro'}`,
      },
      READER_REPLACEMENT_ASSIGNED: {
        EN: `New Opportunity: Replacement Review Available - ${variables.bookTitle || 'Book'}`,
        ES: `Nueva oportunidad: Reseña de reemplazo disponible - ${variables.bookTitle || 'Libro'}`,
        PT: `Nova oportunidade: Avaliação de substituição disponível - ${variables.bookTitle || 'Livro'}`,
      },

      // Author credit adjustments
      AUTHOR_CREDITS_ADDED: {
        EN: `Credits Added to Your Account - ${variables.creditsAdded || 0} Credits`,
        ES: `Créditos añadidos a tu cuenta - ${variables.creditsAdded || 0} Créditos`,
        PT: `Créditos adicionados à sua conta - ${variables.creditsAdded || 0} Créditos`,
      },
      AUTHOR_CREDITS_REMOVED: {
        EN: `Credits Removed from Your Account - ${variables.creditsRemoved || 0} Credits`,
        ES: `Créditos eliminados de tu cuenta - ${variables.creditsRemoved || 0} Créditos`,
        PT: `Créditos removidos da sua conta - ${variables.creditsRemoved || 0} Créditos`,
      },
      AUTHOR_SUSPENDED: {
        EN: 'Important: Your BookProof Account Has Been Suspended',
        ES: 'Importante: Tu cuenta de BookProof ha sido suspendida',
        PT: 'Importante: Sua conta BookProof foi suspensa',
      },
      AUTHOR_UNSUSPENDED: {
        EN: 'Good News: Your BookProof Account Has Been Restored',
        ES: 'Buenas noticias: Tu cuenta de BookProof ha sido restaurada',
        PT: 'Boas notícias: Sua conta BookProof foi restaurada',
      },

      // Affiliate
      AFFILIATE_APPLICATION_RECEIVED: {
        EN: `Affiliate Application Received - BookProof`,
        ES: `Solicitud de afiliado recibida - BookProof`,
        PT: `Inscrição de afiliado recebida - BookProof`,
      },

      // Landing page
      LANDING_PAGE_WELCOME: {
        EN: `Welcome to BookProof, ${variables.userName || 'there'}! You're on the Waitlist`,
        ES: `¡Bienvenido a BookProof, ${variables.userName || 'usuario'}! Estás en la lista de espera`,
        PT: `Bem-vindo ao BookProof, ${variables.userName || 'usuário'}! Você está na lista de espera`,
      },
    };

    try {
      return subjects[type][language] || subjects[type][Language.EN];
    } catch (error) {
      this.logger.error(`Error getting subject for ${type} (${language}):`, error);
      return `BookProof - ${type}`;
    }
  }

  /**
   * Substitute variables in template
   */
  substituteVariables(template: string, variables: EmailVariables): string {
    let result = template;

    // Add default variables
    const allVariables = {
      ...variables,
      currentYear: variables.currentYear || new Date().getFullYear(),
      logoUrl: variables.logoUrl || 'https://bookproof.app/logo.png',
      supportUrl: variables.supportUrl || 'https://bookproof.app/support',
      unsubscribeUrl: variables.unsubscribeUrl || 'https://bookproof.app/unsubscribe',
    };

    // Replace all variables
    for (const [key, value] of Object.entries(allVariables)) {
      if (value !== undefined && value !== null) {
        const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(placeholder, String(value));
      }
    }

    return result;
  }

  /**
   * Get default hardcoded templates (fallback)
   */
  private getDefaultTemplate(type: EmailType, language: Language): string {
    const baseTemplate = this.getBaseTemplate(language);

    // Import template content from templates module
    const { getEmailTemplateContent } = require('./templates');
    const content = getEmailTemplateContent(type, language);

    return baseTemplate.replace('{{content}}', content);
  }

  /**
   * Get base HTML template structure
   */
  private getBaseTemplate(language: Language): string {
    return `
<!DOCTYPE html>
<html lang="${language.toLowerCase()}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>BookProof</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #2563eb;
      padding: 30px 20px;
      text-align: center;
    }
    .header img {
      max-width: 150px;
      height: auto;
    }
    .content {
      padding: 40px 30px;
    }
    .content h1 {
      color: #2563eb;
      font-size: 24px;
      margin-bottom: 20px;
      margin-top: 0;
    }
    .content p {
      margin-bottom: 15px;
      color: #4b5563;
    }
    .button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #1e40af;
    }
    .info-box {
      background-color: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-box {
      background-color: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 5px 0;
      font-size: 14px;
      color: #6b7280;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="{{logoUrl}}" alt="BookProof">
    </div>

    <div class="content">
      {{content}}
    </div>

    <div class="footer">
      <p>© {{currentYear}} BookProof. All rights reserved.</p>
      <p>
        <a href="{{supportUrl}}">Support</a> |
        <a href="{{unsubscribeUrl}}">Unsubscribe</a>
      </p>
      <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
        BookProof, Inc.<br>
        123 Publishing Way, Suite 100<br>
        San Francisco, CA 94105, USA
      </p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
