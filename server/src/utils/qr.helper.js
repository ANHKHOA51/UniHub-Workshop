import crypto from 'crypto';

let privateKey;
const envKey = process.env.ED25519_PRIVATE_KEY;

if (envKey) {
    try {
        const pemKey = envKey.replace(/\\n/g, '\n');
        privateKey = crypto.createPrivateKey(pemKey);
    } catch (error) {
        console.error('Failed to parse ED25519_PRIVATE_KEY:', error.message);
    }
}

if (!privateKey) {
    console.warn('WARNING: Valid ED25519_PRIVATE_KEY is not set. Generating a temporary Ed25519 key for development.');
    const { privateKey: tempKey } = crypto.generateKeyPairSync('ed25519');
    privateKey = tempKey;
}

export const generateQrData = (payload) => {
    if (!payload) throw new Error('Payload is required to generate QR data');
    
    const payloadBuffer = Buffer.from(payload);
    
    const signatureBuffer = crypto.sign(null, payloadBuffer, privateKey);
    
    const signature = signatureBuffer.toString('hex');
    
    return `${payload}.${signature}`;
};
