//babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // CÁC PLUGIN KHÁC CỦA BẠN (NẾU CÓ) CÓ THỂ Ở ĐÂY
      // ...
      // QUAN TRỌNG: 'react-native-reanimated/plugin' PHẢI LÀ PLUGIN CUỐI CÙNG TRONG MẢNG NÀY
      'react-native-reanimated/plugin', 
    ],
  };
};
