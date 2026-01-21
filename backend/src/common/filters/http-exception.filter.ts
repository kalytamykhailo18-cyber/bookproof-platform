import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuditService } from '../../modules/audit/audit.service';
import { EmailService } from '../../modules/email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { LogSeverity, EmailType, UserRole, Language } from '@prisma/client';
import { sanitizeError } from '../utils/log-sanitizer.util';

/**
 * Global exception filter that catches all HTTP exceptions and unhandled errors
 * Implements Section 16.1 and 16.2 requirements for error handling
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Generate unique error ID for support reference
    const errorId = uuidv4();

    // Determine status code and error message
    let status: number;
    let message: string;
    let errors: any = null;
    let stackTrace: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        errors = responseObj.errors || null;
      } else {
        message = exceptionResponse as string;
      }

      stackTrace = exception.stack;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
      stackTrace = exception.stack;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected error occurred';
      stackTrace = String(exception);
    }

    // User-facing error response (Section 16.1)
    const userErrorResponse = this.createUserErrorResponse(
      status,
      message,
      errors,
      errorId,
    );

    // Admin-facing error details (Section 16.2)
    const adminErrorDetails = this.createAdminErrorDetails(
      exception,
      request,
      status,
      message,
      errors,
      stackTrace,
      errorId,
    );

    // Log error for admin visibility
    this.logError(adminErrorDetails, request);

    // Send appropriate response
    response.status(status).json(userErrorResponse);
  }

  /**
   * Creates user-facing error response (Section 16.1)
   * - Generic messages for system errors
   * - Specific messages for validation errors
   * - Unique error ID for support reference
   */
  private createUserErrorResponse(
    status: number,
    message: string,
    errors: any,
    errorId: string,
  ) {
    // Section 16.1: Not Found (404)
    if (status === HttpStatus.NOT_FOUND) {
      return {
        statusCode: status,
        message: 'The requested resource was not found.',
        errorId,
        timestamp: new Date().toISOString(),
      };
    }

    // Section 16.1: Unauthorized (401)
    if (status === HttpStatus.UNAUTHORIZED) {
      return {
        statusCode: status,
        message: 'You must be logged in to access this resource.',
        errorId,
        timestamp: new Date().toISOString(),
      };
    }

    // Section 16.1: Forbidden (403)
    if (status === HttpStatus.FORBIDDEN) {
      return {
        statusCode: status,
        message: "You don't have permission to access this.",
        errorId,
        timestamp: new Date().toISOString(),
      };
    }

    // Section 16.1: Form Validation Errors (400)
    if (status === HttpStatus.BAD_REQUEST && errors) {
      return {
        statusCode: status,
        message: Array.isArray(message) ? message : [message],
        errors, // Field-level errors
        errorId,
        timestamp: new Date().toISOString(),
      };
    }

    // Section 16.1: System Errors (500)
    // Generic message for users, detailed info logged for admins
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      return {
        statusCode: status,
        message: 'Something went wrong. Please try again.',
        errorId, // User can reference this ID when contacting support
        timestamp: new Date().toISOString(),
      };
    }

    // Other client errors (4xx)
    return {
      statusCode: status,
      message: Array.isArray(message) ? message : [message],
      errors,
      errorId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Creates admin-facing error details (Section 16.2)
   * - Full error details
   * - Stack traces
   * - User context
   * - Request data
   */
  private createAdminErrorDetails(
    exception: unknown,
    request: Request,
    status: number,
    message: string,
    errors: any,
    stackTrace: string | undefined,
    errorId: string,
  ) {
    // Sanitize sensitive data from stack trace
    const sanitizedStackTrace = stackTrace
      ? sanitizeError(new Error(stackTrace)).stack
      : undefined;

    return {
      errorId,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      statusCode: status,
      message,
      errors,
      stackTrace: sanitizedStackTrace,
      userContext: {
        userId: (request as any).user?.id || null,
        userEmail: (request as any).user?.email || null,
        userRole: (request as any).user?.role || null,
      },
      requestData: {
        query: request.query,
        params: request.params,
        // Don't log request body for security (may contain sensitive data)
        // body: request.body,
      },
      headers: {
        userAgent: request.headers['user-agent'],
        referer: request.headers.referer,
        origin: request.headers.origin,
      },
      clientInfo: {
        ip:
          request.headers['x-forwarded-for'] ||
          request.headers['x-real-ip'] ||
          request.ip,
      },
    };
  }

  /**
   * Logs error for admin visibility (Section 16.2)
   */
  private async logError(adminErrorDetails: any, request: Request) {
    const { statusCode, message, errorId, stackTrace, userContext } =
      adminErrorDetails;

    // Determine log severity
    let severity: LogSeverity;
    if (statusCode >= 500) {
      severity = LogSeverity.CRITICAL;
    } else if (statusCode >= 400) {
      severity = LogSeverity.WARNING;
    } else {
      severity = LogSeverity.ERROR;
    }

    // Log to console for development
    if (severity === LogSeverity.CRITICAL) {
      this.logger.error(
        `[${errorId}] Critical Error: ${message}`,
        stackTrace,
      );
    } else {
      this.logger.warn(`[${errorId}] ${message}`);
    }

    // Log to database for admin visibility
    try {
      await this.auditService.logAdminAction({
        userId: userContext.userId || 'system',
        userEmail: userContext.userEmail || 'system',
        userRole: userContext.userRole || UserRole.AUTHOR,
        action: `HTTP_ERROR_${statusCode}`,
        entity: 'SYSTEM',
        entityId: errorId,
        changes: {
          errorId,
          path: adminErrorDetails.path,
          method: adminErrorDetails.method,
          message,
          stackTrace,
          userContext,
          requestData: adminErrorDetails.requestData,
          headers: adminErrorDetails.headers,
          clientInfo: adminErrorDetails.clientInfo,
        },
        severity,
        ipAddress: adminErrorDetails.clientInfo.ip as string,
      });

      // Section 16.2: Critical errors trigger admin email
      if (severity === LogSeverity.CRITICAL) {
        await this.sendCriticalErrorEmailToAdmins(adminErrorDetails);
      }
    } catch (logError) {
      // If logging fails, at least log to console
      this.logger.error('Failed to log error to database', logError);
    }
  }

  /**
   * Section 16.2: Send critical error notification email to all admins
   */
  private async sendCriticalErrorEmailToAdmins(errorDetails: any) {
    try {
      // Get all admin users
      const admins = await this.prisma.user.findMany({
        where: {
          role: UserRole.ADMIN,
        },
        select: {
          email: true,
          name: true,
          preferredLanguage: true,
        },
      });

      if (admins.length === 0) {
        this.logger.warn('No admin users found to notify about critical error');
        return;
      }

      // Send email to each admin
      const emailPromises = admins.map((admin: { email: string; name: string; preferredLanguage: Language }) =>
        this.emailService.sendTemplatedEmail(
          admin.email,
          EmailType.ADMIN_CRITICAL_ERROR,
          {
            adminName: admin.name,
            issueId: errorDetails.errorId,
            issueType: `HTTP ${errorDetails.statusCode} Error`,
            issueDescription: errorDetails.message,
            actionUrl: errorDetails.path,
            userName: errorDetails.userContext.userEmail || 'Unknown',
            userEmail: errorDetails.userContext.userEmail || 'system',
            reason: errorDetails.stackTrace || 'No stack trace available',
            dashboardUrl: '/admin/logs/errors',
          },
          undefined,
          admin.preferredLanguage || Language.EN,
        ),
      );

      await Promise.allSettled(emailPromises);

      this.logger.log(
        `Critical error notification sent to ${admins.length} admin(s)`,
      );
    } catch (emailError) {
      // Don't fail the error handler if email sending fails
      this.logger.error(
        'Failed to send critical error email to admins',
        emailError,
      );
    }
  }
}
