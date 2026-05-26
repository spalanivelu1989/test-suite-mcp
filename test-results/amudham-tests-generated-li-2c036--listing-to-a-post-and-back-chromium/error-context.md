# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: amudham/tests/generated/live/flows/blog-navigation.spec.ts >> Blog navigation @flows @amudham >> user navigates from the blog listing to a post and back
- Location: ../../Desktop/amudham/tests/generated/live/flows/blog-navigation.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /lentils: small legumes, big nutrition/i }).or(getByText('Lentils: Small Legumes, Big Nutrition').first())
Expected: visible
Error: strict mode violation: getByRole('heading', { name: /lentils: small legumes, big nutrition/i }).or(getByText('Lentils: Small Legumes, Big Nutrition').first()) resolved to 2 elements:
    1) <h2 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-amudham-green transition-colors">…</h2> aka getByRole('heading', { name: 'Lentils: Small Legumes, Big' })
    2) <a href="/blogs/lentils-small-legumes-big-nutrition">Lentils: Small Legumes, Big Nutrition</a> aka getByRole('link', { name: 'Lentils: Small Legumes, Big' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /lentils: small legumes, big nutrition/i }).or(getByText('Lentils: Small Legumes, Big Nutrition').first())

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - navigation [ref=e3]:
      - link "Amudham Amudham Naturals Logo Naturals" [ref=e4] [cursor=pointer]:
        - /url: /
        - generic [ref=e5]:
          - generic [ref=e6]: Amudham
          - img "Amudham Naturals Logo" [ref=e8]
          - generic [ref=e9]: Naturals
      - list [ref=e10]:
        - listitem [ref=e11]:
          - link "Home" [ref=e12] [cursor=pointer]:
            - /url: /#home
        - listitem [ref=e13]:
          - link "Products" [ref=e14] [cursor=pointer]:
            - /url: /#products
        - listitem [ref=e15]:
          - link "Our Process" [ref=e16] [cursor=pointer]:
            - /url: /#process
        - listitem [ref=e17]:
          - link "About" [ref=e18] [cursor=pointer]:
            - /url: /#about
        - listitem [ref=e19]:
          - link "Contact" [ref=e20] [cursor=pointer]:
            - /url: /#contact
        - listitem [ref=e21]:
          - link "Amazon Store" [ref=e22] [cursor=pointer]:
            - /url: https://www.amazon.in/stores/page/5B29183F-F8E0-4735-A37D-1528412A1F07
        - listitem [ref=e23]:
          - button "Cart (0)" [ref=e24]:
            - img [ref=e25]
            - generic [ref=e29]: Cart (0)
  - main [ref=e30]:
    - generic [ref=e32]:
      - generic [ref=e33]:
        - heading "Our Journal" [level=1] [ref=e34]
        - paragraph [ref=e35]: Discover the wisdom of nature, nutritional insights, and stories behind our pure products.
      - article [ref=e37]:
        - link "🌿 Pure. Natural. Nutritious. Nutrition" [ref=e38] [cursor=pointer]:
          - /url: /blogs/lentils-small-legumes-big-nutrition
          - generic [ref=e39]:
            - generic [ref=e40]: 🌿
            - generic [ref=e41]: Pure. Natural. Nutritious.
          - generic [ref=e42]: Nutrition
        - generic [ref=e43]:
          - generic [ref=e44]: January 8, 2026
          - 'heading "Lentils: Small Legumes, Big Nutrition" [level=2] [ref=e45]':
            - 'link "Lentils: Small Legumes, Big Nutrition" [ref=e46] [cursor=pointer]':
              - /url: /blogs/lentils-small-legumes-big-nutrition
          - paragraph [ref=e47]: For such an unassuming little legume, lentils are nutritional powerhouses. Discover why lentils are so healthy and how to eat them for maximum benefit.
          - link "Read More" [ref=e48] [cursor=pointer]:
            - /url: /blogs/lentils-small-legumes-big-nutrition
            - text: Read More
            - img [ref=e49]
  - contentinfo [ref=e51]:
    - generic [ref=e53]:
      - generic [ref=e54]:
        - heading "🌿 Amudham Naturals" [level=3] [ref=e55]
        - paragraph [ref=e56]: Premium organic products crafted with care. Pure, natural, wholesome — from soil to soul.
        - generic [ref=e57]:
          - link [ref=e58] [cursor=pointer]:
            - /url: https://www.instagram.com/amudhamnaturals/
            - img [ref=e59]
          - link [ref=e62] [cursor=pointer]:
            - /url: https://www.youtube.com/@Amudha-1957?sub_confirmation=1
            - img [ref=e63]
      - generic [ref=e66]:
        - heading "Navigation" [level=4] [ref=e67]
        - list [ref=e68]:
          - listitem [ref=e69]:
            - link "Home" [ref=e70] [cursor=pointer]:
              - /url: /#home
          - listitem [ref=e71]:
            - link "Products" [ref=e72] [cursor=pointer]:
              - /url: /#products
          - listitem [ref=e73]:
            - link "Our Process" [ref=e74] [cursor=pointer]:
              - /url: /#ourprocess
          - listitem [ref=e75]:
            - link "About" [ref=e76] [cursor=pointer]:
              - /url: /#about
          - listitem [ref=e77]:
            - link "Contact" [ref=e78] [cursor=pointer]:
              - /url: /#contact
      - generic [ref=e79]:
        - heading "Legal" [level=4] [ref=e80]
        - list [ref=e81]:
          - listitem [ref=e82]:
            - link "Privacy Policy" [ref=e83] [cursor=pointer]:
              - /url: /privacy-policy
          - listitem [ref=e84]:
            - link "Terms & Conditions" [ref=e85] [cursor=pointer]:
              - /url: /terms-conditions
          - listitem [ref=e86]:
            - link "Refund Policy" [ref=e87] [cursor=pointer]:
              - /url: /refund-policy
          - listitem [ref=e88]:
            - link "Blog" [ref=e89] [cursor=pointer]:
              - /url: /blogs
      - generic [ref=e90]:
        - heading "Get In Touch" [level=4] [ref=e91]
        - generic [ref=e92]:
          - link "+91 9486225762" [ref=e93] [cursor=pointer]:
            - /url: tel:+919486225762
            - img [ref=e94]
            - generic [ref=e96]: +91 9486225762
          - link "amudhamnaturals@gmail.com" [ref=e97] [cursor=pointer]:
            - /url: mailto:amudhamnaturals@gmail.com
            - img [ref=e98]
            - generic [ref=e101]: amudhamnaturals@gmail.com
          - generic [ref=e102]:
            - img [ref=e103]
            - generic [ref=e106]: Cuddalore, Tamil Nadu, India
    - generic [ref=e108]:
      - generic [ref=e109]:
        - paragraph [ref=e110]: © 2026 Amudham Naturals. All rights reserved.
        - paragraph [ref=e111]:
          - text: "FSSAI License No:"
          - strong [ref=e112]: "12425004000475"
      - generic [ref=e113]:
        - generic [ref=e114]: ✓ 100% Natural
        - generic [ref=e115]: ✓ Quality Assured
  - alert [ref=e116]
