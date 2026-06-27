const mongoose = require('mongoose');
require('dotenv').config();
const Project = require('./src/models/Project').default;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB. Finding a project...");
    const project = await Project.findOne();
    if (project) {
      project.assessment = {
        interdisciplinary: 95,
        collaboration: 88,
        technical: 92,
        comments: "Excellent integration of IoT sensors with the React dashboard. The team worked seamlessly together and the technical architecture is solid.",
        assessedAt: new Date()
      };
      await project.save();
      console.log(`Updated project "${project.name}" with mock assessment data!`);
    } else {
      console.log("No projects found in the DB.");
    }
    mongoose.disconnect();
  })
  .catch((err: any) => {
    console.error(err);
    mongoose.disconnect();
  });
