// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native-maps n'a pas de support web et importe des modules natifs de
// react-native qui font échouer le bundle web. expo-router embarque map.tsx
// dans le bundle de toutes les plateformes via require.context, donc on
// remplace react-native-maps par un module vide sur web. L'UI web réelle de
// l'écran carte est dans app/(tabs)/map.web.tsx.
const upstreamResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return { type: 'empty' };
  }
  if (upstreamResolveRequest) {
    return upstreamResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
