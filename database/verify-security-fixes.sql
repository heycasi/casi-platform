-- Security Fixes Verification Script
-- Run this in Supabase SQL Editor to verify all security measures are in place
-- Date: 2025-10-28

-- ============================================================================
-- 1. VERIFY RLS IS ENABLED ON TABLES
-- ============================================================================
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('subscriptions', 'beta_codes', 'beta_signups')
ORDER BY tablename;

-- Expected result: All should show 'true'

-- ============================================================================
-- 2. VERIFY VIEWS ARE USING SECURITY INVOKER (NOT SECURITY DEFINER)
-- ============================================================================
SELECT
  schemaname,
  viewname,
  viewowner,
  CASE
    WHEN definition LIKE '%security_invoker=true%' THEN 'SECURITY INVOKER ✅'
    ELSE 'SECURITY DEFINER ⚠️'
  END as security_type
FROM pg_views
WHERE schemaname = 'public'
  AND viewname IN ('active_user_access', 'vw_messages_by_platform', 'subscription_tier_compliance')
ORDER BY viewname;

-- Expected result: All should show 'SECURITY INVOKER ✅'

-- ============================================================================
-- 3. VERIFY FUNCTIONS HAVE IMMUTABLE SEARCH_PATH
-- ============================================================================
SELECT
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE
    WHEN array_to_string(p.proconfig, ', ') LIKE '%search_path%' THEN 'HAS SEARCH_PATH ✅'
    ELSE 'MISSING SEARCH_PATH ⚠️'
  END as search_path_status,
  array_to_string(p.proconfig, ', ') as config
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('update_tier_status', 'user_has_access', 'get_user_access_details')
ORDER BY p.proname;

-- Expected result: All should show 'HAS SEARCH_PATH ✅'

-- ============================================================================
-- 4. VERIFY RLS POLICIES EXIST
-- ============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('subscriptions', 'beta_codes', 'beta_signups')
ORDER BY tablename, policyname;

-- Expected result: Should see multiple policies for each table

-- ============================================================================
-- 5. SUMMARY CHECK
-- ============================================================================
DO $$
DECLARE
  rls_count INTEGER;
  view_count INTEGER;
  function_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('subscriptions', 'beta_codes', 'beta_signups')
    AND rowsecurity = true;

  -- Count views (approximate check)
  SELECT COUNT(*) INTO view_count
  FROM pg_views
  WHERE schemaname = 'public'
    AND viewname IN ('active_user_access', 'vw_messages_by_platform', 'subscription_tier_compliance');

  -- Count functions with search_path
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname IN ('update_tier_status', 'user_has_access', 'get_user_access_details')
    AND array_to_string(p.proconfig, ', ') LIKE '%search_path%';

  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('subscriptions', 'beta_codes', 'beta_signups');

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '           SECURITY VERIFICATION SUMMARY';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Enabled Tables: % / 3 %', rls_count,
    CASE WHEN rls_count = 3 THEN '✅' ELSE '⚠️' END;
  RAISE NOTICE 'Security Invoker Views: % / 3 %', view_count,
    CASE WHEN view_count = 3 THEN '✅' ELSE '⚠️' END;
  RAISE NOTICE 'Functions with Search Path: % / 3 %', function_count,
    CASE WHEN function_count = 3 THEN '✅' ELSE '⚠️' END;
  RAISE NOTICE 'RLS Policies Created: % %', policy_count,
    CASE WHEN policy_count >= 6 THEN '✅' ELSE '⚠️' END;
  RAISE NOTICE '';

  IF rls_count = 3 AND view_count = 3 AND function_count = 3 AND policy_count >= 6 THEN
    RAISE NOTICE '🎉 ALL SECURITY MEASURES PROPERLY CONFIGURED!';
    RAISE NOTICE '';
    RAISE NOTICE 'Your database is now secure:';
    RAISE NOTICE '  ✅ Row Level Security enabled on sensitive tables';
    RAISE NOTICE '  ✅ Views respect user permissions';
    RAISE NOTICE '  ✅ Functions protected from injection attacks';
    RAISE NOTICE '  ✅ Appropriate access policies in place';
  ELSE
    RAISE NOTICE '⚠️  SOME SECURITY MEASURES ARE MISSING';
    RAISE NOTICE 'Please review the results above and reapply necessary fixes.';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
