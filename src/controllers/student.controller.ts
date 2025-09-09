import { FilterQuery, isValidObjectId } from 'mongoose';
import StudentModel, { studentDTO, TypeStudent } from '../models/student.model';
import { IReqUser } from '../utils/interface';
import response from '../utils/response';
import { Response } from 'express';
import ClassModel from '../models/class.model';

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
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeStudent> = {};

        if (filter.search) query.$text = { $search: filter.search };
        if (filter.className)
          query.className = new RegExp(filter.className, 'i');

        return query;
      };

      const { limit = 10, page = 1, search } = req.query;

      const query = buildQuery({
        search,
      });

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
        'success find all students'
      );
    } catch (error) {
      response.error(res, error, 'failed find all students');
    }
  },
  async findByclassName(req: IReqUser, res: Response) {
    try {
      const { className } = req.params;

      if (!isValidObjectId(className)) {
        return response.notFound(res, 'Invalid className id');
      }

      const kelas = await ClassModel.findById(className).select('className');
      if (!kelas) {
        return response.notFound(res, 'Class not found');
      }

      const students = await StudentModel.find({ className: className });

      if (!students || students.length === 0) {
        return response.notFound(res, 'No students found for this class');
      }

      const { limit = 10, page = 1, search } = req.query;

      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeStudent> = { className };
        if (filter.search) query.$text = { $search: filter.search };
        return query;
      };

      const query = buildQuery({ search });

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
        'success find students by class name'
      );
    } catch (error) {
      response.error(res, error, 'failed to find students by class name');
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to update student');

      const payload = {
        ...req.body,
        updateBy: req.user?.id,
      } as Partial<TypeStudent>;

      if (payload.className && isValidObjectId(payload.className)) {
        const kelas = await ClassModel.findById(payload.className).select(
          'className'
        );
        if (!kelas) return response.notFound(res, 'Class not found');
        payload.className = kelas.className;
      }

      await studentDTO.validate(payload, { abortEarly: false });

      const result = await StudentModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
      });

      if (!result) return response.notFound(res, 'data not found');

      response.success(res, result, 'success to update student');
    } catch (error) {
      response.error(res, error, 'failed to update student');
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to remove student');

      const result = await StudentModel.findByIdAndDelete(id, { new: true });

      response.success(res, result, 'success to remove student');
    } catch (error) {
      response.error(res, error, 'failed to delete student');
    }
  },
};
