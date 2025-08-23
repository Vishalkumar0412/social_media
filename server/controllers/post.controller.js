import { Post } from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";
import { uploadMedia } from "../utills/cloudinary.js";

// import Post from "../models/post.model.js"; 

// Create Post Controller
// import upload from "./upload.js"; // your multer config
// import { uploadMedia } from "./cloudinary.js";
// import Post from "../models/Post.js"; // assuming you have a Post model

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!req.file && !content) {
      return res.status(400).json({
        message: "Please provide content or image",
        success: false,
      });
    }

    let imageUrl = null;

    if (req.file) {
      // Upload the file to Cloudinary
      const uploadResponse = await uploadMedia(req.file.path);
      imageUrl = uploadResponse.secure_url; // get the Cloudinary URL
    }

    const post = await Post.create({
      user: req.user._id,
      image: imageUrl,
      content,
    });

    return res.status(201).json({
      message: "Post created successfully",
      success: true,
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({
      message: "Failed to create post",
      success: false,
    });
  }
};


export const deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "post not found",
        success: false,
      });
    }
    if (post.user.toString() != userId.toString()) {
      return res.status(400).json({
        message: "You are not authorized to delete the post",
        success: false,
      });
    }
    await Post.findByIdAndDelete(postId);
    return res.status(200).json({
      message: "post deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "falied to delete the post",
      success: false,
    });
  }
};
export const getAllPofilePost = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const posts = await Post.find({ user: userId })
      .populate("user", "firstName lastName email") // populate post author
      .populate({
        path: "comments",
        populate: {
          path: "user", // field inside Comment schema
          select: "firstName lastName email", // only pick these fields
        },
      })
      .sort({ createdAt: -1 });

    if (posts.length === 0) {
      return res.status(404).json({
        message: "No posts found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Posts fetched successfully",
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Error fetching profile posts:", error);
    return res.status(500).json({
      message: "Posts can't be fetched",
      success: false,
    });
  }
};

export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
  .populate("user", "username firstName lastName") // populate post creator
  .populate({
    path: "comments",
    populate: {
      path: "user", // assuming Comment schema has `user`
      select: "firstName lastName username", // choose fields you need
    },
  })
  .sort({ createdAt: -1 }); // latest first
    if (!posts || posts.length === 0) {
      return res.status(404).json({
        message: "No posts available",
        success: false,
      });
    }

    return res.status(200).json({
      message: "All posts fetched successfully",
      success: true,
      posts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch posts",
      success: false,
      error: error.message,
    });
  }
};

export const toggleLikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    if (!postId) {
      return res.status(400).json({
        message: "Post ID is required",
        success: false,
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Check if already liked
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likeCount: post.likes.length,
      likes: post.likes, // optional: return all userIds who liked
    });
  } catch (error) {
    console.error("Error in toggleLikePost:", error.message);
    return res.status(500).json({
      message: "Failed to toggle like",
      success: false,
    });
  }
};


export const postComment=async (req,res)=>{
    const {postId}=req.params
    const userId=req.user._id
    // console.log(userId);
    
    const {text}=req.body;
  if(!userId){
    return res.status(400).json({
      message:"User not authorized",
      success:false
    })
  }
    try {
        const post= await Post.findById(postId);
        
        if(!post){
            return res.status(404).json({
                message:"Post not found",
                success:false
            })

        }
        const comment = await Comment.create({
          user:userId,
          text,
          post:postId,
        })
        
        return res.status(201).json({
          message:"commented successfully",
          success:true,
          comment
        })
    

    } catch (error) {
        return res.status(500).json({
          message:"Can't comment",
          success:false
        })
    }
}
export const likeOnComment = async (req, res) => {
  const userId = req.user._id;
  const { commentId } = req.params;
  

  if (!userId) {
    return res.status(400).json({
      message: "User not authorized",
      success: false,
    });
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not exist",
        success: false,
      });
    }

    let message = "";
    if (comment.likes.includes(userId)) {
      // If already liked → unlike
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      message = "Comment unliked";
    } else {
      // Else → like
      comment.likes.push(userId);
      message = "Comment liked";
    }

    // Save with updated likeCount (pre-save hook updates it automatically)
    await comment.save();

    return res.status(200).json({
      message,
      success: true,
      likeCount: comment.likeCount,
      likes: comment.likes,
    });
  } catch (error) {
    console.error("Error in likeOnComment:", error);
    return res.status(500).json({
      message: "Can't like on comment",
      success: false,
    });
  }
};
export const replyOnComment = async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body; // reply text from frontend
  const userId = req.user._id;

  if (!commentId) {
    return res.status(400).json({
      message: "Comment not found",
      success: false,
    });
  }

  try {
    const parentComment = await Comment.findById(commentId);

    if (!parentComment) {
      return res.status(404).json({
        message: "Parent comment does not exist",
        success: false,
      });
    }

    // Create nested (reply) comment
    const nestedComment = await Comment.create({
      user: userId,
      text,
      post: parentComment.post, // keep same post reference
    });

    // Push reply ID to parent comment's comments array
    parentComment.comments.push(nestedComment._id);
    await parentComment.save();

    return res.status(201).json({
      message: "Reply added successfully",
      success: true,
      reply: nestedComment,
    });
  } catch (error) {
    console.error("Error in commentOnComment:", error);
    return res.status(500).json({
      message: "Can't reply to comment",
      success: false,
    });
  }
};
