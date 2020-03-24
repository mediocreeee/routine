const Post = require("../models/post");
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "mediocrity",
  api_key: "819982722527751",
  api_secret: process.env.CLOUDINARY_SECRET
});

module.exports = {
  // Post Index
  async postIndex(req, res, next) {
    let posts = await Post.find({});
    res.render("posts/index", { posts });
  },
  // Post New
  postNew(req, res, next) {
    res.render("posts/new");
  },
  // Post Create
  async postCreate(req, res, next) {
    req.body.post.images = [];
    for (const file of req.files) {
      let image = await cloudinary.v2.uploader.upload(file.path);
      req.body.post.images.push({
        url: image.secure_url,
        public_id: image.public_id
      });
    }
    let post = await Post.create(req.body.post);
    res.redirect(`/posts/${post.id}`);
  },
  // Post Show
  async postShow(req, res, next) {
    let post = await Post.findById(req.params.id);
    res.render("posts/show", { post });
  },
  // Post Edit
  async postEdit(req, res, next) {
    let post = await Post.findById(req.params.id);
    res.render("posts/edit", { post });
  },
  // Post Update
  async postUpdate(req, res, next) {
    let post = await Post.findById(req.params.id);
    if (req.body.deleteImages && req.body.deleteImages.length) {
      let deleteImages = req.body.deleteImages;

      for (const public_id of deleteImages) {
        await cloudinary.v2.destroy(public_id);

        for (const image of post.images) {
          if (image.public_id === public_id) {
            let index = post.images.indexOf(image);
            post.images.splice(index, 1);
          }
        }
      }
    }

    res.redirect(`/posts/${post.id}`);
  },
  // Post Destroy
  async postDestroy(req, res, next) {
    await Post.findByIdAndRemove(req.params.id);
    res.redirect("/posts");
  }
};