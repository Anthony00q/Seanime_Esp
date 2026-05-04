import { useServerMutation } from "@/api/client/requests"
import { RemoveFileCacheBucket_Variables } from "@/api/generated/endpoint.types"
import { API_ENDPOINTS } from "@/api/generated/endpoints"
import { toast } from "sonner"
import { createTranslator } from "@/locales"

export function useGetFileCacheTotalSize() {
    return useServerMutation<boolean>({
        endpoint: API_ENDPOINTS.FILECACHE.GetFileCacheTotalSize.endpoint,
        method: API_ENDPOINTS.FILECACHE.GetFileCacheTotalSize.methods[0],
        mutationKey: [API_ENDPOINTS.FILECACHE.GetFileCacheTotalSize.key],
    })
}

export function useRemoveFileCacheBucket(onSuccess?: () => void) {
    const t = createTranslator("es")
    return useServerMutation<boolean, RemoveFileCacheBucket_Variables>({
        endpoint: API_ENDPOINTS.FILECACHE.RemoveFileCacheBucket.endpoint,
        method: API_ENDPOINTS.FILECACHE.RemoveFileCacheBucket.methods[0],
        mutationKey: [API_ENDPOINTS.FILECACHE.RemoveFileCacheBucket.key],
        onSuccess: async () => {
            toast.success(t("toast.filecache.cacheCleared"))
            onSuccess?.()
        },
    })
}

export function useGetFileCacheMediastreamVideoFilesTotalSize() {
    return useServerMutation<boolean>({
        endpoint: API_ENDPOINTS.FILECACHE.GetFileCacheMediastreamVideoFilesTotalSize.endpoint,
        method: API_ENDPOINTS.FILECACHE.GetFileCacheMediastreamVideoFilesTotalSize.methods[0],
        mutationKey: [API_ENDPOINTS.FILECACHE.GetFileCacheMediastreamVideoFilesTotalSize.key],
    })
}

export function useClearFileCacheMediastreamVideoFiles(onSuccess?: () => void) {
    const t = createTranslator("es")
    return useServerMutation<boolean>({
        endpoint: API_ENDPOINTS.FILECACHE.ClearFileCacheMediastreamVideoFiles.endpoint,
        method: API_ENDPOINTS.FILECACHE.ClearFileCacheMediastreamVideoFiles.methods[0],
        mutationKey: [API_ENDPOINTS.FILECACHE.ClearFileCacheMediastreamVideoFiles.key],
        onSuccess: async () => {
            toast.success(t("toast.filecache.cacheCleared"))
            onSuccess?.()
        },
    })
}
