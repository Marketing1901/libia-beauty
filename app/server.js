const url=process.env.NEXT_PUBLIC_SUPABASE_URL;const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
export async function db(path,opts={}){const r=await fetch(`${url}/rest/v1/${path}`,{...opts,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:opts.prefer||'return=representation',...(opts.headers||{})},cache:'no-store'});if(!r.ok){throw new Error(await r.text())}const t=await r.text();return t?JSON.parse(t):null}
export const okPin=(pin,type='staff')=>String(pin)===String(type==='config'?process.env.CONFIG_PIN:process.env.STAFF_PIN);
export function code(){return Math.random().toString(36).slice(2,8).toUpperCase()+Math.random().toString(36).slice(2,4).toUpperCase()}
