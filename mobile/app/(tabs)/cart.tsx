import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useCartStore } from "@/store/cart.store";
import { images } from "@/constants";
import useServerResource from "@/lib/useServerResource";
import { createOrder, getAddresses } from "@/lib/api";
import type { CartItemType } from "@/type";

const cardShadow = {
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
};
const ADDRESS_SKELETON_COUNT = 3;
const ADDRESS_SKELETONS = Array.from({ length: ADDRESS_SKELETON_COUNT }, (_, index) => index);
const ADDRESS_PILL_SKELETON_STYLE = {
    width: 110,
    height: 44,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
    opacity: 0.6,
};
const ADDRESS_TAB_SKELETON_STYLE = {
    width: 90,
    height: 40,
    borderRadius: 9999,
    backgroundColor: "#E2E8F0",
    opacity: 0.6,
};
const CONTAINER_PADDING = { paddingHorizontal: 24 };

type PaymentMethod = "card_pos" | "online" | "cash";
type TipOption = "0" | "10" | "15" | "20" | "custom";

const paymentOptions: { id: PaymentMethod; label: string; description: string }[] = [
    { id: "card_pos", label: "Card on delivery (POS)", description: "Courier brings a wireless POS" },
    { id: "online", label: "Online card", description: "Coming soon" },
    { id: "cash", label: "Cash", description: "Pay at the door" },
];

const formatCurrency = (value: number) => `TRY ${value.toFixed(2)}`;

const getCustomizationsTotal = (customizations?: CartItemType["customizations"]) =>
    customizations?.reduce((sum, option) => sum + Number(option.price || 0), 0) ?? 0;

const getCartItemKey = (item: CartItemType) => {
    const customizationKey = (item.customizations ?? [])
        .map((c) => c.id)
        .sort()
        .join("_");
    return customizationKey ? `${item.id}-${customizationKey}` : item.id;
};

type CartItemWithRestaurant = CartItemType & { restaurantId?: number };

const CartCard = ({
    item,
    onIncrease,
    onDecrease,
    onRemove,
}: {
    item: CartItemType;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove: () => void;
}) => {
    const price = Number(item.price || 0);
    const customizationTotal = getCustomizationsTotal(item.customizations);
    const total = (price + customizationTotal) * (item.quantity || 1);
    const chips = (item.customizations || []).map((c) => c.name).join(" / ");

    return (
        <View className="bg-white rounded-[32px] flex-row gap-4 p-4" style={cardShadow}>
            <View className="w-24 h-24 rounded-3xl bg-[#FFF4EC] items-center justify-center overflow-hidden">
                <Image
                    source={item.image_url ? { uri: item.image_url } : images.burgerTwo}
                    className="w-full h-full"
                    contentFit="cover"
                    transition={200}
                />
            </View>
            <View className="flex-1 justify-between">
                <View className="gap-1">
                    <Text className="text-xl font-quicksand-bold text-dark-100" numberOfLines={1}>{item.name}</Text>
                    {chips ? (
                        <Text className="body-medium text-dark-60" numberOfLines={1}>{chips}</Text>
                    ) : (
                        <Text className="body-medium text-dark-60">Campus favorite</Text>
                    )}
                </View>
                <View className="flex-row items-center gap-3">
                    <TouchableOpacity className="size-10 rounded-full bg-[#FFE4D4] items-center justify-center" onPress={onDecrease}>
                        <Image source={images.minus} className="size-4" contentFit="contain" />
                    </TouchableOpacity>
                    <Text className="paragraph-semibold text-dark-100">{item.quantity}</Text>
                    <TouchableOpacity className="size-10 rounded-full bg-[#FF8C42] items-center justify-center" onPress={onIncrease}>
                        <Image source={images.plus} className="size-4" contentFit="contain" />
                    </TouchableOpacity>
                </View>
            </View>
            <View className="items-end justify-between">
                <TouchableOpacity className="size-10 rounded-full bg-[#FFE4D4] items-center justify-center" onPress={onRemove}>
                    <Image source={images.trash} className="size-5" contentFit="contain" />
                </TouchableOpacity>
                <Text className="paragraph-semibold text-dark-100">{formatCurrency(total)}</Text>
            </View>
        </View>
    );
};

const stringifyId = (value: string | number | null | undefined) =>
    value === null || value === undefined ? "" : String(value);

const SummaryRow = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
    <View className="flex-row items-center justify-between py-1">
        <Text className={highlight ? "paragraph-semibold text-dark-80" : "body-medium text-dark-60"}>{label}</Text>
        <Text className={highlight ? "h3-bold text-dark-100" : "paragraph-semibold text-dark-100"}>{value}</Text>
    </View>
);

