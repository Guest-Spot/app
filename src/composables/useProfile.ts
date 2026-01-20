import { useMutation } from '@vue/apollo-composable';
import { UPDATE_PROFILE_MUTATION } from 'src/apollo/types/profile';

const useProfile = () => {
  const { mutate: updateProfileMutation } = useMutation(UPDATE_PROFILE_MUTATION);

  const updateProfile = async (documentId: string, data: Record<string, unknown>) =>
    updateProfileMutation({ documentId, data });

  return {
    updateProfile,
  };
};

export default useProfile;
