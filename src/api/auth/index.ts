import { api } from 'src/boot/axios';

/**
 * Delete file by ID
 * @param id - File ID to delete
 * @returns Promise with deleted file data
 */
export async function connect(url: string) {
  const response = await api.get(url);
  return response.data;
}
