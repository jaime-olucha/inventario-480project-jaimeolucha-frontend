import { getInitials } from "@/infrastructure/helpers/getInitials";

interface AvatarUser {
  name: string;
  surname?: string;
}

interface LogoUserProps {
  user?: AvatarUser;
  className?: string;
}

export const LogoUser = ({ user, className }: LogoUserProps) => {
  if (!user) return;
  const initials = getInitials(user.name, user.surname);
  return <p className={className}>{initials}</p>;
};
