import {load} from 'cheerio';
export function parseListing(html) {
  const $=load(html), products=[], seen=new Set();
  $('a[href*="/p/"]').each((_,el)=>{
    const card=$(el), img=card.find('img[alt]').first();
    const name=img.attr('alt')?.trim();
    if(!name) return;
    const url=new URL(card.attr('href'),'https://www.flipkart.com');
    if(url.hostname!=='www.flipkart.com') return;
    const id=url.searchParams.get('pid');
    if(!id || seen.has(id)) return;
    const text=card.text().replace(/\s+/g,' ');
    const priceText=card.find('.hZ3P6w').first().text() || text.match(/₹[\d,]+/)?.[0];
    const price=priceText ? Number(priceText.replace(/[^\d]/g,'')) : null;
    if(price!==null && (!Number.isFinite(price)||price<=0)) return;
    let image=img.attr('src') || img.attr('data-src') || null;
    if(image && !/^https:\/\/[^/]*flixcart\.com\//.test(image)) image=null;
    const status=/Currently unavailable/i.test(text)?'Currently unavailable':/Coming Soon/i.test(text)?'Coming soon':/Sold Out|Out of stock/i.test(text)?'Out of stock':/Only few left/i.test(text)?'Only few left':'Check availability';
    const bigBillionDaysPrice=card.find('*').toArray().some(node=>$(node).text().replace(/\s+/g,' ').trim()==='Big Billion Days Price');
    products.push({id,name,image,price,status,bigBillionDaysPrice,url:url.href,specs:card.find('li').map((_,li)=>$(li).text()).get().slice(0,4)});
    seen.add(id);
  });
  $('script,style').remove();
  const body=$('body,body *').contents().filter((_,node)=>node.type==='text').map((_,node)=>node.data).get().join(' ').replace(/\s+/g,' ');
  const pagination=body.match(/Page\s+(\d+)\s+of\s+(\d+)/i);
  const total=body.match(/of\s+([\d,]+)\s+products/i);
  const empty=/Sorry, no results found|No products found/i.test(body);
  if(!products.length && !empty) throw new Error('Flipkart did not return readable listings. It may be blocking automated access or its page format may have changed.');
  if(products.length && !pagination) throw new Error('Flipkart pagination could not be read. Please open the source page.');
  return {products,total:total?Number(total[1].replace(/,/g,'')):products.length,totalPages:pagination?Number(pagination[2]):1};
}

export function onlyBigBillionDays(result) {
  return {
    products: result.products.filter(product=>product.bigBillionDaysPrice),
    sourceTotal: result.total,
    totalPages: result.totalPages,
  };
}
