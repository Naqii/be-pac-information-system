import pacModel, { pacDTO, TypePAC } from '../models/pac.model';
import { formatSlug } from '../utils/formatSlug';
import { IReqUser } from '../utils/interface';
import { Response } from 'express';
import response from '../utils/response';
import { FilterQuery, isValidObjectId } from 'mongoose';

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TypePAC;

      // prevent duplicate by pacName first
      const existingByName = await pacModel.findOne({
        pacName: payload.pacName,
      });
      if (existingByName) {
        return response.error(
          res,
          null,
          'PAC with the same name already exists'
        );
      }

      // generate a unique slug
      let baseSlug = formatSlug(payload.pacName);
      let slug = baseSlug;
      let counter = 1;
      while (await pacModel.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }
      payload.slug = slug;

      await pacDTO.validate(payload);
      const result = await pacModel.create(payload);
      response.success(res, result, 'success to create a PAC');
    } catch (error) {
      // handle possible duplicate key race condition from DB
      if ((error as any)?.code === 11000) {
        return response.error(
          res,
          error,
          'Duplicate key error: PAC already exists'
        );
      }
      response.error(res, error, 'failed to create a PAC');
    }
  },

  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypePAC> = {};

        if (filter.search) query.$text = { $search: filter.search };

        return query;
      };

      const { limit = 10, page = 1, search } = req.query;

      const query = buildQuery({ search });

      const result = await pacModel
        .find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const count = await pacModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        'success find all pac'
      );
    } catch (error) {
      response.error(res, error, 'failed to find all pac');
    }
  },

  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed find pac data');

      const result = await pacModel.findById(id);

      if (!result) return response.notFound(res, 'failed find pac data');

      response.success(res, result, 'success find one pac data');
    } catch (error) {
      response.error(res, error, 'failed to find pac data');
    }
  },

  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to update pac');

      const result = await pacModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!result) return response.notFound(res, 'data not found');

      response.success(res, result, 'success to update pac');
    } catch (error) {
      response.error(res, error, 'failed to update pac');
    }
  },

  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to remove pac');

      const result = await pacModel.findByIdAndDelete(id, { new: true });

      response.success(res, result, 'success to remove pac');
    } catch (error) {
      response.error(res, error, 'failed to delete pac');
    }
  },

  async findOneBySlug(req: IReqUser, res: Response) {
    try {
      const { slug } = req.params;
      const result = await pacModel.findOne({ slug });

      if (!result) return response.notFound(res, 'PAC not found');
      response.success(res, result, 'success find PAC');
    } catch (error) {
      response.error(res, error, 'failed to find PACs data');
    }
  },
};
