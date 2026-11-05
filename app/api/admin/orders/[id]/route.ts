import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { hasAdminEmail } from "@/helpers/auth/user-profile";
import { parseDelivery, OrderInputError } from "@/helpers/orders/input";
import { updateOrder } from "@/helpers/orders/service";
import { orderError, readOrderRequest } from "@/helpers/orders/http";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user || !hasAdminEmail(user, process.env.ADMIN_EMAILS ?? "")) return Response.json({ error: "You don’t have access to this page." }, { status: user ? 403 : 401 });
  try {
    const input = await readOrderRequest(request);
    if (typeof input.updatedAt !== "string") throw new OrderInputError("Refresh the order before saving.");
    const { id } = await context.params;
    await updateOrder(id, parseDelivery(input), input.updatedAt);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath(`/orders/${id}`);
    revalidatePath("/orders");
    revalidatePath("/shop");
    revalidatePath("/products/[handle]", "page");
    return Response.json({ success: true });
  } catch (error) { return orderError(error); }
}
