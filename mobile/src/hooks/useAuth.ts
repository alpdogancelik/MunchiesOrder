import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';

export type AuthUser = {
    id: string;
    email?: string | null;
};

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data }) => {
            if (!mounted) return;
            const u = data.session?.user;
            setUser(u ? { id: u.id, email: u.email } : null);
            setLoading(false);
        });

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            const u = session?.user;
            setUser(u ? { id: u.id, email: u.email } : null);
            setLoading(false);
        });

        return () => {
            mounted = false;
            sub.subscription.unsubscribe();
        };
    }, []);

    return { user, loading } as const;
}
