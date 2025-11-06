module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel"
        ],
        plugins: [
            // Required by expo-router for improved performance & animations
            ["react-native-worklets/plugin"],
            // Reanimated must come last per its docs
            require.resolve("react-native-reanimated/plugin")
        ]
    };
};
