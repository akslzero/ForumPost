const Comment = require('../models/Comment');
const Post = require('../models/Post');

// Create comment
exports.createComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      content,
      author: req.user.id,
      post: postId
    });

    await comment.save();
    await comment.populate('author', 'username displayName avatar');

    // Update post comments count
    post.commentsCount += 1;
    await post.save();

    // Emit real-time event
    req.app.get('io').emit('newComment', { postId, comment });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get comments for a post
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'username displayName avatar')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const post = await Post.findById(comment.post);
    if (post) {
      post.commentsCount -= 1;
      await post.save();
    }

    await comment.deleteOne();

    // Emit real-time event
    req.app.get('io').emit('commentDeleted', { commentId: comment._id, postId: comment.post });

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
