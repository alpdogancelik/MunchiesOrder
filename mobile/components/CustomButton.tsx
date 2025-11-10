import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import cn from "clsx";

const CustomButton = ({
    onPress,
    title = "Click Me",
    style,
    textStyle,
    leftIcon,
    isLoading = false,
    disabled = false,
}: {
    onPress?: () => void;
    title?: string;
    style?: string;
    textStyle?: string;
    leftIcon?: React.ReactNode;
    isLoading?: boolean;
    disabled?: boolean;
}) => {
    const isBusy = isLoading || disabled;

    return (
        <TouchableOpacity
            className={cn('custom-btn', style, isBusy && 'opacity-60')}
            disabled={isBusy}
            onPress={onPress}
        >
            {leftIcon}

            <View className="flex-center flex-row">
                {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Text className={cn('text-white-100 paragraph-semibold', textStyle)}>
                        {title}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    )
}
export default CustomButton
