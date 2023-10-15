// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
   const body = JSON.parse(req.body);
   const uri = body.uri;
   const options = {
      method: "GET",
      headers: { accept: "application/json" },
   };
   const ref = await fetch(uri, options);
   const data = await ref.json();
   if (!data) res.status(500).json({ data: { ERROR: "NONE" } });
   res.status(200).json({ data });
}
