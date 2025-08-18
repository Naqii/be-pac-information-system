import { FilterQuery, isValidObjectId } from 'mongoose';
import LearningModel, {
  learningDTO,
  TypeLearning,
} from '../models/learning.model';
import { IReqUser } from '../utils/interface';
import response from '../utils/response';
import { Response } from 'express';

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TypeLearning;
      await learningDTO.validate(payload);
      const result = await LearningModel.create(payload);
      response.success(res, result, 'success create a learning data');
    } catch (error) {
      response.error(res, error, 'failed to create a learning data');
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeLearning> = {};

        if (filter.search) query.$text = { $search: filter.search };

        return query;
      };

      const { limit = 10, page = 1, search } = req.query;

      const query = buildQuery({ search });

      const result = await LearningModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const count = await LearningModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        'success find all learnings data'
      );
    } catch (error) {
      response.error(res, error, 'failed find all learning data');
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) return response.notFound(res, 'failed find learning data');

        const result = await LearningModel.findById(id);

        response.success(res, result, 'success find one learning data');
    } catch (error) {
        response.error(res, error, 'failed to find learning data');
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) return response.notFound(res, 'failed to update learning data');

        const result = await LearningModel.findByIdAndUpdate(id, req.body, { new: true });

        if (!result) return response.notFound(res, 'data not found');

        response.success(res, result, 'success to update learning data');
    } catch (error) {
        response.error(res, error, ' failed to update learning data');
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) return response.notFound(res, 'failed to remove learning data');

        const result = await LearningModel.findByIdAndDelete(id);

        response.success(res, result, 'success to remove learning data');
    } catch (error) {
        response.error(res, error, 'failed to remove learning data');
    }
  }
};
