export interface ClerkProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  primaryEmailAddressId: string | null;
  primaryPhoneNumberId: string | null;
  emailAddresses: { id: string; emailAddress: string; verification: { status: string } | null }[];
  phoneNumbers: { id: string; phoneNumber: string; verification: { status: string } | null }[];
  unsafeMetadata: Record<string, unknown>;
  passwordEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export function profileValues(user: ClerkProfile) {
  const email = user.emailAddresses.find(item => item.id === user.primaryEmailAddressId);
  const phone = user.phoneNumbers.find(item => item.id === user.primaryPhoneNumberId);
  const contactMobile = typeof user.unsafeMetadata.mobile === "string" ? user.unsafeMetadata.mobile.trim() : "";
  const fallbackName = typeof user.unsafeMetadata.fullName === "string" ? user.unsafeMetadata.fullName.trim() : "";
  const mobile = /^\+[1-9]\d{7,14}$/.test(contactMobile) ? contactMobile : phone?.phoneNumber ?? null;
  return {
    clerkId: user.id,
    fullName: (fallbackName || [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Customer").slice(0, 255),
    email: (email?.emailAddress ?? "").trim().toLowerCase(),
    mobile,
    emailVerified: email?.verification?.status === "verified",
    mobileVerified: Boolean(phone && phone.phoneNumber === mobile && phone.verification?.status === "verified"),
    passwordEnabled: user.passwordEnabled,
    clerkUpdatedAt: new Date(user.updatedAt),
    createdAt: new Date(user.createdAt),
  };
}

export function hasAdminEmail(user: Pick<ClerkProfile, "emailAddresses">, allowedEmails: string) {
  const allowed = new Set(allowedEmails.split(",").map(value => value.trim().toLowerCase()).filter(Boolean));
  return user.emailAddresses.some(email => email.verification?.status === "verified" && allowed.has(email.emailAddress.trim().toLowerCase()));
}
