import { api } from 'src/boot/axios';

// Upload files types
export interface UploadFileResponse {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface UploadEntryParams {
  files: File | File[];
  refId?: string;
  ref?: string;
  field?: string;
  source?: string;
  path?: string;
}

export interface UpdateFileInfoParams {
  alternativeText?: string;
  caption?: string;
  name?: string;
}

/**
 * Upload files to Strapi
 * @param files - File(s) to upload
 * @returns Promise with uploaded file(s) data
 */
export async function uploadFiles(files: File | File[]): Promise<UploadFileResponse[]> {
  const formData = new FormData();

  if (Array.isArray(files)) {
    files.forEach(file => {
      formData.append('files', file);
    });
  } else {
    formData.append('files', files);
  }

  const response = await api.post<UploadFileResponse[]>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Upload files and link them to a specific entry
 * @param params - Upload parameters including files and relation data
 * @returns Promise with uploaded file(s) data
 */
export async function uploadEntryFiles(params: UploadEntryParams): Promise<UploadFileResponse[]> {
  const formData = new FormData();

  // Add files
  if (Array.isArray(params.files)) {
    params.files.forEach(file => {
      formData.append('files', file);
    });
  } else {
    formData.append('files', params.files);
  }

  // Add optional parameters
  if (params.refId) formData.append('refId', params.refId);
  if (params.ref) formData.append('ref', params.ref);
  if (params.field) formData.append('field', params.field);
  if (params.source) formData.append('source', params.source);
  if (params.path) formData.append('path', params.path);

  const response = await api.post<UploadFileResponse[]>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Get list of uploaded files
 * @returns Promise with files list
 */
export async function getFiles(): Promise<UploadFileResponse[]> {
  const response = await api.get<UploadFileResponse[]>('/api/upload/files');
  return response.data;
}

/**
 * Get specific file by ID
 * @param id - File ID
 * @returns Promise with file data
 */
export async function getFile(id: number | string): Promise<UploadFileResponse> {
  const response = await api.get<UploadFileResponse>(`/api/upload/files/${id}`);
  return response.data;
}

/**
 * Update file information
 * @param id - File ID
 * @param fileInfo - New file information
 * @returns Promise with updated file data
 */
export async function updateFileInfo(id: number | string, fileInfo: UpdateFileInfoParams): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('fileInfo', JSON.stringify(fileInfo));

  const response = await api.post<UploadFileResponse>(`/api/upload?id=${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

/**
 * Delete file by ID
 * @param id - File ID to delete
 * @returns Promise with deleted file data
 */
export async function deleteFile(id: number | string): Promise<UploadFileResponse> {
  const response = await api.delete<UploadFileResponse>(`/api/upload/files/${id}`);
  return response.data;
}
