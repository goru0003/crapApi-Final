const { model, Schema, Types } = require("mongoose");

//Point Schema

const PointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function (v) {
          return v.length === 2;
        },
        message: (props) => `${props.value} you need min 2 items.`,
      },
    },
  },
  {
    _id: false,
  }
);

//Suggestion Schema

const SuggestionSchema = new Schema(
  {
    address: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 255,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

//Crap Schema

const crapSchema = new Schema(
  {
    title: {
      type: String,
      minLength: 3,
      maxLength: 255,
      required: true,
    },
    description: {
      type: String,
      minLength: 3,
      maxLength: 255,
      required: true,
    },
    location: {
      type: PointSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "INTERESTED", "SCHEDULED", "AGREED", "FLUSHED"],
      required: true,
      default: "AVAILABLE",
    },
    suggestion: {
      type: SuggestionSchema,
      required: false,
    },
    owner: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyer: {
      type: Types.ObjectId,
      ref: "User",
      required: false,
    },

    images: {
      type: [String],
      validate: [(imgs) => imgs.length > 0, "You need at least 1 image"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = model("Crap", crapSchema);
