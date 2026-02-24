import { createSupabaseServerClient } from "@/lib/supabase/supabase-server";
import { NavbarClient, type AuthUser } from "./NavbarClient";

export async function Navbar() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authUser: AuthUser | null = user
    ? {
        user_metadata: user.user_metadata as { first_name?: string; last_name?: string },
        email: user.email ?? undefined,
      }
    : null;

  return <NavbarClient user={authUser} />;
}
