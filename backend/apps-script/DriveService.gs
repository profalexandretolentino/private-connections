/**
 * ==========================================
 * Private Connections
 * DriveService.gs
 * ==========================================
 */

/**
 * Abre a pasta storage configurada
 * e localiza ou cria as subpastas.
 */
function getStorageFolders() {
  const root = DriveApp.getFolderById(
    CONFIG.storageFolderId
  );

  return {
    root: root,

    images: getOrCreateChildFolder(
      root,
      CONFIG.folders.images
    ),

    videos: getOrCreateChildFolder(
      root,
      CONFIG.folders.videos
    ),

    audio: getOrCreateChildFolder(
      root,
      CONFIG.folders.audio
    )
  };
}

/**
 * Retorna uma subpasta existente
 * ou cria uma nova.
 */
function getOrCreateChildFolder(parent, name) {
  const folders = parent.getFoldersByName(name);

  if (folders.hasNext()) {
    return folders.next();
  }

  return parent.createFolder(name);
}

/**
 * Salva um anexo recebido em Base64.
 */
function saveAttachment({
  attachment,
  folders,
  timestamp
}) {
  const mimeType = String(
    attachment.mimeType ||
    "application/octet-stream"
  );

  const originalName = String(
    attachment.originalName ||
    "attachment"
  );

  const declaredSize = Number(
    attachment.size || 0
  );

  validateAttachmentSize(declaredSize);

  const bytes = Utilities.base64Decode(
    String(attachment.base64)
  );

  validateAttachmentSize(bytes.length);

  const destination =
    getAttachmentDestination(
      mimeType,
      folders
    );

  const extension =
    resolveFileExtension(
      originalName,
      mimeType
    );

  const fileNumber =
    countFolderFiles(
      destination.folder
    ) + 1;

  const datePart = Utilities.formatDate(
    timestamp,
    CONFIG.timezone,
    "yyyy-MM-dd_HH-mm-ss"
  );

  const fileName =
    `${datePart}_${destination.prefix}-${String(
      fileNumber
    ).padStart(3, "0")}.${extension}`;

  const blob = Utilities.newBlob(
    bytes,
    mimeType,
    fileName
  );

  const file =
    destination.folder.createFile(blob);

  return {
    type: destination.label,
    fileName: fileName,
    driveUrl: file.getUrl(),
    saved: true
  };
}

/**
 * Escolhe a pasta correta conforme o MIME type.
 */
function getAttachmentDestination(
  mimeType,
  folders
) {
  if (mimeType.startsWith("image/")) {
    return {
      folder: folders.images,
      label: "Image",
      prefix: "img"
    };
  }

  if (mimeType.startsWith("video/")) {
    return {
      folder: folders.videos,
      label: "Video",
      prefix: "video"
    };
  }

  if (mimeType.startsWith("audio/")) {
    return {
      folder: folders.audio,
      label: "Audio",
      prefix: "audio"
    };
  }

  throw new Error(
    "Unsupported attachment type."
  );
}

/**
 * Conta os arquivos existentes na pasta.
 */
function countFolderFiles(folder) {
  const files = folder.getFiles();
  let total = 0;

  while (files.hasNext()) {
    files.next();
    total += 1;
  }

  return total;
}

/**
 * Resolve a extensão usando o nome
 * ou o tipo MIME.
 */
function resolveFileExtension(
  originalName,
  mimeType
) {
  const detectedExtension =
    getFileExtension(originalName);

  if (detectedExtension) {
    return detectedExtension;
  }

  const mimeExtensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",

    "video/mp4": "mp4",
    "video/webm": "webm",

    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/wav": "wav",
    "audio/ogg": "ogg"
  };

  return mimeExtensions[mimeType] || "bin";
}

/**
 * Testa acesso à pasta storage
 * e às subpastas.
 */
function testStorageFolders() {
  const folders = getStorageFolders();

  Logger.log(
    "Root folder: " +
    folders.root.getName()
  );

  Logger.log(
    "Image folder: " +
    folders.images.getName()
  );

  Logger.log(
    "Video folder: " +
    folders.videos.getName()
  );

  Logger.log(
    "Audio folder: " +
    folders.audio.getName()
  );
}