# Quick Start Guide - Testing the Planning System

## Prerequisites ✅
- All code changes completed and saved
- Backend and Frontend repos initialized

## Immediate Steps (Do This Now)

### Step 1: Run Database Migration
```powershell
cd "d:\Exam Managment Project\backend"
php artisan migrate
```

**Expected Output:**
```
Migrating: 2025_12_03_172200_modify_group_delegates_remove_unique
Migrated:  2025_12_03_172200_modify_group_delegates_remove_unique (xxx ms)
```

✅ If you see this → Migration successful!  
❌ If you see an error → Check `backend/storage/logs/laravel.log`

---

### Step 2: Start Backend Server
```powershell
cd "d:\Exam Managment Project\backend"
php artisan serve
```

**Expected Output:**
```
INFO  Server running on [http://127.0.0.1:8000]
```

✅ Leave this terminal running → Backend is ready!

---

### Step 3: Start Frontend Dev Server (New Terminal)
```powershell
cd "d:\Exam Managment Project\frontend"
npm run dev
```

**Expected Output:**
```
  VITE v... dev server running at:

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ Keep this terminal running → Frontend is ready!

---

### Step 4: Navigate to Planning Page
1. Open browser → `http://localhost:5173`
2. Login to Admin panel
3. Navigate to **Admin → Planning**

**Expected**:
- Calendar loads with exams (or empty if no exams in DB)
- Sidebar shows filters for room, group, date range
- Add Exam button visible in top-right

✅ Calendar appears → Data loading is working!

---

## Test #1: Create an Exam (Required)

### Setup
1. Ensure you have at least:
   - 1 module (in database or create via Admin → Modules)
   - 1 group (in database or create via Admin → Groups)
   - 1 room (optional - can leave blank)

### Steps
1. Click **"Add Exam"** button (top-right)
2. Fill in fields:
   - **Module**: Select from dropdown
   - **Group**: Select from dropdown  
   - **Room**: Leave blank (optional) or select
   - **Exam Type**: Select "Exam" (default)
   - **Date**: Pick any date (e.g., 2026-02-15)
   - **Start Hour**: Type "08" (8 AM)
   - **End Hour**: Type "10" (10 AM)
3. Click **"Save Exam"**

### Expected
- ✅ Modal closes
- ✅ Exam appears in calendar
- ✅ Success notification shows
- ❌ If error → Check browser console (F12)

---

## Test #2: Edit an Exam (Required)

### Steps
1. Click on exam event in calendar
2. Modal opens with form pre-filled
3. Change **End Hour** to "11" (11 AM)
4. Click **"Update Exam"**

### Expected
- ✅ Modal closes
- ✅ Calendar event updated with new time
- ✅ Success notification shows

---

## Test #3: Delete an Exam (Required)

### Steps
1. Click on exam in calendar
2. Click **delete button** (trash icon)
3. Confirm deletion in popup

### Expected
- ✅ Exam removed from calendar
- ✅ Success notification shows

---

## Test #4: Assign Proctors (Important)

### Steps
1. Click on exam in calendar
2. Click **"Assign Proctors"** button
3. Modal shows list of teachers
4. Select 2-3 teachers via checkboxes
5. Click **"Assign Proctors"**

### Expected
- ✅ Modal closes
- ✅ Success notification shows
- ✅ Proctors assigned to exam

**Note**: If you get an error about "Validation error" or "students must be in group", this is normal - backend validation ensures only group students can be assigned. Verify the students exist in the selected group.

---

## Test #5: Filter Exams (Required)

### Steps
1. With exams in calendar, use filters on left sidebar:
   - Type "A1" in **Group** filter
   - Set **Start Date** to 2026-01-01
   - Set **End Date** to 2026-12-31
2. Calendar updates in real-time

### Expected
- ✅ Calendar shows only exams matching filters
- ✅ Clearing filters shows all exams again

---

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| "Failed to load planning data" | Check Laravel logs: `backend/storage/logs/laravel.log` |
| Calendar empty | Verify exams exist in DB; check Network tab (F12) for API errors |
| Can't select module/group | Ensure modules and groups exist in database |
| Delegate assignment fails | Verify students are assigned to group before making them delegates |
| ESLint errors in VS Code | Errors have been fixed; restart VS Code if needed |
| Migration fails | Run `php artisan migrate:reset` then `php artisan migrate` to retry |

---

## Success Criteria ✅

After testing, you should be able to:
- [x] Create an exam with all required fields
- [x] See exam appear in calendar instantly  
- [x] Edit exam details and see updates in calendar
- [x] Delete exam with confirmation dialog
- [x] Assign multiple proctors to exam
- [x] Filter exams by room/group/date range
- [x] See no errors in browser console (F12)

If all above work → **System is production-ready!** 🎉

---

## Monitoring During Testing

### Browser DevTools (F12)
- **Console Tab**: Check for any JavaScript errors (should be none)
- **Network Tab**: Verify API calls to:
  - `/api/exams` → 200 OK
  - `/api/rooms` → 200 OK
  - `/api/modules` → 200 OK
  - `/api/teachers` → 200 OK
  - `/api/groups` → 200 OK

### Backend Logs
```powershell
# In backend terminal, watch logs in real-time
Get-Content "backend/storage/logs/laravel.log" -Wait -Tail 20
```

### Frontend Logs
- Check terminal where `npm run dev` is running for any build warnings
- Check browser console for React warnings

---

## Need Help?

1. **Frontend Issue**: Check `frontend/src/views/admin/AdminPlanning.jsx` (line numbers in error)
2. **Backend Issue**: Check `backend/storage/logs/laravel.log` for detailed error
3. **Database Issue**: Verify migration ran: `php artisan migrate:status`

---

**Test Duration**: ~15 minutes  
**Last Updated**: December 3, 2024  
**Status**: Ready to Test ✅
