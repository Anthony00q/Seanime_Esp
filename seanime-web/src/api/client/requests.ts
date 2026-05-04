import { getServerBaseUrl } from "@/api/client/server-url"
import { SERVER_AUTH_TOKEN_STORAGE_KEY, serverAuthTokenAtom } from "@/app/(main)/_atoms/server-status.atoms"
import { getClientId, getClientIdProof, setClientIdentity } from "@/lib/server/client-id"
import { createTranslator } from "@/locales"
import { __clientPlatform__ } from "@/types/constants"
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useAtomValue } from "jotai"
import { useEffect } from "react"
import { toast } from "sonner"

type SeaError = AxiosError<{ error: string }>

let authRedirectInProgress = false

type SeaQuery<D> = {
    endpoint: string
    method: "POST" | "GET" | "PATCH" | "DELETE" | "PUT"
    data?: D
    params?: D
    password?: string
}

export function useSeaQuery() {
    const password = useAtomValue(serverAuthTokenAtom)

    return {
        seaFetch: <T, D extends any = any>(endpoint: string, method: "POST" | "GET" | "PATCH" | "DELETE" | "PUT", data?: D, params?: D) => {
            return buildSeaQuery<T, D>({
                endpoint,
                method,
                data,
                params,
                password,
            })
        },
    }
}

function getSeaErrorMessage(data: unknown): string {
    if (typeof data === "string") {
        return data.trim()
    }

    if (typeof data === "object" && data !== null && "error" in data && typeof data.error === "string") {
        return data.error.trim()
    }

    return ""
}

function isAuthFailureResponse(status: number | undefined, data: unknown): boolean {
    const errorMessage = getSeaErrorMessage(data).toLowerCase()

    if (status === 401) {
        return errorMessage === "" || errorMessage.includes("unauthenticated") || errorMessage.includes("unauthorized")
    }

    return status === 429 && errorMessage.includes("too many authentication attempts")
}

function clearStoredServerAuthToken() {
    if (typeof window === "undefined") return

    try {
        window.localStorage.removeItem(SERVER_AUTH_TOKEN_STORAGE_KEY)
    }
    catch {
    }
}

function _handleAuthFailure() {
    clearStoredServerAuthToken()

    if (typeof window === "undefined") return
    if (window.location.pathname.startsWith("/public/auth")) return
    if (authRedirectInProgress) return

    authRedirectInProgress = true
    window.location.replace("/public/auth")
}

function checkAuthError(error: SeaError | AxiosError | null | undefined) {
    if (!error) return

    if (isAuthFailureResponse(error.response?.status, error.response?.data)) {
        _handleAuthFailure()
    }
}

/**
 * Create axios query to the server
 * - First generic: Return type
 * - Second generic: Params/Data type
 */
export async function buildSeaQuery<T, D extends any = any>(
    {
        endpoint,
        method,
        data,
        params,
        password,
    }: SeaQuery<D>): Promise<T | undefined> {
    const headers: Record<string, string> = {}

    if (password) {
        headers["X-Seanime-Token"] = password
    }

    const clientId = getClientId()
    const clientIdProof = getClientIdProof()
    if (clientId && clientIdProof) {
        headers["X-Seanime-Client-Id"] = clientId
        headers["X-Seanime-Client-Id-Proof"] = clientIdProof
    }
    if (__clientPlatform__) {
        headers["X-Seanime-Client-Platform"] = __clientPlatform__
    }

    let res
    try {
        res = await axios<T>({
            url: getServerBaseUrl() + endpoint,
            method,
            data,
            params,
            headers,
            withCredentials: true,
        })
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            checkAuthError(error)
        }
        throw error
    }

    syncClientIdFromHeader(res.headers)

    const response = _handleSeaResponse<T>(res.data)
    return response.data
}

function syncClientIdFromHeader(headers: unknown) {
    if (!headers) return

    const clientId = getHeaderValue(headers, "x-seanime-client-id")
    const clientIdProof = getHeaderValue(headers, "x-seanime-client-id-proof")

    if (clientId) {
        setClientIdentity(clientId, clientIdProof)
    }
}

