import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/src/theme";

type SectionHeaderProps = {
    title: string;
    actionLabel?: string;
    onActionPress?: () => void;
};

export const SectionHeader = ({
    title,
    actionLabel = "See all",
    onActionPress,
}: SectionHeaderProps) => {
    const { theme } = useTheme();
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: theme.spacing.sm,
            }}
        >
            <Text
                style={{
                    fontFamily: "QuickSand-Bold",
                    fontSize: theme.typography.h2,
                    color: theme.colors.ink,
                }}
            >
                {title}
            </Text>
            {onActionPress ? (
                <TouchableOpacity onPress={onActionPress}>
                    <Text
                        style={{
                            color: theme.colors.primary,
                            fontFamily: "QuickSand-SemiBold",
                        }}
                    >
                        {actionLabel}
                    </Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

export default SectionHeader;
