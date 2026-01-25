import mongoose, { Schema, Document } from "mongoose";

export type ChatRole = "user" | "assistant";

export interface ChatItem {
  role: ChatRole;
  content: string;
  createdAt: Date;
}

export interface Conversation {
  _id: mongoose.Types.ObjectId;
  title: string;
  messages: ChatItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  conversations: Conversation[];
}

const ChatSchema = new Schema<ChatItem>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ConversationSchema = new Schema<Conversation>(
  {
    title: { type: String, required: true, default: "New chat" },
    messages: { type: [ChatSchema], default: [] }
  },
  { timestamps: true }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    conversations: { type: [ConversationSchema], default: [] }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
