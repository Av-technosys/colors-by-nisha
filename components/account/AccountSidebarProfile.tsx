import { currentUser } from "@clerk/nextjs/server";
import { UserRound } from "lucide-react";
import { readAccount } from "@/helpers/auth/account";
import { Skeleton } from "@/components/ui/Skeleton";

export function SidebarProfileSkeleton() {
  return <div role="status" aria-label="Loading profile" className="flex items-center gap-4 rounded-md bg-purple p-5 lg:block lg:space-y-5 lg:p-7"><Skeleton className="size-11 shrink-0 bg-white/15 lg:size-14" /><div className="min-w-0 flex-1 space-y-3"><Skeleton className="h-7 w-36 max-w-full bg-white/15" /><Skeleton className="h-3 w-full bg-white/15" /><Skeleton className="hidden h-3 w-32 bg-white/15 lg:block" /></div></div>;
}

export async function AccountSidebarProfile() {
  const user = await currentUser();
  if (!user) return null;
  const account = readAccount(user);
  const initials = account.fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(name => name[0]).join("");
  const joined = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(account.joinedAt));
  return <div className="flex min-w-0 items-center gap-4 rounded-md bg-purple p-5 text-white lg:block lg:p-7">
    <div className="grid size-11 shrink-0 place-items-center rounded-md border border-white/20 bg-white/10 font-display text-lg lg:mb-5 lg:size-14 lg:text-xl">{initials || <UserRound size={24} aria-hidden="true" />}</div>
    <div className="min-w-0">
    <p className="mb-1 hidden text-[10px] uppercase tracking-[0.16em] text-white/50 lg:block">Your profile</p>
    <h2 className="break-words font-display text-xl leading-tight lg:text-2xl">{account.fullName || "Your name"}</h2>
    <p className="mt-2 break-all text-xs leading-relaxed text-white/65">{account.email || "Add your email address"}</p>
    <div className="mt-6 hidden items-center gap-2 border-t border-white/15 pt-4 text-[11px] text-white/60 lg:flex"><span className="size-1.5 rounded-md bg-[#d2bea1]" />Member since {joined}</div>
    </div>
  </div>;
}
