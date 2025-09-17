import { FilterQuery, isValidObjectId } from 'mongoose';
import StudentModel, { studentDTO, TypeStudent } from '../models/student.model';
import { IReqUser } from '../utils/interface';
import response from '../utils/response';
import { Response } from 'express';
import ClassModel from '../models/class.model';
import uploader from '../utils/uploader';
import path from 'path';
import fs from 'fs';

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = {
        ...req.body,
        createdBy: req.user?.id,
      } as TypeStudent;
      await studentDTO.validate(payload);

      const result = await StudentModel.create(payload);
      return response.success(res, result, 'success to create student');
    } catch (error) {
      return response.error(res, error, 'failed to create student');
    }
  },

  async findAll(req: IReqUser, res: Response) {
    try {
      const { limit = 10, page = 1, search, className } = req.query;

      let query: FilterQuery<TypeStudent> = {};

      if (className && isValidObjectId(className)) {
        const kelas = await ClassModel.findById(className).select('className');
        if (!kelas) {
          return response.notFound(res, 'Class not found');
        }
        query.className = className;
      }

      if (search) {
        query.$text = { $search: search as string };
      }

      const result = await StudentModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const count = await StudentModel.countDocuments(query);

      if (className && (!result || result.length === 0)) {
        return response.notFound(res, 'No students found for this class');
      }

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        'success find students'
      );
    } catch (error) {
      response.error(res, error, 'failed to find students');
    }
  },

  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to find student');

      const result = await StudentModel.findById(id);

      if (!result) return response.notFound(res, 'student not found');

      response.success(res, result, 'success find student');
    } catch (error) {
      response.error(res, error, 'failed find teacher data');
    }
  },

  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'Invalid student ID');

      const student = await StudentModel.findById(id);
      if (!student) return response.notFound(res, 'Student not found');

      let newPicture = student.picture;

      if (req.file) {
        // If the new picture filename is different from the old one, replace and delete old
        if (req.file.filename !== student.picture) {
          const oldPicturePath = student.picture
            ? path.join('uploads', student.picture)
            : null;

          if (oldPicturePath && fs.existsSync(oldPicturePath)) {
            fs.unlinkSync(oldPicturePath);
          }
          newPicture = req.file.filename;
        }
        // If the new picture filename is the same as the old one, do nothing (keep old picture)
      }

      const result = await StudentModel.findByIdAndUpdate(
        id,
        { ...req.body, picture: newPicture },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!result) return response.notFound(res, 'Student not found');

      response.success(res, result, 'Student updated successfully');
    } catch (error) {
      response.error(res, error, 'Failed to update student');
    }
  },

  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to remove student');

      const result = await StudentModel.findByIdAndDelete(id, { new: true });

      if (!result) return response.notFound(res, 'Student not found');

      await uploader.remove(result?.picture);

      response.success(res, result, 'success to remove student');
    } catch (error) {
      response.error(res, error, 'failed to delete student');
    }
  },
};
