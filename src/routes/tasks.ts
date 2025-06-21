import express, { Request, Response } from 'express';
import { prisma } from '../server';
import { protect } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate, createTaskSchema, updateTaskSchema } from '../utils/validation';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get all tasks for user
// @route   GET /api/tasks
// @access  Private
export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { 
    page = '1', 
    limit = '10', 
    status, 
    categoryId, 
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Build where clause
  const where: any = { userId };
  
  if (status) {
    where.status = status;
  }
  
  if (categoryId) {
    where.categoryId = categoryId;
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  // Build order by clause
  const orderBy: any = {};
  orderBy[sortBy as string] = sortOrder;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      },
      orderBy,
      skip,
      take: limitNum
    }),
    prisma.task.count({ where })
  ]);

  res.json({
    success: true,
    data: {
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const task = await prisma.task.findFirst({
    where: {
      id,
      userId
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    }
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  res.json({
    success: true,
    data: { task }
  });
});

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { title, description, dueDate, status, categoryId } = req.body;

  // Verify category belongs to user if provided
  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId
      }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found or does not belong to user'
      });
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status || 'PENDING',
      userId,
      categoryId
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: { task }
  });
});

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const { title, description, dueDate, status, categoryId } = req.body;

  // Check if task exists and belongs to user
  const existingTask = await prisma.task.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!existingTask) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  // Verify category belongs to user if provided
  if (categoryId) {
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        userId
      }
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found or does not belong to user'
      });
    }
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(status && { status }),
      ...(categoryId !== undefined && { categoryId })
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          color: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: { task }
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;

  const task = await prisma.task.findFirst({
    where: {
      id,
      userId
    }
  });

  if (!task) {
    return res.status(404).json({
      success: false,
      message: 'Task not found'
    });
  }

  await prisma.task.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
});

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
export const getTaskStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const [
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks
  ] = await Promise.all([
    prisma.task.count({ where: { userId } }),
    prisma.task.count({ where: { userId, status: 'PENDING' } }),
    prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
    prisma.task.count({ 
      where: { 
        userId, 
        dueDate: { lt: new Date() },
        status: { notIn: ['COMPLETED', 'CANCELLED'] }
      } 
    })
  ]);

  res.json({
    success: true,
    data: {
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks
    }
  });
});

// Routes
router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.post('/', validate(createTaskSchema), createTask);
router.get('/:id', getTask);
router.put('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;