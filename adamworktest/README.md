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

UPDATED!
I completely re-did this functionalty from how it was before, had some time over and sat down and reaserched a better way to do it. and came up with this :)

The one before was unreliable because both could be in edit mode at the same time.

When an admin clicks Edit Product, the app tries to update the products locked_by column with their own user ID, but only if it's NULL.

If the lock fails (someone else already locked it), it fetches the editor's email and shows a friendly toast message.

The lock is cleared:
When the user clicks Cancel
if the user saves the product
if the user closes or refreshes the tab (using beforeunload)

Also displays who is editing so you can yell at them loudly to work faster!

would be good with a timeout like function, if someone left their computer at the editing mode for more then lets say 15 min the lock is automatically erased and user gets thrown to the dashboard.

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
