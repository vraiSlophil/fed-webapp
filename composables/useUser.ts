import type {User} from "~/types/user";

export async function useUser() {
  const user = ref<User | null>(null)

  const response = await useApiFetch('/api/user', {method: HttpMethod.GET})
  if (response && response.user) {
      user.value = response.user
  } else {
      user.value = null
  }

  return {user}
}