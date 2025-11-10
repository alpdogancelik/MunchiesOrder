import { useCallback, useEffect, useMemo, useState } from "react";
import { getMenu } from "@/lib/appwrite";
import type { MenuItem } from "@/type";

export type SearchSort = "relevance" | "eta" | "price";

const parsePrice = (item: Partial<MenuItem>) => Number(item.price ?? item.cost ?? 0);
const parseEta = (item: Partial<MenuItem>) => Number(item.deliveryTime ?? item.eta ?? 30);

const sortResults = (list: MenuItem[], sort: SearchSort) => {
    const cloned = [...list];
    if (sort === "price") {
        return cloned.sort((a, b) => parsePrice(a) - parsePrice(b));
    }
    if (sort === "eta") {
        return cloned.sort((a, b) => parseEta(a) - parseEta(b));
    }
    return cloned;
};

type UseSearchOptions = {
    initialQuery?: string;
    initialCategory?: string;
};

export const useSearch = ({ initialQuery = "", initialCategory }: UseSearchOptions = {}) => {
    const [query, setQuery] = useState(initialQuery);
    const [category, setCategory] = useState<string | undefined>(initialCategory);
    const [sort, setSort] = useState<SearchSort>("relevance");
    const [results, setResults] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const params = useMemo(
        () => ({
            query: query.trim() || undefined,
            category,
        }),
        [query, category],
    );

    const fetchResults = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMenu(params);
            const list = Array.isArray(data) ? (data as MenuItem[]) : [];
            setResults(sortResults(list, sort));
        } catch (err: any) {
            setError(err?.message || "Unable to fetch meals. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [params, sort]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const updateSort = useCallback((next: SearchSort) => setSort(next), []);

    return {
        query,
        setQuery,
        category,
        setCategory,
        sort,
        setSort: updateSort,
        results,
        loading,
        error,
        refetch: fetchResults,
    };
};

export default useSearch;
