import Script from "next/script"

/**
 * Sets GA4 Consent Mode v2 default to denied BEFORE the GA4 script loads.
 * Required for CCPA compliance — analytics, ads, and personalization are
 * denied until the user explicitly accepts via the CCPABanner.
 *
 * Must mount in the root layout, ABOVE <GoogleAnalytics>.
 */
export function ConsentDefault() {
  return (
    <Script
      id="ga-consent-default"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
          // If a returning visitor already granted, replay to update immediately.
          try {
            var c = localStorage.getItem('sentinel-consent-v1');
            if (c === 'granted') {
              gtag('consent', 'update', {
                analytics_storage: 'granted',
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted'
              });
            }
          } catch (e) { /* localStorage unavailable */ }
        `,
      }}
    />
  )
}
