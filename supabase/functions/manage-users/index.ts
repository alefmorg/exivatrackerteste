import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller } } = await supabaseAdmin.auth.getUser(token);
    if (!caller) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Sem permissão" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { action, ...params } = await req.json();

    // LIST USERS
    if (action === "list") {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100 });
      if (error) throw error;

      // Get all profiles and roles
      const { data: profiles } = await supabaseAdmin.from("profiles").select("user_id, username");
      const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");

      const profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p]));
      const roleMap = Object.fromEntries((roles || []).map(r => [r.user_id, r.role]));

      const result = users.map(u => ({
        id: u.id,
        email: u.email,
        username: profileMap[u.id]?.username || u.email,
        role: roleMap[u.id] || "user",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }));

      return new Response(JSON.stringify({ users: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // UPDATE USER ROLE
    if (action === "update_role") {
      const { user_id, role } = params;
      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Não pode alterar seu próprio papel" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      // Upsert role
      const { error } = await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id, role }, { onConflict: "user_id" });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // DELETE USER
    if (action === "delete") {
      const { user_id } = params;
      if (user_id === caller.id) {
        return new Response(JSON.stringify({ error: "Não pode excluir a si mesmo" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // RESET PASSWORD
    if (action === "reset_password") {
      const { user_id, new_password } = params;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, { password: new_password });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // UPDATE USERNAME
    if (action === "update_username") {
      const { user_id, username } = params;
      const { error } = await supabaseAdmin.from("profiles").update({ username }).eq("user_id", user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
