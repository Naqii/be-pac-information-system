import ClassModel, { classDTO, TypeClass } from '../models/class.model';
import { IReqUser } from '../utils/interface';
import { Response } from 'express';
import response from '../utils/response';
import { FilterQuery, isValidObjectId } from 'mongoose';
import { formatSlug } from '../utils/formatSlug';

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TypeClass;

      let baseSlug = formatSlug(payload.className);
      let slug = baseSlug;
      payload.slug = slug;

      let counter = 1;
      while (await ClassModel.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }

      payload.slug = slug;

      await classDTO.validate(payload);
      const result = await ClassModel.create(payload);
      response.success(res, result, 'success to create a class');
    } catch (error) {
      response.error(res, error, 'failed to create a class');
    }
  },

  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeClass> = {};

        if (filter.search) query.$text = { $search: filter.search };

        return query;
      };

      const { limit = 10, page = 1, search } = req.query;

      const query = buildQuery({ search });

      const result = await ClassModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const count = await ClassModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        'success find all class'
      );
    } catch (error) {
      response.error(res, error, 'failed to find all class');
    }
  },

  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed find class data');

      const result = await ClassModel.findById(id);

      if (!result) return response.notFound(res, 'failed find classs data');

      response.success(res, result, 'success find one classs data');
    } catch (error) {
      response.error(res, error, 'failed to find classs data');
    }
  },

  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to update class');

      const result = await ClassModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!result) return response.notFound(res, 'data not found');

      response.success(res, result, 'success to update class');
    } catch (error) {
      response.error(res, error, 'failed to update class');
    }
  },

  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to remove class');

      const result = await ClassModel.findByIdAndDelete(id, { new: true });

      response.success(res, result, 'success to remove class');
    } catch (error) {
      response.error(res, error, 'failed to delete class');
    }
  },

  async findOneBySlug(req: IReqUser, res: Response) {
    try {
      const { slug } = req.params;
      const result = await ClassModel.findOne({ slug });

      if (!result) return response.notFound(res, 'Class not found');
      response.success(res, result, 'success find class');
    } catch (error) {
      response.error(res, error, 'failed to find classs data');
    }
  },
};
