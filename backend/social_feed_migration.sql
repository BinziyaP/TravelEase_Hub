-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  location VARCHAR(255),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Likes Table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- Create Follows Table
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (Idempotency fix)
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can insert their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

DROP POLICY IF EXISTS "Public comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON public.comments;

DROP POLICY IF EXISTS "Public likes are viewable by everyone" ON public.likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;

DROP POLICY IF EXISTS "Public follows are viewable by everyone" ON public.follows;
DROP POLICY IF EXISTS "Users can insert their own follows" ON public.follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON public.follows;

-- Re-create Policies for Posts
CREATE POLICY "Public posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Re-create Policies for Comments
CREATE POLICY "Public comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Re-create Policies for Likes
CREATE POLICY "Public likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Re-create Policies for Follows
CREATE POLICY "Public follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can insert their own follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Create a bucket for post images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true) ON CONFLICT (id) DO NOTHING;

-- Drop and re-create storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'post-images' );
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'post-images' AND auth.role() = 'authenticated' );
