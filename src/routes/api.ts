import express from 'express';
import { ROLES } from '../utils/constant';
import authController from '../controllers/auth.controller';
import authMiddleware from '../middleware/auth.middleware';
import aclMiddleware from '../middleware/acl.middleware';
import mediaMiddleware from '../middleware/media.middleware';
import mediaController from '../controllers/media.controller';
import regionController from '../controllers/region.controller';
import teachersController from '../controllers/teachers.controller';
import learningController from '../controllers/learning.controller';
import violationController from '../controllers/violation.controller';
import classController from '../controllers/class.controller';
import parentController from '../controllers/parent.controller';
import studentController from '../controllers/student.controller';
import attendanceController from '../controllers/attendance.controller';
import {
  resizeMultipleImages,
  resizeSingleImage,
} from '../middleware/resize.middleware';
import pacController from '../controllers/pac.controller';
import pcController from '../controllers/pc.controller';

const router = express.Router();

//Register Schema
router.post(
  '/auth/register',
  authController.register
  /*
  #swagger.tags = ['Auth']
  #swagger.requestBody = {
    required: true,
    schema: {$ref: "#/components/schemas/RegisterRequest"}
  }
*/
);
router.post(
  '/auth/login',
  authController.login
  /*
  #swagger.tags = ['Auth']
  #swagger.requestBody = {
    required: true,
    schema: {$ref: "#/components/schemas/LoginRequest"}
  }     
*/
);
router.get(
  '/auth/me',
  authMiddleware,
  authController.me
  /*
  #swagger.tags = ['Auth']
  #swagger.security = [{
    "bearerAuth": [],
  }]
 */
);
router.post(
  '/auth/activation',
  authController.activation
  /*
  #swagger.tags = ['Auth']
  #swagger.requestBody = {
    required: true,
    schema: {$ref: "#/components/schemas/ActivationRequest"}
  }
 */
);

//Media Uploader Schema
router.post(
  '/media/single-upload',
  [
    authMiddleware,
    aclMiddleware([ROLES.ADMIN, ROLES.KK]),
    mediaMiddleware.single('file'),
  ],
  //catatan: ukuran gambar max 1200px dan kualitas 80
  resizeSingleImage(1200, 80),
  mediaController.singleMedia
  /*
    #swagger.tags = ['Media']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              file: {
                type: "string",
                format: "binary"
              }  
            }
          }
        }
      }
    }
  */
);
router.post(
  '/media/multiple-upload',
  [
    authMiddleware,
    aclMiddleware([ROLES.ADMIN, ROLES.KK]),
    mediaMiddleware.multiple('files'),
  ],
  resizeMultipleImages(1200, 80),
  mediaController.multipleMedia
  /*
    #swagger.tags = ['Media']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              files: {
                type: "array",
                items: {
                  type: "string",
                  format: "binary"
                }
              }  
            }
          }
        }
      }
    }
  */
);
router.delete(
  '/media/remove',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.KK])],
  mediaController.remove
  /*
    #swagger.tags = ['Media']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/RemoveMediaRequest"
      }
    }
   */
);

//Region Schema
router.get(
  '/regions',
  regionController.getAllProvinces
  /*
    #swagger.tags = ['Regions']
  */
);
router.get(
  '/regions/:id/province',
  regionController.getProvince
  /*
    #swagger.tags = ['Regions']
  */
);
router.get(
  '/regions/:id/regency',
  regionController.getRegency
  /*
    #swagger.tags = ['Regions']
  */
);
router.get(
  '/regions/:id/district',
  regionController.getDistrict
  /*
    #swagger.tags = ['Regions']
  */
);
router.get(
  '/regions/:id/village',
  regionController.getVillage
  /*
    #swagger.tags = ['Regions']
  */
);
router.get(
  '/regions-search',
  regionController.findByCity
  /*
    #swagger.tags = ['Regions']
  */
);

//PAC Schema
router.post(
  '/pac',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  pacController.create
  /*
    #swagger.tags = ['PAC']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreatePACRequest"
      }
    }
  */
);
router.get(
  '/pac',
  pacController.findAll
  /*
    #swagger.tags = ['PAC']
    #swagger.parameters['limit] = {
    in: 'query',
    type: 'number',
    default: 10,
    }
    #swagger.parameters['page'] = {
    in: 'query',
    type: 'number',
    default: 1,
    }
  */
);
router.get(
  '/pac/:id',
  pacController.findOne
  /*
    #swagger.tags = ['PAC']
  */
);
router.put(
  '/pac/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  pacController.update
  /*
    #swagger.tags = ['PAC']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreatePACRequest"
      }
    }
  */
);
router.delete(
  '/pac/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  pacController.remove
  /*
    #swagger.tags = ['PAC']
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);
router.get(
  '/pac/:slug/slug',
  pacController.findOneBySlug
  /*
    #swagger.tags = ['PAC']
  */
);

