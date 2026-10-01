import test from 'node:test';
import assert from 'node:assert/strict';
import {buildFlipkartUrl,defaults} from '../lib/filters.js';
import {parseListing,onlyBigBillionDays} from '../lib/flipkart.js';
test('preserves every supplied facet including nested plus signs',()=>{
 const url=new URL(buildFlipkartUrl());const facets=url.searchParams.getAll('p[]');
 assert.equal(facets.length,32);
 const sim=facets.find(x=>x.includes('Physical'));
 assert.equal(decodeURIComponent(sim.replace(/\+/g,' ')),'facets.sim_type[]=Dual Sim(Physical + eSIM)');
 assert(facets.includes('facets.price_range.from=10000'));
 assert.equal(url.searchParams.get('sort'),'price_asc');
 assert.equal(new URL(buildFlipkartUrl(defaults,29)).searchParams.get('page'),'29');
});
test('keeps only exact product-level Big Billion Days Price tags and preserves source pagination',()=>{
 const html='<body><header>Big Billion Days Price</header>'+card('A','Big Billion Days Price')+card('B','Special Price')+card('C','Big Billion Days Price ends soon')+card('D','Currently unavailable</span><span>Big Billion Days Price')+'<span>Page 1 of 29</span></body>';
 const result=onlyBigBillionDays(parseListing(html));
 assert.deepEqual(result.products.map(p=>p.id),['A','D']);
 assert.equal(result.products[1].status,'Currently unavailable');
 assert.equal(result.totalPages,29);
 assert.equal(result.total,undefined);
 const noTags=onlyBigBillionDays(parseListing('<body>'+card('X','Bank Offer')+'<span>Page 2 of 29</span></body>'));
 assert.equal(noTags.products.length,0);
 assert.equal(noTags.totalPages,29);
});
const card=(id,status='')=>`<a href="/phone/p/item?pid=${id}"><img alt="Phone ${id}" src="https://rukminim2.flixcart.com/image/phone.jpg"><span>${status}</span><div class="hZ3P6w">₹12,499</div><li>6 GB RAM | 128 GB ROM</li></a>`;
test('parses price and explicit statuses without claiming unknown stock',()=>{
 const result=parseListing('<body>'+card('A','Currently unavailable')+card('B','Coming Soon')+card('C')+card('A')+'Showing 1 – 3 products of 686 products <span>Page 1 of 29</span><a>1</a><a>2</a></body>');
 assert.equal(result.products.length,3);assert.equal(result.products[0].price,12499);
 assert.deepEqual(result.products.map(p=>p.status),['Currently unavailable','Coming soon','Check availability']);
 assert.equal(result.total,686);assert.equal(result.totalPages,29);
});
test('distinguishes an unreadable response from a genuine empty result',()=>{
 assert.throws(()=>parseListing('<body>Access denied</body>'));
 assert.deepEqual(parseListing('<body>Sorry, no results found</body>').products,[]);
});
