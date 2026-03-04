import { create } from 'zustand';

interface LikeState {
    likes: Record<string, number>;
    isLiked: Record<string, boolean>;
    setLikeData: (postId: string, count: number, liked: boolean) => void;
    getLikeData: (postId: string) => { count?: number; liked?: boolean };
}

export const useLikeStore = create<LikeState>((set, get) => ({
    likes: {},
    isLiked: {},
    setLikeData: (postId, count, liked) =>
        set((state) => ({
            likes: { ...state.likes, [postId]: count },
            isLiked: { ...state.isLiked, [postId]: liked },
        })),
    getLikeData: (postId) => {
        const state = get();
        return { count: state.likes[postId], liked: state.isLiked[postId] };
    },
}));
