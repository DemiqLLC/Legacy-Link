import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

import type { UserRoleEnum } from '@/common-types/auth';

type UniversityData = {
  id: string;
  name: string;
  role: UserRoleEnum;
};

export type UseUniversitiesReturn = {
  changeToNewUniversity: (university: UniversityData) => Promise<void>;
};

export const useUniversities = (): UseUniversitiesReturn => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const changeToNewUniversity = async (
    university: UniversityData
  ): Promise<void> => {
    await update({
      user: {
        ...session?.user,
        selectedUniversity: {
          id: university.id,
          name: university.name,
          role: university.role,
        },
      },
    });
    await router.push('/');
  };

  return {
    changeToNewUniversity,
  };
};
