-- Promote admin@exiva.com to master_admin
UPDATE public.user_roles SET role = 'master_admin' WHERE user_id = '0b83526f-c718-4b6b-be66-181bd6880b37';

-- Delete alefjesus2004@gmail.com related data
DELETE FROM public.user_roles WHERE user_id = '202cfdf2-903d-4ae5-ae93-004985fd6112';
DELETE FROM public.profiles WHERE user_id = '202cfdf2-903d-4ae5-ae93-004985fd6112';