import { z } from "zod";

export const applicationContextSchema = z.object({
  companyName: z.string().nullable().default(null),
  jobTitle: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  jobDescription: z.string().nullable().default(null),
  requiredSkills: z.array(z.string()).default([]),
});

export type ApplicationContext = z.infer<typeof applicationContextSchema>;

export const EMPTY_APPLICATION_CONTEXT: ApplicationContext = applicationContextSchema.parse({});
