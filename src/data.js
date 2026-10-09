export const categories = [
  { id: 'figures', label: 'Figures & collectibles', short: 'Figures', description: 'Small details. Big main-character energy.', icon: 'cube', color: 'violet' },
  { id: 'style', label: 'Apparel & style', short: 'Apparel', description: 'Wear your fandom, your way.', icon: 'shirt', color: 'pink' },
  { id: 'desk', label: 'Desk & room', short: 'Desk & room', description: 'Make your space a little more you.', icon: 'monitor', color: 'cyan' },
  { id: 'props', label: 'Replicas & props', short: 'Replicas', description: 'Bring a piece of the story home.', icon: 'sword', color: 'orange' },
];

// Editorial concepts, not retailer listings. Replace with verified products and
// approved affiliate URLs before presenting prices, stock, or purchase buttons.
export const products = [
  { id: 'midnight-ronin', name: 'Midnight Ronin display figure', category: 'figures', series: 'Original design', type: 'Display figure', art: 'ronin', color: '#a582e6', tag: 'Collector inspiration', description: 'A dramatic centerpiece concept with a flowing coat, sculpted details, and a compact display base. A direction to explore when we select the real collection.', tips: ['Check the manufacturer and official licensing.', 'Confirm the figure dimensions and display footprint.', 'Look for retailer photos of the actual item.'] },
  { id: 'off-duty-hoodie', name: 'Off-duty anime graphic hoodie', category: 'style', series: 'Original design', type: 'Everyday style', art: 'hoodie', color: '#dc89b1', tag: 'Style inspiration', description: 'An understated oversized hoodie concept with a small front graphic and a statement back print. Easy to pair with everyday outfits.', tips: ['Use garment measurements rather than size labels.', 'Check the fabric composition and print method.', 'Read the retailer’s return policy before ordering.'] },
  { id: 'after-hours-desk', name: 'After-hours extended desk mat', category: 'desk', series: 'Original design', type: 'Desk setup', art: 'desk', color: '#73c9d2', tag: 'Space inspiration', description: 'A moody cityscape desk mat concept for a more personal work or gaming setup, with room for both a keyboard and mouse.', tips: ['Measure your desk before choosing the mat.', 'Look for stitched edges and a non-slip backing.', 'Confirm the artwork and print quality.'] },
  { id: 'moonlight-blade', name: 'Moonlight decorative blade', category: 'props', series: 'Original design', type: 'Decorative replica', art: 'sword', color: '#e6b079', tag: 'Display inspiration', description: 'A display-only blade concept with a dark handle and a clean silhouette. A collectible direction for fans who enjoy costume props and shelf displays.', tips: ['Choose a clearly described decorative, unsharpened prop.', 'Check local import and shipping restrictions.', 'Check whether a stand is included.'] },
  { id: 'mecha-unit', name: 'Mecha Unit collectible concept', category: 'figures', series: 'Original design', type: 'Mecha collectible', art: 'mecha', color: '#92a3e8', tag: 'Collector inspiration', description: 'A futuristic mecha bust concept that brings bold shapes and mechanical detail to a smaller shelf or desk.', tips: ['Confirm whether the item is assembled or a model kit.', 'Check the recommended skill level for kits.', 'Review the materials and finish.'] },
  { id: 'city-after-dark', name: 'City After Dark art print', category: 'desk', series: 'Original design', type: 'Wall art', art: 'poster', color: '#ca8feb', tag: 'Space inspiration', description: 'An atmospheric original cityscape print concept in violet and pink, designed to complement a dark, cozy anime-inspired room.', tips: ['Check the print dimensions and paper weight.', 'Confirm if a frame is included.', 'Buy from the artist or an authorized seller.'] },
];

