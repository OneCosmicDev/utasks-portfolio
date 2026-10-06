import { Request, Response } from 'express';
import { List, Board } from '../models';
import mongoose from 'mongoose';

const createResponse = <T>(success: boolean, data?: T, message?: string, errors?: Array<{ message: string }>) => ({
  success,
  ...(data !== undefined && { data }),
  ...(message && { message }),
  ...(errors && { errors }),
});

export const createList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, boardId, position } = req.body;
    if (!name || !boardId) {
      res.status(400).json(createResponse(false, undefined, 'Name and boardId are required'));
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid board ID format'));
      return;
    }

    const board = await Board.findById(boardId);
    if (!board) {
      res.status(404).json(createResponse(false, undefined, 'Board not found'));
      return;
    }

    let listPosition = position;
    if (listPosition === undefined) {
      const lastList = await List.findOne({ boardId }).sort({ position: -1 });
      listPosition = lastList ? lastList.position + 1 : 0;
    }

    const list = await List.create({ name, boardId, position: listPosition });

    res.status(201).json(createResponse(true, list.toJSON()));
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({ message: err.message }));
      res.status(400).json(createResponse(false, undefined, 'Validation failed', errors));
      return;
    }
    console.error('Create list error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const getListById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid list ID format'));
      return;
    }

    const list = await List.findById(id);

    if (!list) {
      res.status(404).json(createResponse(false, undefined, 'List not found'));
      return;
    }

    res.json(createResponse(true, list.toJSON()));
  } catch (error) {
    console.error('Get list error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const updateList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, boardId, position } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid list ID format'));
      return;
    }

    const updateData: { name?: string; boardId?: string; position?: number } = {};
    if (name !== undefined) updateData.name = name;
    if (boardId !== undefined) updateData.boardId = boardId;
    if (position !== undefined) updateData.position = position;

    const list = await List.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!list) {
      res.status(404).json(createResponse(false, undefined, 'List not found'));
      return;
    }

    res.json(createResponse(true, list.toJSON()));
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({ message: err.message }));
      res.status(400).json(createResponse(false, undefined, 'Validation failed', errors));
      return;
    }
    console.error('Update list error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const deleteList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid list ID format'));
      return;
    }

    const list = await List.findOneAndDelete({ _id: id });

    if (!list) {
      res.status(404).json(createResponse(false, undefined, 'List not found'));
      return;
    }

    res.json(createResponse(true, undefined, 'List deleted successfully'));
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const getListsByBoardId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { boardId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid board ID format'));
      return;
    }

    const lists = await List.find({ boardId }).sort({ position: 1 });

    res.json(createResponse(true, lists.map(list => list.toJSON())));
  } catch (error) {
    console.error('Get lists by board error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

