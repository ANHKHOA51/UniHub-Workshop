import bcrypt from 'bcrypt';
import { UserModel } from '../models/user.model.js';
import { generateToken } from '../utils/jwt.helper.js';

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
