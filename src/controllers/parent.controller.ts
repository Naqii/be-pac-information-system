import ParentModel, { parentDTO, TypeParent } from '../models/parent.model';
import { IReqUser } from '../utils/interface';
import { Response } from 'express';
import response from '../utils/response';
import { FilterQuery, isValidObjectId } from 'mongoose';

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TypeParent;
      await parentDTO.validate(payload);
      const result = await ParentModel.create(payload);
      response.success(res, result, 'success create a parent');
    } catch (error) {
      response.error(res, error, 'failed to create a parent');
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeParent> = {};

        if (filter.search) query.$text = { $search: filter.search };
        if (filter.poss) query.poss = new RegExp(filter.poss, 'i');

        return query;
      };

      const { limit = 10, page = 1, search, poss } = req.query;

      const query = buildQuery({
        search,
        poss,
      });

      const result = await ParentModel.find(query)
        .limit(+limit) //+ diawal variable menandai bahwa variable ini bertipe number
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const count = await ParentModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        'success find all parents'
      );
    } catch (error) {
      response.error(res, error, 'failed find all parents');
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, 'failed find a parent');
      }

      const result = await ParentModel.findById(id);

      if (!result) {
        return response.notFound(res, 'failed find an parent');
      }

      response.success(res, result, 'success find one an parent');
    } catch (error) {
      response.error(res, error, 'failed to find one an parent');
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, 'failed to update an parent');
      }

      const result = await ParentModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!result) return response.notFound(res, 'parent not found');

      response.success(res, result, 'success to update an parent');
    } catch (error) {
      response.error(res, error, 'failed to update an parent');
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return response.notFound(res, 'failed to remove an parent');
      }

      const result = await ParentModel.findByIdAndDelete(id, { new: true });

      if (!result) return response.notFound(res, 'parent not found');

      response.success(res, result, 'success to delete one parent');
    } catch (error) {
      response.error(res, error, 'failed to delete an parent');
    }
  },
};
