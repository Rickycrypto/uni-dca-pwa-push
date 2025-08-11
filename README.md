
# UNI DCA Trader (PWA + Web Push)

Installable PWA with **Web Push** notifications (iOS-friendly via Safari "Add to Home Screen").
Push requires **VAPID keys** and a tiny API endpoint — both included here.

## Deploy on Vercel
1) Create a new GitHub repo and upload **all files in this folder** (the contents, not the parent).
2) In Vercel → New Project → Import your repo.
3) Set these **Environment Variables** (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = your VAPID public key
   - `VAPID_PRIVATE_KEY` = your VAPID private key
   - `BROADCAST_KEY` = any random secret (used to authorize /api/broadcast)
4) Deploy (Node 20.x).

## Generate VAPID keys (locally)
- With Node:
  ```bash
  npx web-push generate-vapid-keys
  ```
Copy the Public key to `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, Private to `VAPID_PRIVATE_KEY`.

## Use
1) Open the site in iPhone **Safari** → Share → **Add to Home Screen**.
2) Open the app icon → press **Enable Push**, grant notification permission.
3) Press **Send Test**; you should see a push notification.
4) Keep Safari open in the background for reliable iOS PWA push delivery.

## Scheduling
The page computes a **pre-alert** time (default 3h before an execution hour within 08:30–23:00). 
To automate real trade alerts, hook your strategy to call `/api/broadcast` with your `BROADCAST_KEY`.
