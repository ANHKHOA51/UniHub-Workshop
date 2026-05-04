const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Hỗ trợ biên dịch file .wasm cho thư viện expo-sqlite chạy trên nền Web
config.resolver.assetExts.push('wasm');

module.exports = config;
