import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model.js';
import { RefreshTokenModel } from '../models/refresh_token.model.js';
import { generateToken, verifyToken } from '../utils/jwt.helper.js';

export const loginUser = async (email, password) => {
    const user = await UserModel.findByEmail(email);
    if (!user) {
        const error = new Error('Email hoặc mật khẩu không đúng');
        error.status = 401;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error('Email hoặc mật khẩu không đúng');
        error.status = 401;
        throw error;
    }

    const payload = {
        userId: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role,
    };

    const accessToken = generateToken(
        payload,
        process.env.JWT_SECRET,
        '7d'
    );

    const refreshToken = generateToken(
        payload,
        process.env.JWT_SECRET,
        '30d'
    );

    // Lưu Refresh Token vào Database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await RefreshTokenModel.create({
        user_id: user.id,
        token: refreshToken,
        expires_at: expiresAt
    });

    return {
        user: {
            id: user.id,
            email: user.email,
            fullName: user.name,
            role: user.role,
        },
        tokens: {
            accessToken,
            refreshToken,
        },
    };
};

export const refreshToken = async (token) => {
    // 1. Kiểm tra token có trong DB không
    const savedToken = await RefreshTokenModel.findByToken(token);
    if (!savedToken) {
        throw { status: 401, message: 'Refresh token không hợp lệ' };
    }

    // 2. Kiểm tra token đã hết hạn chưa
    if (new Date(savedToken.expires_at) < new Date()) {
        await RefreshTokenModel.deleteByToken(token);
        throw { status: 401, message: 'Refresh token đã hết hạn' };
    }

    // 3. Verify JWT
    try {
        const decoded = verifyToken(token, process.env.JWT_SECRET);
        
        // 4. Tạo Access Token mới
        const payload = {
            userId: decoded.userId,
            email: decoded.email,
            fullName: decoded.fullName,
            role: decoded.role,
        };

        const accessToken = generateToken(
            payload,
            process.env.JWT_SECRET,
            '7d'
        );

        return { accessToken };
    } catch (err) {
        await RefreshTokenModel.deleteByToken(token);
        throw { status: 401, message: 'Refresh token không hợp lệ hoặc đã bị thu hồi' };
    }
};
