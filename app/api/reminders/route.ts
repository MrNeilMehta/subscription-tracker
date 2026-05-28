import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendReminderEmail } from "@/lib/email";

export async function GET() {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*");

  if (error) {
    return NextResponse.json({ error });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const sub of data) {
    const renewal = new Date(sub.date);
    renewal.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (renewal.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 2) {
      await sendReminderEmail(
        sub.user_email, // 🔥 NOW DYNAMIC
        sub.name,
        diffDays
      );
    }
  }

  return NextResponse.json({ success: true });
}