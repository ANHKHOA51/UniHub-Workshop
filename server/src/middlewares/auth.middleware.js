import { verifyToken } from '../utils/jwt.helper.js';

export async function isAuthenticated(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Access denied. No token provided.'
        });
    }

    try {
        req.user = verifyToken(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(403).json({
            message: 'Invalid or expired token.',
            error: error.message
        });
    }
};

export function isAuthorized(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden. Required role(s): ${allowedRoles.join(' or ')}`
            });
        }
        next();
    };
};
