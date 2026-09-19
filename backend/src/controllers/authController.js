import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { User } from "../models/User.js";

const credentialsSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

function createToken(user, jwtSecret) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, jwtSecret, { expiresIn: "1h" });
}

function publicUser(user) {
  return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, notificationsEnabled: user.notificationsEnabled };
}

export function createAuthController({ jwtSecret }) {
  return {
    async register(request, response) {
      const input = credentialsSchema.extend({ name: z.string().trim().min(2).max(100) }).safeParse(request.body);
      if (!input.success) return response.status(400).json({ error: "Invalid registration data", details: input.error.flatten() });

      const existingUser = await User.findOne({ email: input.data.email });
      if (existingUser) return response.status(409).json({ error: "Email is already registered" });

      const passwordHash = await bcrypt.hash(input.data.password, 12);
      try {
        const user = await User.create({
          name: input.data.name,
          email: input.data.email,
          passwordHash,
        });
        return response.status(201).json({ token: createToken(user, jwtSecret), user: publicUser(user) });
      } catch (err) {
        if (err.code === 11000) {
          return response.status(409).json({ error: "Email is already registered" });
        }
        throw err;
      }
    },

    async login(request, response) {
      const input = credentialsSchema.omit({ name: true }).safeParse(request.body);
      if (!input.success) return response.status(400).json({ error: "Invalid login data", details: input.error.flatten() });

      const user = await User.findOne({ email: input.data.email }).select("+passwordHash");
      const validPassword = user && await bcrypt.compare(input.data.password, user.passwordHash);
      if (!validPassword) return response.status(401).json({ error: "Invalid email or password" });

      return response.json({ token: createToken(user, jwtSecret), user: publicUser(user) });
    },

    async me(request, response) {
      const user = await User.findById(request.auth.sub);
      if (!user) return response.status(404).json({ error: "User not found" });
      return response.json({ user: publicUser(user) });
    },

    async updateNotifications(request, response) {
      const input = z.object({ enabled: z.boolean() }).safeParse(request.body);
      if (!input.success) return response.status(400).json({ error: "enabled must be a boolean" });

      const user = await User.findByIdAndUpdate(request.auth.sub, { notificationsEnabled: input.data.enabled }, { new: true });
      if (!user) return response.status(404).json({ error: "User not found" });
      return response.json({ user: publicUser(user) });
    },
  };
}
