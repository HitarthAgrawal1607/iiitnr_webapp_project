const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ENTRIES_DIR = path.join(DATA_DIR, 'entries');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
  secret: 'fitness-warrior-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ENTRIES_DIR)) {
  fs.mkdirSync(ENTRIES_DIR, { recursive: true });
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]), 'utf8');
}

// Helper functions for users
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users:', err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing users:', err);
    return false;
  }
}

// Helper functions for entries
function getUserEntriesFile(userId) {
  return path.join(ENTRIES_DIR, `${userId}.json`);
}

function readUserEntries(userId) {
  const userFile = getUserEntriesFile(userId);
  try {
    if (fs.existsSync(userFile)) {
      const data = fs.readFileSync(userFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (err) {
    console.error('Error reading user entries:', err);
    return [];
  }
}

function writeUserEntries(userId, entries) {
  const userFile = getUserEntriesFile(userId);
  try {
    fs.writeFileSync(userFile, JSON.stringify(entries, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing user entries:', err);
    return false;
  }
}

// Helper functions for nutrition data
function getUserNutritionFile(userId) {
  return path.join(ENTRIES_DIR, `${userId}_nutrition.json`);
}

function readUserNutrition(userId) {
  const nutritionFile = getUserNutritionFile(userId);
  try {
    if (fs.existsSync(nutritionFile)) {
      const data = fs.readFileSync(nutritionFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (err) {
    console.error('Error reading nutrition data:', err);
    return [];
  }
}

function writeUserNutrition(userId, entries) {
  const nutritionFile = getUserNutritionFile(userId);
  try {
    fs.writeFileSync(nutritionFile, JSON.stringify(entries, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing nutrition data:', err);
    return false;
  }
}

// Helper functions for nutrition settings
function getUserNutritionSettingsFile(userId) {
  return path.join(ENTRIES_DIR, `${userId}_nutrition_settings.json`);
}

function readUserNutritionSettings(userId) {
  const settingsFile = getUserNutritionSettingsFile(userId);
  try {
    if (fs.existsSync(settingsFile)) {
      const data = fs.readFileSync(settingsFile, 'utf8');
      return JSON.parse(data);
    }
    return {
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 200,
      fatsGoal: 65
    };
  } catch (err) {
    console.error('Error reading nutrition settings:', err);
    return {
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 200,
      fatsGoal: 65
    };
  }
}

function writeUserNutritionSettings(userId, settings) {
  const settingsFile = getUserNutritionSettingsFile(userId);
  try {
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing nutrition settings:', err);
    return false;
  }
}

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

// ========== AUTH ROUTES ==========

// Register new user
app.post('/api/auth/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const users = readUsers();
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(),
    username,
    email: email || '',
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  writeUserEntries(newUser.id, []);

  res.status(201).json({ 
    message: 'User registered successfully',
    user: { id: newUser.id, username: newUser.username }
  });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const users = readUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({ 
    message: 'Login successful',
    user: { id: user.id, username: user.username }
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ 
      authenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// ========== WEIGHT TRACKER ROUTES (Protected) ==========

// GET user's weight entries
app.get('/api/entries', isAuthenticated, (req, res) => {
  const entries = readUserEntries(req.session.userId);
  res.json(entries);
});

// POST new weight entry
app.post('/api/entries', isAuthenticated, (req, res) => {
  const { date, weight } = req.body;
  
  if (!date || !weight) {
    return res.status(400).json({ error: 'Date and weight are required' });
  }

  const entries = readUserEntries(req.session.userId);
  const newEntry = {
    id: Date.now(),
    date,
    weight: parseFloat(weight)
  };

  entries.push(newEntry);
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (writeUserEntries(req.session.userId, entries)) {
    res.status(201).json(newEntry);
  } else {
    res.status(500).json({ error: 'Failed to save entry' });
  }
});

// DELETE weight entry
app.delete('/api/entries/:id', isAuthenticated, (req, res) => {
  const id = parseInt(req.params.id);
  let entries = readUserEntries(req.session.userId);
  const initialLength = entries.length;

  entries = entries.filter(e => e.id !== id);

  if (entries.length === initialLength) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  if (writeUserEntries(req.session.userId, entries)) {
    res.json({ message: 'Entry deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// ========== NUTRITION TRACKER ROUTES (Protected) ==========

// GET user's nutrition entries
app.get('/api/nutrition/entries', isAuthenticated, (req, res) => {
  const entries = readUserNutrition(req.session.userId);
  res.json(entries);
});

// POST (save all) nutrition entries
app.post('/api/nutrition/entries', isAuthenticated, (req, res) => {
  const entries = req.body;
  
  if (!Array.isArray(entries)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  if (writeUserNutrition(req.session.userId, entries)) {
    res.json({ 
      success: true, 
      message: 'Entries saved successfully',
      count: entries.length 
    });
  } else {
    res.status(500).json({ error: 'Failed to save entries' });
  }
});

// POST add single nutrition entry
app.post('/api/nutrition/entry', isAuthenticated, (req, res) => {
  const { date, type, name, calories, protein, carbs, fats } = req.body;
  
  if (!date || !type || !name || calories === undefined) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const entries = readUserNutrition(req.session.userId);
  const newEntry = {
    id: Date.now(),
    date,
    type,
    name,
    calories: parseFloat(calories) || 0,
    protein: parseFloat(protein) || 0,
    carbs: parseFloat(carbs) || 0,
    fats: parseFloat(fats) || 0
  };

  entries.push(newEntry);
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (writeUserNutrition(req.session.userId, entries)) {
    res.status(201).json({ 
      success: true, 
      message: 'Entry added successfully',
      entry: newEntry
    });
  } else {
    res.status(500).json({ error: 'Failed to add entry' });
  }
});

// DELETE nutrition entry
app.delete('/api/nutrition/entry/:id', isAuthenticated, (req, res) => {
  const id = parseInt(req.params.id);
  let entries = readUserNutrition(req.session.userId);
  const initialLength = entries.length;

  entries = entries.filter(e => e.id !== id);

  if (entries.length === initialLength) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  if (writeUserNutrition(req.session.userId, entries)) {
    res.json({ success: true, message: 'Entry deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// GET user's nutrition settings
app.get('/api/nutrition/settings', isAuthenticated, (req, res) => {
  const settings = readUserNutritionSettings(req.session.userId);
  res.json(settings);
});

// POST (save) user's nutrition settings
app.post('/api/nutrition/settings', isAuthenticated, (req, res) => {
  const { calorieGoal, proteinGoal, carbsGoal, fatsGoal } = req.body;
  
  const settings = {
    calorieGoal: parseFloat(calorieGoal) || 2000,
    proteinGoal: parseFloat(proteinGoal) || 150,
    carbsGoal: parseFloat(carbsGoal) || 200,
    fatsGoal: parseFloat(fatsGoal) || 65
  };

  if (writeUserNutritionSettings(req.session.userId, settings)) {
    res.json({ 
      success: true, 
      message: 'Settings saved successfully',
      settings 
    });
  } else {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// ========== DIET ROUTES (LEGACY - Protected) ==========

// GET user's diet entries (legacy support)
app.get('/api/diet', isAuthenticated, (req, res) => {
  const dietFile = path.join(ENTRIES_DIR, `${req.session.userId}_diet.json`);
  try {
    if (fs.existsSync(dietFile)) {
      const data = fs.readFileSync(dietFile, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error('Error reading diet entries:', err);
    res.json([]);
  }
});

// POST new diet entry (legacy support)
app.post('/api/diet', isAuthenticated, (req, res) => {
  const { date, meal, foodName, calories, protein, carbs, fats } = req.body;
  
  if (!date || !meal || !foodName || !calories) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  const dietFile = path.join(ENTRIES_DIR, `${req.session.userId}_diet.json`);
  let entries = [];
  
  try {
    if (fs.existsSync(dietFile)) {
      const data = fs.readFileSync(dietFile, 'utf8');
      entries = JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading diet file:', err);
  }

  const newEntry = {
    id: Date.now(),
    date,
    meal,
    foodName,
    calories: parseFloat(calories),
    protein: parseFloat(protein) || 0,
    carbs: parseFloat(carbs) || 0,
    fats: parseFloat(fats) || 0
  };

  entries.push(newEntry);
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  try {
    fs.writeFileSync(dietFile, JSON.stringify(entries, null, 2), 'utf8');
    res.status(201).json(newEntry);
  } catch (err) {
    console.error('Error writing diet file:', err);
    res.status(500).json({ error: 'Failed to save entry' });
  }
});

// DELETE diet entry (legacy support)
app.delete('/api/diet/:id', isAuthenticated, (req, res) => {
  const id = parseInt(req.params.id);
  const dietFile = path.join(ENTRIES_DIR, `${req.session.userId}_diet.json`);
  
  try {
    if (!fs.existsSync(dietFile)) {
      return res.status(404).json({ error: 'No entries found' });
    }

    const data = fs.readFileSync(dietFile, 'utf8');
    let entries = JSON.parse(data);
    const initialLength = entries.length;

    entries = entries.filter(e => e.id !== id);

    if (entries.length === initialLength) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    fs.writeFileSync(dietFile, JSON.stringify(entries, null, 2), 'utf8');
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    console.error('Error deleting diet entry:', err);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// GET user's diet settings (legacy support)
app.get('/api/diet/settings', isAuthenticated, (req, res) => {
  const settingsFile = path.join(ENTRIES_DIR, `${req.session.userId}_diet_settings.json`);
  try {
    if (fs.existsSync(settingsFile)) {
      const data = fs.readFileSync(settingsFile, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json({ calorieGoal: 2000, proteinGoal: 150, carbsGoal: 200, fatsGoal: 65 });
    }
  } catch (err) {
    res.json({ calorieGoal: 2000, proteinGoal: 150, carbsGoal: 200, fatsGoal: 65 });
  }
});

// POST/UPDATE user's diet settings (legacy support)
app.post('/api/diet/settings', isAuthenticated, (req, res) => {
  const { calorieGoal, proteinGoal, carbsGoal, fatsGoal } = req.body;
  const settingsFile = path.join(ENTRIES_DIR, `${req.session.userId}_diet_settings.json`);
  
  const settings = {
    calorieGoal: parseFloat(calorieGoal) || 2000,
    proteinGoal: parseFloat(proteinGoal) || 150,
    carbsGoal: parseFloat(carbsGoal) || 200,
    fatsGoal: parseFloat(fatsGoal) || 65
  };

  try {
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2), 'utf8');
    res.json(settings);
  } catch (err) {
    console.error('Error saving settings:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
  console.log(`📁 Users data: ${USERS_FILE}`);
  console.log(`📁 Entries data: ${ENTRIES_DIR}`);
  console.log(`✅ Nutrition tracking routes enabled!`);
});