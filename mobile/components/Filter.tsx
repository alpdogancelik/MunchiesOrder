import { FlatList, Text, TouchableOpacity, Platform } from 'react-native';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import cn from "clsx";

type Category = { $id?: string; id?: string | number; name: string };

type FilterOption = { id: string; name: string; value?: string };

const Filter = ({ categories }: { categories: Category[] }) => {
    const searchParams = useLocalSearchParams<{ category?: string | string[] }>();
    const [active, setActive] = useState<string>('all');

    const currentCategory = useMemo(() => {
        const param = Array.isArray(searchParams.category) ? searchParams.category[0] : searchParams.category;
        return param ?? '';
    }, [searchParams.category]);

    const data = useMemo(() => {
        const normalized = (categories || []).map((item) => ({
            id: String(item.$id ?? item.id ?? item.name),
            name: item.name,
            value: item.name,
        }));
        return [{ id: 'all', name: 'All', value: undefined }, ...normalized] as FilterOption[];
    }, [categories]);

    useEffect(() => {
        if (!currentCategory) {
            setActive('all');
            return;
        }

        const match = data.find((item) => item.value?.toLowerCase() === currentCategory.toLowerCase());
        setActive(match?.id ?? 'all');
    }, [currentCategory, data]);

    const handlePress = (option: FilterOption) => {
        setActive(option.id);
        if (!option.value) router.setParams({ category: undefined } as any);
        else router.setParams({ category: option.value } as any);
    };

    return (
        <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-x-3 pb-3"
            renderItem={({ item }) => (
                <TouchableOpacity
                    className={cn(
                        'px-5 py-2 rounded-full border',
                        active === item.id ? 'bg-primary text-white border-transparent' : 'bg-white border-gray-100'
                    )}
                    style={Platform.OS === 'android' ? { elevation: 3, shadowColor: '#0F172A' } : {}}
                    onPress={() => handlePress(item)}
                >
                    <Text className={cn('paragraph-semibold', active === item.id ? 'text-white' : 'text-dark-80')}>
                        {item.name}
                    </Text>
                </TouchableOpacity>
            )}
        />
    );
};

export default Filter;
