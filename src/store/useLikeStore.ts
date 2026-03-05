import { create } from 'zustand';

interface LikeState {
    likes: Record<string, number>;
    isLiked: Record<string, boolean>;
    likedByAvatars: Record<string, string[]>;
    setLikeData: (postId: string, count: number, liked: boolean) => void;
    getLikeData: (postId: string) => { count?: number; liked?: boolean };
    setLikedByAvatars: (postId: string, avatars: string[]) => void;
    addLikeAvatar: (postId: string, avatarUrl: string) => void;
    removeLikeAvatar: (postId: string, avatarUrl: string) => void;
}

export const useLikeStore = create<LikeState>((set, get) => ({
    likes: {},
    isLiked: {},
    likedByAvatars: {},
    setLikeData: (postId, count, liked) =>
        set((state) => ({
            likes: { ...state.likes, [postId]: count },
            isLiked: { ...state.isLiked, [postId]: liked },
        })),
    getLikeData: (postId) => {
        const state = get();
        return { count: state.likes[postId], liked: state.isLiked[postId] };
    },
    setLikedByAvatars: (postId, avatars) =>
        set((state) => ({
            likedByAvatars: { ...state.likedByAvatars, [postId]: avatars },
        })),
    addLikeAvatar: (postId, avatarUrl) =>
        set((state) => {
            const current = state.likedByAvatars[postId] || [];
            // Don't add duplicates
            if (current.includes(avatarUrl)) return {};
            return {
                likedByAvatars: {
                    ...state.likedByAvatars,
                    [postId]: [avatarUrl, ...current],
                },
            };
        }),
    removeLikeAvatar: (postId, avatarUrl) =>
        set((state) => {
            const current = state.likedByAvatars[postId] || [];
            return {
                likedByAvatars: {
                    ...state.likedByAvatars,
                    [postId]: current.filter((url) => url !== avatarUrl),
                },
            };
        }),
}));
