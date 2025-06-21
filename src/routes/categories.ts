import express, { Request, Response } from 'express';
import { prisma } from '../server';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, createCategorySchema, updateCategorySchema } from '../utils/validation';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get all categories for user
// @route   GET /api/categories
// @access  Private
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const categories = await prisma.category.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          tasks: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json({
    success: true,
    data: { categories }
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const category = await prisma.category.findFirst({
    where: {
      id,
      userId
    },
    include: {
      _count: {
        select: {
          tasks: true
        }
      },
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.json({
    success: true,
    data: { category }
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name, color } = req.body;

  // Check if category name already exists for user
  const existingCategory = await prisma.category.findFirst({
    where: {
      name,
      userId
    }
  });

  if (existingCategory) {
    return res.status(400).json({
      success: false,
      message: 'Category with this name already exists'
    });
  }

  const category = await prisma.category.create({
    data: {
      name,
      color: color || '#3B82F6',
      userId
    },
    include: {
      _count: {
        select: {
          tasks: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category }
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { name, color } = req.body;

  // Check if category exists and belongs to user
  const existingCategory = await prisma.category.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingCategory) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check if new name conflicts with existing category
  if (name && name !== existingCategory.name) {
    const nameConflict = await prisma.category.findFirst({
      where: {
        name,
        userId,
        id: { not: id }
      }
    });

    if (nameConflict) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(color && { color })
    },
    include: {
      _count: {
        select: {
          tasks: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: { category }
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const category = await prisma.category.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check if category has tasks
  const taskCount = await prisma.task.count({
    where: { categoryId: id }
  });

  if (taskCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete category. It has ${taskCount} associated tasks. Please move or delete the tasks first.`
    });
  }

  await prisma.category.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

// Routes
router.get('/', getCategories);
router.post('/', validate(createCategorySchema), createCategory);
router.get('/:id', getCategory);
router.put('/:id', validate(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

export default router;