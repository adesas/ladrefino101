/* ============================================================
   Blog post registry — edit this file to add/remove posts.
   - file:    filename in /blog/ (relative)
   - date:    YYYY-MM-DD
   - tags:    any of: engineering, radio, garage, music
   - excerpt: 1–2 sentences shown on cards
   Full how-to: see ADMIN.md
   ============================================================ */
window.BLOG_POSTS = [
  {
    file: 'smdps-steer-to-zero-kia-niro.html',
    title: 'Steering to Zero: Smart MDPS on a 2018 Kia Niro PHEV',
    date: '2026-06-21',
    tags: ['engineering', 'garage'],
    excerpt: 'Comma 4 reads the steering CAN but never writes to it — by design. The plan to bring low-speed steer-to-zero back using the Niro\'s own Smart MDPS system, a standalone Panda, and one very specific harness.'
  },
  {
    file: 'easyryder-offgrid-solar.html',
    title: 'Easy-Ryder: Making the Camper Run on Sunlight',
    date: '2026-05-30',
    tags: ['garage', 'engineering'],
    excerpt: 'A 1978 Toyota Pickup camper, a 320 W solar array, and a 300 Ah LiFePO₄ bank — how the off-grid power system is sized, wired, and why lithium won.'
  },
  {
    file: 'nissan720-carb-to-fi.html',
    title: 'Retiring the Carburetor: Fuel Injection for a 1984 Nissan 720',
    date: '2026-04-12',
    tags: ['garage'],
    excerpt: 'The 720 runs, but it chokes. The case for converting the old carb to electronic fuel injection — and what that conversion actually involves on a 40-year-old 4×4.'
  }
];
