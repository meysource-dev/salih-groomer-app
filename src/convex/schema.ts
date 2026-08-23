import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      phone: v.optional(v.string()),
    }).index("email", ["email"]),

    // Grooming services
    services: defineTable({
      name: v.string(),
      nameEn: v.string(),
      description: v.string(),
      price: v.number(),
      duration: v.number(),
      petTypes: v.array(v.string()), // ["dog", "cat", "rabbit"]
      icon: v.string(),
      isActive: v.boolean(),
      order: v.number(),
    }).index("by_active", ["isActive"]),

    // Working hours per weekday (admin-configurable)
    work_hours: defineTable({
      weekday: v.number(), // 0=Saturday ... 6=Friday
      slots: v.array(v.string()), // ["09:00", "09:30", ...]
      isActive: v.boolean(),
    }).index("by_weekday", ["weekday"]),

    // Appointment bookings
    appointments: defineTable({
      userId: v.id("users"),
      serviceId: v.id("services"),
      date: v.string(), // YYYY-MM-DD
      time: v.string(), // HH:MM
      petName: v.string(),
      petType: v.string(), // "dog" | "cat" | "rabbit"
      petBreed: v.optional(v.string()),
      petWeight: v.optional(v.number()),
      notes: v.optional(v.string()),
      price: v.number(),
      status: v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("cancelled"),
        v.literal("completed"),
      ),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_date", ["date"])
      .index("by_status", ["status"]),

    // Portfolio / gallery items (admin-managed)
    portfolio: defineTable({
      title: v.string(),
      description: v.optional(v.string()),
      imageUrl: v.string(),
      petType: v.optional(v.string()),
      serviceType: v.optional(v.string()),
      isPublished: v.boolean(),
      order: v.number(),
      createdAt: v.number(),
    }).index("by_published", ["isPublished"]),

    // Blog posts for SEO
    blog_posts: defineTable({
      title: v.string(),
      slug: v.string(),
      content: v.string(),
      excerpt: v.string(),
      coverImage: v.optional(v.string()),
      tags: v.array(v.string()),
      isPublished: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_slug", ["slug"])
      .index("by_published", ["isPublished"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
