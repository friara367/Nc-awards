const btn=document.getElementById("load"),statusEl=document.getElementById("status"),root=document.getElementById("results");
btn.onclick=async()=>{
 statusEl.textContent="Загружаем результаты…";root.innerHTML="";
 try{
  const r=await fetch("/.netlify/functions/results",{headers:{"x-admin-password":document.getElementById("password").value}});
  const data=await r.json();if(!r.ok)throw new Error(data.error||"Нет доступа");
  Object.entries(data.results).forEach(([category,rows])=>{
   const box=document.createElement("section");box.className="result-card";
   const h=document.createElement("h2");h.textContent=category;box.appendChild(h);
   rows.forEach(row=>{const line=document.createElement("div");line.className="result-row";const n=document.createElement("span");n.textContent=row.nominee;const c=document.createElement("b");c.textContent=row.votes+" голосов";line.append(n,c);box.appendChild(line);});
   root.appendChild(box);
  });
  statusEl.textContent="Результаты загружены.";
 }catch(e){statusEl.textContent=e.message;}
};