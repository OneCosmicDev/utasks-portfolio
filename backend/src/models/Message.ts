import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IMessageModel extends Model<IMessage> { }

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
      index: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc: any, ret: Record<string, any>) => {
        ret.id = ret._id.toString();

        if (ret.sender) {
          if (typeof ret.sender === 'object') {
            const id = ret.sender.id || ret.sender._id;
            ret.sender = id ? id.toString() : ret.sender.toString();
          } else {
            ret.sender = ret.sender.toString();
          }
        }

        if (ret.receiver) {
          if (typeof ret.receiver === 'object') {
            const id = ret.receiver.id || ret.receiver._id;
            ret.receiver = id ? id.toString() : ret.receiver.toString();
          } else {
            ret.receiver = ret.receiver.toString();
          }
        }

        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, read: 1 });

export default mongoose.model<IMessage, IMessageModel>('Message', MessageSchema);

