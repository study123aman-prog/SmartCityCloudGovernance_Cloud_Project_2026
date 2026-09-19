import fs from "node:fs/promises";
import path from "node:path";
import { IObjectStorageService } from "../../repositories/interfaces/contracts.js";

export class LocalStorageService extends IObjectStorageService {
  constructor(baseDir = "data/uploads") {
    super();
    this.baseDir = path.resolve(process.cwd(), baseDir);
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (err) {
      console.warn("Could not create local storage directory:", err.message);
    }
  }

  async storeFile(filename, content, contentType = "application/json") {
    await this.init();
    const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const filePath = path.join(this.baseDir, safeName);
    await fs.writeFile(filePath, content);
    return {
      key: safeName,
      path: filePath,
      contentType,
      size: typeof content === "string" ? Buffer.byteLength(content) : content.length,
      stored_at: new Date().toISOString(),
    };
  }

  async getFile(key) {
    const filePath = path.join(this.baseDir, path.basename(key));
    const content = await fs.readFile(filePath);
    return content;
  }

  async listFiles(prefix = "") {
    await this.init();
    try {
      const files = await fs.readdir(this.baseDir);
      const list = [];
      for (const file of files) {
        if (prefix && !file.startsWith(prefix)) continue;
        const stats = await fs.stat(path.join(this.baseDir, file));
        list.push({
          key: file,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
        });
      }
      return list;
    } catch {
      return [];
    }
  }

  async createUploadUrl(filename, contentType) {
    // In local development, return local direct upload route
    const safeName = `${Date.now()}_${path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    return {
      key: safeName,
      uploadUrl: `/api/files/upload?key=${encodeURIComponent(safeName)}`,
      expiresIn: 3600,
      mode: "local_filesystem",
    };
  }
}
