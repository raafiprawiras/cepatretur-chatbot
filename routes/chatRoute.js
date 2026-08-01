import express from 'express';
import { validateChatPayload } from '../utils/validation.js';
import { generateChatResponse } from '../services/geminiService.js';

const router = express.Router();

router.post('/chat', async (req, res, next) => {
  try {
    // 1. Validate incoming payload
    const validation = validateChatPayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        error: true,
        message: validation.message
      });
    }

    const { conversation, context } = validation.data;

    // 2. Generate response using Gemini Service
    const aiResponse = await generateChatResponse(conversation, context);

    if (aiResponse.error) {
      return res.status(aiResponse.statusCode || 500).json({
        error: true,
        message: aiResponse.message
      });
    }

    // 3. Return success response format
    return res.status(200).json({
      result: aiResponse.result,
      model: aiResponse.model
    });
  } catch (error) {
    next(error);
  }
});

export default router;
