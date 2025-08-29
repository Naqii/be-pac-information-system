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
        teacherName: 'sunan baihaqi',
        noTelp: '080123456789',
        gender: 'male',
        bidang: 'Tilawati 1-2',
        pendidikan: 'S1 - Teknik Informatika',
        startDate: '2024-12-12',
      },

      CreateLearningRequest: {
        learningName: 'Tilawati 2',
        teacherId: '689feb50a2aa01a0f645a3b1',
        description: 'Tilawati 2 full',
      },

      CreateViolationRequest: {
        violationName: 'Keterlambatan',
        description: 'Keterlambatan mengikuti pengajian rutin',
        judgeBy: '689feb50a2aa01a0f645a3b1',
        point: '10',
      },

      CreateClassRequest: {
        className: 'pegon bacaan',
        classTeacher: '689feb50a2aa01a0f645a3b1',
        learning: '68a298226bb188e5dd124b80',
      },

      CreateParentRequest: {
        parentName: 'Sunan Baihaqi',
        noTlp: '080123456789',
        gender: 'father',
        poss: 'Rukyah',
        location: {
          region: 3374070003,
          address: 'Jl Mulawarmman III',
        },
      },

      CreateStudentRequest: {
        studentName: 'Sunan Bukhori',
        picture: '',
        noTlp: '080123456789',
        gender: 'male',
        parentName: '68a4800ca398cedf12d93f62',
        className: '68a44b81a3997dce4bcd467d',
        startDate: '2024-12-12',
        location: {
          region: 3374070003,
          address: 'Jl Mulawarmman Selatan',
        },
      },

      CreateAttendanceRequest: {
        fullName: '68a5362e025235682acf72a8',
        className: '68a44b81a3997dce4bcd467d',
        attendance: {
          date: '2024-12-12',
          status: 'hadir',
          description: 'Pengajian Umum',
        },
      },

      PatchAttendanceRequest: {
        date: '2025-01-11',
        status: 'hadir',
        description: 'Pengajian Umum',
      },

      RemoveAttendanceRequest: {
        date: '2025-01-11',
      },
    },
  },
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['../routes/api.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
