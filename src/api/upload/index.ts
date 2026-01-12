import { api } from 'src/boot/axios';

// Upload files types
export interface UploadFileResponse {
  id: number;
  documentId: string;
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

type UploadApiResponse<T> = T | { data: T };

const hasDataWrapper = <T>(payload: UploadApiResponse<T>): payload is { data: T } => {
  return typeof payload === 'object' && payload !== null && 'data' in payload;
};

const normalizeUploadFilesResponse = (
  payload: UploadApiResponse<UploadFileResponse[]>,
): UploadFileResponse[] => {
  if (Array.isArray(payload)) return payload;
  if (hasDataWrapper(payload)) {
    return Array.isArray(payload.data) ? payload.data : [];
  }
  return [];
};

const normalizeUploadFileResponse = (
  payload: UploadApiResponse<UploadFileResponse>,
): UploadFileResponse => {
  if (hasDataWrapper(payload)) {
    return payload.data;
  }
  return payload;
};

/**
 * Upload files to Strapi
 * @param files - File(s) to upload
 * @param folder - Optional folder path where files should be uploaded
 * @returns Promise with uploaded file(s) data
 */
export async function uploadFiles(
  files: File | File[],
  folder?: string,
): Promise<UploadFileResponse[]> {
  const formData = new FormData();

  if (Array.isArray(files)) {
    files.forEach((file) => {
      formData.append('files', file);
    });
  } else {
    formData.append('files', files);
  }

  // Add folder parameter if provided
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await api.post<UploadApiResponse<UploadFileResponse[]>>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return normalizeUploadFilesResponse(response.data);
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
    params.files.forEach((file) => {
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

  const response = await api.post<UploadApiResponse<UploadFileResponse[]>>('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return normalizeUploadFilesResponse(response.data);
}

/**
 * Get list of uploaded files
 * @returns Promise with files list
 */
export async function getFiles(): Promise<UploadFileResponse[]> {
  const response = await api.get<UploadApiResponse<UploadFileResponse[]>>('/api/upload/files');
  return normalizeUploadFilesResponse(response.data);
}

/**
 * Get specific file by ID
 * @param id - File ID
 * @returns Promise with file data
 */
export async function getFile(id: number | string): Promise<UploadFileResponse> {
  const response = await api.get<UploadApiResponse<UploadFileResponse>>(`/api/upload/files/${id}`);
  return normalizeUploadFileResponse(response.data);
}

/**
 * Update file information
 * @param id - File ID
 * @param fileInfo - New file information
 * @returns Promise with updated file data
 */
export async function updateFileInfo(
  id: number | string,
  fileInfo: UpdateFileInfoParams,
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('fileInfo', JSON.stringify(fileInfo));

  const response = await api.post<UploadApiResponse<UploadFileResponse>>(
    `/api/upload?id=${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return normalizeUploadFileResponse(response.data);
}

/**
 * Delete file by ID
 * @param id - File ID to delete
 * @returns Promise with deleted file data
 */
export async function deleteFile(id: number | string): Promise<UploadFileResponse> {
  const response = await api.delete<UploadApiResponse<UploadFileResponse>>(`/api/upload/files/${id}`);
  return normalizeUploadFileResponse(response.data);
}
