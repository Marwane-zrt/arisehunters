/*
  # Clean up declined friend requests

  1. Changes
    - Remove all declined friend requests to allow users to send new requests
    - This is a one-time cleanup migration
  
  2. Security
    - Only affects declined requests, not pending or accepted ones
*/

-- Delete all declined friend requests to allow users to send new requests
DELETE FROM friend_requests WHERE status = 'declined';