const Cart = () => {
    const { items, getTotalPrice, increaseQty, decreaseQty, removeItem, clearCart } = useCartStore();
    const subtotal = useMemo(() => getTotalPrice(), [getTotalPrice, items]);
    const isCartEmpty = items.length === 0;
    const deliveryFee = isCartEmpty ? 0 : 14.9;
    const serviceFee = isCartEmpty ? 0 : 6.5;
    const discount = subtotal > 250 ? 25 : 0;
    const [tipOption, setTipOption] = useState<TipOption>("0");
    const [customTip, setCustomTip] = useState("");
    const parsedCustomTip = Math.max(0, Number(customTip) || 0);
    const tipAmount = tipOption === "custom" ? parsedCustomTip : subtotal * (Number(tipOption) / 100);
    const total = subtotal + deliveryFee + serviceFee + tipAmount - discount;

    const { data: addresses } = useServerResource({ fn: getAddresses, immediate: true, skipAlert: true });
    const [selectedAddress, setSelectedAddress] = useState<string | number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
    const [notes, setNotes] = useState("");
    const [placingOrder, setPlacingOrder] = useState(false);
    const resolvedAddressId = selectedAddress ?? addresses?.[0]?.id ?? null;
    const canCheckout = Boolean(!isCartEmpty && resolvedAddressId !== null && paymentMethod);
    const selectedAddressId = stringifyId(selectedAddress);
    const hasAddresses = Boolean(addresses?.length);
    const listData = useMemo(() => {
        const data: Array<{ type: "addresses" } | { type: "item"; item: CartItemType }> = [{ type: "addresses" }];
        items.forEach((item) => data.push({ type: "item", item }));
        return data;
    }, [items]);

    useEffect(() => {
        if (selectedAddress !== null || !addresses?.length) return;
        const defaultAddress = addresses.find((addr: any) => addr.isDefault);
        setSelectedAddress(defaultAddress?.id ?? addresses[0].id);
    }, [addresses, selectedAddress]);

    const handlePlaceOrder = async () => {
        if (!items.length) {
            Alert.alert("Cart is empty", "Add something tasty before checking out.");
            return;
        }

        if (resolvedAddressId === null) {
            Alert.alert("Add a delivery address", "Please select or save a delivery address before checking out.");
            return;
        }

        if (!paymentMethod) {
            Alert.alert("Select a payment method", "Please choose how you'd like to pay before proceeding.");
            return;
        }

        const restaurantId = (items[0] as CartItemWithRestaurant | undefined)?.restaurantId ?? 1;

        const orderData = {
            restaurantId,
            addressId: resolvedAddressId,
            subtotal,
            deliveryFee,
            serviceFee,
            tip: tipAmount,
            discount,
            total,
            paymentMethod: paymentMethod as PaymentMethod,
            paymentStatus: paymentMethod === "cash" ? "cash_due" : "pending",
            status: "pending",
            specialInstructions: notes,
        };

        const pendingEta = 120;

        const orderItems = items.map((item) => {
            const customizationTotal = getCustomizationsTotal(item.customizations);
            const numericMenuItemId = Number(item.id);
            const menuItemId = Number.isNaN(numericMenuItemId) ? item.id : numericMenuItemId;

            return {
                menuItemId,
                quantity: item.quantity,
                price: item.price + customizationTotal,
                customizations: item.customizations?.map(({ id, name, price, type }) => ({ id, name, price, type })) ?? [],
            };
        });

        try {
            setPlacingOrder(true);
            const created = await createOrder({ orderData, orderItems });
            const newOrderId = String(created?.id ?? Date.now());
            const restaurantLabel =
                (items[0] as CartItemWithRestaurant | undefined)?.name?.split(" ")[0] || "Kampüs Mutfağı";

            clearCart();
            router.replace({
                pathname: "/order/pending",
                params: {
                    orderId: newOrderId,
                    restaurantName: restaurantLabel,
                    eta: String(pendingEta),
                },
            });
        } catch (error: any) {
            Alert.alert("Unable to place order", error?.message || "Please try again in a moment.");
        } finally {
            setPlacingOrder(false);
        }
    };

    if (isCartEmpty) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center px-5">
                <Image source={images.emptyState} className="w-48 h-48" contentFit="contain" />
                <Text className="h3-bold text-dark-100 mt-4">Your cart feels empty</Text>
                <Text className="body-medium text-center mt-2">Add meals from the Home tab and they'll appear here.</Text>
            </SafeAreaView>
        );
    }

    const renderHeader = () => {
        const addressChips = hasAddresses
            ? (addresses as any[]).map((address) => {
                  const isActive = stringifyId(address.id) === selectedAddressId;
                  return (
                      <TouchableOpacity
                          key={address.id}
                          className="px-4 py-2 rounded-2xl border"
                          style={{
                              borderColor: isActive ? "#FF8C42" : "#E2E8F0",
                              backgroundColor: isActive ? "#FFF1E7" : "transparent",
                          }}
                          onPress={() => setSelectedAddress(address.id)}
                      >
                          <Text className="paragraph-semibold text-dark-80">{address.title}</Text>
                      </TouchableOpacity>
                  );
              })
            : ADDRESS_SKELETONS.map((skeleton) => (
                  <View key={`address-pill-${skeleton}`} style={ADDRESS_PILL_SKELETON_STYLE} />
              ));

        return (
            <View className="gap-5 pt-4" style={CONTAINER_PADDING}>
                <View className="gap-2">
                    <TouchableOpacity className="flex-row items-center gap-3 bg-white rounded-3xl px-4 py-3 border border-gray-100" activeOpacity={0.9}>
                        <View className="size-10 rounded-2xl bg-primary/10 items-center justify-center">
                            <Image source={images.location} className="size-5" contentFit="contain" tintColor="#FF8C42" />
                        </View>
                        <View className="flex-1">
                            <Text className="body-medium text-dark-60">Deliver to</Text>
                            <Text className="paragraph-semibold text-dark-100" numberOfLines={1}>
                                {addresses?.find((addr: any) => stringifyId(addr.id) === selectedAddressId)?.title || "Select address"}
                            </Text>
                        </View>
                        <Image source={images.arrowDown} className="size-4" contentFit="contain" />
                    </TouchableOpacity>
                    <Text className="text-4xl font-quicksand-bold text-dark-100 mt-2">Order</Text>
                    <Text className="body-medium text-dark-60">Campus cravings, ready in minutes.</Text>
                </View>

                <View style={{ minHeight: 52 }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-3">{addressChips}</View>
                    </ScrollView>
                </View>
            </View>
        );
    };

    const renderAddressTabs = () => {
        const tabContent = hasAddresses
            ? (addresses as any[]).map((address) => {
                  const isActive = stringifyId(address.id) === selectedAddressId;
                  return (
                      <TouchableOpacity
                          key={address.id}
                          className="px-4 py-2 rounded-full border"
                          style={{
                              borderColor: isActive ? "#FF8C42" : "#CBD5F5",
                              backgroundColor: isActive ? "#FFF6EF" : "#FFFFFF",
                          }}
                          onPress={() => setSelectedAddress(address.id)}
                      >
                          <Text className="paragraph-semibold text-dark-80">{address.title}</Text>
                      </TouchableOpacity>
                  );
              })
            : ADDRESS_SKELETONS.map((skeleton) => (
                  <View key={`address-tab-${skeleton}`} style={ADDRESS_TAB_SKELETON_STYLE} />
              ));

        return (
            <View className="bg-[#F8F6F2] py-3" style={CONTAINER_PADDING}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                    {tabContent}
                </ScrollView>
            </View>
        );
    };

    const renderListItem = ({ item }: { item: { type: "addresses" } | { type: "item"; item: CartItemType } }) => {
        if (item.type === "addresses") return renderAddressTabs();
        const cartItem = item.item;
        return (
            <CartCard
                item={cartItem}
                onIncrease={() => increaseQty(cartItem.id, cartItem.customizations || [])}
                onDecrease={() => decreaseQty(cartItem.id, cartItem.customizations || [])}
                onRemove={() => removeItem(cartItem.id, cartItem.customizations || [])}
            />
        );
    };

    const handleNoteChange = (text: string) => setNotes(text.slice(0, MAX_NOTES));
    const tipOptions: TipOption[] = ["0", "10", "15", "20", "custom"];
    const MAX_NOTES = 200;
    const noteSuggestions = ["Ring the bell", "Leave at door", "Call on arrival"];

    const renderFooter = () => {
        const checkoutLabel = !resolvedAddressId
            ? "Select an address to continue"
            : !paymentMethod
                ? "Select a payment method"
                : `Checkout - ${formatCurrency(total)}`;

        return (
            <View className="gap-5 pt-6" style={CONTAINER_PADDING}>
                <View className="bg-white rounded-[32px] p-5 gap-2" style={cardShadow}>
                    <SummaryRow label="Sub total" value={formatCurrency(subtotal)} />
                    <SummaryRow label="Delivery fee" value={deliveryFee ? formatCurrency(deliveryFee) : "Free"} />
                    <SummaryRow label="Service fee" value={serviceFee ? formatCurrency(serviceFee) : "Free"} />
                    <SummaryRow label="Discount" value={discount ? `- ${formatCurrency(discount)}` : "TRY 0.00"} />
                    <SummaryRow label="Tip" value={formatCurrency(tipAmount)} />
                    <View className="border-t border-gray-100 my-2" />
                    <SummaryRow label="Total" value={formatCurrency(total)} highlight />
                </View>

                <View className="gap-3">
                    <Text className="section-title">Tip your courier</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {tipOptions.map((option) => {
                            const isActive = tipOption === option;
                            return (
                                <TouchableOpacity
                                    key={option}
                                    className="px-4 py-2 rounded-2xl border"
                                    style={{
                                        borderColor: isActive ? "#FF8C42" : "#E2E8F0",
                                        backgroundColor: isActive ? "#FFF6EF" : "#FFFFFF",
                                    }}
                                    onPress={() => {
                                        setTipOption(option);
                                        if (option !== "custom") setCustomTip("");
                                    }}
                                >
                                    <Text className="paragraph-semibold text-dark-80">
                                        {option === "custom" ? "Custom" : `${option}%`}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {tipOption === "custom" && (
                        <TextInput
                            keyboardType="numeric"
                            className="rounded-2xl bg-white border border-gray-100 px-4 py-3 text-dark-100"
                            placeholder="Enter tip amount"
                            placeholderTextColor="#94A3B8"
                            value={customTip}
                            onChangeText={(text) => setCustomTip(text.replace(/[^0-9.]/g, ""))}
                        />
                    )}
                </View>

                <View className="gap-3">
                    <Text className="section-title">Payment methods</Text>
                    {paymentOptions.map((option) => {
                        const isActive = paymentMethod === option.id;
                        return (
                            <TouchableOpacity
                                key={option.id}
                                className="flex-row items-center gap-3 rounded-3xl px-4 py-4 border-2"
                                style={{
                                    borderColor: isActive ? "#FF8C42" : "#E2E8F0",
                                    backgroundColor: isActive ? "#FFF6EF" : "#FFFFFF",
                                }}
                                onPress={() => setPaymentMethod(option.id)}
                            >
                                <View
                                    className="size-4 rounded-full border-2 items-center justify-center"
                                    style={{ borderColor: isActive ? "#FF8C42" : "#CBD5F5" }}
                                >
                                    {isActive && <View className="size-2 rounded-full bg-primary" />}
                                </View>
                                <View className="flex-1">
                                    <Text className="paragraph-semibold text-dark-100">{option.label}</Text>
                                    <Text className="body-medium text-dark-60">{option.description}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View className="gap-2">
                    <Text className="section-title">Notes for courier</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {noteSuggestions.map((suggestion) => (
                            <TouchableOpacity
                                key={suggestion}
                                className="px-3 py-2 rounded-2xl border border-gray-200 bg-white"
                                onPress={() => handleNoteChange(suggestion)}
                            >
                                <Text className="body-medium text-dark-80">{suggestion}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TextInput
                        className="rounded-3xl bg-white border border-gray-100 px-4 py-3 text-dark-100"
                        placeholder="Gate code, dorm details..."
                        placeholderTextColor="#94A3B8"
                        value={notes}
                        onChangeText={handleNoteChange}
                        multiline
                        maxLength={MAX_NOTES}
                    />
                    <Text className="body-medium text-right text-dark-60">{notes.length}/{MAX_NOTES}</Text>
                </View>

                <TouchableOpacity
                    className="custom-btn flex-row items-center justify-center gap-3"
                    style={{ opacity: !canCheckout || placingOrder ? 0.6 : 1 }}
                    disabled={!canCheckout || placingOrder}
                    onPress={handlePlaceOrder}
                >
                    {placingOrder && <ActivityIndicator color="#fff" />}
                    <Text className="paragraph-semibold text-white">
                        {placingOrder ? "Placing order..." : checkoutLabel}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F8F6F2]">
            <FlatList
                data={listData}
                keyExtractor={(entry) =>
                    entry.type === "addresses" ? "address-tabs" : getCartItemKey(entry.item)
                }
                contentContainerStyle={{ paddingBottom: 200 }}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={listData.length ? [1] : []}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ItemSeparatorComponent={() => <View className="h-4" />}
                renderItem={renderListItem}
            />
        </SafeAreaView>
    );
};

/**
 * Cart component that displays the shopping cart page.
 * 
 * This is the default export component for the cart tab screen,
 * allowing users to view and manage items in their shopping cart.
 * 
 * @returns {JSX.Element} The rendered cart screen component
 */
export default Cart;
