import { getAccessToken } from './googleDriveAuth';

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  size?: string;
  createdTime?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface UploadProgressCallback {
  (current: number, total: number, fileName: string, status: 'uploading' | 'completed' | 'error'): void;
}

function getMimeTypeForFile(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ipynb':
      return 'application/x-ipynb+json';
    case 'py':
      return 'text/x-python';
    case 'csv':
      return 'text/csv';
    case 'json':
      return 'application/json';
    case 'md':
      return 'text/markdown';
    case 'txt':
      return 'text/plain';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Searches for an existing folder by name (optionally inside a specific parent folder)
 */
export async function findFolder(folderName: string, parentId?: string): Promise<DriveFolder | null> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  let query = `name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)&spaces=drive`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return {
      id: data.files[0].id,
      name: data.files[0].name,
      webViewLink: data.files[0].webViewLink,
    };
  }

  return null;
}

/**
 * Creates a folder in Google Drive (optionally inside a parent folder)
 */
export async function createFolder(folderName: string, parentId?: string): Promise<DriveFolder> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const metadata: Record<string, any> = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  if (parentId) {
    metadata.parents = [parentId];
  }

  const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Google Drive folder: ${errorText}`);
  }

  return await response.json();
}

/**
 * Ensures a dedicated RubricAI folder hierarchy exists:
 * /RubricAI Student Projects / [Project Name]
 */
export async function getOrCreateProjectFolder(projectName: string): Promise<DriveFolder> {
  // 1. Root folder
  const rootFolderName = 'RubricAI Student Projects';
  let rootFolder = await findFolder(rootFolderName);
  if (!rootFolder) {
    rootFolder = await createFolder(rootFolderName);
  }

  // 2. Project subfolder
  const safeProjectName = (projectName || 'Data Science Project').trim();
  let projectFolder = await findFolder(safeProjectName, rootFolder.id);
  if (!projectFolder) {
    projectFolder = await createFolder(safeProjectName, rootFolder.id);
  }

  return projectFolder;
}

/**
 * Uploads a single file to a specific Google Drive folder using multipart upload
 */
export async function uploadFileToDrive(
  fileName: string,
  content: string,
  folderId: string,
  customMimeType?: string
): Promise<DriveItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const mimeType = customMimeType || getMimeTypeForFile(fileName);
  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,size,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload ${fileName} to Google Drive: ${errorText}`);
  }

  return await response.json();
}

/**
 * Uploads a collection of files into a project folder with progress callbacks
 */
export async function uploadProjectFilesToDrive(
  projectName: string,
  files: { name: string; content: string }[],
  onProgress?: UploadProgressCallback
): Promise<{ folder: DriveFolder; uploadedFiles: DriveItem[] }> {
  const folder = await getOrCreateProjectFolder(projectName);
  const uploadedFiles: DriveItem[] = [];

  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    if (onProgress) {
      onProgress(i + 1, files.length, f.name, 'uploading');
    }

    try {
      const driveFile = await uploadFileToDrive(f.name, f.content, folder.id);
      uploadedFiles.push(driveFile);
      if (onProgress) {
        onProgress(i + 1, files.length, f.name, 'completed');
      }
    } catch (err: any) {
      if (onProgress) {
        onProgress(i + 1, files.length, f.name, 'error');
      }
      throw err;
    }
  }

  return { folder, uploadedFiles };
}

/**
 * Lists files present in a folder
 */
export async function listFolderFiles(folderId: string): Promise<DriveItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const query = `'${folderId}' in parents and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,webViewLink,size,createdTime)&orderBy=createdTime desc`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to list files from Google Drive: ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Deletes a file from Google Drive (MUST be called only after user confirmation in the UI)
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Drive');

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete file from Google Drive: ${errorText}`);
  }
}
