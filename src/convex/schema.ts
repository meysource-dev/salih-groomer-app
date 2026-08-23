import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
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
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      phone: v.optional(v.string()),
    }).index("email", ["email"]),

    // Grooming services offered by Saleh Groomer
    services: defineTable({
      name: v.string(),
      nameEn: v.string(),
      description: v.string(),
      price: v.number(),
      duration: v.number(), // duration in minutes
      petType: v.union(
        v.literal("dog"),
        v.literal("cat"),
        v.literal("both"),
      ),
      icon: v.string(),
      isActive: v.boolean(),
    }).index("by_active", ["isActive"]),

    // Appointment bookings
    appointments: defineTable({
      userId: v.id("users"),
      serviceId: v.id("services"),
      date: v.string(), // YYYY-MM-DD
      time: v.string(), // HH:MM
      petName: v.string(),
      petType: v.union(
        v.literal("dog"),
        v.literal("cat"),
      ),
      petBreed: v.optional(v.string()),
      petWeight: v.optional(v.number()),
      notes: v.optional(v.string()),
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

    // Blog posts for SEO and content
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
