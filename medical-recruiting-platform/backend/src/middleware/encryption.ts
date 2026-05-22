import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

const SENSITIVE_FIELDS = [
  'ssn',
  'socialSecurityNumber',
  'taxId',
  'ein',
  'licenseNumber',
  'npiNumber',
  'phone',
  'address',
  'dateOfBirth'
];

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

export const decrypt = (encryptedText: string): string => {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const encryptionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Encrypt sensitive fields in request body
  if (req.body && typeof req.body === 'object') {
    encryptObject(req.body);
  }
  next();
};

function encryptObject(obj: any, path = '') {
  for (const key of Object.keys(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      if (typeof obj[key] === 'string' && obj[key].length > 0) {
        obj[key] = encrypt(obj[key]);
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      encryptObject(obj[key], currentPath);
    }
  }
}

export const decryptResponse = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  const decrypted = Array.isArray(data) ? [...data] : { ...data };

  for (const key of Object.keys(decrypted)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      if (typeof decrypted[key] === 'string' && decrypted[key].includes(':')) {
        try {
          decrypted[key] = decrypt(decrypted[key]);
        } catch {
          // Not encrypted, leave as-is
        }
      }
    } else if (typeof decrypted[key] === 'object' && decrypted[key] !== null) {
      decrypted[key] = decryptResponse(decrypted[key]);
    }
  }

  return decrypted;
};
