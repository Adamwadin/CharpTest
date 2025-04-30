# CharpTest

# Worktest for charpstAR

Live on charp-test.vercel.app

## Features

### Authentication & Roles

- **Supabase Auth** (Email + Password)
- Role-based logic:

  - **Admin**: Full access to create, edit, and manage users roles
  - **Viewer**: Read-only access to content

- Checking if user is logged in for every page so you someone cant access everything by typing the page in the URL.
- To make it easier for you i disregarded the option to have to verify mail when creating an account. if you want to test it.

### Content Management

- View all content (products)
- Admins can:
  - Add new content
  - Edit existing items
  - Automatically save previous versions before updates
  - Restore older versions from version history (see comment on this function)

### Real-Time Conflict Detection

**Approach:**  
Before saving edits to a product, the app checks whether the `updated_at` timestamp in the database has changed since the item was loaded. If it has, the user is warned that another admin has made changes. This avoids accidental overwrites.

Easiest way to test this is by using two diffrent browsers and login into both Adam and Arjun (after making them both admin)

Click view on the same product.
Open edit on both.
Then on user A change name of the product,
Then try to change it on user B

It Will pop up a toaster pop-up saying you need to refresh because another admin is working on it.
edit mode will go false and the product is fetched again. So yu can try again.

### User Management

- Admins can:
  - View all users
  - Promote/demote between Viewer and Admin

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase
- **Icons:** Lucide-react
- **Deployment:** Vercel

---

## Getting Started

### 1. Clone the repo

git clone https://github.com/Adamwadin/CharpTest.git
cd adamworktest

npm install

npm run dev

.env file to be added in the root file of the project with enviroment variables

I will attach variables in the mail when turning in the assigment.
