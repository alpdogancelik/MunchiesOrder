import React, { createContext, useContext, useMemo, useReducer } from 'react';
import type { MenuItem } from '@shared/schema';

export type CartLine = {
    item: Pick<MenuItem, 'id' | 'name' | 'price' | 'restaurantId'>;
    quantity: number;
};

type State = {
    lines: CartLine[];
};

type Action =
    | { type: 'add'; item: CartLine['item']; qty?: number }
    | { type: 'remove'; id: number }
    | { type: 'clear' };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'add': {
            const idx = state.lines.findIndex((l) => l.item.id === action.item.id);
            const qty = action.qty ?? 1;
            if (idx >= 0) {
                const next = [...state.lines];
                next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
                return { lines: next };
            }
            return { lines: [...state.lines, { item: action.item, quantity: qty }] };
        }
        case 'remove':
            return { lines: state.lines.filter((l) => l.item.id !== action.id) };
        case 'clear':
            return { lines: [] };
        default:
            return state;
    }
}

const CartCtx = createContext<{
    state: State;
    add: (item: CartLine['item'], qty?: number) => void;
    remove: (id: number) => void;
    clear: () => void;
    total: number;
}>({ state: { lines: [] }, add: () => { }, remove: () => { }, clear: () => { }, total: 0 });

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, { lines: [] });
    const total = useMemo(() => state.lines.reduce((sum, l) => sum + Number(l.item.price) * l.quantity, 0), [state.lines]);
    const value = useMemo(
        () => ({
            state,
            add: (item: CartLine['item'], qty?: number) => dispatch({ type: 'add', item, qty }),
            remove: (id: number) => dispatch({ type: 'remove', id }),
            clear: () => dispatch({ type: 'clear' }),
            total,
        }),
        [state, total]
    );
    return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
    return useContext(CartCtx);
}
