import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useRestaurantOrders from "@/src/hooks/useRestaurantOrders";
import { sampleMenu } from "@/lib/sampleData";
import { storage } from "@/src/lib/storage";
import type { RestaurantOrder } from "@/type";

const AUTO_ACCEPT_KEY = "auto_accept_orders";
const formatCurrency = (value?: number | string) => {
    const amount = Number(value ?? 0);
    if (Number.isNaN(amount)) return "TRY 0.00";
    return `TRY ${amount.toFixed(2)}`;
};

const useAutoAccept = () => {
    const [value, setValue] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        let mounted = true;
        storage
            .getItem(AUTO_ACCEPT_KEY)
            .then((stored) => {
                if (!mounted) return;
                if (stored === "true") setValue(true);
            })
            .finally(() => setHydrated(true));
        return () => {
            mounted = false;
        };
    }, []);

    const update = useCallback(async (next: boolean) => {
        setValue(next);
        await storage.setItem(AUTO_ACCEPT_KEY, next ? "true" : "false");
    }, []);

    return { value, setValue: update, hydrated };
};

const menuSeed = (sampleMenu[1] || []).slice(0, 5).map((item) => ({
    id: String(item.id ?? item.$id ?? `menu-${item.name}`),
    name: item.name,
    price: Number(item.price),
    visible: true,
}));

const RestaurantConsoleScreen = () => {
    const restaurantId = "1";
    const { orders, loading, error, mutateStatus, refetch } = useRestaurantOrders(restaurantId);
    const { value: autoAccept, setValue: setAutoAccept, hydrated } = useAutoAccept();
    const [menuItems, setMenuItems] = useState(menuSeed);

    const toggleMenuVisibility = (menuId: string) => {
        setMenuItems((prev) =>
            prev.map((item) => (item.id === menuId ? { ...item, visible: !item.visible } : item)),
        );
    };

    const todaysStats = useMemo(() => {
        const today = new Date().toDateString();
        const todaysOrders = orders.filter((order) => {
            const ts = order.createdAt || order.updatedAt;
            if (!ts) return false;
            return new Date(ts).toDateString() === today;
        });
        const revenue = todaysOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
        return {
            count: todaysOrders.length,
            revenue,
        };
    }, [orders]);

    const handleAction = async (orderId: string, status: string) => {
        try {
            await mutateStatus(orderId, status);
        } catch {
            Alert.alert("Unable to update order");
        }
    };

    useEffect(() => {
        if (!autoAccept) return;
        orders
            .filter((order) => order.status === "pending")
            .forEach((order) => {
                const id = String(order.id ?? order.$id);
                handleAction(id, "preparing");
            });
    }, [autoAccept, orders]);

    const renderOrderRow = ({ item }: { item: RestaurantOrder }) => {
        const orderId = String(item.id ?? item.$id);
        const summary = (item.orderItems || []).slice(0, 2)
            .map((entry) => `${entry.quantity || 1}x ${entry.name || "Item"}`)
            .join(", ");
        return (
            <View className="flex-row items-center bg-white rounded-2xl p-3 mb-3 border border-gray-100">
                <View className="flex-1">
                    <Text className="paragraph-semibold text-dark-100">#{orderId.slice(-5)}</Text>
                    <Text className="body-medium text-dark-60" numberOfLines={1}>
                        {summary || "No items"}
                    </Text>
                </View>
                <View className="w-24">
                    <Text className="paragraph-semibold text-dark-100">{formatCurrency(item.total)}</Text>
                </View>
                <View className="flex-row gap-2">
                    {item.status === "pending" && (
                        <TouchableOpacity className="chip bg-primary" onPress={() => handleAction(orderId, "preparing")}>
                            <Text className="paragraph-semibold text-white">Confirm</Text>
                        </TouchableOpacity>
                    )}
                    {item.status === "preparing" && (
                        <TouchableOpacity className="chip bg-primary/10" onPress={() => handleAction(orderId, "ready")}>
                            <Text className="paragraph-semibold text-primary">Mark ready</Text>
                        </TouchableOpacity>
                    )}
                    {item.status !== "canceled" && (
                        <TouchableOpacity className="chip bg-red-50" onPress={() => handleAction(orderId, "canceled")}>
                            <Text className="paragraph-semibold text-red-500">Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-5 pt-6 gap-6 flex-1">
                <View className="bg-white rounded-3xl p-4 border border-gray-100 flex-row justify-between">
                    <View>
                        <Text className="body-medium text-dark-60">Orders today</Text>
                        <Text className="text-3xl font-quicksand-bold text-dark-100">{todaysStats.count}</Text>
                    </View>
                    <View>
                        <Text className="body-medium text-dark-60">Revenue today</Text>
                        <Text className="text-3xl font-quicksand-bold text-dark-100">{formatCurrency(todaysStats.revenue)}</Text>
                    </View>
                </View>

                <View className="bg-white rounded-3xl p-4 border border-gray-100">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="section-title">Auto accept orders</Text>
                        <Switch
                            value={autoAccept}
                            disabled={!hydrated}
                            onValueChange={setAutoAccept}
                        />
                    </View>
                    <Text className="body-medium text-dark-60">
                        When enabled, incoming orders will be confirmed automatically.
                    </Text>
                </View>

                <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="section-title">Incoming orders</Text>
                        <TouchableOpacity onPress={refetch}>
                            <Text className="paragraph-semibold text-primary">Refresh</Text>
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <ActivityIndicator color="#FF8C42" />
                    ) : error ? (
                        <Text className="body-medium text-red-500">{error}</Text>
                    ) : (
                        <FlatList
                            data={orders}
                            keyExtractor={(item) => String(item.id ?? item.$id)}
                            renderItem={renderOrderRow}
                            ListEmptyComponent={<Text className="body-medium text-dark-60">No orders yet.</Text>}
                        />
                    )}
                </View>

                <View className="bg-white rounded-3xl p-4 border border-gray-100">
                    <Text className="section-title mb-3">Menu visibility</Text>
                    {menuItems.map((item) => (
                        <View key={item.id} className="flex-row items-center justify-between py-2 border-b border-gray-100">
                            <View>
                                <Text className="paragraph-semibold text-dark-100">{item.name}</Text>
                                <Text className="body-medium text-dark-60">{formatCurrency(item.price)}</Text>
                            </View>
                            <Switch value={item.visible} onValueChange={() => toggleMenuVisibility(item.id)} />
                        </View>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default RestaurantConsoleScreen;
