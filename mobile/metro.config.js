const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the parent directory to watchFolders so Metro can find convex files
config.watchFolders = [
  path.resolve(__dirname, '..'), // Parent directory
];

// Configure resolver to handle the convex alias
config.resolver.alias = {
  convex: path.resolve(__dirname, '../convex'),
};

module.exports = config;