# API Module

This module provides API utilities for the GuestSpot application, including file upload functionality for Strapi v5.

## Upload API

The upload module provides methods for uploading and managing files in Strapi.

### Usage Examples

#### Import the API

```typescript
import { uploadFiles, deleteFile, UploadAPI } from 'src/api';
```

#### Upload Files

```typescript
// Upload single file
const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
const uploadedFiles = await uploadFiles(file);

// Upload multiple files
const files = [file1, file2, file3];
const uploadedFiles = await uploadFiles(files);
```

#### Upload Files Linked to Entry

```typescript
// Upload file and link to a restaurant entry
const uploadedFiles = await uploadEntryFiles({
  files: file,
  refId: '5c126648c7415f0c0ef1bccd',
  ref: 'api::restaurant.restaurant',
  field: 'cover'
});
```

#### Delete File

```typescript
// Delete file by ID
const deletedFile = await deleteFile(123);
```

#### Get Files

```typescript
// Get all files
const allFiles = await getFiles();

// Get specific file
const file = await getFile(123);
```

#### Update File Info

```typescript
// Update file metadata
const updatedFile = await updateFileInfo(123, {
  alternativeText: 'New alt text',
  caption: 'New caption'
});
```

### API Methods

- `uploadFiles(files)` - Upload one or more files
- `uploadEntryFiles(params)` - Upload files and link to entry
- `getFiles()` - Get list of all files
- `getFile(id)` - Get specific file by ID
- `updateFileInfo(id, fileInfo)` - Update file metadata
- `deleteFile(id)` - Delete file by ID

### Types

```typescript
interface UploadFileResponse {
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

interface UploadEntryParams {
  files: File | File[];
  refId?: string;
  ref?: string;
  field?: string;
  source?: string;
  path?: string;
}

interface UpdateFileInfoParams {
  alternativeText?: string;
  caption?: string;
  name?: string;
}
```
