# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: amudham/tests/generated/live/flows/browse-and-add-to-cart.spec.ts >> Browse and add to cart @flows @amudham >> user browses products, selects a variant in the modal, and adds it to the cart
- Location: ../../Desktop/amudham/tests/generated/live/flows/browse-and-add-to-cart.spec.ts:5:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('dialog')

```

```yaml
- banner:
  - navigation:
    - link "Amudham Amudham Naturals Logo Naturals":
      - /url: /
      - text: Amudham
      - img "Amudham Naturals Logo"
      - text: Naturals
    - list:
      - listitem:
        - link "Home":
          - /url: /#home
      - listitem:
        - link "Products":
          - /url: /#products
      - listitem:
        - link "Our Process":
          - /url: /#process
      - listitem:
        - link "About":
          - /url: /#about
      - listitem:
        - link "Contact":
          - /url: /#contact
      - listitem:
        - link "Amazon Store":
          - /url: https://www.amazon.in/stores/page/5B29183F-F8E0-4735-A37D-1528412A1F07
      - listitem:
        - button "Cart (0)"
- main:
  - img "Amudham Naturals Banner"
  - img "black-rice-porridge-mix0"
  - img "roasted-salted-peanuts1"
  - img "Cashew"
  - img "dhal-powder"
  - img "chilli"
  - img "corn-flour"
  - img "green-tea"
  - img "jaggery-powder-new"
  - img "jowar-atta"
  - img "kambu-dosa-mix"
  - img "Karupu-Kavuni"
  - img "mapillai-samba-rice"
  - img "multi-grain-atta"
  - img "pesarattu-mix"
  - img "ragi-flour"
  - img "ragi-dosa-mix"
  - img "raw-peanut"
  - img "roasted-unsalted-peanuts"
  - img "sprouted-ragi-flour"
  - img "wheat-flour"
  - img "white-rice-flour"
  - img "black-rice-porridge-mix0"
  - img "roasted-salted-peanuts1"
  - img "Cashew"
  - img "dhal-powder"
  - img "chilli"
  - img "corn-flour"
  - img "green-tea"
  - img "jaggery-powder-new"
  - img "jowar-atta"
  - img "kambu-dosa-mix"
  - img "Karupu-Kavuni"
  - img "mapillai-samba-rice"
  - img "multi-grain-atta"
  - img "pesarattu-mix"
  - img "ragi-flour"
  - img "ragi-dosa-mix"
  - img "raw-peanut"
  - img "roasted-unsalted-peanuts"
  - img "sprouted-ragi-flour"
  - img "wheat-flour"
  - img "white-rice-flour"
  - paragraph: Naturally Grown
  - paragraph: 100% Chemical Free
  - heading "Nature’s Finest Natural Foods" [level=1]:
    - text: Nature’s Finest Natural Foods
    - img
  - paragraph: Food has a unique way of bringing people together—whether friends meeting for a casual meal or families gathering to celebrate special moments. At Amudham Naturals, we believe food is more than just nourishment; it is a source of happiness, connection, and well-being.
  - paragraph: We believe it is possible to feel both happy and healthy by enjoying food that is delicious, nutritious, and thoughtfully prepared. What we eat influences how we feel, both physically and mentally. By choosing minimally processed foods made with wholesome ingredients, we support our body’s natural need for energy and balance, helping us feel our best every day.
  - paragraph: That is why we take extra care in everything we make. At Amudham Naturals, our products are more than food—they are meant to gently enrich your life, supporting a healthier body, a happier mind, and a better way of living.
  - link "Start Shopping":
    - /url: "#products"
  - link "Our Story":
    - /url: "#about"
  - heading "Our Wholesome Products" [level=2]
  - paragraph: Experience the purest essence of nature with our carefully curated selection of organic, nutritious, and high-quality staples for your healthy kitchen.
  - button "All Products"
  - button "Nuts & Seeds"
  - button "Grains & Rice"
  - button "Flours"
  - button "Natural Sweeteners"
  - button "Spices"
  - img "Premium Cashew முந்திரிப்பருப்பு"
  - text: nuts
  - heading "Premium Cashew முந்திரிப்பருப்பு" [level=3]
  - paragraph: Cashews are rich in healthy fats, protein, magnesium, and zinc. They can support heart health and provide nutrients important for bones, brain, and skin as part of a balanced diet.
  - text: protein healthy fats
  - button "1kg"
  - button "500g"
  - text: ₹1199.00 Inc. GST (5%)
  - button "Add"
  - img "Peanuts நிலக்கடலை"
  - text: nuts
  - heading "Peanuts நிலக்கடலை" [level=3]
  - paragraph: Peanuts are a protein-rich legume with healthy fats, fiber, and essential vitamins. They can support heart health, provide energy, and contribute to muscle maintenance as part of a balanced diet.
  - text: protein healthy fats
  - button "1kg"
  - text: ₹280.00 Inc. GST (5%)
  - button "Add"
  - img "Roasted Unsalted Peanuts வறுத்த உப்பு இல்லாத கடலை"
  - text: nuts
  - heading "Roasted Unsalted Peanuts வறுத்த உப்பு இல்லாத கடலை" [level=3]
  - paragraph: Perfectly roasted peanuts without any added salt. A wholesome, protein-rich snack that's great for a natural energy boost and heart-healthy diets.
  - text: protein healthy fats
  - button "350g"
  - text: ₹189.00 Inc. GST (5%)
  - button "Add"
  - img "Roasted Salted Peanuts வறுத்த உப்பு கடலை"
  - text: nuts
  - heading "Roasted Salted Peanuts வறுத்த உப்பு கடலை" [level=3]
  - paragraph: Crunchy, perfectly roasted peanuts seasoned with salt. A classic, protein-packed snack that offers a delicious balance of flavor and energy.
  - text: protein healthy fats
  - button "350g"
  - text: ₹189.00 Inc. GST (5%)
  - button "Add"
  - img "Jaggery Powder நாட்டு சக்கரை"
  - text: sweeteners
  - heading "Jaggery Powder நாட்டு சக்கரை" [level=3]
  - paragraph: Jaggery powder is a natural sweetener containing iron, minerals, and some antioxidants. It is less processed than refined sugar and provides trace nutrients, but should be consumed in moderation.
  - text: iron minerals
  - button "1kg"
  - text: ₹210.00 Inc. GST (5%)
  - button "Add"
  - img "Dhal Powder பருப்பு பொடி"
  - text: flours
  - heading "Dhal Powder பருப்பு பொடி" [level=3]
  - paragraph: Amudham Naturals Dhal Powder, also known as Paruppu Podi, is a traditional spiced blend perfect for idly, dosa, and rice mixes. This aromatic seasoning combines roasted lentils with spices, offering authentic South Indian flavor and nutritional benefits with no added preservatives.
  - text: protein fiber
  - button "250g"
  - text: ₹189.00 Inc. GST (5%)
  - button "Add"
  - img "Black Rice Porridge Mix கருப்பு கவுனி கஞ்சி மிக்ஸ்"
  - text: flours
  - heading "Black Rice Porridge Mix கருப்பு கவுனி கஞ்சி மிக்ஸ்" [level=3]
  - paragraph: A convenient and nutritious porridge mix made from antioxidant-rich Karuppu Kavuni black rice. Perfect for a quick, healthy breakfast that supports digestion and provides sustained energy.
  - text: antioxidants fiber
  - button "350g"
  - button "250g"
  - text: ₹249.00 Inc. GST (5%)
  - button "Add"
  - img "Sprouted Ragi Flour முளைகட்டிய கேழ்வரகு மாவு"
  - text: flours
  - heading "Sprouted Ragi Flour முளைகட்டிய கேழ்வரகு மாவு" [level=3]
  - paragraph: Made from sprouted ragi (finger millet), this flour is easier to digest and has increased nutritional value. The sprouting process enhances the bioavailability of calcium, iron, and other minerals, making it an excellent choice for all age groups, especially children.
  - text: calcium iron
  - button "1kg"
  - button "500g"
  - text: ₹299.00 Inc. GST (5%)
  - button "Add"
  - img "Ragi Flour கேழ்வரகு மாவு"
  - text: flours
  - heading "Ragi Flour கேழ்வரகு மாவு" [level=3]
  - paragraph: Ragi Flour, made from ground Ragi Millet, is a highly nutritious, gluten-free flour. It's an excellent source of calcium and iron, perfect for making rotis, dosas, and porridge.
  - text: calcium iron
  - button "1kg"
  - text: ₹239.00 Inc. GST (5%)
  - button "Add"
  - img "Ragi Millet Dosa Mix கேழ்வரகு இட்லி தோசை மாவு"
  - text: flours
  - heading "Ragi Millet Dosa Mix கேழ்வரகு இட்லி தோசை மாவு" [level=3]
  - paragraph: Amudham Naturals Ragi Millet Dosa Mix is a nutritious blend of Indian finger millet. Gluten-free and made with no added preservatives, it's perfect for preparing healthy dosas and idlies. Rich in calcium and fiber, this traditional mix supports bone health and digestion.
  - text: calcium fiber
  - button "500g"
  - text: ₹210.00 Inc. GST (5%)
  - button "Add"
  - img "Wheat Flour கோதுமை மாவு"
  - text: flours
  - heading "Wheat Flour கோதுமை மாவு" [level=3]
  - paragraph: Premium quality wheat flour, ground from selected wheat grains. Perfect for soft rotis, chapatis, and other traditional Indian breads.
  - text: carbohydrates fiber
  - button "1kg"
  - text: ₹229.00 Inc. GST (5%)
  - button "Add"
  - img "Golden Maize Corn Flour சோள மாவு"
  - text: flours
  - heading "Golden Maize Corn Flour சோள மாவு" [level=3]
  - paragraph: Finely ground golden maize flour, rich in antioxidants and fiber. Ideal for healthy rotis and snacks.
  - text: carbohydrates fiber
  - button "1kg"
  - text: ₹229.00 Inc. GST (5%)
  - button "Add"
  - img "Jowar Atta சோளம் மாவு"
  - text: flours
  - heading "Jowar Atta சோளம் மாவு" [level=3]
  - paragraph: Healthy and gluten-free sorghum flour, packed with essential nutrients and fiber.
  - text: fiber protein
  - button "1kg"
  - text: ₹249.00 Inc. GST (5%)
  - button "Add"
  - img "Pesarattu Dosa Mix Flour பெசரட்டு தோசை மாவு"
  - text: flours
  - heading "Pesarattu Dosa Mix Flour பெசரட்டு தோசை மாவு" [level=3]
  - paragraph: Authentic Green Gram Dosa Mix for healthy and delicious Pesarattu.
  - text: protein fiber
  - button "500g"
  - text: ₹259.00 Inc. GST (5%)
  - button "Add"
  - img "Kambu Dosa Mix கம்பு தோசை மாவு"
  - text: flours
  - heading "Kambu Dosa Mix கம்பு தோசை மாவு" [level=3]
  - paragraph: Nutritious Pearl Millet Dosa Mix for a healthy start to your day.
  - text: fiber iron
  - button "500g"
  - text: ₹239.00 Inc. GST (5%)
  - button "Add"
  - img "7-Grain Multi Grain Atta மல்டி கிரைன் ஆட்டா"
  - text: flours
  - heading "7-Grain Multi Grain Atta மல்டி கிரைன் ஆட்டா" [level=3]
  - paragraph: A powerful blend of 7 essential grains for maximum nutrition and fiber.
  - text: fiber protein
  - button "1kg"
  - text: ₹269.00 Inc. GST (5%)
  - button "Add"
  - img "Pure White Rice Flour அரிசி மாவு"
  - text: flours
  - heading "Pure White Rice Flour அரிசி மாவு" [level=3]
  - paragraph: Finely milled from high-quality white rice, this flour is perfect for making a variety of dishes, from crispy dosas to fluffy pancakes. Its neutral flavor and smooth texture make it a versatile choice for both sweet and savory recipes.
  - text: carbohydrates energy
  - button "1kg"
  - text: ₹229.00 Inc. GST (5%)
  - button "Add"
  - img "Green Tea பசுமை தேநீர்"
  - text: spices
  - heading "Green Tea பசுமை தேநீர்" [level=3]
  - paragraph: Premium quality green tea leaves, rich in antioxidants for a healthy mind and body.
  - text: antioxidants catechins
  - button "200g"
  - text: ₹379.00 Inc. GST (5%)
  - button "Add"
  - img "Red Chilli Powder மிளகாய் தூள்"
  - text: spices
  - heading "Red Chilli Powder மிளகாய் தூள்" [level=3]
  - paragraph: Made from premium quality dried red chillies, ground to perfection to add a vibrant color and spicy flavor to your dishes. It's a staple in Indian cooking, known for its heat and ability to enhance the taste of curries, sauces, and marinades.
  - text: vitamin c vitamin a
  - button "200g"
  - text: ₹100.00 Inc. GST (5%)
  - button "Add"
  - img "Black Rice Raw கருப்பு கவுனி அரிசி"
  - text: grains
  - heading "Black Rice Raw கருப்பு கவுனி அரிசி" [level=3]
  - paragraph: Black rice is rich in antioxidants, fiber, and essential minerals. It may support heart health, aid digestion, and help manage blood sugar levels as part of a healthy diet.
  - text: antioxidants fiber
  - button "1kg"
  - button "500g"
  - text: ₹320.00 Inc. GST (5%)
  - button "Add"
  - img "Mapillai Samba Rice மாப்பிள்ளை சம்பா அரிசி"
  - text: grains
  - heading "Mapillai Samba Rice மாப்பிள்ளை சம்பா அரிசி" [level=3]
  - paragraph: Also known as Bridegroom Rice, Mapillai Samba is a traditional red rice from Tamil Nadu. It's packed with fiber, iron, and zinc, and has a low glycemic index, making it beneficial for blood sugar control and boosting strength.
  - text: fiber iron
  - button "1kg"
  - text: ₹229.00 Inc. GST (5%)
  - button "Add"
  - button
  - img "Premium Cashew<br>முந்திரிப்பருப்பு"
  - button
  - button
  - button "View 1":
    - img "View 1"
  - button "View 2":
    - img "View 2"
  - button "View 3":
    - img "View 3"
  - button "View 4":
    - img "View 4"
  - text: nuts
  - heading "Premium Cashew முந்திரிப்பருப்பு" [level=2]
  - paragraph: Cashews are rich in healthy fats, protein, magnesium, and zinc. They can support heart health and provide nutrients important for bones, brain, and skin as part of a balanced diet.
  - heading "Flavor Profile" [level=4]
  - text: "Crunchy & Creamy nutty 5/5 sweet 3/5 creamy 4/5 Aroma:"
  - paragraph: "\"Mild Roasted Nut\""
  - heading "Best Paired With" [level=4]
  - text: Honey Dried Fruits Curries
  - paragraph: "Pro Tip: Perfect for snacking or thickening rich gravies."
  - heading "Ingredients" [level=4]
  - list:
    - listitem: • Raw Cashew Nuts
  - heading "Health Benefits" [level=4]
  - list:
    - listitem: heart health
    - listitem: brain health
    - listitem: skin health
    - listitem: bone support
  - heading "High In" [level=4]
  - text: protein healthy fats magnesium zinc Select Weight
  - button "1kg"
  - button "500g"
  - text: ₹1199.00 Inclusive of 5% GST
  - button "Add to Cart"
  - text: Our Promise
  - heading "From Soil to Soul" [level=2]
  - paragraph: Every product tells a story of dedication, care, and love for pure, wholesome food. This is our journey to your table.
  - heading "From Blessed Earth" [level=3]
  - paragraph: We partner with farmers who nurture the soil with love, growing crops without harsh chemicals. Every seed planted carries the promise of pure, natural goodness.
  - text: ✓
  - heading "Harvested with Care" [level=3]
  - paragraph: At the perfect moment of ripeness, crops are harvested mindfully. Our farmers know their land intimately—every field tells a story of dedication and respect for nature.
  - text: ✓
  - heading "Processed with Integrity" [level=3]
  - paragraph: Using traditional methods passed down through generations, we process every grain and legume to preserve its soul. Minimal processing means maximum nutrition and taste.
  - text: ✓
  - heading "Brought to Your Home" [level=3]
  - paragraph: "Sealed with care in clean, sustainable packaging, our products journey to your kitchen. Every package carries our promise: pure food for your family's health and happiness."
  - text: ✓
  - heading "See It In Action" [level=3]
  - paragraph: Watch how we bring our promise to life—from the farms of dedicated growers to the kitchens of families who trust us
  - iframe
  - heading "Black Rice Farm Walkthrough" [level=4]
  - paragraph: Watch this farm walkthrough to see the majestic black rice plant in its natural habitat. Learn about the unique characteristics of this ancient 'forbidden rice' and how it's grown with dedication and care.
  - paragraph: "\"This Is What a Black Rice Plant Looks Like\""
  - heading "Our Stories" [level=5]
  - button "1 Black Rice Farm Walkthrough This Is What a Black Rice Plant Looks Like":
    - text: "1"
    - paragraph: Black Rice Farm Walkthrough
    - paragraph: This Is What a Black Rice Plant Looks Like
  - button "2 Our Agriculture Quality Packing":
    - text: "2"
    - paragraph: Our Agriculture
    - paragraph: Quality Packing
  - button "3 Our Rice Field Minimal Processing":
    - text: "3"
    - paragraph: Our Rice Field
    - paragraph: Minimal Processing
  - button "4 Rice Harvesting in Action Perfect Harvesting":
    - text: "4"
    - paragraph: Rice Harvesting in Action
    - paragraph: Perfect Harvesting
  - button "5 Rice Seedling Transplantation Rice Seedling Transplantation":
    - text: "5"
    - paragraph: Rice Seedling Transplantation
    - paragraph: Rice Seedling Transplantation
  - text: Our Mission
  - heading "Our Food Philosophy" [level=2]
  - paragraph: At Amudham Naturals, we are dedicated to offering exceptional value by providing superior quality products at accessible everyday prices. We believe that wholesome, natural food should be honest and available to all.
  - paragraph:
    - text: Our mission is to deliver pure products crafted with integrity, transparency, and a deep-seated commitment to
    - strong: "\"real food.\""
    - text: Every item in our selection is thoughtfully sourced from trusted partners who mirror our passion for authenticity and nutritional excellence.
  - paragraph: When you choose us, we want you to feel a genuine connection to food that is pure, authentic, and handled with care. We select each ingredient with the same diligence we would for our own families.
  - paragraph: "\"Wow! That was a delightful experience, and I got a fantastic deal. I look forward to coming back!\""
  - paragraph: — The Amudham Promise
  - text: Get In Touch
  - heading "Let's Connect" [level=2]
  - paragraph: From personalized recommendations to partnership inquiries, we're here to guide your journey from soil to soul.
  - heading "Send us a message" [level=3]
  - text: Full Name
  - textbox "Your Name"
  - text: Email
  - textbox "hello@example.com"
  - text: Subject
  - textbox "e.g. Bulk Ordering, Partnerships"
  - text: Message
  - textbox "Tell us what you're looking for..."
  - button "Send Message"
  - heading "Contact Information" [level=3]
  - paragraph: Reach out to us directly
  - paragraph: Contact Number
  - link "+91 9486225762":
    - /url: tel:+919486225762
  - paragraph: Mon-Sat, 9AM-7PM IST
  - button "Copy Contact Number"
  - paragraph: Official Inquiries
  - link "amudhamnaturals@gmail.com":
    - /url: mailto:amudhamnaturals@gmail.com
  - paragraph: Response within 24 hours
  - button "Copy Official Inquiries"
  - paragraph: Store Location
  - link "Cuddalore, TamilNadu":
    - /url: https://maps.app.goo.gl/zJBAFjVTDmbavfUDA
  - paragraph: Visit us in person
  - button "Copy Store Location"
  - text: Our Location
  - heading "Visit Our Store" [level=3]
  - paragraph: Gandhi Gramam, Cuddalore, TN
  - text: Click to expand
  - iframe
  - heading "Follow Our Journey" [level=3]
  - paragraph: Stay connected with our daily stories and updates
  - link "YouTube":
    - /url: https://www.youtube.com/@Amudha-1957?sub_confirmation=1
    - img "YouTube"
  - link "Instagram":
    - /url: https://www.instagram.com/amudhamnaturals/
    - img "Instagram"
  - link "LinkedIn":
    - /url: https://www.linkedin.com/company/amudham-naturals
    - img "LinkedIn"
  - link "WhatsApp":
    - /url: https://chat.whatsapp.com/K6E89KKaTHhIpNf2xjjUP7?mode=gi_t
    - img "WhatsApp"
  - img
  - text: Certified Quality
  - heading "From Soil to Soul" [level=3]
  - paragraph: "\"Every product is crafted with care, ensuring the highest standards of purity and nutrition for your family.\""
  - paragraph: FSSAI Certified
  - paragraph: "License No: 12425004000475"
  - paragraph: GST Registered
  - paragraph: "GSTIN: 33AFQPA9130C1ZV"
  - paragraph: Trademark Registered
  - paragraph: "Proprietor: 7072196"
  - paragraph: UDYAM Registered
  - paragraph: "Reg No: UDYAM-TN-04-0112184"
