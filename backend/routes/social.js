const express = require('express');
const router = express.Router();
const { getSupabase } = require('../config/supabase');


// Middleware to check authentication (optional, depending on your auth strategy)
// For this demo, we assume the frontend sends a user ID or we trust the request for public reads
// But for writes, we should verify the user. 
// Assuming passport or similar middleware fills req.user, OR we just pass user_id in body for the demo if auth is complex.
// Let's try to use the standard auth middleware if available, or just proceed since Supabase RLS handles security at the DB level 
// IF we use the supabase client with the user's access token. 
// However, the server-side supabase client usually uses the Service Role key (admin).
// So relying on RLS requires `supabase.auth.setSession()` or similar.
// For simplicity in this Node.js layer, we'll implement basic CRUD and trust the frontend's user_id for now (or minimal verification).

// GET /api/social/posts - Get all posts with user info
router.get('/posts', async (req, res) => {
    const { user_id } = req.query; // Get current user ID from query params

    try {
        const supabase = getSupabase();
        const { data: posts, error } = await supabase
            .from('posts')
            .select(`
                *,
                likes (user_id),
                comments (
                    id, content, created_at,
                    user_id
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Enhance posts with user details manually since we can't easily join auth.users or public.users in one go depending on FK setup
        // But since we have a public 'users' table (as seen in auth.js), let's try to fetch user info for each post
        // Optimization: Fetch all unique user IDs first
        const userIds = [...new Set(posts.map(p => p.user_id))];

        const { data: usersData, error: usersError } = await supabase
            .from('profiles') // querying the public 'profiles' table managed by auth.js
            .select('id, full_name, user_type')
            .in('id', userIds);

        if (usersError) console.error("Error fetching user details for posts:", usersError);

        // Map users for easy lookup
        const userMap = {};
        if (usersData) {
            usersData.forEach(u => userMap[u.id] = u);
        }

        const enrichedPosts = posts.map(post => {
            const user = userMap[post.user_id] || { full_name: 'Unknown User' };
            const likesCount = post.likes ? post.likes.length : 0;
            const commentsCount = post.comments ? post.comments.length : 0;

            // Check if current user liked
            const isLiked = user_id && post.likes
                ? post.likes.some(like => like.user_id === user_id)
                : false;

            return {
                ...post,
                user_name: user.full_name,
                user_role: user.user_type,
                likes_count: likesCount,
                comments_count: commentsCount,
                liked_by_me: isLiked
            };
        });

        res.json({ success: true, posts: enrichedPosts });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch posts' });
    }
});

// GET /api/social/stats - Get user's social stats
router.get('/stats', async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ success: false, message: 'User ID required' });

    try {
        const supabase = getSupabase();
        // Get posts count
        const { count: postsCount, error: postsError } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id);

        if (postsError) throw postsError;

        // Get followers count
        const { count: followersCount, error: followersError } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', user_id);

        if (followersError) throw followersError;

        // Get following count
        const { count: followingCount, error: followingError } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', user_id);

        if (followingError) throw followingError;

        res.json({
            success: true,
            stats: {
                posts: postsCount || 0,
                followers: followersCount || 0,
                following: followingCount || 0
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

// GET /api/social/users/suggestions - Get users to follow
router.get('/users/suggestions', async (req, res) => {
    const { user_id } = req.query;
    // user_id might be undefined if not logged in, but we assume logged in for feed

    try {
        const supabase = getSupabase();
        let query = supabase
            .from('profiles')
            .select('id, full_name, user_type, email')
            .neq('id', user_id) // Don't suggest self
            .neq('user_type', 'admin') // Exclude all administrators
            .limit(20); // Fetch more to allow for filtering

        // Ideally we filter out users already followed, but for simplicity we can fetch and filter or do a subquery
        // Since Supabase JS client doesn't support complex NOT IN subqueries easily without raw SQL or RPC, 
        // we'll fetch a batch and filter in code if list is small.

        const { data: users, error } = await query;
        if (error) throw error;

        // Get list of people already followed
        let followedIds = [];
        if (user_id) {
            const { data: follows } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', user_id);

            if (follows) followedIds = follows.map(f => f.following_id);
        }

        // Filter and randomize
        let suggestions = users
            .filter(u => !followedIds.includes(u.id))
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, 3); // Take top 3

        // Fetch agency names for suggestions
        const agencyIds = suggestions.filter(u => u.user_type === 'agency').map(u => u.id);
        const agencyMap = {};

        if (agencyIds.length > 0) {
            const { data: agencies, error: agencyError } = await supabase
                .from('agencies')
                .select('user_id, agency_name')
                .in('user_id', agencyIds);

            if (!agencyError && agencies) {
                agencies.forEach(a => {
                    agencyMap[a.user_id] = a.agency_name;
                });
            }
        }

        suggestions = suggestions.map(u => ({
            ...u,
            agency_name: agencyMap[u.id] || null
        }));

        res.json({ success: true, suggestions });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch suggestions' });
    }
});

// POST /api/social/posts - Create a new post
router.post('/posts', async (req, res) => {
    const { user_id, content, image_url, location } = req.body;

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('posts')
            .insert([{ user_id, content, image_url, location }])
            .select();

        if (error) throw error;

        // Fetch user info to return complete object
        const { data: userData } = await supabase
            .from('profiles')
            .select('full_name, user_type')
            .eq('id', user_id)
            .single();

        const enrichedPost = {
            ...data[0],
            user_name: userData ? userData.full_name : 'Unknown',
            user_role: userData ? userData.user_type : 'User'
        };

        res.json({ success: true, post: enrichedPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ success: false, message: 'Failed to create post' });
    }
});

// POST /api/social/posts/:id/like - Like/Unlike a post
router.post('/posts/:id/like', async (req, res) => {
    const { user_id } = req.body;
    const post_id = req.params.id;

    try {
        const supabase = getSupabase();
        // Check if already liked
        const { data: existingLike, error: checkError } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', post_id)
            .eq('user_id', user_id)
            .single();

        if (existingLike) {
            // Unlike
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('id', existingLike.id);

            if (error) throw error;

            // Decrement counter
            await supabase.rpc('decrement_likes', { row_id: post_id }); // Optional if we use count(*)

            res.json({ success: true, action: 'unliked' });
        } else {
            // Like
            const { error } = await supabase
                .from('likes')
                .insert([{ post_id, user_id }]);

            if (error) throw error;

            res.json({ success: true, action: 'liked' });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ success: false, message: 'Failed to toggle like' });
    }
});

// POST /api/social/follow/:id - Follow a user
router.post('/follow/:id', async (req, res) => {
    const following_id = req.params.id;
    const { user_id: follower_id } = req.body;

    if (following_id === follower_id) {
        return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('follows')
            .insert([{ follower_id, following_id }]);

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ success: false, message: 'Already following' });
            }
            throw error;
        }

        res.json({ success: true, message: 'Followed successfully' });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ success: false, message: 'Failed to follow user' });
    }
});

// DELETE /api/social/follow/:id - Unfollow a user
router.delete('/follow/:id', async (req, res) => {
    const following_id = req.params.id;
    const { user_id: follower_id } = req.body; // Ideally in header or session

    try {
        const supabase = getSupabase();
        const { error } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', follower_id)
            .eq('following_id', following_id);

        if (error) throw error;

        res.json({ success: true, message: 'Unfollowed successfully' });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ success: false, message: 'Failed to unfollow user' });
    }
});

// DELETE /api/social/posts/:id - Delete a post
router.delete('/posts/:id', async (req, res) => {
    const post_id = req.params.id;
    const { user_id } = req.body; // In a real app, get this from session/token!

    try {
        const supabase = getSupabase();

        // 1. Verify ownership
        const { data: post, error: fetchError } = await supabase
            .from('posts')
            .select('user_id')
            .eq('id', post_id)
            .single();

        if (fetchError || !post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (post.user_id !== user_id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // 2. Delete
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', post_id);

        if (error) throw error;

        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, message: 'Failed to delete post' });
    }
});

// PUT /api/social/posts/:id - Edit a post
router.put('/posts/:id', async (req, res) => {
    const post_id = req.params.id;
    const { user_id, content } = req.body;

    try {
        const supabase = getSupabase();

        // 1. Verify ownership
        const { data: post, error: fetchError } = await supabase
            .from('posts')
            .select('user_id')
            .eq('id', post_id)
            .single();

        if (fetchError || !post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (post.user_id !== user_id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // 2. Update
        const { error } = await supabase
            .from('posts')
            .update({ content, updated_at: new Date() })
            .eq('id', post_id);

        if (error) throw error;

        res.json({ success: true, message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ success: false, message: 'Failed to update post' });
    }
});

// POST /api/social/posts/:id/comment - Add a comment
router.post('/posts/:id/comment', async (req, res) => {
    const { user_id, content } = req.body;
    const post_id = req.params.id;

    try {
        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('comments')
            .insert([{ post_id, user_id, content }])
            .select();

        if (error) throw error;
        res.json({ success: true, comment: data[0] });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Failed to add comment' });
    }
});

// DELETE /api/social/comments/:id - Delete a comment
router.delete('/comments/:id', async (req, res) => {
    const comment_id = req.params.id;
    const { user_id } = req.body;

    try {
        const supabase = getSupabase();

        // Verify ownership
        const { data: comment, error: fetchError } = await supabase
            .from('comments')
            .select('user_id')
            .eq('id', comment_id)
            .single();

        if (fetchError || !comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        if (comment.user_id !== user_id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', comment_id);

        if (error) throw error;

        res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ success: false, message: 'Failed to delete comment' });
    }
});

// GET /api/social/users/:id/followers - Get list of followers
router.get('/users/:id/followers', async (req, res) => {
    try {
        const supabase = getSupabase();
        const { data: follows, error: followError } = await supabase
            .from('follows')
            .select('follower_id')
            .eq('following_id', req.params.id);

        if (followError) throw followError;

        const ids = follows.map(f => f.follower_id);

        if (ids.length === 0) {
            return res.json({ success: true, users: [] });
        }

        // Fetch profiles
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id, full_name, user_type')
            .in('id', ids);

        if (userError) throw userError;

        // Fetch agency names for agencies
        const agencyIds = users.filter(u => u.user_type === 'agency').map(u => u.id);
        let agencyMap = {};

        if (agencyIds.length > 0) {
            const { data: agencies, error: agencyError } = await supabase
                .from('agencies')
                .select('user_id, agency_name')
                .in('user_id', agencyIds);

            if (!agencyError && agencies) {
                agencies.forEach(a => {
                    agencyMap[a.user_id] = a.agency_name;
                });
            }
        }

        // Merge data
        const enrichedUsers = users.map(u => ({
            ...u,
            agency_name: agencyMap[u.id] || null
        }));

        res.json({ success: true, users: enrichedUsers });
    } catch (error) {
        console.error('Error fetching followers:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch followers' });
    }
});

// GET /api/social/users/:id/following - Get list of following
router.get('/users/:id/following', async (req, res) => {
    try {
        const supabase = getSupabase();
        const { data: follows, error: followError } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', req.params.id);

        if (followError) throw followError;

        const ids = follows.map(f => f.following_id);

        if (ids.length === 0) {
            return res.json({ success: true, users: [] });
        }

        // Fetch profiles
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id, full_name, user_type')
            .in('id', ids);

        if (userError) throw userError;

        // Fetch agency names for agencies
        const agencyIds = users.filter(u => u.user_type === 'agency').map(u => u.id);
        let agencyMap = {};

        if (agencyIds.length > 0) {
            const { data: agencies, error: agencyError } = await supabase
                .from('agencies')
                .select('user_id, agency_name')
                .in('user_id', agencyIds);

            if (!agencyError && agencies) {
                agencies.forEach(a => {
                    agencyMap[a.user_id] = a.agency_name;
                });
            }
        }

        // Merge data
        const enrichedUsers = users.map(u => ({
            ...u,
            agency_name: agencyMap[u.id] || null
        }));

        res.json({ success: true, users: enrichedUsers });
    } catch (error) {
        console.error('Error fetching following:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch following' });
    }
});

module.exports = router;
