# BrocampSupport - Setup Instructions

## ✅ Complete Complaint Management System

Your student-admin complaint system is ready! Here's what's included:

### 🎯 Features Implemented

**Student Side:**
- ✅ Login/Signup with email & password
- ✅ Student Dashboard with complaint list
- ✅ Raise new complaints with:
  - Title & Description
  - Category selection
  - Photo upload
  - Audio recording
- ✅ View complaint status (Pending/In Progress/Resolved)
- ✅ Chat with admin about complaints
- ✅ Logout functionality

**Admin Side:**
- ✅ Admin login with email & password
- ✅ Admin Dashboard showing all complaints
- ✅ View student details, photos, audio
- ✅ Update complaint status
- ✅ Add admin comments
- ✅ Chat with students
- ✅ Logout functionality

---

## 🚀 Setup Steps (CRITICAL - Do This First!)

### Step 1: Set Up Database

1. Go to your **Lovable Cloud Dashboard**
2. Click on **Database** → **SQL Editor**
3. Open the file `database-setup.sql` (in your project root)
4. Copy ALL the SQL code
5. Paste it into the SQL Editor
6. Click **Run** to execute

This will create all necessary tables, policies, and storage buckets.

### Step 2: Test the System

1. **Navigate to the home page** (/)
2. Click **"Login"** or **"Get Started"**
3. You'll see two tabs: **Student** and **Admin**

**To create a Student account:**
- Click the "Student" tab
- Enter any email (e.g., student@test.com)
- Enter any password
- Click "Login" - it will auto-create the account with student role

**To create an Admin account:**
- Click the "Admin" tab
- Enter any email (e.g., admin@test.com)
- Enter any password
- Click "Login" - it will auto-create the account with admin role

---

## 📱 How to Use

### As a Student:
1. Login → You'll see the Student Dashboard
2. Click **"New Complaint"** to submit
3. Fill in details, upload photo/audio
4. Submit and track status
5. Click **"View Chat"** to communicate with admin

### As an Admin:
1. Login → You'll see all complaints
2. Click **"Manage"** to:
   - Change status (Pending/In Progress/Resolved)
   - Add admin comments
3. Click **"Chat"** to communicate with the student

---

## 🔧 Default Categories

The system includes these complaint categories:
- Technical Issue
- Academic
- Facilities
- Administrative
- Other

---

## 🎨 Routes Available

- `/` - Home/Landing page
- `/login` - Login/Signup page (both student & admin)
- `/student` - Student Dashboard
- `/student/new-complaint` - Submit new complaint
- `/student/complaint/:id` - View complaint chat
- `/admin` - Admin Dashboard
- `/admin/complaint/:id` - View complaint chat

---

## 🔐 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Role-based access control
- ✅ Secure file storage with policies
- ✅ Separate roles table (prevents privilege escalation)
- ✅ Users can only see their own data (students)
- ✅ Admins can see all data

---

## 📂 File Storage

Students can upload:
- **Photos**: JPG, PNG, etc.
- **Audio**: WebM format (recorded or uploaded)

Files are stored in Supabase Storage bucket: `complaint-attachments`

---

## 🎯 Next Steps (Optional Enhancements)

Once the basic system is working, you can add:
- Email notifications when status changes
- Push notifications for new messages
- Analytics dashboard for admins
- Priority levels for complaints
- File type restrictions/validation
- More complaint categories

---

## ⚠️ Troubleshooting

**Can't see data?**
- Make sure you ran the SQL setup script
- Check that you're logged in with the correct role

**Upload not working?**
- Verify the storage bucket was created (check SQL script ran successfully)

**Login issues?**
- Clear browser cache and try again
- Check Supabase URL Configuration in Settings

---

## ✨ You're All Set!

The complete complaint management system is ready to use. Just run the SQL setup and start testing!