//PC Schema
router.post(
  '/pc',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  pcController.create
  /*
    #swagger.tags = ['PC']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreatePCRequest"
      }
    }
  */
);
router.get(
  '/pc',
  pcController.findAll
  /*
    #swagger.tags = ['PC']
    #swagger.parameters['limit] = {
    in: 'query',
    type: 'number',
    default: 10,
    }
    #swagger.parameters['page'] = {
    in: 'query',
    type: 'number',
    default: 1,
    }
  */
);
router.get(
  '/pc/:id',
  pcController.findOne
  /*
    #swagger.tags = ['PC']
  */
);
router.put(
  '/pc/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  pcController.update
  /*
    #swagger.tags = ['PC']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreatePCRequest"
      }
    }
  */
);
router.delete(
  '/pc/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  pcController.remove
  /*
    #swagger.tags = ['PC']
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);
router.get(
  '/pc/:slug/slug',
  pcController.findOneBySlug
  /*
    #swagger.tags = ['PC']
  */
);
router.put(
  '/pcdata/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  pcController.upsertPAC
  /*
    #swagger.tags = ['PC']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreatePACListRequest"
      }
    }
  */
);
router.delete(
  '/pc/:id/pac',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  pcController.removeItemPAC
  /*
    #swagger.tags = ['PC']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/RemovePACListRequest"
      }
    }
  */
);

//Teachers Schema
router.post(
  '/teachers',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  teachersController.create
  /*
    #swagger.tags = ['Teachers']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateTeachersRequest"
      }
    }
  */
);
router.get(
  '/teachers',
  teachersController.findAll
  /*
    #swagger.tags = ['Teachers']
    #swagger.parameters['limit] = {
    in: 'query',
    type: 'number',
    default: 10,
    }
    #swagger.parameters['page'] = {
    in: 'query',
    type: 'number',
    default: 1,
    }
    #swagger.parameters['bidang'] = {
    in: 'query',
    type: 'string'
    }
    #swagger.parameters['pendidikan'] = {
    in: 'query',
    type: 'string',
    }
  */
);
router.get(
  '/teachers/:id',
  teachersController.findOne
  /*
    #swagger.tags = ['Teachers']
  */
);
router.put(
  '/teachers/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  teachersController.update
  /*
    #swagger.tags = ['Teachers']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateTeachersRequest"
      }
    }
  */
);
router.delete(
  '/teachers/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  teachersController.remove
  /*
    #swagger.tags = ['Teachers']
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);
router.get(
  '/teachers/:slug/slug',
  teachersController.findOneBySlug
  /*
    #swagger.tags = ['Teachers']
  */
);

//Learning Schema
router.post(
  '/learning',
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  learningController.create
  /*
    #swagger.tags = ['Learning']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateLearningRequest"
      }
    }
  */
);
router.get(
  '/learning',
  learningController.findAll
  /*
    #swagger.tags = ['Learning']
    #swagger.parameters['limit] = {
    in: 'query',
    type: 'number',
    default: 10,
    }
    #swagger.parameters['page'] = {
    in: 'query',
    type: 'number',
    default: 1,
    }
  */
);
router.get(
  '/learning/:id',
  learningController.findOne
  /*
    #swagger.tags = ['Learning']
  */
);
router.put(
  '/learning/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  learningController.update
  /*
    #swagger.tags = ['Learning']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateLearningRequest"
      }
    }
  */
);
router.delete(
  '/learning/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  learningController.remove
  /*
    #swagger.tags = ['Learning']
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);

//Violation Schema
router.post(
  '/violation',
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  violationController.create
  /*
    #swagger.tags = ['Violation']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateViolationRequest"
      }
    }
  */
);
router.get(
  '/violation',
  violationController.findAll
  /*
    #swagger.tags = ['Violation']
    #swagger.parameters['limit] = {
    in: 'query',
    type: 'number',
    default: 10,
    }
    #swagger.parameters['page'] = {
    in: 'query',
    type: 'number',
    default: 1,
    }
  */
);
router.get(
  '/violation/:id',
  violationController.findOne
  /*
    #swagger.tags = ['Violation']
  */
);
router.put(
  '/violation/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  violationController.update
  /*
    #swagger.tags = ['Violation']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateViolationRequest"
      }
    }
  */
);
router.delete(
  '/violation/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  violationController.remove
  /*
    #swagger.tags = ['Violation']
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);

//Class Scheme
router.post(
  '/class',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  classController.create
  /*
    #swagger.tags = ['Class']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateClassRequest"
      }
    }
  */
);
router.get(
  '/class',
  classController.findAll
  /*
    #swagger.tags = ['Class']
    #swagger.parameters['limit] = {
    in: 'query',
    type: 'number',
    default: 10,
    }
    #swagger.parameters['page'] = {
    in: 'query',
    type: 'number',
    default: 1,
    }
  */
);
router.get(
  '/class/:id',
  classController.findOne
  /*
    #swagger.tags = ['Class']
  */
);
router.put(
  '/class/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  classController.update
  /*
    #swagger.tags = ['Class']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateClassRequest"
      }
    }
  */
);
router.delete(
  '/class/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  classController.remove
  /*
    #swagger.tags = ['Class']
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);
router.get(
  '/class/:slug/slug',
  classController.findOneBySlug
  /*
    #swagger.tags = ['Class']
  */
);

