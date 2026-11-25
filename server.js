import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname,"public")));

const demoPlan = request => ({
  title: "Lead follow-up automation",
  summary: "A practical automation plan generated for the requested business process.",
  trigger: "A new lead is submitted through a website form.",
  steps: [
    "Validate required lead fields.",
    "Save the lead to a CRM or database.",
    "Use an AI step to classify intent and priority.",
    "Notify the sales team for high-priority leads.",
    "Send an acknowledgement to the customer.",
    "Log the workflow result for monitoring."
  ],
  tools: ["Webhook","CRM or database","LLM API","Email or messaging API"],
  data: ["name","email","message","lead_score","workflow_status"],
  safeguards: [
    "Validate required fields before processing.",
    "Keep API keys server-side.",
    "Retry temporary failures with a limit.",
    "Log failures without unnecessary sensitive data."
  ],
  tests: [
    "Valid lead creates one workflow run.",
    "Missing email is rejected safely.",
    "AI timeout is retried and logged.",
    "High-priority lead creates a notification."
  ]
});

async function generateWithOpenAI(request) {
  if (!process.env.OPENAI_API_KEY) return demoPlan(request);

  const r = await fetch("https://api.openai.com/v1/responses", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`
    },
    body:JSON.stringify({
      model:process.env.OPENAI_MODEL || "gpt-4.1-mini",
      input:[
        {role:"system",content:"You are an automation architect. Return ONLY valid JSON with keys: title, summary, trigger, steps, tools, data, safeguards, tests. Keep it practical and concise."},
        {role:"user",content:`Design an automation workflow for: ${request}`}
      ]
    })
  });
  if (!r.ok) throw new Error(`AI request failed: ${r.status}`);
  const data = await r.json();
  return JSON.parse(data.output_text);
}

app.post("/api/workflow", async (req,res) => {
  const request=String(req.body?.request || "").trim();
  if (!request) return res.status(400).json({error:"Describe the process you want to automate."});
  try {
    const plan=await generateWithOpenAI(request);
    res.json({mode:process.env.OPENAI_API_KEY ? "ai" : "demo",plan});
  } catch (e) {
    console.error(e);
    res.status(502).json({error:"AI generation failed. Check the server configuration."});
  }
});

app.get("*",(_req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(port,()=>console.log(`AI Workflow Assistant running on port ${port}`));
