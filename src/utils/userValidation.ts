import { User, Collaborator, ProjectOwner } from "@/types/user";

export function isProfileComplete(user: User | null): boolean {
  if (!user) return false;

  const basicFields = ["fullName", "location", "bio"];
  if (basicFields.some((field) => !user[field as keyof User])) {
    return false;
  }

  if (user.userType === "collaborator") {
    const collaborator = user as Collaborator;
    if (!collaborator.roles || collaborator.roles.length === 0) return false;
    if (!collaborator.availability) return false;
    // Enforce at least one skill
    if (!collaborator.skills || collaborator.skills.length === 0) return false;
  }

  if (user.userType === "project_owner") {
    const owner = user as ProjectOwner;
    if (!owner.company) return false;
  }

  return true;
}

export function getMissingFields(user: User | null): string[] {
  if (!user) return [];

  const missing: string[] = [];

  if (!user.fullName) missing.push("Full Name");
  if (!user.location) missing.push("Location");
  if (!user.bio) missing.push("Bio");

  if (user.userType === "collaborator") {
    const collaborator = user as Collaborator;
    if (!collaborator.roles || collaborator.roles.length === 0)
      missing.push("At least one Role");
    if (!collaborator.availability) missing.push("Availability");
    if (!collaborator.skills || collaborator.skills.length === 0)
      missing.push("At least one Skill");
  }

  if (user.userType === "project_owner") {
    const owner = user as ProjectOwner;
    if (!owner.company) missing.push("Company Name");
  }

  return missing;
}
