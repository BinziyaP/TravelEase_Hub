const axios = require('axios');

const SERVICE_URL = process.env.ITINERARY_SERVICE_URL || 'http://localhost:5055';

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🔌 New Client Connected:', socket.id);

        // Handle user chat messages
        socket.on('chat_message', async (data) => {
            const { message, context } = data;
            console.log(`📩 Message from ${socket.id}: ${message}`);

            try {
                // Forward to Python AI Service
                // If Python service is not running, this will throw
                const response = await axios.post(`${SERVICE_URL}/chat`, {
                    message,
                    context
                }, { timeout: 30000 });

                socket.emit('chat_response', {
                    message: response.data.response,
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                console.error('❌ AI Service Error:', err.message);

                let reply = "I'm having trouble connecting to the AI service.";
                if (err.code === 'ECONNREFUSED') {
                    reply = "The AI Brain is currently offline. Please ensure the Python service is running.";
                }

                socket.emit('chat_response', {
                    message: reply,
                    isError: true,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Handle Alert Subscriptions (Rooms)
        socket.on('join_trip', (tripId) => {
            socket.join(`trip_${tripId}`);
            console.log(`Socket ${socket.id} joined trip_${tripId}`);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Client Disconnected:', socket.id);
        });
    });
};
