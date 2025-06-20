// Point API pour recevoir les questions
const express = require('express');
const router = express.Router();
const aiService = require('../services/ai');

// Route pour chat simple
router.post('/message', async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;
    
    const messages = [
      ...conversation,
      { role: 'user', content: message }
    ];

    const response = await aiService.generateResponse(messages);
    
    res.json({
      success: true,
      response: response,
      model: 'llama-4'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route pour chat avec images (multimodal)
router.post('/multimodal', async (req, res) => {
  try {
    const { message, imageUrl } = req.body;
    
    const response = await aiService.generateMultimodalResponse(message, imageUrl);
    
    res.json({
      success: true,
      response: response,
      model: 'llama-4-multimodal'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route pour streaming
router.post('/stream', async (req, res) => {
  try {
    const { message, conversation = [] } = req.body;
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const messages = [
      ...conversation,
      { role: 'user', content: message }
    ];

    await aiService.generateStreamingResponse(
      messages,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    );

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

module.exports = router;