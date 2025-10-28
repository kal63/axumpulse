🧩 Project Overview — AxumPulse 360 (VAS Fitness & Learning Platform)

AxumPulse is a web-based fitness and learning application built on top of a telecom-integrated VAS (Value Added Service) system.
Users subscribe via their mobile number through the telecom’s API, and as long as their subscription is active, they can log in to access the platform’s digital content.

🚀 Core Idea

AxumPulse delivers localized health, fitness, and educational content in multiple languages (English and Amharic for MVP).
The platform combines fitness tracking, gamification, and educational media to encourage consistent engagement.

It’s divided into three main user roles:

Public / Trainee Users – ordinary subscribers who can:

Watch workout videos and read resources (articles)

Track habits (sleep, water, workouts)

Join challenges and earn XP

Redeem rewards

Receive notifications

Trainers / Content Creators – verified users who can:

Create and manage workouts (with multiple steps and exercises)

Write educational articles/resources

Upload media assets

Submit content for moderation (admin approval)

Admins / Super Users – internal moderators who:

Approve or reject trainer content

Verify trainers

Manage challenges, rewards, and active languages

Oversee user activity and system health

🧱 MVP Focus (Phase 1)

For the MVP, only the web app will be developed — no mobile apps or AI features yet.
Payment and subscription management are handled entirely by a third-party telecom API.
The app only checks whether a user’s subscription is active before granting access.

🎯 Active Development Module

Right now, we’re building the Admin Dashboard — a simple front-end interface that shows how super users manage the platform.
This version is front-end only (mock data) and demonstrates the structure and design of the admin experience.

Admin Features (Demo Scope):

View overall stats (Users, Pending Trainers, Pending Moderation, Active Challenges)

Moderate trainer content (approve/reject workouts & resources)

Verify/unverify trainers

Toggle users between Admin / Blocked status

Create/manage challenges (daily/weekly/one-off)

Create/manage rewards (XP-based)

Enable/disable available languages (EN/AM)

🧰 Tech Stack (Front-End)

Next.js 14+ (App Router, TypeScript)

Tailwind CSS + shadcn/ui

Mocked data only (no backend API in demo)

Client-side state updates with React hooks

🧠 Design Goals

Clean, minimal admin interface (dashboard + sidebar layout)

Responsive design (desktop and mobile)

Clear separation between roles (Admin / Trainer / Public)

Focus on readability and future scalability

📄 Summary for Cursor

AxumPulse is a multi-role VAS-based fitness platform that provides localized health and learning content.
The current focus is on the Admin Dashboard demo, a front-end mock app showing how admins manage users, trainers, content moderation, challenges, rewards, and languages.