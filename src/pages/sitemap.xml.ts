import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
export const GET: APIRoute = async ({site}) => {
  const routes=(await getCollection('pages')).map(page=>page.id==='start'?'/':`/${page.id}/`);
  routes.push('/about/','/datenschutz/','/sitemap/');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(path=>`<url><loc>${new URL(path,site)}</loc></url>`).join('')}</urlset>`,{headers:{'Content-Type':'application/xml; charset=utf-8'}});
};
