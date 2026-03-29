-- Create a function to execute dynamic SQL
-- This is a helper function to allow running migrations from the backend
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
