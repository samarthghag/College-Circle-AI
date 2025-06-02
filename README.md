# College Circle - AI-Powered Study Assistant

College Circle is an intelligent study assistant that helps students learn more effectively by generating study materials from their course content and queries. It uses Google's Gemini AI to create personalized study aids.

## Features

### 1. Smart Notes Generation
- Convert course content into well-structured study notes
- Supports Markdown formatting for better readability
- Includes relevant citations and sources

### 2. Interactive Flashcards
- Generate flashcards from course material
- Each flashcard has a question and detailed answer
- Perfect for quick revision and self-testing

### 3. Quiz Generation
- Create multiple-choice questions from course content
- Includes explanations for correct answers
- Helps test understanding of key concepts

### 4. Resource Recommendations
- Get curated external learning resources
- Includes various types: videos, articles, research papers
- All resources are relevant to the study topic

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google AI API key (Gemini)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/college-circle.git
cd college-circle
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## How to Use

1. **Course Plan Input**
   - Paste your course material or syllabus
   - The system will use this as context for generating study materials

2. **Query Input**
   - Enter specific topics or questions
   - The AI will generate relevant study materials

3. **Generated Content**
   - View notes, flashcards, and quizzes in separate tabs
   - Access recommended external resources
   - All content is interactive and can be used for study

## Technical Stack

- React with TypeScript
- Vite for build tooling
- Google Gemini AI API
- Tailwind CSS for styling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for powering the intelligent features
- React and Vite communities for the excellent development tools