function getHeaderValue(headers: unknown, name: string): string {
    if (typeof headers === "object" && headers !== null && "get" in headers && typeof headers.get === "function") {
        const value = headers.get(name)
        if (typeof value === "string" && value.trim()) {
            return value.trim()
        }
        return ""
    }

    const rawValue = (headers as Record<string, string | string[] | undefined>)[name]
    if (typeof rawValue === "string" && rawValue.trim()) {
        return rawValue.trim()
    }

    if (Array.isArray(rawValue) && typeof rawValue[0] === "string" && rawValue[0].trim()) {
        return rawValue[0].trim()
    }

    return ""
}

type ServerMutationProps<R, V = void> = UseMutationOptions<R | undefined, SeaError, V, unknown> & {
    endpoint: string
    method: "POST" | "GET" | "PATCH" | "DELETE" | "PUT"
}

/**
 * Create mutation hook to the server
 * - First generic: Return type
 * - Second generic: Params/Data type
 */
export function useServerMutation<R = void, V = void>(
    {
        endpoint,
        method,
        ...options
    }: ServerMutationProps<R, V>) {

    const t = createTranslator("es")
    const password = useAtomValue(serverAuthTokenAtom)

    return useMutation<R | undefined, SeaError, V>({
        onError: error => {
            checkAuthError(error)
            if (isAuthFailureResponse(error.response?.status, error.response?.data)) {
                return
            }
            console.log("Mutation error", error)
            const errorMsg = _handleSeaError(error.response?.data)
            if (errorMsg.includes("feature disabled")) {
                toast.warning(t("toast.client.featureDisabled"))
                return
            }
            toast.error(errorMsg)
        },
        mutationFn: async (variables) => {
            return buildSeaQuery<R, V>({
                endpoint: endpoint,
                method: method,
                data: variables,
                password: password,
            })
        },
        ...options,
    })
}


type ServerQueryProps<R, V> = UseQueryOptions<R | undefined, SeaError, R | undefined> & {
    endpoint: string
    method: "POST" | "GET" | "PATCH" | "DELETE" | "PUT"
    params?: V
    data?: V
    muteError?: boolean
}

/**
 * Create query hook to the server
 * - First generic: Return type
 * - Second generic: Params/Data type
 */
export function useServerQuery<R, V = any>(
    {
        endpoint,
        method,
        params,
        data,
        muteError,
        ...options
    }: ServerQueryProps<R | undefined, V>) {

    const password = useAtomValue(serverAuthTokenAtom)

    const props = useQuery<R | undefined, SeaError>({
        queryFn: async () => {
            return buildSeaQuery<R, V>({
                endpoint: endpoint,
                method: method,
                params: params,
                data: data,
                password: password,
            })
        },
        ...options,
    })

    useEffect(() => {
        if (!muteError && props.isError) {
            if (isAuthFailureResponse(props.error?.response?.status, props.error?.response?.data)) {
                _handleAuthFailure()
                return
            }
            console.log("Server error", props.error)
            const errorMsg = _handleSeaError(props.error?.response?.data)
            if (errorMsg.includes("feature disabled")) {
                return
            }
            if (!!errorMsg) {
                toast.error(errorMsg)
            }
        }
    }, [props.error, props.isError, muteError])

    return props
}

//----------------------------------------------------------------------------------------------------------------------

function _handleSeaError(data: any): string {
    const t = createTranslator("es")
    if (typeof data === "string") return "Server Error: " + data

    const err = data?.error as string

    if (!err) return "Unknown error"

    if (err.includes("Too many requests"))
        return t("toast.client.anilistRateLimit")

    try {
        const graphqlErr = JSON.parse(err) as any
        console.log("AniList error", graphqlErr)
        if (graphqlErr.graphqlErrors && graphqlErr.graphqlErrors.length > 0 && !!graphqlErr.graphqlErrors[0]?.message) {
            return t("toast.client.anilistError", { error: graphqlErr.graphqlErrors[0]?.message })
        }
        return t("toast.client.anilistError", { error: "" })
    }
    catch (e) {
        if (err.includes("no cached data") || err.includes("cache lookup failed")) {
            return ""
        }
        return t("toast.client.error", { error: err })
    }
}

function _handleSeaResponse<T>(res: unknown): { data: T | undefined, error: string | undefined } {
    const t = createTranslator("es")

    if (typeof res === "object" && !!res && "error" in res && typeof res.error === "string") {
        return { data: undefined, error: res.error }
    }
    if (typeof res === "object" && !!res && "data" in res) {
        return { data: res.data as T, error: undefined }
    }

    return { data: undefined, error: t("toast.client.noResponse") }

}
