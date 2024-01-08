import { useEffect } from "react";
import { Skeleton } from "../ui/skeleton"

const HomeSkeleton = () => {
    const n:number = Math.round(window.innerHeight/180);
    useEffect(()=>{
    })
    return <>
        <div className="mt-6">
            <div className="flex flex-row w-full justify-center"> 
                <ul className="w-11/12 lg:w-[650px] sm:w-11/12 space-y-2">
    
                    {
                    [...Array(n)].map((e, i) => <>
                            <li className="w-full"> 
                                <Skeleton className="w-full h-40 rounded-md" />
                            </li>  

                            </>)
                    }

                </ul>

                <div className="w-[300px] hidden sm:hidden md:hidden lg:block ml-6 space-y-2">
                    <Skeleton className="w-full h-[212px] rounded-md" />
                    <Skeleton className="w-full h-[178px] rounded-md" />
                </div>
            </div>
        </div>
        
    </>
}

export default HomeSkeleton