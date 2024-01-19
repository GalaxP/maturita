import { Skeleton } from "components/ui/skeleton"

export const PostSkeleton = () => {
    return <div className="w-11/12 lg:w-[700px] sm:w-11/12 mx-auto mt-6 space-y-4">
        <Skeleton className="h-52" />
        <Skeleton className="h-16" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
    </div>
}

