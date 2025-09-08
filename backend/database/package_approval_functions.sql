-- Package approval functions for admin management

-- Function to approve a package
CREATE OR REPLACE FUNCTION approve_package(
  package_uuid UUID,
  admin_uuid UUID,
  approval_notes TEXT DEFAULT 'Approved by admin'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  package_record RECORD;
BEGIN
  -- Check if package exists and is pending
  SELECT * INTO package_record FROM packages WHERE id = package_uuid;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Package not found');
  END IF;
  
  IF package_record.status = 'approved' THEN
    RETURN json_build_object('success', false, 'message', 'Package is already approved');
  END IF;
  
  -- Update package status to approved
  UPDATE packages 
  SET 
    status = 'approved',
    admin_notes = approval_notes,
    approved_at = NOW(),
    approved_by = admin_uuid,
    rejected_at = NULL,
    rejected_by = NULL,
    updated_at = NOW()
  WHERE id = package_uuid;
  
  -- Insert approval history record
  INSERT INTO package_approval_history (
    package_id,
    admin_id,
    action,
    notes,
    created_at
  ) VALUES (
    package_uuid,
    admin_uuid,
    'approved',
    approval_notes,
    NOW()
  );
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Package approved successfully',
    'package_id', package_uuid
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'Error approving package: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a package
CREATE OR REPLACE FUNCTION reject_package(
  package_uuid UUID,
  admin_uuid UUID,
  rejection_notes TEXT DEFAULT 'Rejected by admin'
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  package_record RECORD;
BEGIN
  -- Check if package exists
  SELECT * INTO package_record FROM packages WHERE id = package_uuid;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Package not found');
  END IF;
  
  IF package_record.status = 'rejected' THEN
    RETURN json_build_object('success', false, 'message', 'Package is already rejected');
  END IF;
  
  -- Update package status to rejected
  UPDATE packages 
  SET 
    status = 'rejected',
    admin_notes = rejection_notes,
    rejected_at = NOW(),
    rejected_by = admin_uuid,
    approved_at = NULL,
    approved_by = NULL,
    updated_at = NOW()
  WHERE id = package_uuid;
  
  -- Insert rejection history record
  INSERT INTO package_approval_history (
    package_id,
    admin_id,
    action,
    notes,
    created_at
  ) VALUES (
    package_uuid,
    admin_uuid,
    'rejected',
    rejection_notes,
    NOW()
  );
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Package rejected successfully',
    'package_id', package_uuid
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'message', 'Error rejecting package: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get package statistics
CREATE OR REPLACE FUNCTION get_package_stats()
RETURNS JSON AS $$
DECLARE
  pending_count INTEGER;
  approved_count INTEGER;
  rejected_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO pending_count FROM packages WHERE status = 'pending';
  SELECT COUNT(*) INTO approved_count FROM packages WHERE status = 'approved';
  SELECT COUNT(*) INTO rejected_count FROM packages WHERE status = 'rejected';
  SELECT COUNT(*) INTO total_count FROM packages;
  
  RETURN json_build_object(
    'pending', pending_count,
    'approved', approved_count,
    'rejected', rejected_count,
    'total', total_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get agency package statistics
CREATE OR REPLACE FUNCTION get_agency_package_stats(agency_uuid UUID)
RETURNS JSON AS $$
DECLARE
  pending_count INTEGER;
  approved_count INTEGER;
  rejected_count INTEGER;
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO pending_count FROM packages WHERE agency_id = agency_uuid AND status = 'pending';
  SELECT COUNT(*) INTO approved_count FROM packages WHERE agency_id = agency_uuid AND status = 'approved';
  SELECT COUNT(*) INTO rejected_count FROM packages WHERE agency_id = agency_uuid AND status = 'rejected';
  SELECT COUNT(*) INTO total_count FROM packages WHERE agency_id = agency_uuid;
  
  RETURN json_build_object(
    'pending', pending_count,
    'approved', approved_count,
    'rejected', rejected_count,
    'total', total_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION approve_package(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_package(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_package_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_agency_package_stats(UUID) TO authenticated;