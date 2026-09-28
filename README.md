# Interactive Birthday Website

A polished, responsive, interactive birthday website powered by Supabase.

## Features
- **Virtual Cake & Candles**: Blow out candles using microphone or a fallback button.
- **Balloon Mini-Game**: Pop balloons for fun.
- **3D Gift Reveal**: Interactive gift box that opens to reveal messages and vouchers.
- **Birthday Music**: Play a song file, use a direct audio link, or configure a shared default track.
- **Photo Gallery**: Responsive grid with accessible lightbox.
- **Letters**: Dedicated reading view for messages from friends/family.
- **Admin Dashboard**: Secure management of content using Supabase Auth and RLS.

## Setup Instructions

### 1. Supabase Project Setup
1. Create a new project at [Supabase](https://supabase.com).
2. Go to SQL Editor and run the `supabase/migrations/001_initial_schema.sql` script to create tables, functions, and RLS policies.
3. Run the `supabase/seed.sql` script if you want some dummy data.
4. Go to Storage and create a bucket named `gallery`. Make it public.
5. In the SQL Editor, run the storage policies defined in `supabase/storage/README.md`.

### 2. Admin Bootstrap
1. Go to Supabase Authentication -> Users and create a new user (your admin account).
2. Copy the `User UID` of the newly created user.
3. Go to SQL Editor and run:
   ```sql
   INSERT INTO admin_users (user_id) VALUES ('YOUR_USER_UID_HERE');
   ```

### 3. Frontend Configuration
1. Open `frontend/js/config.js`.
2. Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your project's URL and Anon Key (found in Supabase Settings -> API).

### 4. Local Preview
You can use any local web server to preview the site. For example, using Python:
```bash
cd frontend
python -m http.server 8000
```
Open `http://localhost:8000` in your browser.
Admin dashboard is at `http://localhost:8000/admin/`.

### 5. Choose the birthday song
1. To preview a song on your own device, open **Change song** on the music player and choose an audio file. The file stays on your device.
2. To use a song link in your browser, paste a direct link to an audio file such as MP3, OGG, or WAV. This choice is saved in that browser only. Links to Spotify or YouTube pages are not direct audio files.
3. To set the same default song for everyone, place the audio file in `frontend/assets/` and set `DEFAULT_MUSIC_URL` in `frontend/js/config.js`, for example:
   ```js
   DEFAULT_MUSIC_URL: "assets/favorite-song.mp3",
   ```
   Include that file when you deploy the `frontend` folder. Browsers require a click on **Play** before music can start.

### 6. Deployment
Deploy the `frontend` folder to GitHub Pages, Vercel, or Netlify. Ensure the deployment settings point to the `frontend` directory as the root.
