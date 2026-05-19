import { useEffect } from "react"
import { useAuthStore } from "../../infrastructure/store/auth.store"
import { useUserStore } from "../../infrastructure/store/user.store"
import { jwtDecode } from "jwt-decode"
import type { JwtPayload } from "./interface/JwtPayload"
import { useRepositories } from "../../infrastructure/RepositoryContext/RepositoryContext"

export const useAuthInit = () => {
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const setUser = useUserStore((state) => state.setUser)
  const setInitialized = useUserStore((state) => state.setInitialized)
  const { user } = useRepositories()

  useEffect(() => {
    if (!token) {
      setInitialized();
      return;
    }

    try {
      const decode = jwtDecode<JwtPayload>(token)

      user.getById(decode.id).then((u) => {
        setUser(u);

      }).catch(() => {
        logout();

      }).finally(() => {
        setInitialized();
      })

    } catch {
      logout()
      setInitialized();
    }
  }, [token, logout, setUser, setInitialized, user])
}
