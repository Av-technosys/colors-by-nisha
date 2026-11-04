import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/helpers/auth/users";

export async function POST() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  try {
    const record = await syncUser(user);
    if (!record || record.deletedAt) return Response.json({ error: "Account unavailable." }, { status: 403 });
    return Response.json({ synced: true });
  } catch {
    return Response.json({ error: "Your account is signed in, but the profile could not be saved. Please retry." }, { status: 503 });
  }
}
