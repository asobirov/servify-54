import { relations, sql } from "drizzle-orm";
import { check, index, pgEnum, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import { user as User } from "./auth-schema";

export * from "./auth-schema";

export const UserRelations = relations(User, ({ one }) => ({
  metadata: one(UserMetadata, {
    fields: [User.id],
    references: [UserMetadata.userId],
  }),
}));

export const Role = pgEnum("role", ["user", "provider"]);
export const UserMetadata = pgTable(
  "user_metadata",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => User.id)
      .unique(),

    roles: Role("roles").array().notNull().default(["user"]),

    locale: t.text(),

    updatedAt: t
      .timestamp({ mode: "date", withTimezone: true })
      .$onUpdateFn(() => sql`now()`),
  }),
  (t) => [
    index("user_roles_idx").on(t.roles),
    index("locale_idx").on(t.locale),
  ],
);

export const UserMetadataRelations = relations(UserMetadata, ({ one }) => ({
  user: one(User, {
    fields: [UserMetadata.userId],
    references: [User.id],
  }),
}));

export const Customer = pgTable("customer", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),

  userId: t
    .text("user_id")
    .notNull()
    .references(() => User.id),

  firstName: t.text(),
  lastName: t.text(),

  phone: t.text(),
  locale: t.text(),

  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const Provider = pgTable("service_provider", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  userId: t
    .text("user_id")
    .notNull()
    .unique()
    .references(() => User.id, { onDelete: "cascade" }),

  // TODO: add phone number validation and unique constraint
  phoneNumber: t.text(),

  // Name as in ID
  firstName: t.text(),
  lastName: t.text(),

  bio: t.text(),

  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const ProviderRelations = relations(Provider, ({ many }) => ({
  services: many(Service),
}));

export const Post = pgTable("post", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  title: t.varchar({ length: 256 }).notNull(),
  content: t.text().notNull(),
  serviceId: t.uuid("service_id").references(() => Service.id),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const PostRelations = relations(Post, ({ one, many }) => ({
  service: one(Service, {
    fields: [Post.serviceId],
    references: [Service.id],
  }),
  images: many(Media),
}));

export const CreatePostSchema = createInsertSchema(Post, {
  title: z.string().max(256),
  content: z.string().max(256),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const Service = pgTable("service", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  providerId: t
    .uuid("provider_id")
    .notNull()
    .references(() => Provider.id),

  imageId: t.uuid("image_id").references(() => Media.id),

  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const ServiceRelations = relations(Service, ({ one, many }) => ({
  provider: one(Provider, {
    fields: [Service.providerId],
    references: [Provider.id],
  }),
  image: one(Media, {
    fields: [Service.imageId],
    references: [Media.id],
  }),
  posts: many(Post),
  serviceToCategories: many(ServiceToCategories),
}));

// export const SavedService = pgTable(
//   "saved_service",
//   (t) => ({
//     userId: t
//       .text("user_id")
//       .notNull()
//       .references(() => User.id),
//     serviceId: t
//       .uuid("service_id")
//       .notNull()
//       .references(() => Service.id),

//     createdAt: t.timestamp().defaultNow().notNull(),
//   }),
//   (t) => [primaryKey({ columns: [t.userId, t.serviceId] })],
// );

// export const SavedServiceRelations = relations(SavedService, ({ one }) => ({
//   user: one(User, { fields: [SavedService.userId], references: [User.id] }),
//   service: one(Service, {
//     fields: [SavedService.serviceId],
//     references: [Service.id],
//   }),
// }));

export const Media = pgTable("media", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  url: t.text(),
  postId: t.uuid("post_id"),
  serviceId: t.uuid("service_id"),
  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const Category = pgTable("category", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),

  title: t.text(),

  createdAt: t.timestamp().defaultNow().notNull(),
  updatedAt: t
    .timestamp({ mode: "date", withTimezone: true })
    .$onUpdateFn(() => sql`now()`),
}));

export const CategoryRelations = relations(Category, ({ many }) => ({
  serviceToCategories: many(ServiceToCategories),
}));

export const ServiceToCategories = pgTable(
  "service_to_categories",
  (t) => ({
    serviceId: t
      .uuid("service_id")
      .notNull()
      .references(() => Service.id),
    categoryId: t
      .uuid("category_id")
      .notNull()
      .references(() => Category.id),
  }),
  (t) => [primaryKey({ columns: [t.serviceId, t.categoryId] })],
);

export const ServiceToCategoriesRelations = relations(
  ServiceToCategories,
  ({ one }) => ({
    service: one(Service, {
      fields: [ServiceToCategories.serviceId],
      references: [Service.id],
    }),
    category: one(Category, {
      fields: [ServiceToCategories.categoryId],
      references: [Category.id],
    }),
  }),
);

export const Address = pgTable(
  "address",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),

    title: t.text(),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => User.id),

    locationId: t
      .uuid()
      .notNull()
      .references(() => Location.id),

    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: "date", withTimezone: true })
      .$onUpdateFn(() => sql`now()`),
  }),
  (t) => [index("address_title_idx").on(t.title)],
);

export const AddressRelations = relations(Address, ({ one }) => ({
  user: one(User, {
    fields: [Address.userId],
    references: [User.id],
  }),
  location: one(Location, {
    fields: [Address.locationId],
    references: [Location.id],
  }),
}));

export const LocationType = pgEnum("location_type", [
  "point",
  "polygon",
  "multipolygon",
]);

export const Location = pgTable(
  "location",
  (t) => ({
    id: t.uuid().notNull().primaryKey().defaultRandom(),

    // The text that is recommended to be specified as a title when displaying the object.
    name: t.text(),
    fullAddress: t.text(),

    house: t.text(),
    street: t.text(),
    district: t.text(),

    city: t.text(),
    region: t.text(),
    country: t.text(),

    type: LocationType("type").notNull(),
    geom: t.geometry("geom", {
      type: "Geometry",
      srid: 4326,
    }),

    createdAt: t.timestamp().defaultNow().notNull(),
    updatedAt: t
      .timestamp({ mode: "date", withTimezone: true })
      .$onUpdateFn(() => sql`now()`),
  }),
  (t) => [
    check(
      "location_geo_type_check",
      sql`
        (type = 'point'   AND GeometryType(geom) = 'POINT') OR 
        (type = 'polygon' AND GeometryType(geom) = 'POLYGON') OR
        (type = 'multipolygon' AND GeometryType(geom) = 'MULTIPOLYGON')
      `,
    ),
    index("geo_idx").using("gist", t.geom),
    index("location_name_idx").on(t.name),
    index("location_full_address_idx").on(t.fullAddress),
  ],
);
