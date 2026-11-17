const statusEl=document.getElementById("status");
const voterIdKey="nc_awards_voter_id";
let voterId=localStorage.getItem(voterIdKey);
if(!voterId){voterId=crypto.randomUUID();localStorage.setItem(voterIdKey,voterId);}
fetch("categories.json").then(r=>r.json()).then(cats=>{
 const root=document.getElementById("categories");
 cats.forEach((cat,i)=>{
  const card=document.createElement("section");card.className="card";
  const h=document.createElement("h2");h.textContent=cat.symbol+"  "+cat.name;card.appendChild(h);
  cat.nominees.forEach(n=>{
   const b=document.createElement("button");b.className="crystal";b.textContent="◆  "+n;
   b.onclick=async()=>{
    b.disabled=true;statusEl.textContent="Отправляем голос…";
    try{
     const res=await fetch("/.netlify/functions/vote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({voterId,category:cat.name,nominee:n})});
     const data=await res.json();if(!res.ok)throw new Error(data.error||"Ошибка");
     [...card.querySelectorAll("button")].forEach(x=>x.disabled=true);
     statusEl.textContent="Голос принят: "+cat.name+" — "+n;
    }catch(e){b.disabled=false;statusEl.textContent=e.message;}
   };card.appendChild(b);
  });root.appendChild(card);
 });
}).catch(()=>statusEl.textContent="Не удалось загрузить номинации.");