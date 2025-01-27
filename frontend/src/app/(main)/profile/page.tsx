'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
    const router = useRouter();

    const user = { email: "john.doe@iiit.ac.in"}

    useEffect(() => {
        if (user?.email) {
            router.push(`/profile/${encodeURIComponent(user.email)}`);
        }
    }, [user, router]);

    return null;
}