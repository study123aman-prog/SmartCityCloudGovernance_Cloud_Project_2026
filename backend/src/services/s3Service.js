import { ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function createS3Service({ region, bucket }) {
  const client = region ? new S3Client({ region }) : null;

  function ensureConfigured() {
    if (!client || !bucket) {
      const error = new Error("S3 storage is not configured");
      error.statusCode = 503;
      throw error;
    }
  }

  return {
    async createUploadUrl({ key, contentType }) {
      ensureConfigured();
      const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
      return getSignedUrl(client, command, { expiresIn: 300 });
    },

    async listUserFiles(userId) {
      ensureConfigured();
      const result = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: `users/${userId}/` }));
      return (result.Contents ?? []).map((file) => ({ key: file.Key, size: file.Size, lastModified: file.LastModified }));
    },
  };
}
