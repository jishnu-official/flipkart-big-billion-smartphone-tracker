import {buildFlipkartUrl, defaults, groups,validPriceRange} from '../../../lib/filters.js';
import {parseListing,onlyBigBillionDays} from '../../../lib/flipkart.js';
export const dynamic='force-dynamic';
export async function GET(request) {
  const q=new URL(request.url).searchParams;
  const page=Number(q.get('page')||1);
  if(!Number.isInteger(page)||page<1||page>1000) return Response.json({error:'Invalid page.'},{status:400});
  let filters=defaults;
  try {
    if(q.has('filters')) {
      filters=JSON.parse(q.get('filters'));
      if(!filters || !validPriceRange(filters)) throw new Error();
      if(!filters || typeof filters!=='object' || groups.some(g=>!Array.isArray(filters[g.key]) || filters[g.key].some(v=>!g.values.includes(v)))) throw new Error();
    }
  } catch {return Response.json({error:'Invalid filters.'},{status:400});}
  const sourceUrl=buildFlipkartUrl(filters,page);
  try {
    const response=await fetch(sourceUrl,{cache:'no-store',signal:AbortSignal.timeout(20000)});
    if(!response.ok) throw new Error(`Flipkart returned HTTP ${response.status}. Please try again later.`);
    const result=onlyBigBillionDays(parseListing(await response.text()));
    return Response.json({...result,page,sourceUrl,checkedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
  } catch(error) {
    return Response.json({error:error.name==='TimeoutError'?'Flipkart took too long to respond. Please try again.':error.message,sourceUrl},{status:502,headers:{'Cache-Control':'no-store'}});
  }
}
