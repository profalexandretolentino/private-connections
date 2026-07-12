export function validateFile(file, maxFileSize) {
  if (!file) return;

  if (file.size > maxFileSize) {
    throw new Error("Please choose a file smaller than 8 MB.");
  }

  const allowedTypes = [
    "image/",
    "video/",
    "audio/"
  ];

  const isAllowed = allowedTypes.some((type) =>
    file.type.startsWith(type)
  );

  if (!isAllowed) {
    throw new Error("Unsupported file type.");
  }
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");

      const base64 = result.includes(",")
        ? result.split(",")[1]
        : result;

      resolve(base64);
    };

    reader.onerror = () => {
      reject(
        new Error("The selected file could not be read.")
      );
    };

    reader.readAsDataURL(file);
  });
}

export function getAttachmentLabel(file) {
  if (!file) return "No attachment";

  if (file.type.startsWith("image/")) {
    return "📷 Image received";
  }

  if (file.type.startsWith("video/")) {
    return "🎥 Video received";
  }

  if (file.type.startsWith("audio/")) {
    return "🎵 Audio received";
  }

  return "File received";
}

export async function createAttachment(file) {
  if (!file) return null;

  return {
    originalName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    base64: await fileToBase64(file)
  };
}