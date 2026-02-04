# Google Sign-In Setup Guide

Follow these steps to generate a **Google Client ID** and enable Sign-In for your application.

## Step 1: Create a Project in Google Cloud Console
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in with your Google account.
3. Click on the project dropdown in the top navigation bar (it might say "Select a project").
4. Click **"New Project"**.
5. Enter a project name (e.g., "Trace Team Finder") and click **Create**.
6. Wait for the notification that the project is created, then click **"Select Project"**.

## Step 2: Configure OAuth Consent Screen
1. In the left sidebar, go to **"APIs & Services"** > **"OAuth consent screen"**.
2. Select **External** (unless you have a Google Workspace organization) and click **Create**.
3. **App Information**:
   - **App Name**: Trace Team Finder
   - **User support email**: Select your email.
4. **Developer Contact Information**:
   - Enter your email address.
5. Click **Save and Continue** (you can skip "Scopes" and "Test Users" for now by clicking Save and Continue at the bottom of each page).
6. On the Summary page, click **Back to Dashboard**.

## Step 3: Create Credentials (Client ID)
1. In the left sidebar, click **"Credentials"**.
2. Click **"+ CREATE CREDENTIALS"** at the top and select **"OAuth client ID"**.
3. **Application Type**: Select **Web application**.
4. **Name**: (Leave as default or name it "Trace Client").
5. **Authorized JavaScript origins**:
   - Click **"ADD URI"**.
   - Enter: `http://localhost:5173`
   *(Note: This must match exactly where your frontend is running. If Vite runs on a different port, use that one.)*
6. **Authorized redirect URIs**:
   - You can leave this blank for this popup flow, or add `http://localhost:5173` just in case.
7. Click **Create**.

## Step 4: Copy Your Client ID
1. A popup will appear saying "OAuth client created".
2. Copy the text under **"Your Client ID"** (it ends in `.apps.googleusercontent.com`).
   - *Ignore the "Client Secret" for now, we only need the ID for the frontend.*

## Step 5: Update Your Code
1. Open the file `client/src/main.jsx` in your project.
2. Locate the line:
   ```javascript
   const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE";
   ```
3. Replace `"YOUR_GOOGLE_CLIENT_ID_HERE"` with the ID you copied.
   - Example:
     ```javascript
     const GOOGLE_CLIENT_ID = "123456789-abcde...apps.googleusercontent.com";
     ```
4. Save the file.

## Step 6: Test
1. Refresh your application in the browser.
2. Go to the Login page.
3. Click "Sign in with Google".
