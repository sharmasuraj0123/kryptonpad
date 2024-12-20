import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {
      email,
      twitter_id,
      twitter_username,
      metamask_wallet_address,
      usertype,
    } = req.body;
    console.log("🚀 ~ req:", req);

    const { data, error } = await supabase
      .from("users") // The name of the table
      .insert([
        {
          email,
          twitter_id,
          twitter_username,
          metamask_wallet_address,
          usertype,
        },
      ]);

    if (error) {
      console.log("🚀 ~ error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "User added successfully", data });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
