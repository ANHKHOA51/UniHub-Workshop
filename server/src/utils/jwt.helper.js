import jwt from 'jsonwebtoken';

export function generateToken(payload, secretKey, tokenLife) {
    if (!secretKey) {
        throw new Error('Secret key is required to sign token');
    }

    return jwt.sign(
        payload,
        secretKey,
        { algorithm: 'HS256', expiresIn: tokenLife }
    );
}

export function verifyToken(token, secretKey) {
    if (!secretKey) {
        throw new Error('Secret key is required to verify token');
    }

    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        throw new Error(`Token verification failed: ${error.message}`);
    }
}