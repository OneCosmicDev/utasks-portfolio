import mongoose, { Document, Schema } from 'mongoose';

export interface IBoard extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Board name is required'],
      trim: true,
      minlength: [3, 'Board name must be at least 3 characters'],
      maxlength: [100, 'Board name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        ret.title = ret.name;
        ret.userId = ret.userId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

BoardSchema.pre('findOneAndDelete', async function () {
  const board = await this.model.findOne(this.getFilter());
  if (board) {
    const List = mongoose.model('List');
    const lists = await List.find({ boardId: board._id });
    
    const Card = mongoose.model('Card');
    for (const list of lists) {
      await Card.deleteMany({ listId: list._id });
    }
    
    await List.deleteMany({ boardId: board._id });
  }
});

export default mongoose.model<IBoard>('Board', BoardSchema);
