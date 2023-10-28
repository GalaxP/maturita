import { lazy } from "react"

export const lazyLoad = (path: string, namedExport?: string) => {
    return lazy(() => {
        const promise = import("../"+path)
        
        if(namedExport == null) return promise
        return promise.then((module)=>({default: module[namedExport]}))
    })
}