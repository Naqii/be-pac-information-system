import { FilterQuery, isValidObjectId } from 'mongoose';
import pcModel, {
  pcDTO,
  pcItemDTO,
  TypeItemPAC,
  TypePC,
} from '../models/pc.model';
import { formatSlug } from '../utils/formatSlug';
import { IReqUser } from '../utils/interface';
import response from '../utils/response';
import { Response } from 'express';

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TypePC;

      // prevent duplicate by pcName first
      const existingByName = await pcModel.findOne({
        pcName: payload.pcName,
      });
      if (existingByName) {
        return response.error(
          res,
          null,
          'PC with the same name already exists'
        );
      }

      // generate a unique slug
      let baseSlug = formatSlug(payload.pcName);
      let slug = baseSlug;
      let counter = 1;
      while (await pcModel.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }
      payload.slug = slug;

      await pcDTO.validate(payload);
      const result = await pcModel.create(payload);
      response.success(res, result, 'success to create a PC');
    } catch (error) {
      // handle possible duplicate key race condition from DB
      if ((error as any)?.code === 11000) {
        return response.error(
          res,
          error,
          'Duplicate key error: PC already exists'
        );
      }
      response.error(res, error, 'failed to create a PC');
    }
  },

  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypePC> = {};

        if (filter.search) query.$text = { $search: filter.search };

        return query;
      };

      const { limit = 10, page = 1, search } = req.query;

      const query = buildQuery({ search });

      const result = await pcModel
        .find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const count = await pcModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        'success find all PC'
      );
    } catch (error) {
      response.error(res, error, 'failed to find all PC');
    }
  },

  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed find PC data');

      const result = await pcModel.findById(id);

      if (!result) return response.notFound(res, 'failed find PC data');

      response.success(res, result, 'success find one PC data');
    } catch (error) {
      response.error(res, error, 'failed to find PC data');
    }
  },

  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to update PC');

      const result = await pcModel.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!result) return response.notFound(res, 'data not found');

      response.success(res, result, 'success to update PC');
    } catch (error) {
      response.error(res, error, 'failed to update PC');
    }
  },

  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to remove PC');

      const result = await pcModel.findByIdAndDelete(id, { new: true });

      response.success(res, result, 'success to remove PC');
    } catch (error) {
      response.error(res, error, 'failed to delete PC');
    }
  },

  async findOneBySlug(req: IReqUser, res: Response) {
    try {
      const { slug } = req.params;
      const result = await pcModel.findOne({ slug });

      if (!result) return response.notFound(res, 'PC not found');
      response.success(res, result, 'success find PC');
    } catch (error) {
      response.error(res, error, 'failed to find PC data');
    }
  },

  async upsertPAC(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const newDataPAC = req.body as TypeItemPAC;
      await pcItemDTO.validate(newDataPAC);

      let updated =
        (await pcModel.findOneAndUpdate(
          { _id: id, 'pacList.pacId': newDataPAC.pacId },
          {
            new: true,
          }
        )) ||
        (await pcModel.findByIdAndUpdate(
          id,
          { $push: { pacList: newDataPAC } },
          {
            new: true,
          }
        ));

      if (!updated) return response.notFound(res, 'PC doc not found');
      return response.success(res, updated, 'upsert PAC item');
    } catch (error) {
      return response.error(res, error, 'failed upsert PAC item');
    }
  },

  async removeItemPAC(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const { pacId } = req.body as any;
      if (!pacId) return response.notFound(res, 'pacId is required');

      const result = await pcModel.findByIdAndUpdate(
        id,
        { $pull: { pacList: { pacId: pacId } } },
        { new: true }
      );

      if (!result) return response.notFound(res, 'pac doc not found');
      return response.success(res, result, 'remove pac item');
    } catch (error) {
      return response.error(res, error, 'failed remove item');
    }
  },
};
