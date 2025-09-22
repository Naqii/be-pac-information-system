import { FilterQuery, isValidObjectId } from 'mongoose';
import StudentModel, { studentDTO, TypeStudent } from '../models/student.model';
import { IReqUser } from '../utils/interface';
import response from '../utils/response';
import { Response } from 'express';
import ClassModel from '../models/class.model';
import uploader from '../utils/uploader';

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

      const result = await StudentModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

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
