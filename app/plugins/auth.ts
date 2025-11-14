import {useAuth} from "~/domains/auth/composables/useAuth";

export default defineNuxtPlugin(async () => {
    if (import.meta.client) {
        const { initAuth } = useAuth()
        await initAuth()
    }
})