# How to Start Easy Share

## Quick Start (2 Terminals)

### Terminal 1: Backend
```bash
cd backend
./run.sh
```

Wait for this message:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

Wait for this message:
```
  VITE v7.3.1  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

## Open Your Browser

Go to: **http://localhost:5173**

## Common Issues

### Issue: "Port 5173 is in use"

**Solution:** Kill all vite processes first:
```bash
pkill -f vite
# Then try again
cd frontend && npm run dev
```

### Issue: "UI not loading" or "Blank screen"

**Checklist:**
1. ✅ Is backend running? Check: http://localhost:8000/health
2. ✅ Is frontend running? Check terminal for "VITE ready" message
3. ✅ Open browser console (F12) and check for errors
4. ✅ Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue: API errors in console

**Solution:** Make sure backend is running first before starting frontend.

## Full Cleanup & Restart

If things are really stuck:

```bash
# Stop everything
pkill -f vite
pkill -f uvicorn

# Restart backend
cd backend
./run.sh

# In another terminal, restart frontend
cd frontend
npm run dev
```

## Verification

Once both are running, test:

1. **Backend Health:** http://localhost:8000/health
   - Should see: `{"status":"healthy","version":"1.0.0"}`

2. **Backend API Docs:** http://localhost:8000/docs
   - Should see: Interactive Swagger UI

3. **Frontend:** http://localhost:5173
   - Should see: Easy Share homepage with file upload

## Success!

If you see the Easy Share homepage with the file dropzone, everything is working correctly!

## Next Steps

1. Drop a file to upload
2. Get a share code
3. Open http://localhost:5173/receive in another tab
4. Enter the share code
5. See the file details!
