import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/database';
import { logger } from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // Fail fast so we don't run with an insecure default and so developers see a clear error.
  throw new Error('JWT_SECRET environment variable is not set. Aborting startup.');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: number;
  email: string;
  name: string;
  isAdmin: boolean;
}

export function generateAccessToken(payload: TokenPayload): string {
  try {
    // jsonwebtoken expects jwt.Payload / JwtPayload and a jwt.Secret.
    // We cast to those types explicitly to satisfy TS while keeping runtime behavior unchanged.
    return jwt.sign(
      payload as unknown as jwt.JwtPayload,
      JWT_SECRET as unknown as jwt.Secret,
      { expiresIn: JWT_EXPIRES_IN }
    );
  } catch (err) {
    logger.error('Error signing JWT access token:', err);
    throw err;
  }
}

/**
 * Verify access token and return TokenPayload or null if invalid/expired.
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const verifiedUnknown = jwt.verify(
      token,
      JWT_SECRET as unknown as jwt.Secret
    ) as unknown;

    if (typeof verifiedUnknown === 'string') {
      // Unexpected: verify returned the raw string payload
      logger.debug('Access token verified to a string (unexpected).');
      return null;
    }

    // Now treat as object (JwtPayload). Do a runtime shape check instead of trusting TS cast.
    const obj = verifiedUnknown as Record<string, unknown> | undefined;
    if (!obj) return null;

    // Support two naming styles: { userId } or { sub } (subject)
    const userIdRaw = obj['userId'] ?? obj['sub'];
    const emailRaw = obj['email'];
    const nameRaw = obj['name'];
    const isAdminRaw = obj['isAdmin'];

    // Validate types
    const userId =
      typeof userIdRaw === 'number'
        ? userIdRaw
        : typeof userIdRaw === 'string' && /^\d+$/.test(userIdRaw)
        ? parseInt(userIdRaw, 10)
        : null;

    if (!userId) return null;
    if (typeof emailRaw !== 'string') return null;
    if (typeof nameRaw !== 'string') return null;
    const isAdmin = typeof isAdminRaw === 'boolean' ? isAdminRaw : false;

    return {
      userId,
      email: emailRaw,
      name: nameRaw,
      isAdmin,
    };
  } catch (err) {
    logger.debug('Access token verification failed:', err);
    return null;
  }
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

export async function createRefreshToken(userId: number): Promise<string> {
  const token = generateRefreshToken();
  const expiresAt = new Date();

  // Parse the expiration time
  const expiresInMs = parseExpirationTime(REFRESH_TOKEN_EXPIRES_IN);
  expiresAt.setTime(expiresAt.getTime() + expiresInMs);

  try {
    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  } catch (error) {
    logger.error('Error creating refresh token:', error);
    throw new Error('Failed to create refresh token');
  }
}

export async function validateRefreshToken(token: string): Promise<number | null> {
  try {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      return null;
    }

    if (refreshToken.expiresAt < new Date()) {
      // Token expired, clean it up
      await prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      });
      return null;
    }

    return refreshToken.userId;
  } catch (error) {
    logger.error('Error validating refresh token:', error);
    return null;
  }
}

export async function revokeRefreshToken(token: string): Promise<void> {
  try {
    await prisma.refreshToken.delete({
      where: { token },
    });
  } catch (error) {
    logger.error('Error revoking refresh token:', error);
    // Do not rethrow - revoke is best-effort
  }
}

export async function revokeAllUserRefreshTokens(userId: number): Promise<void> {
  try {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  } catch (error) {
    logger.error('Error revoking all user refresh tokens:', error);
    throw new Error('Failed to revoke refresh tokens');
  }
}

export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (result.count > 0) {
      logger.info(`Cleaned up ${result.count} expired refresh tokens`);
    }
  } catch (error) {
    logger.error('Error cleaning up expired tokens:', error);
  }
}

function parseExpirationTime(timeString: string): number {
  const match = timeString.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiration time format: ${timeString}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Invalid time unit: ${unit}`);
  }
}

// Only start periodic cleanup outside of test environment.
if (process.env.NODE_ENV !== 'test') {
  setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
}
