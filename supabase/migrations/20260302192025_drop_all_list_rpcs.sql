-- Drop all overloads of list_applications_admin (different param counts from migrations)
DROP FUNCTION IF EXISTS list_applications_admin(int, int, text, text, uuid, text, text, text, text);
DROP FUNCTION IF EXISTS list_applications_admin(int, int, text, text, uuid, text, text, text, text, boolean);