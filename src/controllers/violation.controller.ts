import { FilterQuery, isValidObjectId } from 'mongoose';
import ViolationModel, {
  TypeViolation,
  violationDTO,
} from '../models/violation.model';
import { IReqUser } from '../utils/interface';
import response from '../utils/response';
import { Response } from 'express';

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TypeViolation;
      await violationDTO.validate(payload);
      const result = await ViolationModel.create(payload);
      response.success(res, result, 'success to create a violation data');
    } catch (error) {
      response.error(res, error, 'failed to create a violation data');
    }
  },

  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeViolation> = {};

        if (filter.search) query.$text = { $search: filter.search };

        return query;
      };

      const { limit = 10, page = 1, search } = req.query;

      const query = buildQuery({ search });

      const result = await ViolationModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();
      const count = await ViolationModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        'success find all violation data'
      );
    } catch (error) {
      response.error(res, error, 'failed to find all violation data');
    }
  },

  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to find one violation data');

      const result = await ViolationModel.findById(id);

      response.success(res, result, 'success to find one violation data');
    } catch (error) {
      response.error(res, error, 'failed to find one violation data');
    }
  },

  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to update violation data');

      const result = await ViolationModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!result) return response.notFound(res, 'data not found');

      response.success(res, result, 'success to update violation data');
    } catch (error) {
      response.error(res, error, 'failed to update violatio data');
    }
  },

  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to remove violation data');

      const result = await ViolationModel.findByIdAndDelete(id);

      response.success(res, result, 'success to remove violation data');
    } catch (error) {
      response.error(res, error, 'failed to remove violation data');
    }
  },
};
