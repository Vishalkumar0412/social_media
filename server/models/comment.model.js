import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 300,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    comments: [   
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    post:{
     type:mongoose.Schema.Types.ObjectId,
     ref:"Post",
     required:true
    }
  },
  { timestamps: true }
);

// Keep likeCount in sync automatically
commentSchema.pre("save", function (next) {
  this.likeCount = this.likes.length;
  next();
});

export const Comment = mongoose.model("Comment", commentSchema);
