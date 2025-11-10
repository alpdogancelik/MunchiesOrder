import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Image } from "expo-image";
import { z } from "zod";
import { images } from "@/constants";
import { useAddressActions, useAddresses } from "./hooks";
import type { AddressFormNavigation, AddressFormScreenProps } from "./types";

const schema = z.object({
    label: z.string().min(2, "Enter a helpful label."),
    line1: z.string().min(3, "Address line is required."),
    block: z.string().optional(),
    room: z.string().optional(),
    city: z.string().min(2, "City is required."),
    country: z.string().min(2, "Country is required."),
    isDefault: z.boolean(),
});

type FormState = z.infer<typeof schema>;
type FormErrors = Partial<Record<keyof FormState, string>>;

const buildInitialState = (options: { editing?: Partial<FormState>; defaultIsDefault: boolean }): FormState => ({
    label: options.editing?.label ?? "",
    line1: options.editing?.line1 ?? "",
    block: options.editing?.block ?? "",
    room: options.editing?.room ?? "",
    city: options.editing?.city ?? "",
    country: options.editing?.country ?? "",
    isDefault: options.editing?.isDefault ?? options.defaultIsDefault,
});

const AddressFormScreen = () => {
    const navigation = useNavigation<AddressFormNavigation>();
    const route = useRoute<AddressFormScreenProps["route"]>();
    const { addresses } = useAddresses();
    const { createAddress, updateAddress, isMutating } = useAddressActions();
    const addressId = route.params?.addressId;
    const editingAddress = useMemo(() => addresses.find((address) => address.id === addressId), [addressId, addresses]);

    const [form, setForm] = useState<FormState>(() =>
        buildInitialState({
            editing: editingAddress,
            defaultIsDefault: addresses.length === 0,
        }),
    );
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        setForm(
            buildInitialState({
                editing: editingAddress,
                defaultIsDefault: addresses.length === 0,
            }),
        );
    }, [editingAddress, addresses.length]);

    const handleChange = (field: keyof FormState, value: string | boolean) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async () => {
        const parsed = schema.safeParse(form);
        if (!parsed.success) {
            const nextErrors: FormErrors = {};
            parsed.error.issues.forEach((issue) => {
                const path = issue.path[0] as keyof FormState;
                nextErrors[path] = issue.message;
            });
            setErrors(nextErrors);
            return;
        }
        try {
            if (editingAddress) {
                await updateAddress({ ...editingAddress, ...parsed.data });
            } else {
                await createAddress(parsed.data);
            }
            navigation.goBack();
        } catch (error: any) {
            Alert.alert("Unable to save address", error?.message ?? "Please try again.");
        }
    };

    const screenTitle = editingAddress ? "Edit address" : "Add new address";

    const renderField = (
        label: string,
        field: keyof FormState,
        placeholder: string,
        keyboardType: "default" | "numeric" | "email-address" = "default",
    ) => (
        <View className="gap-2">
            <Text className="paragraph-semibold text-dark-100">{label}</Text>
            <TextInput
                value={form[field] as string}
                onChangeText={(text) => handleChange(field, text)}
                placeholder={placeholder}
                keyboardType={keyboardType}
                className="bg-white rounded-2xl px-4 py-3 border border-gray-200 text-dark-100"
                placeholderTextColor="#94A3B8"
                autoCapitalize="words"
            />
            {errors[field] ? <Text className="caption text-red-500">{errors[field]}</Text> : null}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.select({ ios: "padding", android: undefined })}
                keyboardVerticalOffset={80}
            >
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
                    <View className="flex-row items-center justify-between mb-6">
                        <TouchableOpacity
                            className="size-10 rounded-full bg-white items-center justify-center border border-gray-100"
                            onPress={() => navigation.goBack()}
                        >
                            <Image source={images.arrowBack} className="size-4" contentFit="contain" />
                        </TouchableOpacity>
                        <Text className="h4-bold text-dark-100">{screenTitle}</Text>
                        <View className="size-10" />
                    </View>

                    <View className="gap-5">
                        {renderField("Label", "label", "Dorm A - Room 204")}
                        {renderField("Address line", "line1", "Campus Residences")}
                        {renderField("Block / Building", "block", "Block A")}
                        {renderField("Room", "room", "Room 204")}
                        {renderField("City", "city", "Kalkanli")}
                        {renderField("Country", "country", "TRNC")}

                        <View className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-4 border border-gray-100">
                            <View className="flex-1 pr-4">
                                <Text className="paragraph-semibold text-dark-100">Make default</Text>
                                <Text className="body-medium text-dark-60">
                                    This address will appear first at checkout.
                                </Text>
                            </View>
                            <Switch
                                value={form.isDefault}
                                onValueChange={(value) => handleChange("isDefault", value)}
                                trackColor={{ false: "#CBD5F5", true: "#FE8C00" }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>
                </ScrollView>
                <View className="px-5 pb-8">
                    <TouchableOpacity
                        disabled={isMutating}
                        className={`rounded-full py-4 items-center ${isMutating ? "bg-gray-300" : "bg-primary"}`}
                        onPress={handleSubmit}
                    >
                        <Text className="paragraph-semibold text-white">{isMutating ? "Saving..." : "Save address"}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddressFormScreen;
