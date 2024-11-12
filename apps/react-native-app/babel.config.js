module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.js', '.ts', '.tsx', '.json'],
        alias: {
          '@components': './src/components',
          '@containers': './src/containers',
          '@features': './src/features',
          '@graphql': './src/graphql',
          '@hooks': './src/hooks',
          '@navigators': './src/navigators',
          '@types': './src/types',
          '@utils': './src/utils',
          '@assets': './assets',
          '@client': './src/Client',
          '@store': './src/Store',
          '@redux': './src/redux',
        },
      },
    ],
  ],
};
