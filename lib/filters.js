export const groups = [
  {key:'brand', label:'Brand', values:['MOTOROLA','vivo','OPPO','POCO','realme','Samsung','REDMI','Tecno','IQOO','Mi','OnePlus','CMF by Nothing','Alcatel','HMD','Infinix','Mivi']},
  {key:'ram', label:'RAM', values:['6 GB','8 GB and Above']},
  {key:'internal_storage',label:'Storage',values:['128 - 255.9 GB','256 GB & Above']},
  {key:'primary_camera',label:'Primary camera',values:['48 - 63.9 MP','64 MP & Above']},
  {key:'battery_capacity',label:'Battery',values:['5000 - 5999 mAh','6000 mAh & Above']},
  {key:'network_type',label:'Network',values:['5G','5.5G']},
  {key:'sim_type',label:'SIM type',values:['Dual Sim(Physical + eSIM)','Dual Sim(Nano + eSIM)','Dual Sim']},
  {key:'type',label:'Phone type',values:['Smartphones']},
];
export const priceLimits = {min:0,max:100000,step:500};
export const defaults = {...Object.fromEntries(groups.map(g=>[g.key,[...g.values]])),priceMin:10000,priceMax:20000};
export function validPriceRange(filters) {
  return Number.isInteger(filters.priceMin) && Number.isInteger(filters.priceMax)
    && filters.priceMin>=priceLimits.min && filters.priceMax<=priceLimits.max
    && filters.priceMin<=filters.priceMax;
}
export function buildFlipkartUrl(filters=defaults, page=1) {
  if(!validPriceRange(filters)) throw new Error('Invalid price range');
  const q=new URLSearchParams({sid:'tyy,4io',marketplace:'FLIPKART',sort:'price_asc'});
  for(const g of groups) for(const value of filters[g.key] || []) {
    if(!g.values.includes(value)) throw new Error('Invalid filter');
    const encoded=encodeURIComponent(value).replace(/[()]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase()).replace(/%20/g,'+');
    q.append('p[]',`facets.${g.key}%5B%5D=${encoded}`);
  }
  q.append('p[]',`facets.price_range.from=${filters.priceMin}`);
  q.append('p[]',`facets.price_range.to=${filters.priceMax}`);
  q.set('page',String(page));
  return 'https://www.flipkart.com/mobiles/pr?'+q;
}
