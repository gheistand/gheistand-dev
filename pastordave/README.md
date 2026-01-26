# pastordave-org

Ask Pastor Dave - Faith-based Q&A resource website hosted on Cloudflare Workers.

## About

Ask Pastor Dave is a faith-based question and answer resource designed to provide thoughtful, biblical guidance on spiritual matters. The site offers an accessible platform for individuals seeking pastoral wisdom and scriptural insight.

## What's Included

- **Progressive Web App (PWA)**: Full offline capability with service worker
- **Responsive Design**: Mobile-first design that works on all devices
- **Manifest Configuration**: Installable as a native app on mobile devices
- **Custom Icons**: Multiple icon sizes for various devices and platforms

## Technology Stack

- Static HTML/CSS/JavaScript
- Progressive Web App (PWA) with Service Worker
- Hosted on Cloudflare Workers
- Cloudflare Zero Trust for authentication (if applicable)

## Structure

pastordave-org/
├── index.html # Main landing page
├── manifest.json # PWA manifest configuration
├── service-worker.js # Service worker for offline capability
├── icon-192x192.png # PWA icon (192x192)
└── icon-512x512.png # PWA icon (512x512)

## Features

### Progressive Web App
The site is configured as a PWA with:
- **Offline Support**: Service worker caches assets for offline access
- **Installable**: Can be installed as a standalone app on mobile devices
- **App-like Experience**: Full-screen mode without browser UI when installed

## Deployment
This site is automatically deployed via Cloudflare Workers. Any push to the main branch triggers an automatic build and deployment to askpastordave.org.

- **Cloudflare Worker Configuration
- **Worker Name: young-recipe-91fd
- **Custom Domain: askpastordave.org
- **Deployment: Automated via GitHub integration

## Local Development
Clone the repository:
- git clone https://github.com/gheistand/pastordave-org.git
- cd pastordave-org
- Open index.html in your browser to test locally

To test PWA features locally, you'll need to serve over HTTPS:
# Using Python 3
python -m http.server 8000

# Or using Node.js http-server
npx http-server
Make changes, commit, and push to trigger deployment:
git add .
git commit -m "Your commit message"
git push origin main

## Related Projects
- gheistand.dev - Personal and professional website
- baseflood.com - BaseFlood Engineering, PLLC
- illinoisfloodmaps.org - Illinois flood mapping resources
- About the Creator:
Glenn Heistand is a lay member of the Global Methodist Church and water resources professional, combining technical expertise with pastoral care to serve communities through faith-based resources and flood risk management.

## License
MIT License - Copyright © 2024-2025 Glenn Heistand

## Contact
For questions or feedback about Ask Pastor Dave, please visit the website at askpastordave.org.

## Acknowledgments
This project serves as a resource for individuals seeking biblical guidance and pastoral wisdom in their daily lives.

### Manifest Details
```json
{
  "name": "Ask Pastor Dave",
  "short_name": "Pastor Dave",
  "theme_color": "#2196f3",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/"
}
