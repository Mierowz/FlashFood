# FlashFood

**Good food. Less waiting.** FlashFood is a school-canteen ordering demo built with React, Vite, and Electron. It lets students explore canteen menus, check food information, place simulated orders, and track them. A linked parent view demonstrates shared carts, food-safety controls, purchase history, and sending meals to a student.

> **Demo notice:** FlashFood currently uses local demo accounts and sample data. Top-ups, balances, points, payment choices, order statuses, crowd estimates, and meal-assistance options are simulations—not real payments, live canteen integrations, verified medical advice, or a school-funded benefit. Data is stored locally in the app/browser and is not a production multi-user sync service.

## Download the desktop app

The Windows and macOS installers are attached to GitHub Releases:

1. Open this repository on GitHub.
2. Select **Releases** (usually on the repository's right side, or from the repository's **Tags/Releases** area).
3. Open the latest release.
4. Under **Assets**, download the installer for your operating system:
   - **Windows:** `FlashFood-Setup-...exe`
   - **macOS:** `FlashFood-...pkg`
5. Open the downloaded installer and follow its prompts.

If a release has no installer assets yet, the first release build has not finished. Check the repository's **Actions** tab for the **Build FlashFood installers** workflow.

### Important installation note

These builds are not configured with paid platform code-signing certificates or Apple notarization. Windows or macOS may display a security warning. For public or production distribution, configure the appropriate signing and notarization credentials before distributing installers broadly.

## Features and how to access them

### Student experience

- **School ID sign-in:** Enter a student School ID and its demo password on the login screen. Use **Reset demo data** there to restore the sample state.
- **Home dashboard:** View the sample balance and points, friends, featured foods, recommendations, canteen busyness demo, and meal-assistance entry.
- **Canteen menu:** Select **See all** or a food/menu entry from Home. Browse **What's New**, **Favorites**, or **All Foods**, and filter by **All**, **Main**, or **Small** canteen.
- **Food details:** Select a food to see its price, description, listed allergens, nutrition information, stock, favorite toggle, and add-to-cart control.
- **Favorites:** Tap the star on a food card or item page. Favorites are prioritized in the menu and recommendations.
- **Cart and checkout:** Open the cart icon in the top bar, remove items if needed, then continue to checkout. The demo checkout offers School Balance, Points, and Cash on Pickup, plus fulfilment and recipient options where available.
- **Wallet and points:** Use **Top Up** on the Home balance card to simulate adding funds. Demo orders award points; the checkout shows the point value available for redemption.
- **Order confirmation and tracking:** After placing an order, open **Track order status** or the Home order banner. The **Simulate next update** control advances the sample status from Placed to Preparing to Ready.
- **Purchase history:** Choose **History** in the bottom navigation. Switch between **Recently Bought**, **Most Bought**, and **Least Bought**. The Restrict action on a history item opens food restrictions.
- **Friends:** Choose **See all** beside Friends on Home. Search by name or School ID, send or respond to friend requests, open a friend profile, view their demo favorites/history, or unfriend them.
- **Canteen map:** Choose **Map** in the bottom navigation to view the sample school layout, canteen busyness, and approximate walk labels.
- **Saved schools:** Choose **Saved Schools** in the bottom navigation to view the demo saved-school screen.
- **Profile and settings:** Tap your avatar in the top bar. The profile shows points, purchases, balance, allergies, restrictions, and favorites. Open **Account & Settings** for preferences and log out.
- **Allergies:** From Profile, choose **Allergies**. Select common allergens or add a custom one. Matching menu items are blocked from the cart/checkout by the demo's safety checks.
- **Meal assistance:** Choose **View meals** on Home, or **Meal Assistance** from the relevant dashboard. The meal options are illustrative demo content.

### Parent experience

