# Cohere API Setup Instructions

## 1. Get Your Cohere API Key

1. Visit [https://cohere.ai/](https://cohere.ai/)
2. Sign up for an account or log in
3. Navigate to your dashboard/API section
4. Generate a new API key

## 2. Configure Environment Variables

1. Create a `.env.local` file in your project root:
   ```bash
   touch .env.local
   ```

2. Add your Cohere API key to the file:
   ```env
   NEXT_PUBLIC_COHERE_API_KEY=your_actual_api_key_here
   ```

3. **Important**: Never commit `.env.local` to version control!

## 3. API Configuration

The app now uses:
- **CohereClientV2** - Latest Cohere client
- **command-a-03-2025** - Latest Cohere model
- **Chat API** - Uses the new chat endpoint instead of generate

## 4. Test the Connection

The app will automatically check if your API key is configured when you try to generate a document. If there are any issues, you'll see specific error messages in the toast notifications.

## 5. Usage

1. Upload a template file (.txt, .md, .html, .pdf, .docx)
2. Add a description of what you want to generate
3. Click "Generate Document"
4. The app will use Cohere AI to create content based on your template and description

## Features

- ✅ File validation and upload
- ✅ Real-time Cohere API integration
- ✅ Error handling with user-friendly messages
- ✅ Document preview and export
- ✅ Toast notifications for user feedback

## Troubleshooting

- **"API key is not configured"**: Make sure your `.env.local` file exists and contains a valid API key
- **Network errors**: Check your internet connection
- **File errors**: Ensure your uploaded file is one of the supported formats
- **Generation errors**: Check the console for detailed error messages