```

# Test source

```ts
  1  | // Generated for amudham from plan.md. Regenerated by /design.
  2  | import { test, expect } from '../../../../../lib/fixtures';
  3  | 
  4  | test.describe('Blog navigation @flows @amudham', () => {
  5  |   test('user navigates from the blog listing to a post and back', async ({ authedPage: page }) => {
  6  |     test.info().annotations.push({ type: 'description', value: 'Navigate to /blogs, open the Lentils article, confirm content, then return to /blogs via Back to Journal.' });
  7  | 
  8  |     // Step 1: Navigate to /blogs
  9  |     await page.goto('https://amudhamnaturals.com/blogs');
  10 | 
  11 |     // Step 2: Assert "Lentils: Small Legumes, Big Nutrition" article card or heading visible
  12 |     await expect(
  13 |       page.getByRole('heading', { name: /lentils: small legumes, big nutrition/i })
  14 |         .or(page.getByText('Lentils: Small Legumes, Big Nutrition').first())
> 15 |     ).toBeVisible();
     |       ^ Error: expect(locator).toBeVisible() failed
  16 | 
  17 |     // Step 3: Click the article card link or "Read More" link
  18 |     await page.getByRole('link', { name: /read more/i }).first().click();
  19 | 
  20 |     // Step 4: Assert URL is /blogs/lentils-small-legumes-big-nutrition
  21 |     await expect(page).toHaveURL('https://amudhamnaturals.com/blogs/lentils-small-legumes-big-nutrition');
  22 | 
  23 |     // Step 5: Assert article heading containing "Lentils" visible
  24 |     await expect(page.getByRole('heading', { name: /lentils/i })).toBeVisible();
  25 | 
  26 |     // Step 6: Assert article body paragraph text visible (non-empty)
  27 |     const articleBody = page.locator('article p, [class*="content"] p, main p').first();
  28 |     await expect(articleBody).toBeVisible();
  29 |     await expect(articleBody).not.toHaveText('');
  30 | 
  31 |     // Step 7: Click "Back to Journal" link
  32 |     await page.getByRole('link', { name: /back to journal/i }).click();
  33 | 
  34 |     // Step 8: Assert URL is https://amudhamnaturals.com/blogs
  35 |     await expect(page).toHaveURL('https://amudhamnaturals.com/blogs');
  36 |   });
  37 | });
  38 | 
```