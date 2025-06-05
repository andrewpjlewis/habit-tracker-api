const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Habit Tracker API',
    description: 'API for user authentication and habit tracking'
  },
  host: 'habit-tracker-api-eqos.onrender.com',
  schemes: ['http'],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication routes'
    },
    {
      name: 'Habits',
      description: 'Habit management'
    },
    {
      name: 'Logs',
      description: 'Habit logging'
    }
  ]
};

// Output file and files containing routes
const outputFile = './swagger.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);