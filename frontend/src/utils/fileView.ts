import { useAuthStore } from '@/store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export function getFileViewUrl(fileId: string): string {
  const token = useAuthStore.getState().accessToken
  return `${API_BASE_URL}/files/${fileId}/view?token=${token}`
}
