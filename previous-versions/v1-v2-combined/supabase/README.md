# Supabase Database Setup

## Prerequisites
1. Create a free Supabase account at https://supabase.com
2. Create a new project

## Setup Instructions

### 1. Create Database Tables
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the entire contents of `schema.sql`
4. Paste and run the SQL in the editor
5. Verify tables were created in the Table Editor

### 2. Configure Environment Variables
1. Go to Project Settings > API
2. Copy your project URL and anon key
3. Create a `.env.local` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Enable Real-time
1. Go to Database > Replication
2. Enable replication for these tables:
   - operations
   - service_line_updates
   - iaps

### 4. Security (Optional)
For production:
1. Enable Row Level Security (RLS) policies
2. Set up authentication
3. Modify the policies in `schema.sql` as needed

## Features

### Automatic Synchronization
- All data changes are automatically synced to Supabase
- Real-time updates across all connected clients
- Offline support with automatic sync when reconnected

### Data Persistence
- Operations data
- Service line updates with history
- IAP documents with version control
- Audit trail for all changes

### Performance
- Indexed queries for fast lookups
- Materialized views for common aggregations
- Efficient real-time subscriptions

## Testing
1. Start the application: `npm run dev`
2. Check the header for sync status indicators
3. Create an operation and verify it appears in Supabase
4. Make changes and verify they sync

## Troubleshooting

### "Supabase not configured"
- Ensure `.env.local` exists with correct values
- Restart the dev server after adding environment variables

### Sync not working
- Check browser console for errors
- Verify Supabase project is active
- Check network connectivity

### Real-time updates not working
- Ensure replication is enabled
- Check WebSocket connectivity
- Verify RLS policies allow access