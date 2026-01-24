# 🚀 ARISE Hunter - Supabase Database Setup Instructions

Follow these simple steps to set up your database in Supabase.

## 📋 Prerequisites

- ✅ Supabase account created
- ✅ New Supabase project created
- ✅ Environment variables updated in `.env` file

## 🔧 Setup Steps

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `mgztjrtvsvxliqfgeflf`
3. Click on **"SQL Editor"** in the left sidebar (icon looks like `</>`)

### Step 2: Run the Setup Script

1. In the SQL Editor, click **"New Query"**
2. Open the file `SUPABASE_COMPLETE_SETUP.sql` from your project folder
3. **Copy all the content** from that file
4. **Paste it** into the Supabase SQL Editor
5. Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 3: Verify the Setup

After running the script, you should see a success message. To verify:

1. Click on **"Table Editor"** in the left sidebar
2. You should see the following tables:
   - ✅ `user_profiles`
   - ✅ `categories`
   - ✅ `habits`
   - ✅ `goals`
   - ✅ `milestones`
   - ✅ `skills`
   - ✅ `rules`
   - ✅ `rule_violations`
   - ✅ `rule_daily_checks`
   - ✅ `routines`

### Step 4: Test Your Application

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. Open your browser and go to: http://localhost:5173/

3. Try to sign up or log in - your user profile should be created automatically!

## 🎯 What This Setup Includes

### Tables Created:
- **user_profiles** - Extended user information
- **categories** - Organization categories for habits/goals
- **habits** - Daily habit tracking
- **goals** - Goal management
- **milestones** - Goal milestones
- **skills** - Skill learning tracker
- **rules** - Personal rules system
- **rule_violations** - Rule violation tracking
- **rule_daily_checks** - Daily rule compliance
- **routines** - Routine management

### Security Features:
- 🔒 Row Level Security (RLS) enabled on all tables
- 🔐 User-specific data policies (users can only see/edit their own data)
- 🤖 Automatic user profile creation on signup
- 📊 Optimized indexes for better performance

## ⚠️ Troubleshooting

### If you get an error about existing tables:

The script uses `CREATE TABLE IF NOT EXISTS`, so it won't fail if tables already exist. However, if you want to start fresh:

1. Go to **SQL Editor**
2. Run this command to drop all tables:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   GRANT ALL ON SCHEMA public TO postgres;
   GRANT ALL ON SCHEMA public TO public;
   ```
3. Then run the `SUPABASE_COMPLETE_SETUP.sql` script again

### If authentication doesn't work:

1. Go to **Authentication** → **Settings** in Supabase
2. Make sure **"Enable email confirmations"** is set according to your preference
3. Check that your **Site URL** is set to `http://localhost:5173` for development

## 🎉 You're All Set!

Your ARISE Hunter database is now ready to use. Start tracking your habits, goals, and skills!

## 📞 Need Help?

If you encounter any issues:
1. Check the Supabase logs in the Dashboard
2. Verify your environment variables in `.env`
3. Make sure you're using the correct project URL and anon key
