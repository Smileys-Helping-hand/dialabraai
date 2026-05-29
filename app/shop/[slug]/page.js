/**
 * /shop/[slug] — shop profile page.
 * ShopProvider (in root layout) automatically detects the slug from the
 * URL path via slugFromPath(), so no extra wiring needed here.
 * We just render the same ShopHomePage content.
 */
export { default } from '@/app/home/page';
