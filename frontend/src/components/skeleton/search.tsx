import { Skeleton } from "../ui/skeleton"

const SearchSkeleton = () => {

    return <>
                
        <div className="mt-6">
            <div className="flex flex-row w-full justify-center"> 
                <ul className="w-11/12 lg:w-[800px] sm:w-11/12 space-y-2">
                    <li className="w-full"> 
                        <Skeleton className="w-full h-40 rounded-md" />
                    </li>
                    <li className="w-full"> 
                        <Skeleton className="w-full h-40 rounded-md" />
                    </li>
                    <li className="w-full"> 
                        <Skeleton className="w-full h-40 rounded-md" />
                    </li>
                    <li className="w-full"> 
                        <Skeleton className="w-full h-40 rounded-md" />
                    </li>
                    <li className="w-full"> 
                        <Skeleton className="w-full h-40 rounded-md" />
                    </li>
                </ul>
            </div>
        </div>
    </>
}

export default SearchSkeleton