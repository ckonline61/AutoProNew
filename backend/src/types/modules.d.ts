declare module 'bcryptjs' {
  export function hash(s: string, salt: number | string): Promise<string>;
  export function hashSync(s: string, salt?: number | string): string;
  export function compare(s: string, hash: string): Promise<boolean>;
  export function compareSync(s: string, hash: string): boolean;
  export function genSalt(rounds?: number): Promise<string>;
  export function genSaltSync(rounds?: number): string;
  const bcrypt: {
    hash: typeof hash;
    hashSync: typeof hashSync;
    compare: typeof compare;
    compareSync: typeof compareSync;
    genSalt: typeof genSalt;
    genSaltSync: typeof genSaltSync;
  };
  export default bcrypt;
}

declare module 'jsonwebtoken' {
  export type Secret = string | Buffer;
  export interface SignOptions {
    expiresIn?: string | number;
    algorithm?: string;
    issuer?: string;
    subject?: string;
    audience?: string | string[];
    noTimestamp?: boolean;
    header?: Record<string, unknown>;
  }
  export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | RegExp | Array<string | RegExp>;
    issuer?: string | string[];
    ignoreExpiration?: boolean;
    subject?: string;
  }
  export interface JwtPayload {
    [key: string]: unknown;
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
  }
  export class JsonWebTokenError extends Error {
    inner?: Error;
  }
  export class TokenExpiredError extends JsonWebTokenError {
    expiredAt: Date;
  }
  export class NotBeforeError extends JsonWebTokenError {
    date: Date;
  }

  export function sign(payload: string | Buffer | object, secretOrPrivateKey: Secret, options?: SignOptions): string;
  export function verify(token: string, secretOrPublicKey: Secret, options?: VerifyOptions): JwtPayload | string;
  export function decode(token: string, options?: { complete?: boolean; json?: boolean }): null | JwtPayload | string;

  const jwt: {
    sign: typeof sign;
    verify: typeof verify;
    decode: typeof decode;
    JsonWebTokenError: typeof JsonWebTokenError;
    TokenExpiredError: typeof TokenExpiredError;
    NotBeforeError: typeof NotBeforeError;
  };
  export default jwt;
}
