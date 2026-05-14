const mongoose =
  require("mongoose");

const pushTokenSchema =
  new mongoose.Schema(

    {

      userId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref:
          "User",

        required:
          true,

      },

      token: {

        type:
          String,

        required:
          true,

        unique:
          true,

      },

      platform: {

        type:
          String,

        default:
          "web",

      },

      createdAt: {

        type:
          Date,

        default:
          Date.now,

      },

    }

  );

module.exports =
  mongoose.model(
    "PushToken",
    pushTokenSchema
  );