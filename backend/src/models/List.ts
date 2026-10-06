import mongoose, { Document, Schema } from 'mongoose';

export interface IList extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  boardId: mongoose.Types.ObjectId;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const ListSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'List name is required'],
      trim: true,
      minlength: [1, 'List name must be at least 1 character'],
      maxlength: [100, 'List name cannot exceed 100 characters'],
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Board ID is required'],
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        ret.boardId = ret.boardId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

ListSchema.index({ boardId: 1, position: 1 });

ListSchema.pre('findOneAndDelete', async function () {
  const list = await this.model.findOne(this.getFilter());
  if (list) {
    const Card = mongoose.model('Card');
    await Card.deleteMany({ listId: list._id });
  }
});

export default mongoose.model<IList>('List', ListSchema);

