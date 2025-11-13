
# Chronicle AI

<div align="center">
  <img src="https://raw.githubusercontent.com/google/aistudio-applications/main/static/chronicle-ai-logo.svg" alt="Chronicle AI Logo" width="120">
  <h1 align="center">Chronicle AI</h1>
  <p align="center">
    Transform video content into formal markdown summaries with linked visuals, powered by Gemini.
  </p>
</div>

Chronicle AI is a modern web application designed to streamline the process of documenting video content. By providing a video file (or a direct URL) and its transcript, users can leverage the power of Google's Gemini AI to generate a well-structured, formal markdown document. The document intelligently links to key frames extracted from the video, providing a comprehensive and easy-to-navigate summary.

## ✨ Key Features

- **AI-Powered Summarization**: Utilizes the Gemini Flash model to synthesize transcripts into professional markdown documents.
- **Key Visual Extraction**: Automatically captures 10 significant frames from the video to serve as visual references.
- **Linked Visuals**: Intelligently creates markdown links from the text to the corresponding key frames within the document.
- **Dual Video Input**: Supports both direct file uploads and fetching videos from a URL.
- **Multi-Language Output**: Generate documents in English, Chinese, or Japanese.
- **PPTX Export**: Download the generated summary and key visuals as a PowerPoint presentation with a single click.
- **Multilingual UI**: The application interface supports English, Chinese, and Japanese.
- **Sleek, Modern UI**: Features a futuristic, AI-inspired design with a seamless light/dark theme toggle.
- **Fully Responsive**: Designed to work beautifully on desktops, tablets, and mobile devices.

## 🚀 Tech Stack

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API (`@google/genai`)
- **Presentation Generation**: `pptxgenjs`

---

## 🔧 Getting Started & Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/).

### Installation & Running Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/chronicle-ai.git
    cd chronicle-ai
    ```

2.  **Set up your API Key:**
    The application loads the Gemini API key from the environment. For local development, you'll need to simulate this. The easiest way is to use a simple HTTP server that can inject the key.

    - **Create a `.env` file** in the root of your project and add your API key:
      ```
      API_KEY=YOUR_GEMINI_API_KEY_HERE
      ```
    - **We recommend using `vite`** as a lightweight development server that handles this automatically.
      
    - **Install Vite:**
      ```bash
      npm install vite
      ```
    - **Run the development server:**
      ```bash
      npx vite
      ```
    This will start a server, and you can open the provided URL (e.g., `http://localhost:5173`) in your browser.

## ☁️ Deployment

This project is a static web application and can be easily deployed to various hosting platforms. Here are instructions for two popular choices: Cloudflare Pages and Google Firebase Hosting.

### Option 1: Deploying to Cloudflare Pages (Recommended)

Cloudflare Pages is an excellent choice as it provides a simple way to manage environment variables for your static site.

1.  **Push to a Git Repository:**
    Push your project code to a new repository on GitHub, GitLab, or Bitbucket.

2.  **Create a Cloudflare Pages Project:**
    - Log in to your [Cloudflare dashboard](https://dash.cloudflare.com/).
    - Go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
    - Select your Git provider and the repository you just created.

3.  **Configure Build Settings:**
    - **Framework preset:** Select `None`.
    - **Build command:** Leave this **blank**. Since this is a vanilla HTML/JS/CSS project, no build step is needed.
    - **Build output directory:** Set this to the project's root directory (`/`).

4.  **Add Environment Variable (Crucial Step):**
    - Go to **Settings** > **Environment variables**.
    - Under **Production**, add a new variable:
      - **Variable name:** `API_KEY`
      - **Value:** Paste your Google Gemini API key here.
    - Click **Save**.

5.  **Save and Deploy:**
    Click the **Save and Deploy** button. Cloudflare will deploy your site, and your `API_KEY` will be securely available to the application.

### Option 2: Deploying to Google Firebase Hosting

Firebase Hosting is another robust option, but handling environment variables for a purely static site is less direct. The recommended approach is to use a Cloud Function as a proxy, but for a simpler setup, you would have to manually place your key.

**⚠️ Security Warning:** The following method will expose your API key in your client-side code. This is not recommended for production applications. For a more secure setup, consider using the Cloudflare method or implementing a backend proxy (e.g., a Firebase Cloud Function).

1.  **Install Firebase CLI:**
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login and Initialize Firebase:**
    ```bash
    firebase login
    firebase init hosting
    ```
    - Select **Use an existing project** or **Create a new project**.
    - Set your public directory to the root directory: **`.`** (just a period).
    - Configure as a single-page app: **No**.
    - Set up automatic builds and deploys with GitHub: **No** (you can set this up later if you wish).

3.  **Manually Add API Key:**
    - Open `services/geminiService.ts`.
    - Find the line:
      ```typescript
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      ```
    - **Temporarily** replace `process.env.API_KEY` with your actual API key string:
      ```typescript
      const ai = new GoogleGenAI({ apiKey: "YOUR_GEMINI_API_KEY_HERE" });
      ```

4.  **Deploy:**
    ```bash
    firebase deploy
    ```

5.  **Revert Changes:**
    **IMPORTANT:** After deploying, immediately undo the change in `geminiService.ts` to avoid accidentally committing your API key to your Git repository.

---

## 📂 Project Structure

```
/
├── components/
│   ├── MarkdownViewer.tsx      # Renders the generated markdown and visuals
│   └── VideoProcessor.tsx      # Handles user input for video and transcript
├── services/
│   └── geminiService.ts        # Logic for interacting with the Gemini API
├── types.ts                    # TypeScript type definitions
├── App.tsx                     # Main application component
├── index.html                  # The main HTML file
├── index.tsx                   # React application entry point
└── README.md                   # This file
```

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements, please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
