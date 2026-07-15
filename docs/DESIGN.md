## Vibe
- Art Deco Luxury × Precious Metal Material — deep obsidian dark environment with champagne gold as the singular accent, referencing the weight and luster of physical gold bullion. Structural hierarchy is built through gold borders, spaced-letterform serif headings, and restrained metallic shimmer.

## Color
- Primary: #D4AF37
- On Primary: #121212
- Accent: #C9973A
- On Accent: #121212
- Background: #121212
- Foreground: #FDFBF7
- Muted: #1E1E1E
- Border: #2A2A2A
- Secondary: #1A1A1A

## Typography
- Heading: Cinzel (family: 'Cinzel', serif, weight: 600, url: https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap)
- Body: Inter (family: 'Inter', sans-serif, weight: 400, url: https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap)

## Visual Language
- Core visual signature: gold hairline borders (1px #D4AF37 at 40% opacity) framing sections and cards; gold gradient shimmer sweep on interactive elements — never as background fill
- Material & depth: near-zero box-shadow; depth via surface brightness stepping (#121212 → #1A1A1A → #1E1E1E); subtle radial glow at card borders on hover using gold at 15% opacity
- Containers & buttons: rectangular cards with 1px gold border at 30% opacity; primary CTA: bg-primary text-on-primary; secondary: transparent bg + gold border + gold text; dividers are 1px Border color
- Layout rhythm: generous vertical whitespace between sections; gold accent appears only on active states, CTAs, and section dividers; alternates dense data rows with open hero/feature blocks

## Animation
- Entrance: sections fade-in + 20px upward translate on scroll, duration 700ms ease-out via tailwindcss-intersect
- Interaction: gold border glow brightens on card hover (opacity 0.3→0.8), 200ms ease
- Scroll / transition: page route transitions fade 150ms; ticker scrolls horizontally continuous 30s linear loop

## Forbidden
- No large flat gold color fills as backgrounds or hero blocks
- No frosted-glass blur stacking — glassmorphism accent only on single hero container
- No rounded pill buttons — use sharp rectangular or minimal 2px radius only

## Additional Notes
- Brand logo: https://miaoda-conversation-file.s3cdn.medo.dev/user-aau54i87abk0/app-csclqvxoqsqp/20260704/Gemini_Generated_Image_485gui485gui485g(1).png — display in header on all pages (mobile and desktop)
- Login page: use full-bleed dark background with centered glassmorphic card, gold border, logo above form
- Gold price ticker: horizontal scrolling marquee with glowing gold text on dark strip
- All headings: Cinzel font, wide letter-spacing (tracking-widest)
- Data numbers (prices, weights): tabular-nums