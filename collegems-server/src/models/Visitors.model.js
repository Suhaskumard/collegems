import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: true,
    },

     phoneNumber:
     {
      type: Number ,
      required:true,

     },

    purpose: {
      type: String,
      required: true,
    },
    
    entryTime: {
      type: Date,
      default: Date.now,
    },
    exitTime: {
      type: Date,
      default: null,
    },
     
    homeaddress:
    {
      type: String,
      required: true,

    },

  },
  { timestamps: true }
);

export default mongoose.model("Visitor", visitorSchema);