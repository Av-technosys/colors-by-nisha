import { currentUser } from "@clerk/nextjs/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { parseAddress } from "@/helpers/auth/account";
import { syncUser } from "@/helpers/auth/users";
import { placeOrder } from "@/helpers/orders/service";
import { OrderInputError } from "@/helpers/orders/input";
import { orderError, readOrderRequest } from "@/helpers/orders/http";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Please sign in before placing an order." }, { status: 401 });
  try {
    const input = await readOrderRequest(request);
    let record = await db.query.users.findFirst({ where: and(eq(users.clerkId, user.id), isNull(users.deletedAt)) });
    record ??= await syncUser(user);
    if (!record || record.deletedAt) return Response.json({ error: "Account unavailable." }, { status: 403 });
    if (!record.fullName || !record.mobile || !record.email) throw new OrderInputError("Please complete your name, email, and mobile number in your account before ordering.");
    if (!input.address || typeof input.address !== "object" || Array.isArray(input.address)) throw new OrderInputError("Enter your shipping address.");
    const address = parseAddress({ ...input.address, country: "India" }, "checkout");
    const id = await placeOrder(record.id, input, address);
    return Response.json({ id, url: `/orders/${id}` }, { status: 201 });
  } catch (error) { return orderError(error); }
}
