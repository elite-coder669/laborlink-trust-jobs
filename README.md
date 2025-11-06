# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d1b21841-6e1c-4186-8bb7-879a86e101f1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d1b21841-6e1c-4186-8bb7-879a86e101f1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d1b21841-6e1c-4186-8bb7-879a86e101f1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Recent updates (Multi-worker hiring)

This project now supports employers posting jobs that require multiple workers (positions). Key changes:

- New DB column: `jobs.positions_required` (integer, default 1). Employers can set how many workers they need for a job.
- Applicants are stored in `applications` (existing). Employers can accept multiple applicants up to `positions_required`.
- When the number of accepted applications reaches `positions_required`, the job's `status` is updated to `in_progress` automatically.
- Job detail pages now show "X applicant(s) • Y position(s) required" and include an employer-facing Applicants panel where the employer can Accept/Reject applicants.

If you're running locally or deploying, follow these steps to apply the database migration and test the flow.

### Apply the DB migration

The migration file is included at `supabase/migrations/20251106121000_add_positions_required.sql`.

If you use the Supabase CLI (recommended):

```bash
# push migrations to your local/dev supabase
npx supabase db push
```

Or run the SQL directly in the Supabase SQL editor.

### Dev / test the multi-worker flow

1. Restart the dev server:

```bash
npm run dev
```

2. Open two (or more) browser sessions:
- Employer (logged in): Post a job via `/post-job` and set "Number of Workers Required" to >1.
- Worker(s): Log in as different worker accounts and apply to the job.

3. Employer flows:
- Visit the job's detail page (`/jobs/:id`) as the employer. The Applicants panel lists incoming applications with Accept/Reject controls.
- Accept applicants up to `positions_required`. When the accepted count reaches the required number, the job status will move to `in_progress`.

4. Worker flows:
- Workers will see their application status update in their Worker Dashboard. The UI uses React Query invalidation and Supabase realtime hooks to refresh employer/worker views.

### Notes and recommendations

- Atomicity: Accepting an application and updating job status currently happens in multiple sequential DB calls. For full transactional safety under concurrent acceptance, consider adding a Postgres function / RPC that performs the accept-and-assign in a single transaction. I can add that for you.
- Assignments: If you want to explicitly store which workers are assigned to a job, consider adding an `assigned_laborers` table or column. This repo can be updated to include that migration + UI.

If you'd like me to add the atomic RPC or an explicit assignments table and UI, tell me and I'll implement it next.
