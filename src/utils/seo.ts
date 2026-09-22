import { Product } from '../types';

export const DEFAULT_TITLE = 'Tizzitech - The Brand Behind The Gear';
export const DEFAULT_DESCRIPTION = 'A high-performance tech e-commerce platform with inventory tracking, genuine gadgets, and fast delivery in Lagos, Nigeria.';
export const DEFAULT_IMAGE = '/logo.svg';
export const DEFAULT_SITE_NAME = 'Tizzitech Lagos';

/**
 * Utility to safely set or create a <meta> element in document.head
 */
export function setMetaTag(selector: { key: 'name' | 'property'; val: string }, content: string) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${selector.key}="${selector.val}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(selector.key, selector.val);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Remove a <meta> element if present
 */
export function removeMetaTag(selector: { key: 'name' | 'property'; val: string }) {
  if (typeof document === 'undefined') return;
  const el = document.head.querySelector(`meta[${selector.key}="${selector.val}"]`);
  if (el) {
    el.remove();
  }
}

/**
 * Set canonical URL in <head>
 */
export function setCanonicalUrl(url: string) {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

export function removeCanonicalUrl() {
  if (typeof document === 'undefined') return;
  const link = document.head.querySelector('link[rel="canonical"]');
  if (link) link.remove();
}

/**
 * Generate Schema.org JSON-LD Structured Data for an individual product/package
 * optimized for Lagos, Nigeria local search and social sharing.
 */
export function generatePackageStructuredData(product: Product, canonicalUrl: string) {
  const images = (product.images && product.images.length > 0)
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : []);

  const reviewsList = product.reviews || [];
  const hasReviews = reviewsList.length > 0;
  const avgRating = hasReviews
    ? Number((reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1))
    : 5;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tizzitech.com.ng';

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${canonicalUrl}#product`,
        "name": product.name,
        "image": images.map(img => img.startsWith('http') ? img : `${origin}${img}`),
        "description": product.description || `Order ${product.name} in Lagos, Nigeria. Guaranteed authentic tech with tested warranty and fast delivery across Ikeja, Lekki, Victoria Island, Yaba & nationwide.`,
        "sku": product.id,
        "mpn": product.id,
        "brand": {
          "@type": "Brand",
          "name": product.brand || "Tizzitech"
        },
        "category": product.category,
        "itemCondition": product.condition?.toLowerCase() === 'new' 
          ? "https://schema.org/NewCondition" 
          : "https://schema.org/UsedCondition",
        "offers": {
          "@type": "Offer",
          "url": canonicalUrl,
          "priceCurrency": "NGN",
          "price": product.price,
          "priceValidUntil": "2027-12-31",
          "itemCondition": product.condition?.toLowerCase() === 'new' 
            ? "https://schema.org/NewCondition" 
            : "https://schema.org/UsedCondition",
          "availability": product.stock > 0 
            ? "https://schema.org/InStock" 
            : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "LocalBusiness",
            "name": "Tizzitech",
            "image": `${origin}/logo.svg`,
            "telephone": "+2348000000000",
            "priceRange": "₦₦₦",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Computer Village / Ikeja Tech District",
              "addressLocality": "Ikeja",
              "addressRegion": "Lagos State",
              "postalCode": "100001",
              "addressCountry": "NG"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 6.5965,
              "longitude": 3.3421
            },
            "areaServed": [
              { "@type": "AdministrativeArea", "name": "Lagos State" },
              { "@type": "City", "name": "Ikeja" },
              { "@type": "City", "name": "Lekki" },
              { "@type": "City", "name": "Victoria Island" },
              { "@type": "City", "name": "Yaba" },
              { "@type": "City", "name": "Surulere" },
              { "@type": "City", "name": "Alimosho" },
              { "@type": "Country", "name": "Nigeria" }
            ]
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": 2500,
              "currency": "NGN"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "NG",
              "addressRegion": "Lagos"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "businessDays": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
              },
              "cutoffTime": "16:00:00+01:00",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 0,
                "maxValue": 1,
                "unitCode": "d"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 1,
                "maxValue": 2,
                "unitCode": "d"
              }
            }
          }
        },
        ...(hasReviews ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": avgRating,
            "reviewCount": reviewsList.length,
            "bestRating": 5,
            "worstRating": 1
          },
          "review": reviewsList.map(r => ({
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": r.author
            },
            "datePublished": r.date || "2026-05-01",
            "reviewBody": r.comment,
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": r.rating,
              "bestRating": 5,
              "worstRating": 1
            }
          }))
        } : {})
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": origin
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": product.category || "Gear",
            "item": `${origin}/?category=${encodeURIComponent(product.category || '')}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": product.name,
            "item": canonicalUrl
          }
        ]
      }
    ]
  };
}

/**
 * Apply all OpenGraph meta tags, Twitter card, local Lagos SEO geo tags,
 * and JSON-LD structured data to the active document.
 */
export function applyProductSeo(product: Product, customBaseUrl?: string) {
  if (typeof document === 'undefined') return;

  const origin = customBaseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://tizzitech.com.ng');
  const canonicalUrl = `${origin}/package/${product.id}`;

  const pageTitle = `${product.name} | Buy in Lagos, Nigeria - Tizzitech`;
  const metaDescription = `Buy ${product.name} (${product.condition || 'New'}) in Lagos, Nigeria for ₦${product.price.toLocaleString()}. 100% Genuine, tested warranty, and fast same-day/24h delivery across Ikeja, Lekki, Victoria Island, Yaba & nationwide on Tizzitech.`;

  // Set document title
  document.title = pageTitle;

  // Primary meta description
  setMetaTag({ key: 'name', val: 'description' }, metaDescription);

  // Determine main image URL
  const rawImage = product.imageUrl || (product.images && product.images[0]) || DEFAULT_IMAGE;
  const fullImageUrl = rawImage.startsWith('http') ? rawImage : `${origin}${rawImage}`;

  // Standard OpenGraph Tags
  setMetaTag({ key: 'property', val: 'og:site_name' }, 'Tizzitech Lagos');
  setMetaTag({ key: 'property', val: 'og:title' }, `${product.name} - Buy in Lagos, Nigeria | Tizzitech`);
  setMetaTag({ key: 'property', val: 'og:description' }, metaDescription);
  setMetaTag({ key: 'property', val: 'og:type' }, 'product');
  setMetaTag({ key: 'property', val: 'og:url' }, canonicalUrl);
  setMetaTag({ key: 'property', val: 'og:image' }, fullImageUrl);
  setMetaTag({ key: 'property', val: 'og:image:secure_url' }, fullImageUrl);
  setMetaTag({ key: 'property', val: 'og:image:alt' }, product.name);
  setMetaTag({ key: 'property', val: 'og:locale' }, 'en_NG');

  // E-commerce OpenGraph Tags (Facebook & WhatsApp product previews)
  setMetaTag({ key: 'property', val: 'product:price:amount' }, String(product.price));
  setMetaTag({ key: 'property', val: 'product:price:currency' }, 'NGN');
  setMetaTag({ key: 'property', val: 'product:availability' }, product.stock > 0 ? 'in stock' : 'out of stock');
  setMetaTag({ key: 'property', val: 'product:condition' }, product.condition?.toLowerCase() === 'new' ? 'new' : 'used');
  setMetaTag({ key: 'property', val: 'product:brand' }, product.brand || 'Tizzitech');
  setMetaTag({ key: 'property', val: 'product:category' }, product.category || 'Tech');
  setMetaTag({ key: 'property', val: 'product:retailer_item_id' }, product.id);

  // Twitter / X Social Cards
  setMetaTag({ key: 'name', val: 'twitter:card' }, 'summary_large_image');
  setMetaTag({ key: 'name', val: 'twitter:title' }, `${product.name} | Tizzitech Lagos`);
  setMetaTag({ key: 'name', val: 'twitter:description' }, metaDescription);
  setMetaTag({ key: 'name', val: 'twitter:image' }, fullImageUrl);
  setMetaTag({ key: 'name', val: 'twitter:image:alt' }, product.name);

  // Local Lagos SEO Meta Tags
  setMetaTag({ key: 'name', val: 'geo.region' }, 'NG-LA');
  setMetaTag({ key: 'name', val: 'geo.placename' }, 'Lagos, Nigeria');
  setMetaTag({ key: 'name', val: 'geo.position' }, '6.5244;3.3792');
  setMetaTag({ key: 'name', val: 'ICBM' }, '6.5244, 3.3792');

  // Set Canonical link tag
  setCanonicalUrl(canonicalUrl);

  // Inject or update Schema.org Structured Data
  const jsonLdData = generatePackageStructuredData(product, canonicalUrl);
  let scriptEl = document.getElementById('product-structured-data') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'product-structured-data';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(jsonLdData, null, 2);
}

/**
 * Clean up package-specific meta tags and restore default website metadata
 */
export function clearProductSeo() {
  if (typeof document === 'undefined') return;

  document.title = DEFAULT_TITLE;
  setMetaTag({ key: 'name', val: 'description' }, DEFAULT_DESCRIPTION);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tizzitech.com.ng';
  const defaultImage = `${origin}${DEFAULT_IMAGE}`;

  // Reset standard OpenGraph
  setMetaTag({ key: 'property', val: 'og:site_name' }, DEFAULT_SITE_NAME);
  setMetaTag({ key: 'property', val: 'og:title' }, DEFAULT_TITLE);
  setMetaTag({ key: 'property', val: 'og:description' }, DEFAULT_DESCRIPTION);
  setMetaTag({ key: 'property', val: 'og:type' }, 'website');
  setMetaTag({ key: 'property', val: 'og:url' }, origin);
  setMetaTag({ key: 'property', val: 'og:image' }, defaultImage);
  setMetaTag({ key: 'property', val: 'og:locale' }, 'en_NG');

  // Remove specific product tags
  removeMetaTag({ key: 'property', val: 'product:price:amount' });
  removeMetaTag({ key: 'property', val: 'product:price:currency' });
  removeMetaTag({ key: 'property', val: 'product:availability' });
  removeMetaTag({ key: 'property', val: 'product:condition' });
  removeMetaTag({ key: 'property', val: 'product:brand' });
  removeMetaTag({ key: 'property', val: 'product:category' });
  removeMetaTag({ key: 'property', val: 'product:retailer_item_id' });

  // Reset Twitter Cards
  setMetaTag({ key: 'name', val: 'twitter:card' }, 'summary_large_image');
  setMetaTag({ key: 'name', val: 'twitter:title' }, DEFAULT_TITLE);
  setMetaTag({ key: 'name', val: 'twitter:description' }, DEFAULT_DESCRIPTION);
  setMetaTag({ key: 'name', val: 'twitter:image' }, defaultImage);

  // Remove canonical & JSON-LD
  removeCanonicalUrl();
  const scriptEl = document.getElementById('product-structured-data');
  if (scriptEl) scriptEl.remove();
}

/**
 * Social Sharing Helpers specifically crafted for Lagos & Nigerian shoppers
 */
export function getWhatsAppShareUrl(product: Product, packageUrl: string): string {
  const text = `Check out this *${product.name}* (${product.condition || 'New'}) on Tizzitech for *₦${product.price.toLocaleString()}*! 🚀 Fast same-day/24h delivery across Lagos with warranty: ${packageUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function getTwitterShareUrl(product: Product, packageUrl: string): string {
  const text = `Buy ${product.name} (₦${product.price.toLocaleString()}) on @Tizzitech! Genuine tech with fast delivery across Lagos, Nigeria 🇳🇬 #LagosTech #Tizzitech`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(packageUrl)}`;
}
