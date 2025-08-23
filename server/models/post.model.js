import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    image: {
      type: String, // URL of uploaded image
      default: "",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Users who liked this post
      },
    ],
    likeCount:{
      type:Number,
      default:0
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    }]
  },
  { timestamps: true }
);
postSchema.pre("save", function (next) {
  this.likeCount = this.likes.length;
  next();
});
export const Post= mongoose.model("Post", postSchema);
