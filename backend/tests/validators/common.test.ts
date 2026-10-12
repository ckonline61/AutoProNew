import {
  objectIdSchema,
  paginationSchema,
  phoneSchema,
  emailSchema,
  passwordSchema,
  pincodeSchema,
  latitudeSchema,
  longitudeSchema,
} from '../../src/validators/common';

describe('Common Validators', () => {
  describe('objectIdSchema', () => {
    it('should accept valid ObjectId', () => {
      expect(objectIdSchema.parse('507f1f77bcf86cd799439011')).toBe('507f1f77bcf86cd799439011');
    });

    it('should reject invalid ObjectId', () => {
      expect(() => objectIdSchema.parse('invalid')).toThrow();
      expect(() => objectIdSchema.parse('123')).toThrow();
    });
  });

  describe('paginationSchema', () => {
    it('should use defaults', () => {
      const result = paginationSchema.parse({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sort).toBe('createdAt');
      expect(result.order).toBe('desc');
    });

    it('should parse string values', () => {
      const result = paginationSchema.parse({ page: '2', limit: '50' });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it('should reject invalid page', () => {
      expect(() => paginationSchema.parse({ page: '0' })).toThrow();
    });

    it('should reject limit over 100', () => {
      expect(() => paginationSchema.parse({ limit: '101' })).toThrow();
    });
  });

  describe('phoneSchema', () => {
    it('should accept valid Indian phone numbers', () => {
      expect(phoneSchema.parse('9876543210')).toBe('9876543210');
      expect(phoneSchema.parse('6000000000')).toBe('6000000000');
    });

    it('should reject invalid phone numbers', () => {
      expect(() => phoneSchema.parse('1234567890')).toThrow(); // starts with 1
      expect(() => phoneSchema.parse('987654321')).toThrow(); // 9 digits
      expect(() => phoneSchema.parse('98765432100')).toThrow(); // 11 digits
    });
  });

  describe('emailSchema', () => {
    it('should accept valid emails and lowercase them', () => {
      expect(emailSchema.parse('User@Example.COM')).toBe('user@example.com');
    });

    it('should reject invalid emails', () => {
      expect(() => emailSchema.parse('notanemail')).toThrow();
      expect(() => emailSchema.parse('')).toThrow();
    });
  });

  describe('passwordSchema', () => {
    it('should accept valid passwords', () => {
      expect(passwordSchema.parse('password123')).toBe('password123');
    });

    it('should reject short passwords', () => {
      expect(() => passwordSchema.parse('short')).toThrow();
    });

    it('should reject passwords over 128 characters', () => {
      expect(() => passwordSchema.parse('a'.repeat(129))).toThrow();
    });
  });

  describe('pincodeSchema', () => {
    it('should accept valid 6-digit pincode', () => {
      expect(pincodeSchema.parse('110001')).toBe('110001');
    });

    it('should reject invalid pincodes', () => {
      expect(() => pincodeSchema.parse('1234')).toThrow();
      expect(() => pincodeSchema.parse('1234567')).toThrow();
    });
  });

  describe('coordinate schemas', () => {
    it('should accept valid latitude', () => {
      expect(latitudeSchema.parse(28.6139)).toBe(28.6139);
      expect(latitudeSchema.parse(-90)).toBe(-90);
      expect(latitudeSchema.parse(90)).toBe(90);
    });

    it('should reject invalid latitude', () => {
      expect(() => latitudeSchema.parse(91)).toThrow();
      expect(() => latitudeSchema.parse(-91)).toThrow();
    });

    it('should accept valid longitude', () => {
      expect(longitudeSchema.parse(77.209)).toBe(77.209);
    });

    it('should reject invalid longitude', () => {
      expect(() => longitudeSchema.parse(181)).toThrow();
      expect(() => longitudeSchema.parse(-181)).toThrow();
    });
  });
});
