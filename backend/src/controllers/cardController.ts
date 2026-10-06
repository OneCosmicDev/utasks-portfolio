import { Request, Response } from 'express';
import { Card, List } from '../models';
import mongoose from 'mongoose';

const createResponse = <T>(success: boolean, data?: T, message?: string, errors?: Array<{ message: string }>) => ({
  success,
  ...(data !== undefined && { data }),
  ...(message && { message }),
  ...(errors && { errors }),
});

export const createCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, listId, position, priority, dueDate, isCompleted } = req.body;
    if (!title || !listId) {
      res.status(400).json(createResponse(false, undefined, 'Title and listId are required'));
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(listId)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid list ID format'));
      return;
    }

    const list = await List.findById(listId);
    if (!list) {
      res.status(404).json(createResponse(false, undefined, 'List not found'));
      return;
    }

    let cardPosition = position;
    if (cardPosition === undefined) {
      const lastCard = await Card.findOne({ listId }).sort({ position: -1 });
      cardPosition = lastCard ? lastCard.position + 1 : 0;
    }

    const cardData: any = {
      title,
      listId,
      position: cardPosition,
    };

    if (description !== undefined) cardData.description = description;
    if (priority !== undefined) cardData.priority = priority;
    if (dueDate !== undefined) cardData.dueDate = dueDate;
    if (isCompleted !== undefined) cardData.isCompleted = isCompleted;

    const card = await Card.create(cardData);

    res.status(201).json(createResponse(true, card.toJSON()));
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({ message: err.message }));
      res.status(400).json(createResponse(false, undefined, 'Validation failed', errors));
      return;
    }
    console.error('Create card error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const getCardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid card ID format'));
      return;
    }

    const card = await Card.findById(id);

    if (!card) {
      res.status(404).json(createResponse(false, undefined, 'Card not found'));
      return;
    }

    res.json(createResponse(true, card.toJSON()));
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const updateCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, listId, position, priority, dueDate, isCompleted } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid card ID format'));
      return;
    }

    if (listId !== undefined && !mongoose.Types.ObjectId.isValid(listId)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid list ID format'));
      return;
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (listId !== undefined) updateData.listId = listId;
    if (position !== undefined) updateData.position = position;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

    const card = await Card.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!card) {
      res.status(404).json(createResponse(false, undefined, 'Card not found'));
      return;
    }

    res.json(createResponse(true, card.toJSON()));
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => ({ message: err.message }));
      res.status(400).json(createResponse(false, undefined, 'Validation failed', errors));
      return;
    }
    console.error('Update card error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const deleteCard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid card ID format'));
      return;
    }

    const card = await Card.findByIdAndDelete(id);

    if (!card) {
      res.status(404).json(createResponse(false, undefined, 'Card not found'));
      return;
    }

    res.json(createResponse(true, undefined, 'Card deleted successfully'));
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

export const getCardsByListId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { listId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      res.status(400).json(createResponse(false, undefined, 'Invalid list ID format'));
      return;
    }

    const cards = await Card.find({ listId }).sort({ position: 1 });

    res.json(createResponse(true, cards.map(card => card.toJSON())));
  } catch (error) {
    console.error('Get cards by list error:', error);
    res.status(500).json(createResponse(false, undefined, 'Server error'));
  }
};

