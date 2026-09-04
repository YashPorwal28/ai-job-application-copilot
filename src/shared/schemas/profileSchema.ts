import { z } from "zod";

const nullableString = z.string().nullable().default(null);

export const personalInfoSchema = z.object({
  firstName: nullableString,
  lastName: nullableString,
  fullName: nullableString,
  email: nullableString,
  phone: nullableString,
  address: nullableString,
  city: nullableString,
  state: nullableString,
  country: nullableString,
  postalCode: nullableString,
});

export const linksSchema = z.object({
  linkedin: nullableString,
  github: nullableString,
  portfolio: nullableString,
  website: nullableString,
});

export const experienceEntrySchema = z.object({
  company: nullableString,
  role: nullableString,
  location: nullableString,
  startDate: nullableString,
  endDate: nullableString,
  current: z.boolean().default(false),
  description: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
});

export const educationEntrySchema = z.object({
  institution: nullableString,
  degree: nullableString,
  fieldOfStudy: nullableString,
  startDate: nullableString,
  endDate: nullableString,
});

export const projectEntrySchema = z.object({
  name: nullableString,
  description: nullableString,
  technologies: z.array(z.string()).default([]),
  url: nullableString,
});

export const workAuthorizationSchema = z.object({
  authorizedCountries: z.array(z.string()).default([]),
  requiresSponsorship: z.boolean().nullable().default(null),
});

export const professionalProfileSchema = z.object({
  personal: personalInfoSchema,
  links: linksSchema,
  summary: nullableString,
  experience: z.array(experienceEntrySchema).default([]),
  education: z.array(educationEntrySchema).default([]),
  skills: z.array(z.string()).default([]),
  projects: z.array(projectEntrySchema).default([]),
  workAuthorization: workAuthorizationSchema,
});

export type ProfessionalProfile = z.infer<typeof professionalProfileSchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Links = z.infer<typeof linksSchema>;
export type WorkAuthorization = z.infer<typeof workAuthorizationSchema>;

export const EMPTY_PROFILE: ProfessionalProfile = professionalProfileSchema.parse({
  personal: {},
  links: {},
  summary: null,
  experience: [],
  education: [],
  skills: [],
  projects: [],
  workAuthorization: {},
});
