const { getDefaultConfig } = require("@expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [...defaultConfig.resolver.sourceExts, "jsx", "js", "ts", "tsx", "json"],
    assetExts: [...defaultConfig.resolver.assetExts],
  },
  transformer: {
    ...defaultConfig.transformer,
    assetPlugins: ["expo-asset/tools/hashAssetFiles"],
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
};
