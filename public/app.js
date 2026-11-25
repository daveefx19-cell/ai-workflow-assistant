const box=document.querySelector("#request"),btn=document.querySelector("#generate"),status=document.querySelector("#status"),result=document.querySelector("#result");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const block=(title,value)=>`<div class="block"><h3>${esc(title)}</h3>${Array.isArray(value)?`<ul>${value.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:`<p>${esc(value)}</p>`}</div>`;

const demoPlan = request => ({
 title:"Lead follow-up automation",
 summary:"A practical automation plan for: "+request,
 trigger:"A new lead or business event enters the workflow.",
 steps:["Validate the incoming data.","Save the data to a CRM or database.","Use an AI step to classify intent and priority.","Notify the appropriate team when action is required.","Send an acknowledgement or follow-up.","Log the result for monitoring and improvement."],
 tools:["Webhook","CRM or database","LLM API","Email or messaging API"],
 data:["name","email","message","priority","workflow_status"],
 safeguards:["Validate required fields.","Keep API keys server-side.","Limit retries for temporary failures.","Log failures without unnecessary sensitive data."],
 tests:["Valid input creates one workflow run.","Missing required data is rejected safely.","AI/API failure is handled without losing the request.","High-priority records create the correct notification."]
});

async function generate(){
 const request=box.value.trim();
 if(!request){status.textContent="Describe a process first.";return;}
 btn.disabled=true;status.textContent="Generating workflow...";result.classList.add("hidden");
 try{
  const r=await fetch("/api/workflow",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({request})});
  if(!r.ok) throw new Error("API unavailable");
  const d=await r.json();
  render(d.plan,d.mode==="ai");
 }catch(_){
  render(demoPlan(request),false);
  status.textContent="Portfolio demo mode: the browser version is running without a server. The Node.js version supports live LLM integration.";
 }finally{btn.disabled=false}
}
function render(p,isAI){
 result.innerHTML=`<span class="mode">${isAI?"LIVE AI":"PORTFOLIO DEMO"}</span><h2>${esc(p.title)}</h2><p>${esc(p.summary)}</p>
 ${block("Trigger",p.trigger)}${block("Workflow steps",p.steps)}${block("Suggested tools",p.tools)}${block("Data",p.data)}${block("Safeguards",p.safeguards)}${block("Test cases",p.tests)}`;
 result.classList.remove("hidden");
 if(isAI) status.textContent="Live AI workflow generated.";
}
btn.onclick=generate;
