export default function SkeletonPost() {
    return (
        <div className="bg-[var(--bg-muted)]/40 border border-[var(--muted-border)] rounded-xl p-4 animate-pulse">
            <div className="flex items-start gap-3">
                {/* Avatar skeleton */}
                <div className="w-12 h-12 rounded-full bg-[rgba(10,167,198,0.1)]" />
                <div className="flex-1 space-y-3">
                    {/* Header text skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="h-4 bg-[rgba(10,167,198,0.1)] rounded w-1/4"></div>
                        <div className="h-3 bg-[rgba(10,167,198,0.05)] rounded w-1/6"></div>
                    </div>
                    {/* Content lines */}
                    <div className="space-y-2">
                        <div className="h-3 bg-[rgba(10,167,198,0.05)] rounded w-full"></div>
                        <div className="h-3 bg-[rgba(10,167,198,0.05)] rounded w-5/6"></div>
                        <div className="h-3 bg-[rgba(10,167,198,0.05)] rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
