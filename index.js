import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API
});

// Extract details from the user's input text
app.post('/extract-details', async (req, res) => {
  const { text } = req.body;

  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant that extracts customer details such as name, phone number, email, expected destination, expected date, budget, and expected return date from the text. If the exact expected date is not mentioned but the duration of the trip is provided, calculate the expected return date based on the provided duration and the departure date.'
      },
      {
        role: 'user',
        content: `Please analyze well and extract all the customer details (name, phone number, email, expected destination, expected date, budget, and expected return date) from the following text. Return the data as a JSON object with the following keys: customerName for name, pNumber for phone number, email for email, hopeToGo for expected destination, date for expected date, budget for budget, and return for expected return date. If only the number of days for the trip is given, calculate the expected return date: \n\n${text}`
      }
    ];

    const completion = await openai.chat.completions.create({
      messages,
      model: 'gpt-4o',
    });


    const extractedDetails = JSON.parse(completion.choices[0].message.content);

    res.json({ extractedDetails });
  } catch (error) {
    console.error('Error extracting details:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to extract details' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
