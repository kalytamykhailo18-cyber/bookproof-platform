import { Language } from '@prisma/client';

/**
 * Complete remaining email templates - Part 3
 * PAYMENT, KEYWORD_RESEARCH, AFFILIATE, CLOSER workflows
 */

export const completeRemainingTemplates = {
  // Payment emails (5 templates)
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

  // Keyword Research (1 template)
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

  // Affiliate emails (4 templates)
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

  // Closer emails (2 templates)
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
};
