import mongoose, { Document, Schema } from 'mongoose';

export interface ICard extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  listId: mongoose.Types.ObjectId;
  position: number;
  priority?: 1 | 2 | 3;
  dueDate?: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
      minlength: [1, 'Card title must be at least 1 character'],
      maxlength: [200, 'Card title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    listId: {
      type: Schema.Types.ObjectId,
      ref: 'List',
      required: [true, 'List ID is required'],
    },
    position: {
      type: Number,
      default: 0,
    },
    priority: {
      type: Number,
      enum: [1, 2, 3],
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        ret.listId = ret.listId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

CardSchema.index({ listId: 1, position: 1 });

export default mongoose.model<ICard>('Card', CardSchema);

