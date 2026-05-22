import { Request, Response, NextFunction } from 'express';
import { PrismaClient, HIPAAAction } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

const SENSITIVE_PATHS = [
  '/api/v1/providers',
  '/api/v1/employers',
  '/api/v1/credentials',
  '/api/v1/applications',
  '/api/v1/messages',
  '/api/v1/payments'
];

const isSensitiveOperation = (req: Request): boolean => {
  return SENSITIVE_PATHS.some(path => req.path.startsWith(path)) && 
         ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
};

export const hipaaAuditMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', async () => {
    if (!isSensitiveOperation(req)) return;

    try {
      const userId = (req as any).user?.id;
      const action = getHIPAAAction(req.method);
      const resourceType = getResourceType(req.path);

      await prisma.hIPAAAuditLog.create({
        data: {
          userId,
          action,
          resourceType,
          resourceId: req.params.id || req.body.id,
          details: {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            responseTime: Date.now() - startTime,
            query: Object.keys(req.query).length > 0 ? req.query : undefined
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          success: res.statusCode < 400
        }
      });
    } catch (error) {
      logger.error('HIPAA audit logging failed:', error);
    }
  });

  next();
};

function getHIPAAAction(method: string): HIPAAAction {
  switch (method) {
    case 'POST': return HIPAAAction.CREATE;
    case 'GET': return HIPAAAction.READ;
    case 'PUT':
    case 'PATCH': return HIPAAAction.UPDATE;
    case 'DELETE': return HIPAAAction.DELETE;
    default: return HIPAAAction.READ;
  }
}

function getResourceType(path: string): string {
  const segments = path.split('/');
  return segments[3] || 'unknown';
}

export const logHIPAAEvent = async (data: {
  userId?: string;
  action: HIPAAAction;
  resourceType: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  success: boolean;
  failureReason?: string;
}) => {
  try {
    await prisma.hIPAAAuditLog.create({ data });
  } catch (error) {
    logger.error('HIPAA event logging failed:', error);
  }
};
