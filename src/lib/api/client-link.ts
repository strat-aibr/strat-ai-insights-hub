
import { supabase } from "@/integrations/supabase/client";

// Function to generate a client link
export async function generateClientLink(userId: number): Promise<string> {
  try {
    console.log("Generating client link for user ID:", userId);
    
    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from("TRACKING | USERS")
      .select("id, name")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error checking user:", userError);
      throw new Error("User not found");
    }

    // Create a simple token (in a production app, you'd use a more secure method)
    const token = btoa(`client-${userId}-${Date.now()}`);
    
    // In a real app, you would store this token in the database
    // For now, we'll just return the link
    const baseUrl = window.location.origin;
    return `${baseUrl}/strat-ai-report/view?token=${token}&userId=${userId}`;
  } catch (error) {
    console.error("Error generating client link:", error);
    throw error;
  }
}
