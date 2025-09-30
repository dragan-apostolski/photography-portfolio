---
trigger: model_decision
description: Use this rule when asked to deploy the application
---

- App is deployed on Vercel
- Code should be commited and pushed to git repo before initiating a deploy
- Use vercel CLI for deploy operations
- Don't mix netlify and vercel, netlify is not used for the deployment of this project