- contentinfo:
  - heading "🌿 Amudham Naturals" [level=3]
  - paragraph: Premium organic products crafted with care. Pure, natural, wholesome — from soil to soul.
  - link:
    - /url: https://www.instagram.com/amudhamnaturals/
  - link:
    - /url: https://www.youtube.com/@Amudha-1957?sub_confirmation=1
  - heading "Navigation" [level=4]
  - list:
    - listitem:
      - link "Home":
        - /url: /#home
    - listitem:
      - link "Products":
        - /url: /#products
    - listitem:
      - link "Our Process":
        - /url: /#ourprocess
    - listitem:
      - link "About":
        - /url: /#about
    - listitem:
      - link "Contact":
        - /url: /#contact
  - heading "Legal" [level=4]
  - list:
    - listitem:
      - link "Privacy Policy":
        - /url: /privacy-policy
    - listitem:
      - link "Terms & Conditions":
        - /url: /terms-conditions
    - listitem:
      - link "Refund Policy":
        - /url: /refund-policy
    - listitem:
      - link "Blog":
        - /url: /blogs
  - heading "Get In Touch" [level=4]
  - link "+91 9486225762":
    - /url: tel:+919486225762
  - link "amudhamnaturals@gmail.com":
    - /url: mailto:amudhamnaturals@gmail.com
  - text: Cuddalore, Tamil Nadu, India
  - paragraph: © 2026 Amudham Naturals. All rights reserved.
  - paragraph:
    - text: "FSSAI License No:"
    - strong: "12425004000475"
  - text: ✓ 100% Natural ✓ Quality Assured
