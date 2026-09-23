/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Parker site-wide cleanup.
 * Removes non-authorable site chrome (header, footer, nav, chat widget),
 * injected script-tag placeholders, and tracking iframes.
 * All selectors verified against migration-work/cleaned.html.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Chat/messaging widgets and tracking iframes can wrap or block block-matching.
    // Verified in cleaned.html: <div class="parker-comchatskill">,
    // <iframe id="db-sync">, <iframe id="embeddedMessagingSiteContextFrame">.
    WebImporter.DOMUtils.remove(element, [
      '.parker-comchatskill',
      '#db-sync',
      '#embeddedMessagingSiteContextFrame',
    ]);
  }

  if (hookName === H.after) {
    // Non-authorable site chrome and leftover elements.
    // Verified in cleaned.html:
    //   #parker_h_f_header_root  -> global header/top-bar/mega-nav
    //   nav#parker_h_f_sub_item  -> sub navigation inside header
    //   #parker_h_f_footer_wrapper -> global footer
    //   #h1tagheader             -> injected "Home" h1 shell element (not authored)
    //   iframe / script          -> tracking + injected script tags
    WebImporter.DOMUtils.remove(element, [
      '#parker_h_f_header_root',
      '#parker_h_f_footer_wrapper',
      '#h1tagheader',
      'nav#parker_h_f_sub_item',
      'iframe',
      'script',
    ]);
  }
}
