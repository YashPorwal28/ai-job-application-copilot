import type { ProfessionalProfile } from "../../shared/schemas/profileSchema";
import { PersonalInfoForm } from "./profile/PersonalInfoForm";
import { LinksForm } from "./profile/LinksForm";
import { ExperienceForm } from "./profile/ExperienceForm";
import { EducationForm } from "./profile/EducationForm";
import { SkillsForm } from "./profile/SkillsForm";
import { ProjectsForm } from "./profile/ProjectsForm";
import { WorkAuthorizationForm } from "./profile/WorkAuthorizationForm";
import { FormField } from "./FormField";

interface ProfileEditorProps {
  profile: ProfessionalProfile;
  onChange: (updater: (current: ProfessionalProfile) => ProfessionalProfile) => void;
  onSave: () => void;
  onDelete: () => void;
  saveStatus: "idle" | "saved";
}

export function ProfileEditor({ profile, onChange, onSave, onDelete, saveStatus }: ProfileEditorProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">Your profile</h2>
        <div className="flex items-center gap-3">
          {saveStatus === "saved" && <span className="text-xs text-green-600">Saved</span>}
          <button
            onClick={onSave}
            className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>

      <PersonalInfoForm personal={profile.personal} onChange={(personal) => onChange((p) => ({ ...p, personal }))} />
      <LinksForm links={profile.links} onChange={(links) => onChange((p) => ({ ...p, links }))} />

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Summary</h3>
        <FormField label="Professional summary" value={profile.summary} onChange={(summary) => onChange((p) => ({ ...p, summary }))} textarea />
      </section>

      <ExperienceForm experience={profile.experience} onChange={(experience) => onChange((p) => ({ ...p, experience }))} />
      <EducationForm education={profile.education} onChange={(education) => onChange((p) => ({ ...p, education }))} />
      <SkillsForm skills={profile.skills} onChange={(skills) => onChange((p) => ({ ...p, skills }))} />
      <ProjectsForm projects={profile.projects} onChange={(projects) => onChange((p) => ({ ...p, projects }))} />
      <WorkAuthorizationForm
        workAuthorization={profile.workAuthorization}
        onChange={(workAuthorization) => onChange((p) => ({ ...p, workAuthorization }))}
      />

      <div className="pt-4 border-t border-slate-200">
        <button onClick={onDelete} className="text-xs font-medium text-red-600 hover:underline">
          Delete entire profile
        </button>
      </div>
    </div>
  );
}
