import { Database } from "../../services/supabase/supabase.database";

export type QuestInsert = Database["public"]["Tables"]["quests"]["Insert"];
