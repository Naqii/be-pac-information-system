import { FilterQuery, isValidObjectId } from 'mongoose';
import StudentModel, { studentDTO, TypeStudent } from '../models/student.model';
import { IReqUser } from '../utils/interface';
import response from '../utils/response';
import { Response } from 'express';
import ClassModel from '../models/class.model';
import ParentModel from '../models/parent.model';

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = {
        ...req.body,
        createdBy: req.user?.id,
      } as TypeStudent;
      await studentDTO.validate(payload);

      const ortu = await ParentModel.findById(payload.parentName).select(
        'parentName'
      );
      if (!ortu) return response.notFound(res, 'Parent not found');
      payload.parentName = ortu.parentName;

      const kelas = await ClassModel.findById(payload.className).select(
        'className'
      );
      if (!kelas) return response.notFound(res, 'Class not found');
      payload.className = kelas.className;

      const existed = await StudentModel.findOne({
        className: payload.className,
        parentName: payload.parentName,
      });

      const result = await StudentModel.create(payload);
      return response.success(res, result, 'success to create attendance doc');
    } catch (error) {
      return response.error(res, error, 'failed to create attendance doc');
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const { limit = 10, page = 1, className, search } = req.query;

      const allowedClasses = ['PraRemaja', 'Remaja', 'Usman'];

      let query: FilterQuery<TypeStudent> = {};

      if (search) {
        query.$text = { $search: search as string };
      }

      if (className) {
        if (!allowedClasses.includes(className as string)) {
          return response.notFound(res, 'Invalid className');
        }
        query.className = className;
      } else {
        // Kalau className tidak dikirim, defaultnya ambil semua dari allowedClasses
        query.className = { $in: allowedClasses };
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
        'success find all student'
      );
    } catch (error) {
      response.error(res, error, 'failed to find all student');
    }
  },
  // async findByClass(req: IReqUser, res: Response) {
  //   try {
  //     const { className } = req.params;

  //     if (!className) {
  //       return response.notFound(res, 'className is required');
  //     }

  //     const { limit = 10, page = 1 } = req.query;

  //     const result = await StudentModel.find({ className })
  //       .limit(+limit)
  //       .skip((+page - 1) * +limit)
  //       .sort({ createdAt: -1 })
  //       .lean()
  //       .exec();
  //     const count = await StudentModel.countDocuments(result);

  //     if (!result || result.length === 0) {
  //       return response.notFound(res, 'No student data found for this class');
  //     }

  //     response.pagination(
  //       res,
  //       result,
  //       {
  //         current: +page,
  //         total: count,
  //         totalPages: Math.ceil(count / +limit),
  //       },
  //       'success find all student'
  //     );
  //   } catch (error) {
  //     response.error(res, error, 'failed to find students data');
  //   }
  // },
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

      if (payload.parentName && isValidObjectId(payload.parentName)) {
        const ortu = await ParentModel.findById(payload.parentName).select(
          'parentName'
        );
        if (!ortu) return response.notFound(res, 'Parent not found');
        payload.parentName = ortu.parentName;
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
