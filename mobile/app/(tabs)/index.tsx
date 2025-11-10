import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import CartButton from "@/components/CartButton";
import MenuCard from "@/components/MenuCard";
import RestaurantCard from "@/components/RestaurantCard";
import { images, offers } from "@/constants";
import useHome from "@/src/hooks/useHome";
import { Chip, Card, SectionHeader } from "@/src/components";
import { useTheme, ThemeDefinition } from "@/src/theme";

export default function Index() {
    const {
        userName,
        menu,
        menuLoading,
        heroLoading,
        restaurants,
        restaurantsLoading,
        categories,
        categoriesLoading,
        quickActions,
    } = useHome();
    const [activeCategory, setActiveCategory] = useState("all");
    const router = useRouter();
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const filteredMenu = useMemo(() => {
        if (!menu) return [];
        if (activeCategory === "all") return menu.slice(0, 4);
        const categoryLower = activeCategory.toLowerCase();
        return menu.filter((item: any) => item.categories?.includes(categoryLower)).slice(0, 4);
    }, [menu, activeCategory]);

    const renderCategory = ({ item }: { item: any }) => (
        <Chip
            label={item.name}
            icon={item.icon ? <Image source={item.icon} style={styles.chipIcon} contentFit="contain" /> : undefined}
            selected={activeCategory === item.id}
            onPress={() => setActiveCategory(item.id)}
        />
    );

    const renderQuickAction = (action: any) => (
        <TouchableOpacity
            key={action.id}
            style={styles.quickCardWrapper}
            onPress={() => router.push(action.target as any)}
        >
            <Card style={styles.quickCard}>
                <Image source={action.icon || images.star} style={styles.quickCardIcon} contentFit="contain" />
                <Text style={styles.quickCardLabel}>{action.label}</Text>
            </Card>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                stickyHeaderIndices={[2]}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.deliveryLabel}>DELIVER TO</Text>
                        <TouchableOpacity style={styles.deliveryRow}>
                            <Text style={styles.deliveryName}>{userName}</Text>
                            <Image source={images.arrowDown} style={styles.arrowIcon} contentFit="contain" />
                        </TouchableOpacity>
                        <Text style={styles.deliveryEta}>ETA ~15 min</Text>
                    </View>
                    <CartButton />
                </View>

                {heroLoading ? (
                    <View style={styles.heroSkeleton} />
                ) : (
                    <LinearGradient
                        colors={[theme.colors.primary, `${theme.colors.primary}D9`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.heroTextArea}>
                            <Text style={styles.heroEyebrow}>late night cravings?</Text>
                            <Text style={styles.heroTitle}>
                                Order warm meals straight to your study desk.
                            </Text>
                            <TouchableOpacity style={styles.heroCta} onPress={() => router.push("/search")}>
                                <Text style={styles.heroCtaText}>Start exploring</Text>
                            </TouchableOpacity>
                        </View>
                        <Image source={images.burgerTwo} style={styles.heroImage} contentFit="contain" />
                    </LinearGradient>
                )}

                <View style={styles.categoriesContainer}>
                    {categoriesLoading ? (
                        <View style={styles.categorySkeletonRow}>
                            {[...Array(4)].map((_, index) => (
                                <View key={index} style={styles.categorySkeleton} />
                            ))}
                        </View>
                    ) : (
                        <FlatList
                            data={categories}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryListContent}
                            renderItem={renderCategory}
                            keyExtractor={(item) => item.id}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <SectionHeader title="Quick actions" />
                    <View style={styles.quickGrid}>
                        {quickActions.map(renderQuickAction)}
                    </View>
                </View>

                <View style={styles.section}>
                    <SectionHeader title="Featured picks" onActionPress={() => router.push("/search")} />
                    {menuLoading ? (
                        <ActivityIndicator color="#FF8C42" />
                    ) : (
                        <View style={styles.gridGap}>
                            {filteredMenu.map((item: any, index: number) => (
                                <MenuCard
                                    key={item.$id || item.id || `${item.name}-${index}`}
                                    item={item}
                                    onPress={() => router.push({ pathname: "/search", params: { query: item.name } })}
                                />
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <SectionHeader title="Popular restaurants around you" />
                    {restaurantsLoading ? (
                        <ActivityIndicator color="#FF8C42" />
                    ) : (
                        <View style={styles.gridGap}>
                            {(restaurants || []).map((restaurant: any, index: number) => (
                                <RestaurantCard
                                    key={String(restaurant.id ?? restaurant.$id ?? index)}
                                    restaurant={restaurant}
                                    onPress={() =>
                                        router.push({
                                            pathname: "/restaurants/[id]",
                                            params: { id: String(restaurant.id ?? restaurant.$id ?? index) },
                                        })
                                    }
                                />
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <SectionHeader title="Trending offers" />
                    <View style={styles.gridGap}>
                        {offers.map((offer, index) => (
                            <TouchableOpacity
                                key={offer.id}
                                activeOpacity={0.9}
                                style={[styles.offerCard, { backgroundColor: offer.color }]}
                                onPress={() => router.push({ pathname: "/search", params: { query: offer.title.split(" ")[0] } })}
                            >
                                <Image source={offer.image} style={styles.offerImage} contentFit="contain" />
                                <View style={styles.offerInfo}>
                                    <Text style={styles.offerTitle}>{offer.title}</Text>
                                    <View style={styles.offerChip}>
                                        <Text style={styles.offerChipText}>Tap to redeem</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme: ThemeDefinition) =>
    StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: theme.colors.surface },
        scrollContent: { paddingBottom: theme.spacing["2xl"] * 3 },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.xl,
            paddingBottom: theme.spacing.md,
        },
        deliveryLabel: {
            color: theme.colors.primary,
            fontFamily: "QuickSand-SemiBold",
            fontSize: 12,
            letterSpacing: 1,
        },
        deliveryRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.xs,
            marginTop: theme.spacing.xs,
        },
        deliveryName: {
            fontFamily: "QuickSand-Bold",
            fontSize: 24,
            color: theme.colors.ink,
        },
        arrowIcon: { width: 14, height: 14 },
        deliveryEta: { color: theme.colors.muted, marginTop: 4 },
        heroCard: {
            marginHorizontal: theme.spacing.lg,
            borderRadius: theme.radius.xl,
            padding: theme.spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.md,
        },
        heroSkeleton: {
            marginHorizontal: theme.spacing.lg,
            borderRadius: theme.radius.xl,
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.border,
            height: 140,
        },
        heroTextArea: { flex: 1, gap: theme.spacing.xs },
        heroEyebrow: {
            color: theme.colors.surface,
            fontFamily: "QuickSand-SemiBold",
            textTransform: "uppercase",
            fontSize: 12,
            opacity: 0.8,
        },
        heroTitle: { color: theme.colors.surface, fontFamily: "QuickSand-Bold", fontSize: 24, lineHeight: 30 },
        heroCta: {
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.ink,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            alignSelf: "flex-start",
        },
        heroCtaText: { color: theme.colors.surface, fontFamily: "QuickSand-SemiBold" },
        heroImage: { width: 110, height: 110 },
        categoriesContainer: {
            backgroundColor: theme.colors.surface,
            paddingVertical: theme.spacing.sm,
            borderBottomWidth: 1,
            borderColor: theme.colors.border,
        },
        categorySkeletonRow: { flexDirection: "row", gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg },
        categoryListContent: { gap: theme.spacing.sm, paddingHorizontal: theme.spacing.lg },
        categorySkeleton: {
            width: 90,
            height: 38,
            borderRadius: theme.radius.md,
            backgroundColor: theme.colors.border,
        },
        chipIcon: { width: 18, height: 18 },
        section: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
        quickGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing.md,
        },
        quickCardWrapper: {
            width: "47%",
        },
        quickCard: {
            alignItems: "center",
            justifyContent: "center",
            gap: theme.spacing.sm,
        },
        quickCardIcon: { width: 32, height: 32 },
        quickCardLabel: { fontFamily: "QuickSand-SemiBold", color: theme.colors.ink, textAlign: "center" },
        gridGap: { gap: theme.spacing.md },
        offerCard: {
            borderRadius: theme.radius.xl,
            padding: theme.spacing.lg,
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.md,
        },
        offerImage: { width: 100, height: 100 },
        offerInfo: { flex: 1, gap: theme.spacing.sm },
        offerTitle: { color: theme.colors.surface, fontFamily: "QuickSand-Bold", fontSize: theme.typography.h1 },
        offerChip: {
            borderRadius: theme.radius.lg,
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.md,
            backgroundColor: "rgba(255,255,255,0.2)",
        },
        offerChipText: { color: theme.colors.surface, fontFamily: "QuickSand-SemiBold" },
    });
