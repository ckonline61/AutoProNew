import { Types } from 'mongoose';
import { CmsPage, ICmsPage, CmsCategory } from '../models/cms-page.model';
import { NotFoundError, ConflictError } from '../errors/app-error';

export interface CreatePageDTO {
  slug: string;
  title: string;
  content: string;
  category?: CmsCategory;
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder?: number;
}

export interface UpdatePageDTO {
  slug?: string;
  title?: string;
  content?: string;
  category?: CmsCategory;
  isPublished?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  sortOrder?: number;
}

export const cmsService = {
  /**
   * Create a new CMS page.
   */
  async createPage(authorId: string, data: CreatePageDTO): Promise<ICmsPage> {
    const slug = data.slug.toLowerCase().trim();
    const existing = await CmsPage.findOne({ slug });
    if (existing) {
      throw new ConflictError(`Page with slug '${slug}' already exists`);
    }

    const page = new CmsPage({
      ...data,
      slug,
      author: new Types.ObjectId(authorId),
      publishedAt: data.isPublished ? new Date() : undefined,
    });

    return await page.save();
  },

  /**
   * Update an existing CMS page.
   */
  async updatePage(pageId: string, data: UpdatePageDTO): Promise<ICmsPage> {
    const page = await CmsPage.findById(pageId);
    if (!page) {
      throw new NotFoundError('Page not found');
    }

    if (data.slug && data.slug.toLowerCase().trim() !== page.slug) {
      const slug = data.slug.toLowerCase().trim();
      const existing = await CmsPage.findOne({ slug });
      if (existing) {
        throw new ConflictError(`Page with slug '${slug}' already exists`);
      }
      page.slug = slug;
    }

    if (data.title !== undefined) page.title = data.title;
    if (data.content !== undefined) page.content = data.content;
    if (data.category !== undefined) page.category = data.category;
    if (data.metaTitle !== undefined) page.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) page.metaDescription = data.metaDescription;
    if (data.sortOrder !== undefined) page.sortOrder = data.sortOrder;

    if (data.isPublished !== undefined) {
      if (data.isPublished && !page.isPublished) {
        page.publishedAt = new Date();
      }
      page.isPublished = data.isPublished;
    }

    return await page.save();
  },

  /**
   * Public: Get a single published page by slug.
   */
  async getPageBySlug(slug: string): Promise<ICmsPage> {
    const page = await CmsPage.findOne({
      slug: slug.toLowerCase().trim(),
      isPublished: true,
    }).populate('author', 'name email');

    if (!page) {
      throw new NotFoundError(`Page '${slug}' not found`);
    }

    return page;
  },

  /**
   * Public: Get all published pages with optional category filter.
   */
  async getAllPages(category?: CmsCategory, page: number = 1, limit: number = 20) {
    const query: Record<string, unknown> = { isPublished: true };
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [pages, total] = await Promise.all([
      CmsPage.find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name')
        .lean(),
      CmsPage.countDocuments(query),
    ]);

    return {
      pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Admin: Get all pages including unpublished drafts.
   */
  async getAllPagesAdmin(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [pages, total] = await Promise.all([
      CmsPage.find()
        .sort({ sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email')
        .lean(),
      CmsPage.countDocuments(),
    ]);

    return {
      pages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Admin: Publish a page.
   */
  async publishPage(pageId: string): Promise<ICmsPage> {
    const page = await CmsPage.findById(pageId);
    if (!page) {
      throw new NotFoundError('Page not found');
    }

    page.isPublished = true;
    page.publishedAt = new Date();
    return await page.save();
  },

  /**
   * Admin: Unpublish a page.
   */
  async unpublishPage(pageId: string): Promise<ICmsPage> {
    const page = await CmsPage.findById(pageId);
    if (!page) {
      throw new NotFoundError('Page not found');
    }

    page.isPublished = false;
    return await page.save();
  },

  /**
   * Admin: Delete a page.
   */
  async deletePage(pageId: string): Promise<ICmsPage> {
    const page = await CmsPage.findByIdAndDelete(pageId);
    if (!page) {
      throw new NotFoundError('Page not found');
    }
    return page;
  },
};
