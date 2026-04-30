SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('shipping_method', 'shipping_cost', 'payment_evidence');