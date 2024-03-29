const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  birthDate: {
    type: String,
    required: true
  },
  bloodGroup: {
    type: String
  },
  workPlace: {
    type: String
  },
  image: {
    image_name: {
      type: String,
      required: true
    },
    secure_url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    created_at: {
      type: String,
      default: Date.now.toString()
    },
    width: {
      type: String,
      required: true
    },
    height: {
      type: String,
      required: true
    }
  },
  firstGuardianName: {
    type: String,
    required: true
  },
  firstGuardianRelation: {
    type: String,
    required: true
  },
  secondGuardianName: {
    type: String
  },
  secondGuardianRelation: {
    type: String
  },
  medicalHistory: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  batchType: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
