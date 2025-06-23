import type {User} from "~/types/user";

export async function useUser(): Promise<{user: Ref<User | null>}> {
  const user = ref<User | null>(null)

  const response = await useApiFetch('/api/user', {method: HttpMethod.GET})
  if (response && response.data) {
      user.value = response.data
  } else {
      user.value = null
  }

  return {user}
}