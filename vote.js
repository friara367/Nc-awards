const categories = require("../../categories.json");
exports.handler = async (event) => {
 if(event.httpMethod!=="POST") return {statusCode:405,body:"Method not allowed"};
 try {
  const {voterId,category,nominee}=JSON.parse(event.body||"{}");
  if(typeof voterId!=="string"||voterId.length<20||voterId.length>80) throw new Error("Неверный идентификатор участника");
  const cat=categories.find(c=>c.name===category);
  if(!cat||!cat.nominees.includes(nominee)) throw new Error("Неизвестная номинация или участник");
  const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error("Не настроены переменные Supabase в Netlify");
  const response=await fetch(`${url}/rest/v1/votes`,{method:"POST",headers:{apikey:key,Authorization:`Bearer ${key}`,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({voter_id:voterId,category,nominee})});
  if(response.status===409) return {statusCode:409,body:JSON.stringify({error:"В этой номинации с этого браузера уже голосовали"})};
  if(!response.ok) throw new Error(await response.text());
  return {statusCode:200,body:JSON.stringify({ok:true})};
 } catch(e){return {statusCode:400,body:JSON.stringify({error:e.message})};}
};