//Parent Scheme
router.post(
  '/parent',
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  parentController.create
  /*
    #swagger.tags = ['Parent']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateParentRequest"
      }
    }
  */
);
router.get(
  '/parent',
  parentController.findAll
  /*
    #swagger.tags = ['Parent']
    #swagger.parameters['limit] = {
    in: 'query',
    type: 'number',
    default: 10,
    }
    #swagger.parameters['page'] = {
    in: 'query',
    type: 'number',
    default: 1,
    }
  */
);
router.get(
  '/parent/:id',
  parentController.findOne
  /*
    #swagger.tags = ['Parent']
  */
);
router.put(
  '/parent/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  parentController.update
  /*
    #swagger.tags = ['Parent']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateParentRequest"
      }
    }
  */
);
router.delete(
  '/parent/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  parentController.remove
  /*
    #swagger.tags = ['Parent']
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);

//Student Scheme
router.post(
  '/student',
  [authMiddleware, aclMiddleware([ROLES.ADMIN])],
  studentController.create
  /*
    #swagger.tags = ['Student']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateStudentRequest"
      }
    }
  */
);
router.get(
  '/student',
  studentController.findAll
  /*
    #swagger.tags = ['Student']
    #swagger.parameters['limit'] = {
    in: 'query',
    type: 'number',
    default: 10,
    }
    #swagger.parameters['page'] = {
    in: 'query',
    type: 'number',
    default: 1,
    }
  */
);
router.get(
  '/student/:id',
  studentController.findOne
  /*
    #swagger.tags = ['Student']
    */
);
router.put(
  '/student/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  studentController.update
  /*
    #swagger.tags = ['Student']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateStudentRequest"
      }
    }
  */
);
router.delete(
  '/student/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  studentController.remove
  /*
    #swagger.tags = ['Student']
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);

//Attendance Schema
router.post(
  '/attendance',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  attendanceController.create
  /*
    #swagger.tags = ['Attendance']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/CreateAttendanceRequest"
      }
    }
  */
);
router.get(
  '/attendance',
  attendanceController.findAll
  /*
    #swagger.tags = ['Attendance']
    #swagger.parameters['limit] = {
    in: 'query',
    type: 'number',
    default: 10,
    }
    #swagger.parameters['page'] = {
    in: 'query',
    type: 'number',
    default: 1,
    }
  */
);
router.put(
  '/attendance/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  attendanceController.upsertAttendance
  /*
    #swagger.tags = ['Attendance']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/PatchAttendanceRequest"
      }
    }
  */
);
router.get(
  '/attendance/recap',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  attendanceController.recapByClassMonth
  /*
    #swagger.tags = ['Attendance']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.parameters['className'] = {
    in: 'query',
    type: 'string',
    default: '68a6b088dc1aa32d7aab3c57',
    }
    #swagger.parameters['month'] = {
    in: 'query',
    type: 'number',
    default: 01,
    }
    #swagger.parameters['year'] = {
    in: 'query',
    type: 'number',
    default: 2025,
    }
  */
);
router.get(
  '/attendance/export',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  attendanceController.exportExcel
  /*
    #swagger.tags = ['Attendance']
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);
router.delete(
  '/attendance/:id',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  attendanceController.rmFromAttendance
  /*
    #swagger.tags = ['Attendance']
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);
router.delete(
  '/attendance/:id/recap',
  [authMiddleware, aclMiddleware([ROLES.ADMIN, ROLES.MANAGER])],
  attendanceController.removeItem
  /*
    #swagger.tags = ['Attendance']
    #swagger.security = [{
      "bearerAuth": []
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/RemoveAttendanceRequest"
      }
    }
  */
);

export default router;
