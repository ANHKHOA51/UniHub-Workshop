// ============================================================
// UniHub Workshop — QR Verification Service (Ed25519)
// Xác minh chữ ký số trên mã QR check-in
// ============================================================

import { USE_MOCK_DATA } from '@/constants/config';
import * as ed from '@noble/ed25519';
import { ED25519_PUBLIC_KEY } from '@/constants/config';

import { sha512 } from '@noble/hashes/sha2.js';

ed.hashes.sha512 = sha512;
ed.hashes.sha512Async = async (msg) => sha512(msg);

/**
 * Cấu trúc mã QR: "{registration_id}.{signature_hex}"
 *
 * Ví dụ: "550e8400-e29b-41d4.a1b2c3d4e5f6..."
 *
 * - registration_id (payload): UUID của đăng ký
 * - signature: Chữ ký Ed25519 ở dạng hex
 */

interface QrParseResult {
  isValid: boolean;
  registrationId: string | null;
  error?: string;
}

/**
 * Parse và xác minh mã QR.
 *
 * Lớp 1: Tách chuỗi QR thành payload + signature
 * Lớp 2: Xác minh chữ ký bằng Public Key (Ed25519)
 *
 * Khi USE_MOCK_DATA = true, chấp nhận mọi QR có dạng "reg-xxx" (mock)
 * hoặc dạng "payload.signature" và bỏ qua bước verify signature.
 */
export async function verifyQrCode(qrData: string): Promise<QrParseResult> {
  if (!qrData || qrData.trim().length === 0) {
    return { isValid: false, registrationId: null, error: 'Mã QR trống' };
  }

  const trimmed = qrData.trim();

  // ─── Mock mode: chấp nhận registration ID trực tiếp ─────
  if (USE_MOCK_DATA) {
    // Trong mock mode, QR code chứa trực tiếp registration_id
    // (không có chữ ký)
    if (trimmed.startsWith('reg-')) {
      return { isValid: true, registrationId: trimmed };
    }

    // Hoặc dạng payload.signature (bỏ qua verify)
    const dotIndex = trimmed.lastIndexOf('.');
    if (dotIndex > 0) {
      const payload = trimmed.substring(0, dotIndex);
      return { isValid: true, registrationId: payload };
    }

    // Nếu không match → coi như QR giả mạo
    return { isValid: false, registrationId: null, error: 'Mã QR không hợp lệ' };
  }

  // ─── Production mode: verify Ed25519 signature ──────────
  const dotIndex = trimmed.lastIndexOf('.');
  if (dotIndex <= 0 || dotIndex === trimmed.length - 1) {
    return {
      isValid: false,
      registrationId: null,
      error: 'Mã QR không đúng định dạng (thiếu chữ ký)',
    };
  }

  const payload = trimmed.substring(0, dotIndex);
  const signatureHex = trimmed.substring(dotIndex + 1);

  try {
    // Decode public key from base64
    const publicKeyBytes = Uint8Array.from(atob(ED25519_PUBLIC_KEY), (c) => c.charCodeAt(0));

    // Decode signature from hex
    const signatureBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    // Encode payload to Uint8Array
    const payloadBytes = new TextEncoder().encode(payload);

    // Verify signature
    const isValid = await ed.verifyAsync(signatureBytes, payloadBytes, publicKeyBytes);

    if (!isValid) {
      return {
        isValid: false,
        registrationId: null,
        error: 'Chữ ký số không hợp lệ — QR có thể bị giả mạo',
      };
    }

    return { isValid: true, registrationId: payload };
  } catch (error) {
    return {
      isValid: false,
      registrationId: null,
      error: `Lỗi xác minh chữ ký: ${error instanceof Error ? error.message : 'Unknown'}`,
    };
  }
}
