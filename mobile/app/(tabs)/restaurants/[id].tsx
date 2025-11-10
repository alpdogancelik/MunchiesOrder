import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { images } from "@/constants";
import CartButton from "@/components/CartButton";
import MenuCard from "@/components/MenuCard";
import useServerResource from "@/lib/useServerResource";
import {
    getRestaurant,
    getRestaurantCategories,
    getRestaurantMenu,
    getRestaurantReviews,
    submitReview,
} from "@/lib/api";

type MenuParams = { categoryId?: number };

const ratingOptions = [1, 2, 3, 4, 5];

const formatCurrency = (value?: number | string) => {
    const amount = Number(value ?? 0);
    if (Number.isNaN(amount)) return "TRY 0.00";
    return `TRY ${amount.toFixed(2)}`;
};

const RestaurantDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const restaurantId = useMemo(() => Number(id), [id]);

    const fetchRestaurant = useCallback(() => getRestaurant(restaurantId), [restaurantId]);
    const fetchCategories = useCallback(() => getRestaurantCategories(restaurantId), [restaurantId]);
    const fetchReviews = useCallback(() => getRestaurantReviews(restaurantId), [restaurantId]);
    const fetchMenu = useCallback((params?: MenuParams) => getRestaurantMenu({ restaurantId, ...(params || {}) }), [restaurantId]);

    const { data: restaurant, loading: restaurantLoading } = useServerResource({ fn: fetchRestaurant, immediate: !!restaurantId });
    const { data: categories } = useServerResource({ fn: fetchCategories, immediate: !!restaurantId, skipAlert: true });
    const defaultMenuParams = useMemo<MenuParams>(() => ({ categoryId: undefined }), []);
    const {
        data: menuItems,
        loading: menuLoading,
        refetch: refetchMenu,
    } = useServerResource<any[], MenuParams>({
        fn: fetchMenu,
        params: defaultMenuParams,
        immediate: !!restaurantId,
        skipAlert: true,
    });
    const {
        data: reviews,
        loading: reviewsLoading,
        refetch: refetchReviews,
    } = useServerResource({ fn: fetchReviews, immediate: !!restaurantId, skipAlert: true });

    const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
    const [isReviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

    const handleCategoryPress = (categoryId: number | "all") => {
        setSelectedCategory(categoryId);
        const payload = categoryId === "all" ? { categoryId: undefined } : { categoryId };
        refetchMenu(payload);
    };

    const handleSubmitReview = async () => {
        try {
            await submitReview({
                restaurantId,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
            });
            setReviewModalVisible(false);
            setReviewForm({ rating: 5, comment: "" });
            refetchReviews();
        } catch (error: any) {
            console.error(error);
        }
    };

    if (!restaurantId || Number.isNaN(restaurantId)) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-white">
                <Text className="paragraph-semibold">Restaurant not found.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="px-5 pt-6 gap-5">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity className="size-10 rounded-full bg-white items-center justify-center border border-gray-100" onPress={() => router.back()}>
                            <Image source={images.arrowBack} className="size-5" resizeMode="contain" />
                        </TouchableOpacity>
                        <CartButton />
                    </View>

                    {restaurantLoading ? (
                        <ActivityIndicator color="#FF8C42" className="mt-10" />
                    ) : restaurant ? (
                        <View className="restaurant-hero">
                            <View className="flex-row items-center gap-4">
                                <View className="size-24 rounded-3xl overflow-hidden bg-white/10">
                                    <Image
                                        source={restaurant.imageUrl ? { uri: restaurant.imageUrl } : images.logo}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-3xl font-quicksand-bold text-white">{restaurant.name}</Text>
                                    <Text className="body-medium text-white/80 mt-1">{restaurant.cuisine}</Text>
                                    <View className="flex-row gap-2 mt-3">
                                        <View className="rating-pill bg-white/20 border-white/30">
                                            <Image source={images.star} className="size-4 mr-1" resizeMode="contain" tintColor="#FFD36B" />
                                            <Text className="paragraph-semibold text-white">
                                                {restaurant.rating ? Number(restaurant.rating).toFixed(1) : "New"}
                                            </Text>
                                        </View>
                                        <View className="rating-pill bg-white/20 border-white/30">
                                            <Text className="paragraph-semibold text-white">
                                                {restaurant.reviewCount || 0} reviews
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View className="flex-row gap-3">
                                <View className="hero-metric">
                                    <Text className="body-medium text-white/60">Delivery time</Text>
                                    <Text className="h3-bold text-white mt-1">{restaurant.deliveryTime || "20-30"} min</Text>
                                </View>
                                <View className="hero-metric">
                                    <Text className="body-medium text-white/60">Delivery fee</Text>
                                    <Text className="h3-bold text-white mt-1">
                                        {restaurant.deliveryFee ? formatCurrency(restaurant.deliveryFee) : "Free"}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : null}

                    {categories && categories.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}>
                            <TouchableOpacity
                                className={`px-5 py-2 rounded-full border ${selectedCategory === "all" ? "bg-primary text-white border-transparent" : "bg-white border-gray-100"}`}
                                onPress={() => handleCategoryPress("all")}
                            >
                                <Text className={`paragraph-semibold ${selectedCategory === "all" ? "text-white" : "text-dark-80"}`}>All</Text>
                            </TouchableOpacity>
                            {categories.map((category: any) => (
                                <TouchableOpacity
                                    key={category.id}
                                    className={`px-5 py-2 rounded-full border ${selectedCategory === category.id ? "bg-primary text-white border-transparent" : "bg-white border-gray-100"}`}
                                    onPress={() => handleCategoryPress(category.id)}
                                >
                                    <Text className={`paragraph-semibold ${selectedCategory === category.id ? "text-white" : "text-dark-80"}`}>
                                        {category.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}

                    <View className="gap-3">
                        <View className="flex-row items-center justify-between">
                            <Text className="section-title">Menu</Text>
                            {menuLoading && <ActivityIndicator size="small" color="#FF8C42" />}
                        </View>
                        <View className="gap-4">
                            {(menuItems || []).map((item: any) => (
                                <MenuCard
                                    key={item.$id}
                                    item={{
                                        ...item,
                                        $id: item.$id || `${restaurantId}-${item.id}`,
                                        image_url: item.image_url || item.imageUrl || '',
                                        price: Number(item.price),
                                    }}
                                />
                            ))}
                        </View>
                    </View>

                    <View className="gap-3">
                        <View className="flex-row items-center justify-between">
                            <Text className="section-title">Reviews</Text>
                            <TouchableOpacity onPress={() => setReviewModalVisible(true)}>
                                <Text className="paragraph-semibold text-primary-dark">Write a review</Text>
                            </TouchableOpacity>
                        </View>
                        {reviewsLoading ? (
                            <ActivityIndicator color="#FF8C42" />
                        ) : reviews && reviews.length > 0 ? (
                            <View className="gap-3">
                                {reviews.slice(0, 5).map((review: any) => (
                                    <View key={review.id} className="secondary-card gap-2">
                                        <View className="flex-row items-center justify-between">
                                            <Text className="paragraph-semibold text-dark-100">{review.user?.firstName || "Anonymous"}</Text>
                                            <View className="rating-pill">
                                                <Image source={images.star} className="size-3.5 mr-1" resizeMode="contain" tintColor="#FFB703" />
                                                <Text className="paragraph-semibold text-dark-100">{review.rating}</Text>
                                            </View>
                                        </View>
                                        <Text className="body-medium">{review.comment || "Delicious!"}</Text>
                                        <Text className="body-regular text-gray-200">
                                            {new Date(review.createdAt || review.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="secondary-card items-center gap-2">
                                <Text className="paragraph-semibold text-dark-80">No reviews yet</Text>
                                <Text className="body-medium text-center">Be the first to share your experience.</Text>
                                <TouchableOpacity className="hero-cta" onPress={() => setReviewModalVisible(true)}>
                                    <Text className="text-white">Leave feedback</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            <Modal visible={isReviewModalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 gap-4">
                        <Text className="h3-bold text-dark-100">Share your experience</Text>
                        <View className="flex-row items-center gap-3">
                            {ratingOptions.map((value) => (
                                <TouchableOpacity key={value} onPress={() => setReviewForm((prev) => ({ ...prev, rating: value }))}>
                                    <Image
                                        source={images.star}
                                        className="size-7"
                                        resizeMode="contain"
                                        tintColor={value <= reviewForm.rating ? "#FFB703" : "#E2E8F0"}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            placeholder="Tell other students about the meal..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            value={reviewForm.comment}
                            onChangeText={(comment) => setReviewForm((prev) => ({ ...prev, comment }))}
                            className="min-h-[120px] border border-gray-100 rounded-2xl p-4 text-dark-100"
                        />
                        <View className="flex-row gap-3">
                            <TouchableOpacity className="flex-1 px-4 py-3 rounded-full bg-gray-50" onPress={() => setReviewModalVisible(false)}>
                                <Text className="paragraph-semibold text-dark-80 text-center">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity className="flex-1 px-4 py-3 rounded-full bg-primary" onPress={handleSubmitReview}>
                                <Text className="paragraph-semibold text-white text-center">Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default RestaurantDetails;
