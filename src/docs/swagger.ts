import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: 'v0.0.1',
    title: 'Dokumentasi API PAC Information System',
    description: 'Dokumentasi API PAC Kramas Infromation System',
  },

  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Local Server',
    },
    {
      url: 'https://be-pac-information-system.vercel.app/api',
      description: 'Deploy Server',
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
    schemas: {
      LoginRequest: {
        identifier: 'member2025@yopmail.com',
        password: 'Member2025',
      },

      RegisterRequest: {
        fullName: 'member2025',
        username: 'member2025',
        email: 'member2025@yopmail.com',
        password: 'Member2025!',
        confirmPassword: 'Member2025!',
      },

      ActivationRequest: {
        code: 'abcrandom',
      },

      RemoveMediaRequest: {
        fileUrl:
          'http://res.cloudinary.com/dzfxaqjrp/image/upload/v1755250296/example.png',
      },

      CreateTeachersRequest: {
        name: 'sunan baihaqi',
        noTelp: '080123456789',
        bidang: 'Tilawati 1-2',
        pendidikan: 'S1 - Teknik Informatika',
        startDate: '2024-12-12 00:00:00',
        slug: 'sunan-baihaqi',
      },

      CreateLearningRequest: {
        name: 'Tilawati 2',
        teacher: '689feb50a2aa01a0f645a3b1',
        description: 'Tilawati 2 full',
      },

      CreateViolationRequest: {
        name: 'Keterlambatan',
        description: 'Keterlambatan mengikuti pengajian rutin',
        judgeBy: '689feb50a2aa01a0f645a3b1',
        point: '10',
      },
    },
  },
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['../routes/api.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
