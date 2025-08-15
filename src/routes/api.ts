import express from 'express';
import authController from '../controllers/auth.controller';
import authMiddleware from '../middleware/auth.middleware';
import aclMiddleware from '../middleware/acl.middleware';
import mediaMiddleware from '../middleware/media.middleware';
import { ROLES } from '../utils/constant';
import mediaController from '../controllers/media.controller';

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
  mediaController.singleMedia
  /*
    #swagger.tags = ['Media']
    #swagger.security = [{
      "bearerAuth": {}
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
  mediaController.multipleMedia
  /*
    #swagger.tags = ['Media']
    #swagger.security = [{
      "bearerAuth": {}
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
      "bearerAuth": {}
    }]
    #swagger.requestBody = {
      required: true,
      schema: {
        $ref: "#/components/schemas/RemoveMediaRequest"
      }
    }
   */
);

export default router;