export const franchises = [
  { id: 'one-piece', name: 'One Piece', subtitle: 'For the adventure', symbol: '☸︎', color: '#edb37e' },
  { id: 'naruto', name: 'Naruto', subtitle: 'Follow your own path', symbol: '◉', color: '#eab369' },
  { id: 'demon-slayer', name: 'Demon Slayer', subtitle: 'A cut above', symbol: '✳', color: '#72cbb9' },
  { id: 'jujutsu-kaisen', name: 'Jujutsu Kaisen', subtitle: 'Embrace the energy', symbol: '✺', color: '#bda0f2' },
  { id: 'dragon-ball', name: 'Dragon Ball', subtitle: 'Beyond your limits', symbol: '★', color: '#e99278' },
  { id: 'attack-on-titan', name: 'Attack on Titan', subtitle: 'Beyond the walls', symbol: '◈', color: '#9faed1' },
];

export const guides = [
  { id: 'first-figure', title: 'Your first anime figure. A little less guesswork.', eyebrow: 'THE COLLECTOR’S GUIDE', description: 'Prize, scale, or articulated? Find the right starting point for your shelf and your budget.', time: '4 min read', art: 'ronin', color: '#aa80e0', sections: [
    ['Start with a character you love', 'A collection does not need to begin with a rare or expensive piece. Choose a character or design you will enjoy seeing every day, then decide how much space and money you want to dedicate to it.'],
    ['Understand the different formats', 'Prize figures are often a more accessible entry point, although quality varies. Scale figures usually focus on sculpt and finish, while articulated figures trade a seamless silhouette for poses. Model kits add the experience of building the collectible yourself.'],
    ['Check dimensions, not just the photo', 'A close-up photograph can make a small figure look enormous. Compare the listed height with your shelf, and allow room for the base, accessories, and any extended weapons or clothing.'],
    ['Buy from a seller you can verify', 'Look for a named manufacturer, a clear product code, licensing information, and an understandable returns policy. Prices far below comparable listings deserve extra research. Images alone do not establish authenticity.'],
    ['Consider the complete cost', 'Shipping, taxes, customs, and currency conversion can change the total. For a preorder, read the cancellation policy and expected release window before paying.']
  ] },
  { id: 'anime-space', title: 'A better anime setup, one detail at a time.', eyebrow: 'ROOM & DESK', description: 'Build a space that feels personal without filling every surface.', time: '3 min read', art: 'desk', color: '#6eafb7', sections: [
    ['Choose one focal point', 'Start with one display figure, art print, or desk mat that sets the mood. A few deliberate choices often work better than many competing decorations.'],
    ['Keep your setup useful', 'Measure the area where your keyboard, mouse, and monitor sit. Make sure collectibles do not obstruct ventilation, speakers, or the space you need to work.'],
    ['Use light sparingly', 'A soft light behind a monitor or shelf can help highlight a display. Keep bright lights away from your eyes and avoid lighting that causes glare on your screen.'],
    ['Leave room to grow', 'A little empty shelf space makes individual pieces easier to appreciate. Protect prints and figures from direct sunlight, dust, and heat, and follow the manufacturer’s cleaning advice.']
  ] },
  { id: 'buying-safely', title: 'Before you click buy: the collector’s checklist.', eyebrow: 'BUY SMARTER', description: 'A practical check for sellers, shipping, and listings that look too good to be true.', time: '3 min read', art: 'mecha', color: '#9a9fdb', sections: [
    ['Identify the seller', 'A familiar marketplace name is not the same as a verified third-party seller. Check who sells and ships the product, their recent feedback, and how the platform handles disputes.'],
    ['Compare the listing details', 'Match the manufacturer, item code, dimensions, and materials with official product information when available. Ask for clarification when a listing uses vague language or inconsistent photos.'],
    ['Read the shipping and returns terms', 'Confirm delivery to your country, estimated costs, and whether import charges are included. Read the conditions for damaged items, returns, cancellations, and preorders.'],
    ['Recognize uncertainty', 'An affiliate recommendation is a discovery aid, not a guarantee of quality or availability. Check the current listing at the retailer and keep a copy of your order details.']
  ] },
];
