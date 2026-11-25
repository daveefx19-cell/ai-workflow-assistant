const box=document.querySelector("#request"),btn=document.querySelector("#generate"),status=document.querySelector("#status"),result=document.querySelector("#result");
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const block=(title,value)=>`<div class="block"><h3>${esc(title)}</h3>${Array.isArray(value)?`<ul>${value.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:`<p>${esc(value)}</p>`}</div>`;

btn.onclick=async()=>{
 const request=box.value.trim();
 if(!request){status.textContent="Describe a process first.";return;}
 btn.disabled=true;status.textContent="Generating workflow...";result.classList.add("hidden");
 try{
  const r=await fetch("/api/workflow",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({request})});
  const d=await r.json(); if(!r.ok) throw new Error(d.error);
  const p=d.plan;
  result.innerHTML=`<span class="mode">${d.mode==="ai"?"LIVE AI":"DEMO MODE"}</span><h2>${esc(p.title)}</h2><p>${esc(p.summary)}</p>
  ${block("Trigger",p.trigger)}${block("Workflow steps",p.steps)}${block("Suggested tools",p.tools)}${block("Data",p.data)}${block("Safeguards",p.safeguards)}${block("Test cases",p.tests)}`;
  result.classList.remove("hidden");status.textContent=d.mode==="ai"?"Live AI workflow generated.":"Demo workflow generated.";
 }catch(e){status.textContent=e.message}finally{btn.disabled=false}
};
