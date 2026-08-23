import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      phone: v.optional(v.string()),
    }).index("email", ["email"]),

    // Admin users with username/password
    admin_users: defineTable({
      username: v.string(),
      passwordHash: v.string(), // SHA-256 hash
      name: v.optional(v.string()),
      isActive: v.boolean(),
    }).index("by_username", ["username"]),

    // Grooming services
    services: defineTable({
      name: v.string(),
      nameEn: v.string(),
      description: v.string(),
      price: v.number(),
      duration: v.number(),
      petTypes: v.array(v.string()),
      icon: v.string(),
      isActive: v.boolean(),
      order: v.number(),
    }).index("by_active", ["isActive"]),

    // Working hours per weekday
    work_hours: defineTable({
      weekday: v.number(),
      slots: v.array(v.string()),
      isActive: v.boolean(),
    }).index("by_weekday", ["weekday"]),

    // Appointment bookings
    appointments: defineTable({
      userId: v.id("users"),
      serviceId: v.id("services"),
      date: v.string(),
      time: v.string(),
      petName: v.string(),
      petType: v.string(),
      petBreed: v.optional(v.string()),
      petWeight: v.optional(v.number()),
      phone: v.string(),
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

    // Portfolio / gallery
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

    // Blog posts
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
  { schemaValidation: false },
);

export default schema;
