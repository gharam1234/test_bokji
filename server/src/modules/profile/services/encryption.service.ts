/**
 * 암호화 서비스
 * AES-256 암호화/복호화 및 해시 생성
 */

import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  
  // 암호화 키 (환경변수에서 가져오기, 실제 운영시에는 KMS 등 사용)
  private readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key!!';
  private readonly IV_LENGTH = 16;
  private readonly ALGORITHM = 'aes-256-cbc';

  /**
   * 문자열을 AES-256으로 암호화
   * @param plainText 암호화할 문자열
   * @returns 암호화된 Buffer
   */
  encrypt(plainText: string): Buffer {
    try {
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const key = this.getKey();
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
      
      let encrypted = cipher.update(plainText, 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      // IV + 암호화된 데이터를 합쳐서 반환
      return Buffer.concat([iv, encrypted]);
    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`);
      throw new Error('암호화 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 암호화된 Buffer를 복호화
   * @param encryptedData 암호화된 Buffer
   * @returns 복호화된 문자열
   */
  decrypt(encryptedData: Buffer): string {
    try {
      const iv = encryptedData.slice(0, this.IV_LENGTH);
      const encrypted = encryptedData.slice(this.IV_LENGTH);
      const key = this.getKey();
      
      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`);
      throw new Error('복호화 처리 중 오류가 발생했습니다.');
    }
  }

  /**
   * 숫자를 암호화
   * @param value 암호화할 숫자
   * @returns 암호화된 Buffer
   */
  encryptNumber(value: number): Buffer {
    return this.encrypt(value.toString());
  }

  /**
   * 암호화된 숫자를 복호화
   * @param encryptedData 암호화된 Buffer
   * @returns 복호화된 숫자
   */
  decryptNumber(encryptedData: Buffer): number {
    const decrypted = this.decrypt(encryptedData);
    return parseFloat(decrypted);
  }

  /**
   * 검색용 해시 생성 (SHA-256)
   * @param value 해시할 문자열
   * @returns 해시 문자열
   */
  hash(value: string): string {
    const salt = process.env.HASH_SALT || 'default-hash-salt';
    return crypto
      .createHash('sha256')
      .update(value + salt)
      .digest('hex');
  }

  /**
   * 암호화 키 생성 (32바이트)
   */
  private getKey(): Buffer {
    return crypto
      .createHash('sha256')
      .update(this.ENCRYPTION_KEY)
      .digest();
  }
}
