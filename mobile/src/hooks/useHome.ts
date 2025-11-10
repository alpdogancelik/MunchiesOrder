import { useMemo } from "react";
import { ImageSourcePropType } from "react-native";
import useAuthStore from "@/store/auth.store";
import useAppwrite from "@/lib/useAppwrite";
import useServerResource from "@/lib/useServerResource";
import { getMenu } from "@/lib/appwrite";
import { getRestaurants } from "@/lib/api";
import type { Category } from "@/type";
import { CATEGORIES, images } from "@/constants";

type QuickAction = {
    id: string;
    label: string;
    icon: ImageSourcePropType;
    target: string;
};

type UseHomeResult = {
    userName: string;
    menu: any[] | null;
    menuLoading: boolean;
    heroLoading: boolean;
    restaurants: any[] | null;
    restaurantsLoading: boolean;
    categories: Category[];
    categoriesLoading: boolean;
    quickActions: QuickAction[];
};

export const useHome = (): UseHomeResult => {
    const { user } = useAuthStore();
    const featuredMenuParams = useMemo(() => ({ limit: 6 }), []);
    const { data: menu, loading: menuLoading } = useAppwrite({ fn: getMenu, params: featuredMenuParams });
    const {
        data: restaurants,
        loading: restaurantsLoading,
    } = useServerResource({ fn: getRestaurants, immediate: true, skipAlert: true });

    const categories = useMemo(() => CATEGORIES as unknown as Category[], []);
    const quickActions = useMemo<QuickAction[]>(
        () => [
            { id: "orders", label: "Order history", icon: images.clock, target: "/orders" },
            { id: "favorites", label: "Favourites", icon: images.star, target: "/search?query=popular" },
            { id: "addresses", label: "Addresses", icon: images.location, target: "/profile" },
            { id: "coupons", label: "Coupons", icon: images.dollar, target: "/search?query=promo" },
        ],
        [],
    );

    return {
        userName: user?.name || "Campus Dorm",
        menu,
        menuLoading,
        heroLoading: menuLoading,
        restaurants,
        restaurantsLoading,
        categories,
        categoriesLoading: menuLoading,
        quickActions,
    };
};

export default useHome;