- alert
```

# Test source

```ts
  1  | // Generated for amudham from plan.md. Regenerated by /design.
  2  | import { test, expect } from '../../../../../lib/fixtures';
  3  | 
  4  | test.describe('Browse and add to cart @flows @amudham', () => {
  5  |   test('user browses products, selects a variant in the modal, and adds it to the cart', async ({ authedPage: page }) => {
  6  |     test.info().annotations.push({ type: 'description', value: 'Full browse-to-cart flow: filter tabs visible → open Premium Cashew modal → switch to 500g → add to cart → confirm cart panel shows correct entry.' });
  7  | 
  8  |     // Step 1: Navigate to the home page
  9  |     await page.goto('https://amudhamnaturals.com/');
  10 | 
  11 |     // Step 2: Scroll to product section
  12 |     await page.locator('#products').scrollIntoViewIfNeeded();
  13 | 
  14 |     // Step 3: Assert category filter tabs visible
  15 |     await expect(page.getByRole('button', { name: 'All Products' })).toBeVisible();
  16 |     await expect(page.getByRole('button', { name: 'Nuts & Seeds' })).toBeVisible();
  17 |     await expect(page.getByRole('button', { name: 'Grains & Rice' })).toBeVisible();
  18 |     await expect(page.getByRole('button', { name: 'Flours' })).toBeVisible();
  19 |     await expect(page.getByRole('button', { name: 'Natural Sweeteners' })).toBeVisible();
  20 |     await expect(page.getByRole('button', { name: 'Spices' })).toBeVisible();
  21 | 
  22 |     // Step 4: Click "Premium Cashew" product card
  23 |     await page.locator('#products').getByText('Premium Cashew').first().click();
  24 | 
  25 |     // Step 5: Assert modal with "Premium Cashew" heading opens
  26 |     const modal = page.getByRole('dialog');
> 27 |     await expect(modal).toBeVisible();
     |                         ^ Error: expect(locator).toBeVisible() failed
  28 |     await expect(modal.getByRole('heading', { name: 'Premium Cashew' })).toBeVisible();
  29 | 
  30 |     // Step 6: Assert "1kg" variant selected, price "₹1199.00" shown
  31 |     await expect(modal.getByRole('button', { name: '1kg' })).toBeVisible();
  32 |     await expect(modal.getByText('₹1199.00')).toBeVisible();
  33 | 
  34 |     // Step 7: Click "500g" variant button
  35 |     await modal.getByRole('button', { name: '500g' }).click();
  36 | 
  37 |     // Step 8: Assert price updates to "₹600.00"
  38 |     await expect(modal.getByText('₹600.00')).toBeVisible();
  39 | 
  40 |     // Step 9: Click "Add to Cart"
  41 |     await modal.getByRole('button', { name: 'Add to Cart' }).click();
  42 | 
  43 |     // Step 10: Assert cart badge increments (≥1)
  44 |     const cartBadge = page.locator('[class*="badge"], [class*="count"], [aria-label*="cart" i]').first();
  45 |     await expect(cartBadge).toBeVisible();
  46 | 
  47 |     // Step 11: Click cart icon
  48 |     await page.getByRole('button', { name: /cart/i }).click();
  49 | 
  50 |     // Step 12: Assert cart panel open; "Premium Cashew" entry with "Weight: 500g" and "₹600.00" visible
  51 |     await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();
  52 |     const cartPanel = page.locator('[class*="cart"], [class*="drawer"]').filter({ hasText: 'Shopping Cart' }).first();
  53 |     await expect(cartPanel.getByText('Premium Cashew')).toBeVisible();
  54 |     await expect(cartPanel.getByText(/500g/i)).toBeVisible();
  55 |     await expect(cartPanel.getByText('₹600.00')).toBeVisible();
  56 | 
  57 |     // Step 13: Assert "Proceed to Checkout" link visible
  58 |     await expect(cartPanel.getByRole('link', { name: /proceed to checkout/i })).toBeVisible();
  59 |   });
  60 | });
  61 | 
```