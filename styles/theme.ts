// styles/theme.ts
import {
    MD3LightTheme as DefaultLightTheme,
    MD3DarkTheme as DefaultDarkTheme,
    configureFonts,
    MD3Theme, // Import MD3Theme type
    // adaptNavigationTheme // You might need this if integrating with React Navigation themes
} from 'react-native-paper';
import type { ThemeProp } from 'react-native-paper/lib/typescript/types'; // For better typing

// Định nghĩa font chuẩn (tùy chọn, bạn có thể bỏ qua nếu dùng font mặc định)
const fontConfig = {
    // Bạn có thể tùy chỉnh font cho các variant khác nhau ở đây
    // Ví dụ:
    // regular: {
    //   fontFamily: 'Roboto-Regular',
    //   fontWeight: 'normal',
    // },
    // medium: {
    //   fontFamily: 'Roboto-Medium',
    //   fontWeight: 'normal',
    // },
    // Hoặc để trống để dùng font mặc định của Paper
} as const; // Use 'as const' for stricter type checking if defining font variants

// Màu sắc tùy chỉnh của bạn
const customLightColors = {
    primary: "#caa26a",
    // primaryVariant: "#dac296", // MD3 không còn dùng primaryVariant, thay vào đó là surfaceVariant, primaryContainer
    onPrimary: "#ffffff",
    primaryContainer: "#ffecd1", // Màu nền cho các component nhấn mạnh màu primary
    onPrimaryContainer: "#2c1600", // Màu chữ/icon trên primaryContainer

    secondary: "#496783",
    onSecondary: "#ffffff",
    secondaryContainer: "#d1e4f9", // Tương tự primaryContainer cho secondary
    onSecondaryContainer: "#001e30",

    tertiary: "#a0522d", // Ví dụ thêm màu tertiary
    onTertiary: "#ffffff",
    tertiaryContainer: "#ffdbc7",
    onTertiaryContainer: "#381000",

    background: "#fcfcff", // Nền chính của ứng dụng
    surface: "#fcfcff",    // Nền của các component như Card, Modal
    surfaceVariant: "#e7e0eb", // Nền cho các component ít nổi bật hơn
    onSurface: "#1c1b1f",      // Màu chữ/icon trên background và surface
    onSurfaceVariant: "#49454f",// Màu chữ/icon trên surfaceVariant (thường dùng cho label, placeholder)
    
    outline: '#79747e',        // Màu viền
    outlineVariant: '#cac4d0', // Màu viền ít nổi bật hơn

    error: "#ba1a1a",
    onError: "#ffffff",
    errorContainer: "#ffdad6",
    onErrorContainer: "#410002",

    // Các màu khác bạn có thể muốn tùy chỉnh
    // surfaceDisabled: 'rgba(28, 27, 31, 0.12)',
    // onSurfaceDisabled: 'rgba(28, 27, 31, 0.38)',
    // backdrop: 'rgba(49, 48, 51, 0.4)',
};

const customDarkColors = {
    primary: "#caa26a", // Giữ nguyên hoặc điều chỉnh cho dark mode
    onPrimary: "#4a2c00", // Màu chữ/icon trên primary trong dark mode
    primaryContainer: "#694219", // Nền cho component nhấn mạnh màu primary trong dark mode
    onPrimaryContainer: "#ffecd1",

    secondary: "#adc8e2", // Màu secondary sáng hơn cho dark mode
    onSecondary: "#1c3349",
    secondaryContainer: "#334b61",
    onSecondaryContainer: "#d1e4f9",

    tertiary: "#ffb68c",
    onTertiary: "#5c1d00",
    tertiaryContainer: "#8c360a",
    onTertiaryContainer: "#ffdbc7",

    background: "#1c1b1f",
    surface: "#1c1b1f", // Trong MD3 dark, surface thường giống background
    surfaceVariant: "#49454f",
    onSurface: "#e6e1e5",
    onSurfaceVariant: "#cac4d0",

    outline: '#938f99',
    outlineVariant: '#49454f',

    error: "#ffb4ab",
    onError: "#690005",
    errorContainer: "#93000a",
    onErrorContainer: "#ffdad6",

    // highlight:"#322222" // 'highlight' không phải là key chuẩn của MD3, cân nhắc dùng surfaceVariant hoặc elevation
};


export const AppLightTheme: MD3Theme = {
    ...DefaultLightTheme, // Kế thừa tất cả thuộc tính từ theme MD3 light mặc định
    roundness: 8, // Ví dụ: Tùy chỉnh độ bo góc chung
    colors: {
        ...DefaultLightTheme.colors, // Kế thừa tất cả màu sắc từ theme MD3 light mặc định
        ...customLightColors,       // Ghi đè với các màu tùy chỉnh của bạn
    },
    // fonts: configureFonts({config: fontConfig, isV3: true}), // Bỏ isV3 nếu dùng Paper v5 mặc định là MD3
    fonts: configureFonts({config: fontConfig }), // Sử dụng configureFonts cho MD3
    // elevation vẫn sẽ được kế thừa từ DefaultLightTheme
};

export const AppDarkTheme: MD3Theme = {
    ...DefaultDarkTheme,
    roundness: 8,
    colors: {
        ...DefaultDarkTheme.colors,
        ...customDarkColors,
    },
    // fonts: configureFonts({config: fontConfig, isV3: true}),
    fonts: configureFonts({config: fontConfig }),
    // elevation vẫn sẽ được kế thừa từ DefaultDarkTheme
};

// Helper để sử dụng theme trong NavigationContainer (nếu cần)
// export const NavigationLightTheme = {
//   ...NavigationDefaultTheme,
//   colors: {
//     ...NavigationDefaultTheme.colors,
//     primary: AppLightTheme.colors.primary,
//     background: AppLightTheme.colors.background,
//     card: AppLightTheme.colors.surface,
//     text: AppLightTheme.colors.onSurface,
//     border: AppLightTheme.colors.outline,
//     notification: AppLightTheme.colors.error, // Hoặc một màu thông báo riêng
//   },
// };

// export const NavigationDarkTheme = {
//   ...NavigationDarkThemeColors, // This should be NavigationDarkTheme from @react-navigation/native
//   colors: {
//     ...NavigationDarkThemeColors.colors,
//     primary: AppDarkTheme.colors.primary,
//     background: AppDarkTheme.colors.background,
//     card: AppDarkTheme.colors.surface,
//     text: AppDarkTheme.colors.onSurface,
//     border: AppDarkTheme.colors.outline,
//     notification: AppDarkTheme.colors.error,
//   },
// };

