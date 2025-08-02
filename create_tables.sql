-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  notebook_id UUID REFERENCES notebooks(id),
  user_id UUID REFERENCES auth.users NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can create notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can update own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can delete own notebooks" ON notebooks;
DROP POLICY IF EXISTS "Users can view own entries" ON entries;
DROP POLICY IF EXISTS "Users can create entries" ON entries;
DROP POLICY IF EXISTS "Users can update own entries" ON entries;
DROP POLICY IF EXISTS "Users can delete own entries" ON entries;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own notebooks" ON notebooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create notebooks" ON notebooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notebooks" ON notebooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notebooks" ON notebooks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own entries" ON entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create entries" ON entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON entries FOR DELETE USING (auth.uid() = user_id);