- **Parent sign-in:** Use the parent's School ID shown on the login screen. The demo parent account uses the password of its linked student account.
- **Parent dashboard:** The home screen links to Purchase History, Food Restrictions, Allergies, Send a Meal, Shared Cart, Meal Assistance, and Order Status.
- **Child allergies:** Open **Allergies** on the parent dashboard to manage the linked student's allergen list.
- **Food restrictions:** Open **Food Restrictions** to allow or restrict individual demo foods. Allergen and restriction checks are also applied when adding foods to the shared cart and checking out.
- **Send a Meal:** Choose **Send a Meal** and select a food to add it to the shared cart for the linked student.
- **Shared cart and orders:** Open **Shared Cart** or **Order Status** on the dashboard to review the demo cart and current order.
- **Parent network:** Use **See all** beside Parent Network to access the friend/network screen.
- **Profile and settings:** Tap the avatar in the top bar for the linked student's profile summary, allergies, preferences, and log-out control.

### Demo sign-in details

The login screen shows the sample School IDs. Student passwords follow the pattern `lastname.123456` (lowercase surname). Parent accounts use the password of their linked student's demo account. These are **demo-only credentials**, not real account credentials. The sample data can be edited in `src/demoData.js`.

## Build and run locally

Requirements: Node.js 22 (or a compatible version supported by the dependencies) and npm.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. To run the desktop Electron version locally:

```bash
npm run electron
```

## Build installers locally

Run the matching command on the relevant operating system:

```bash
npm run dist:win   # Windows .exe installer
npm run dist:mac   # macOS .pkg installer
```

The installer files are written to `release/`. A Windows build is most reliable on a Windows runner, and a macOS `.pkg` should be built on a macOS runner; the included GitHub Actions workflow handles both platforms.

## Publish installers to GitHub Releases (recommended)

You do **not** need to upload `.exe` or `.pkg` files to the repository by hand. The workflow builds them and attaches them to a GitHub Release.

1. Upload/push this project to a GitHub repository, keeping the `.github/workflows/build-release.yml` file.
2. On GitHub, open **Actions** and ensure workflows are allowed to run for the repository.
3. Commit and push your project changes to the default branch.
4. Create and push a version tag. From the project folder, run:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

5. Open **Actions** and watch **Build FlashFood installers**. It builds Windows and macOS packages on separate runners.
6. When both builds succeed, the workflow creates a GitHub Release for the tag and attaches the `.exe` and `.pkg` under **Assets**. Anyone with access to the repository can download those release assets; public repositories allow public downloads.

To test the build without publishing a release, open **Actions → Build FlashFood installers → Run workflow**. That manual run uploads temporary workflow artifacts, available on the workflow run page for 14 days, but does not create a public Release unless it is run for a `v*` tag.

## Project structure

```text
flashfood-app/
├── .github/workflows/build-release.yml  # Cross-platform build + GitHub Release
├── electron.cjs                         # Electron desktop window
├── index.html                           # Vite entry HTML
├── package.json                         # Scripts and Electron Builder targets
├── public/assets/                       # Food images, avatars, and school artwork
└── src/
    ├── main.jsx                         # React app screens and interactions
    ├── styles.css                       # App styling
    └── demoData.js                      # Sample accounts, food menu, and history
```

## Tech stack

- React
- Vite
- Electron
- electron-builder
- GitHub Actions for Windows/macOS builds and release assets

## Customizing the demo

- Edit `src/demoData.js` to change sample accounts, menu items, prices, listed allergens, nutrition flags, favorites, balances, and history.
- Edit `src/main.jsx` for app behavior and screen content.
- Edit `src/styles.css` for the visual design.
- Food and avatar images are stored in `public/assets/`.

## Limitations

- Demo data and state are stored locally; this project does not provide a real backend, remote account synchronization, live stock feed, real payment processor, real notifications, or real canteen order integration.
- The crowd indicator and order progression are simulated in the interface.
- Nutrition/allergen information is sample content and should not be treated as a verified medical or dietary source.
- Meal assistance is a presentation concept. Actual eligibility and funding would need to be handled by the school.
- Code signing/notarization is not configured by default.
