const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  const genAI = new GoogleGenerativeAI('AIzaSyBjXWCw1dZYkO_haBnOIP7qWAWjSq90ToU');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  try {
    const result = await model.generateContent('Hello');
    console.log(result.response.text());
  } catch (error) {
    console.error(error);
  }
}

run();
