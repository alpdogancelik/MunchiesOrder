const { withNativeWind } = require('nativewind/metro');
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sharedPath = path.resolve(projectRoot, '..', 'shared');

const baseConfig = getDefaultConfig(projectRoot);

// Preserve monorepo watchFolders if used
baseConfig.watchFolders = [sharedPath];
baseConfig.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(projectRoot, '..', 'node_modules'),
];

module.exports = withNativeWind(baseConfig, { input: './app/globals.css' });
