import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const resetDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/utasks';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    
    const db = mongoose.connection.db;
    
    console.log('Deleting all data...');
    
    const collections = ['users', 'boards', 'lists', 'cards', 'messages'];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const result = await collection.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} documents from ${collectionName}`);
    }
    
    console.log('\n✅ Database reset complete! All data has been deleted.');
    console.log('You can now create new accounts.');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

resetDatabase();

