import { FilterQuery, isValidObjectId } from 'mongoose';
import TeacherModel, {
  teacherDTO,
  TypeTeacher,
} from '../models/teachers.model';
import { IReqUser } from '../utils/interface';
import response from '../utils/response';
import { Response } from 'express';
import uploader from '../utils/uploader';
import { formatSlug } from '../utils/formatSlug';

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TypeTeacher;

      let baseSlug = formatSlug(payload.name);
      let slug = baseSlug;
      payload.slug = slug;

      let counter = 1;
      while (await TeacherModel.findOne({ slug })) {
        slug = `${baseSlug}-${counter++}`;
      }

      payload.slug = slug;

      await teacherDTO.validate(payload);
      const result = await TeacherModel.create(payload);
      response.success(res, result, 'success create a teacher data');
    } catch (error) {
      response.error(res, error, 'failed to create a teacher data');
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const buildQuery = (filter: any) => {
        let query: FilterQuery<TypeTeacher> = {};

        if (filter.search) query.$text = { $search: filter.search };
        if (filter.bidang) query.bidang = new RegExp(filter.bidang, 'i');
        if (filter.pendidikan)
          query.pendidikan = new RegExp(filter.pendidikan, 'i');

        return query;
      };

      const { limit = 10, page = 1, search, bidang, pendidikan } = req.query;

      const query = buildQuery({
        search,
        bidang,
        pendidikan,
      });

      const result = await TeacherModel.find(query)
        .limit(+limit)
        .skip((+page - 1) * +limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      const count = await TeacherModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          current: +page,
          total: count,
          totalPages: Math.ceil(count / +limit),
        },
        'success find all teachers data'
      );
    } catch (error) {
      response.error(res, error, 'failed find all teachers data');
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed find teachers data');

      const result = await TeacherModel.findById(id);

      if (!result) return response.notFound(res, 'failed find teachers data');

      response.success(res, result, 'success find one teachers data');
    } catch (error) {
      response.error(res, error, 'failed to find teachers data');
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to update teachers data');

      const result = await TeacherModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!result) return response.notFound(res, 'data not found');

      response.success(res, result, 'success to update teachers data');
    } catch (error) {
      response.error(res, error, 'failed to update teachers data');
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id))
        return response.notFound(res, 'failed to remove teacher data');

      const result = await TeacherModel.findByIdAndDelete(id, { new: true });

      if (result?.picture) {
        await uploader.remove(result.picture);
      }

      response.success(res, result, 'success to remove teachers data');
    } catch (error) {
      response.error(res, error, 'failed to delete teachers data');
    }
  },
  async findOneBySlug(req: IReqUser, res: Response) {
    try {
      const { slug } = req.params;
      const result = await TeacherModel.findOne({ slug });

      if (!result) return response.notFound(res, 'Teacher not found');
      response.success(res, result, 'success find teacher');
    } catch (error) {
      response.error(res, error, 'failed to find teachers data');
    }
  },
};
