const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../server');
const Item = require('../models/item');

let mongoServer;

// Setup before tests
beforeAll(async () => {
  // Create an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Clear database between tests
beforeEach(async () => {
  await Item.deleteMany({});
});

// Cleanup after tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Item API', () => {
  // Test for GET /api/items
  describe('GET /api/items', () => {
    it('should return all items', async () => {
      // Create test items
      await Item.create([
        { name: 'Item 1', description: 'Description 1' },
        { name: 'Item 2', description: 'Description 2' }
      ]);
      
      const response = await request(app).get('/api/items');
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('name', 'Item 1');
      expect(response.body[1]).toHaveProperty('name', 'Item 2');
    });
  });
  
  // Test for GET /api/items/:id
  describe('GET /api/items/:id', () => {
    it('should return a single item by ID', async () => {
      const item = await Item.create({ 
        name: 'Test Item', 
        description: 'Test Description' 
      });
      
      const response = await request(app).get(`/api/items/${item._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Test Item');
      expect(response.body).toHaveProperty('description', 'Test Description');
    });
    
    it('should return 404 if item not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/items/${fakeId}`);
      
      expect(response.status).toBe(404);
    });
  });
  
  // Test for POST /api/items
  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'New Item',
        description: 'New Description'
      };
      
      const response = await request(app)
        .post('/api/items')
        .send(newItem);
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', 'New Item');
      expect(response.body).toHaveProperty('description', 'New Description');
      expect(response.body).toHaveProperty('_id');
      
      // Verify item was actually saved to database
      const savedItem = await Item.findById(response.body._id);
      expect(savedItem).toBeTruthy();
      expect(savedItem.name).toBe('New Item');
    });
    
    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/items')
        .send({ description: 'Missing name' });
      
      expect(response.status).toBe(400);
    });
  });
  
  // Test for PUT /api/items/:id
  describe('PUT /api/items/:id', () => {
    it('should update an existing item', async () => {
      const item = await Item.create({ 
        name: 'Original Name', 
        description: 'Original Description' 
      });
      
      const updatedData = {
        name: 'Updated Name',
        description: 'Updated Description'
      };
      
      const response = await request(app)
        .put(`/api/items/${item._id}`)
        .send(updatedData);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Updated Name');
      expect(response.body).toHaveProperty('description', 'Updated Description');
      
      // Verify item was actually updated in database
      const updatedItem = await Item.findById(item._id);
      expect(updatedItem.name).toBe('Updated Name');
    });
    
    it('should return 404 if item not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/items/${fakeId}`)
        .send({ name: 'Updated Name' });
      
      expect(response.status).toBe(404);
    });
  });
  
  // Test for DELETE /api/items/:id
  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await Item.create({ 
        name: 'Item to Delete', 
        description: 'Will be deleted' 
      });
      
      const response = await request(app).delete(`/api/items/${item._id}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Item deleted successfully');
      
      // Verify item was actually deleted from database
      const deletedItem = await Item.findById(item._id);
      expect(deletedItem).toBeNull();
    });
    
    it('should return 404 if item not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).delete(`/api/items/${fakeId}`);
      
      expect(response.status).toBe(404);
    });
  });
});
