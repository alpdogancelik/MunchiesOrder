export type ColorRoles = {
    primary: string;
    ink: string;
    surface: string;
    muted: string;
    success: string;
    warning: string;
    danger: string;
    border: string;
};

export type RadiusScale = {
    sm: number;
    md: number;
    lg: number;
    xl: number;
};

export type SpacingScale = {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    "2xl": number;
};

export type TypographyScale = {
    h1: number;
    h2: number;
    body: number;
    caption: number;
};

export const lightColors: ColorRoles = {
    primary: "#FF8C42",
    ink: "#0F172A",
    surface: "#FFFFFF",
    muted: "#A0AEC0",
    success: "#22C55E",
    warning: "#FACC15",
    danger: "#F87171",
    border: "#E2E8F0",
};

export const darkColors: ColorRoles = {
    primary: "#FFB66E",
    ink: "#F5F7FB",
    surface: "#11131A",
    muted: "#7B879B",
    success: "#4ADE80",
    warning: "#FCD34D",
    danger: "#FB7185",
    border: "#262A38",
};

export const radius: RadiusScale = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
};

export const spacing: SpacingScale = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
};

export const typography: TypographyScale = {
    h1: 28,
    h2: 22,
    body: 16,
    caption: 12,
};
