import { useQuery } from "@tanstack/react-query";

interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  schoolId?: string;
  classroomId?: string;
  active: boolean;
  roleName?: string;
  roleDisplayName?: string;
  roleCategory?: string;
  roleDescription?: string;
}

export function useCurrentRole() {
  const { data: currentRole, isLoading, error } = useQuery<UserRole>({
    queryKey: ['/api/user/current-role'],
  });

  return {
    currentRole,
    isLoading,
    error,
  };
}