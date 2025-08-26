import { FilterQuery, isValidObjectId } from 'mongoose';
import StudentModel, { studentDTO, TypeStudent } from '../models/student.model';
import { IReqUser } from '../utils/interface';
import response from '../utils/response';
import { Response } from 'express';

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TypeStudent;
      await studentDTO.validate(payload);
      const result = await StudentModel.create(payload);
      response.success(res, result, 'success to create a student');
    } catch (error) {
      response.error(res, error, 'failed to create a student');
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeStudent> = {};

        if (filter.search) query.$text = { $search: filter.search };
        if (filter.classId) query.classId = filter.classId;

        return query;
      };

      const { limit = 10, page = 1, search } = req.query;

      const query = buildQuery({ search });

      const result = await StudentModel.find(query)
        .populate('classId')
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
        'success find all student'
      );
    } catch (error) {
      response.error(res, error, 'failed to find all student');
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed find student data');

      const result = await StudentModel.findById(id);

      if (!result) return response.notFound(res, 'failed find students data');

      response.success(res, result, 'success find one students data');
    } catch (error) {
      response.error(res, error, 'failed to find students data');
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to update student');

      const result = await StudentModel.findByIdAndUpdate(id, req.body, {
        new: true,
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
