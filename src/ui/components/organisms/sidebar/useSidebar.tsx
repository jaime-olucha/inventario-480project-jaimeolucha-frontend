import { getRoleBadge } from '@/infrastructure/helpers/getRoleBadge';
import { useRepositories } from '@/infrastructure/RepositoryContext/RepositoryContext';
import { useAuthStore } from '@/infrastructure/store/auth.store';
import { useUserStore } from '@/infrastructure/store/user.store';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

export const useSidebar = () => {

  const [expanded, setExpanded] = useState(true);
  const user = useUserStore((store) => store.user);
  const clearUser = useUserStore((store) => store.clearUser);
  const authLogout = useAuthStore((store) => store.logout);
  const navigate = useNavigate();
  const { auth } = useRepositories();

  const roleBadge = getRoleBadge(user?.role);

  const handleToggleExpanded = () => {
    setExpanded((v) => !v)
  }

  async function handleLogout() {
    try {
      await auth.logout();
    } finally {
      authLogout();
      clearUser();
      navigate("/login");
    }
  }


  return {
    expanded,
    roleBadge,
    user,

    handleLogout,
    handleToggleExpanded
  }
}
