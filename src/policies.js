export const contactEmail = 'nexoriofficialon@gmail.com';
export const contactLink = `<a class="policy-link" href="mailto:${contactEmail}">${contactEmail}</a>`;
export const policyDate = '2026-10-10';
export const previewNotice = 'This collection is a design preview. The illustrations are concepts, not products offered for sale. Product authenticity and licensing have not been verified for these concepts.';
export const franchiseNotice = 'NEXORI is an independent editorial website and is not endorsed by or affiliated with the anime franchises referenced here. Franchise names and trademarks belong to their respective owners.';

export const policies = {
  disclosure: {
    eyebrow: 'CLEAR FROM THE START', title: 'Affiliate disclosure.',
    intro: 'How recommendations are funded, and what you can expect from us.',
    sections: [
      ['The current preview', 'This collection contains illustrated concepts, not purchasable product listings. There are no active affiliate purchase links, verified product prices or paid placements in this version.'],
      ['How affiliate links will work', 'When affiliate links are introduced, we may earn a commission if you make a qualifying purchase through them. We will identify the commercial relationship clearly near the relevant recommendations and links, and include any wording required by the applicable affiliate program.'],
      ['Editorial choices and sponsorships', 'We aim to explain why each item was selected, who it may suit and which details need checking. Any paid placement, gifted product or other material commercial relationship will be identified with the relevant content. An affiliate relationship is not evidence of a product’s authenticity or quality.'],
      ['Testing, prices and availability', 'We will distinguish research and opinion from first-hand testing. We will not describe a product as personally tested unless it was. Retailer prices, availability and delivery terms can change; check the actual listing before buying.'],
      ['Purchases at external retailers', 'Future purchases will take place on the retailer’s website. Check the seller identity, product version, delivery costs, import charges and returns policy before ordering. The retailer handles payment, fulfilment and order support. This does not remove our responsibility for information we publish.'],
      ['Questions and corrections', `For questions about a recommendation or a commercial relationship, contact ${contactLink}. Do not include payment details or sensitive order information.`],
    ],
  },
  privacy: {
    eyebrow: 'YOUR SPACE. YOUR CHOICE.', title: 'Privacy, in plain language.',
    intro: 'This notice describes the current NEXORI preview and the information used by its features.',
    sections: [
      ['Who to contact', `NEXORI is an independent editorial website being developed from Israel. For privacy questions or requests, contact ${contactLink}. The operator’s legal identification and production service details will be completed before public launch.`],
      ['Saved finds', 'When you save a concept, its identifier is stored in this browser’s local storage under nexori.saved.v1. The saved list is not sent to a server by this feature and is not shared between devices. It remains until you remove it or clear this site’s data. If browser storage is unavailable, saved finds may last only for the current visit.'],
      ['Your motion preference', 'If you use “Reduce visual motion”, this browser stores that choice under nexori.motion.v1 so it can be applied on your next visit. It is not sent to a server by this feature. Clearing this site’s browser data removes the choice. Your browser’s own reduced-motion preference is also respected.'],
      ['Search and technical delivery', 'Search and filtering run locally over this collection. The current application has no account registration, checkout, contact form, analytics, advertising pixels or newsletter subscription. Images are included with the site rather than loaded from external image services. If the site is served online, the delivery provider may receive technical information such as IP addresses, requested URLs and browser details. A production hosting provider has not yet been selected for this preview; its actual processing and retention will be described before public launch.'],
      ['When you email us', 'Contacting us by email shares your email address and the information you choose to include so we can respond and address the issue. Messages are handled using Gmail; your email provider and ours may also process them under their own terms and privacy policies. Correspondence should be kept only as needed for the inquiry, any follow-up and applicable legal obligations. Do not send passwords, payment information or identification documents by default. Contacting us does not subscribe you to marketing.'],
      ['Your choices and requests', `You can remove individual saved finds, use “Clear saved finds” below, or clear this site’s data in your browser. For information held through correspondence, contact ${contactLink}. Access, correction, deletion and other requests will be assessed under the law that applies; some information may need to be retained where required. We may ask for proportionate verification where necessary, without requesting sensitive documents by default.`],
      ['External websites and future features', 'Future retailer links will take you to separate websites with their own privacy practices; affiliate networks may process clicks and purchases under the applicable program. Before adding those links, tracking, embedded services, forms or mailing lists, we will update this notice and implement any applicable consent, disclosure and security requirements.'],
      ['Changes to this notice', 'The date on this page identifies the latest content update. This notice must continue to reflect the services actually used; it does not claim that every future feature or every jurisdiction has already been assessed.'],
    ],
    action: 'clear-saved',
  },
  terms: {
    eyebrow: 'A FEW THINGS TO KNOW', title: 'Terms of use.',
    intro: 'NEXORI is an independent discovery and editorial website, currently presented as a design preview.',
    sections: [
      ['The collection and editorial information', `${previewNotice} Guides provide general shopping information. Recommendations and illustrations do not guarantee suitability, price, stock, delivery, licensing or authenticity. Specific claims must be supported by information about the actual product and seller.`],
      ['Independent franchise references', franchiseNotice],
      ['Illustrations and content rights', 'Preview artwork is illustrative and is not a photograph of a retail product. Some artwork was generated with AI. AI generation alone does not establish exclusive ownership or clearance of third-party rights. Franchise references do not grant a licence to reproduce their characters or logos. If you wish to reuse material or believe content affects your rights, contact us; please identify the relevant page and explain your request.'],
      ['External purchases', 'NEXORI does not sell or take payment for products in this preview. When retailer links are added, purchases will be made with the identified retailer under its terms. Check the current listing, seller, total cost, restrictions, shipping and returns before ordering. We do not promise refunds or delivery on a retailer’s behalf.'],
      ['Commercial relationships', 'Affiliate links and other material commercial relationships will be identified with the relevant content. Our affiliate disclosure explains the current status and approach.'],
      ['Responsible use', 'Do not use this website to attempt unauthorised access, disrupt its operation or infringe another person’s rights. Do not send sensitive personal information that is not needed for an inquiry.'],
      ['Corrections and your rights', `If content appears inaccurate, misleading or infringing, please contact ${contactLink} with the page address and relevant details. Nothing in these terms excludes obligations or rights that cannot lawfully be excluded. Your applicable consumer and privacy rights remain unaffected.`],
      ['Changes', 'These terms describe the present version. We will review them when the website’s services or commercial relationships change and update the date shown on this page.'],
    ],
  },
  contact: {
    eyebrow: 'LET’S KEEP IT REAL', title: 'Get in touch.',
    intro: 'Questions, corrections and thoughtful feedback are welcome.',
    sections: [
      ['Contact NEXORI', `Email ${contactLink} for website inquiries, editorial corrections, privacy requests, accessibility feedback, rights concerns or partnership inquiries. The website is being developed from Israel. Public legal operator details will be completed before launch.`],
      ['What to include', 'Tell us which page or feature you are asking about and describe the issue. For accessibility feedback, you may include your browser or device and the type of assistance needed. Please share only the information necessary to help; do not send passwords, card details or sensitive documents.'],
      ['How email works', 'The email link opens your email application. This page does not submit a form or send a message automatically. Contacting us does not add you to a marketing list; our privacy notice explains how correspondence is handled.'],
      ['Retailer orders', 'There are no purchasable listings in this preview. For future orders placed at an external retailer, contact that retailer for payment, shipping, cancellations and returns. You can also tell us if a recommendation contains inaccurate information.'],
    ],
  },
  accessibility: {
    eyebrow: 'A PLACE FOR EVERY FAN', title: 'Accessibility.',
    intro: 'Our approach, the features available now and how to ask for help.',
    sections: [
      ['Current status', 'NEXORI is a pre-launch design preview. This page is not a certification of WCAG or legal compliance. A complete accessibility assessment, including assistive-technology testing and the requirements applicable to the operator, has not yet been completed.'],
      ['Navigation and controls', 'The site includes a skip-to-content link, labelled navigation and buttons, visible keyboard focus and a search dialog that can be closed with Escape. Main content receives focus after internal navigation. Illustrative images have text alternatives; decorative effects are hidden from assistive technology.'],
      ['Motion and readability', 'The site respects your browser’s reduced-motion preference. You can also use “Reduce visual motion” in the footer to stop continuous decorative animations and banner scroll movement. The layout adapts to smaller screens, and browser zoom remains available.'],
      ['Assessment still needed', 'Screen-reader reading order and announcements, colour contrast across all states, magnification and reflow, and a complete assessment against the applicable accessibility requirements still need review. We will address identified barriers and keep this page accurate rather than claim unverified conformance or exemptions.'],
      ['Request assistance or report a barrier', `Contact ${contactLink} with the page, task and difficulty you experienced. Browser, device or assistive-technology details can help, but please do not include sensitive information. We will review feedback and discuss a suitable way to help; no response time is guaranteed by this preview.`],
    ],
  },
  rights: {
    eyebrow: 'RESPECT FOR THE STORIES', title: 'Content & franchise references.',
    intro: 'How to understand the artwork, references and product information in this preview.',
    sections: [
      ['An independent website', franchiseNotice],
      ['Preview artwork', 'The banner and collection artwork are illustrations created for the design preview; some artwork was generated with AI. They are not evidence that a retail product exists or is officially licensed. Creation of an illustration does not, by itself, establish exclusive rights or clearance of third-party material.'],
      ['Future product information', 'Actual product photographs and descriptions will be used only through an appropriate permission or permitted affiliate content source. Product-specific licensing or authenticity claims will require supporting evidence. Fan art, replicas and official merchandise must not be described as interchangeable.'],
      ['Report a concern', `For a rights or trademark concern, email ${contactLink} with the relevant URL, the material concerned and an explanation of your interest. We will review the concern and any supporting information. This notice does not authorise copying protected material or remove any applicable rights.`],
    ],
  },
};
